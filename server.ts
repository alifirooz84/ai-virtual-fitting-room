import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { normalizeGarmentAiSpec, AI_COMPANION_SPEC_PROMPT_FA, AI_COMPANION_SPEC_PROMPT_EN } from './src/data/aiPromptGuide.ts';
import { ClothingProduct, GarmentSlot } from './src/types/clothing.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // Static uploads directory for lightweight image serving
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
  }
  app.use('/uploads', express.static(uploadsDir));
  app.use('/api/uploads', express.static(uploadsDir));

  // --- REST API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Smart Multi-Store AI Virtual Try-On API',
      version: '2.0.0',
      totalStores: db.getAllStores().length,
      totalProducts: db.getAllProducts().length,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Prompt & JSON schema guide for merchants
  app.get('/api/ai/prompt-guide', (req, res) => {
    res.json({
      prompt_fa: AI_COMPANION_SPEC_PROMPT_FA,
      prompt_en: AI_COMPANION_SPEC_PROMPT_EN,
      slots: ['slot_top', 'slot_bottom', 'slot_outer', 'slot_shoes', 'slot_accessory'],
      example_json_top: {
        garment_id: "TOP-TSHIRT-001",
        name_fa: "تی‌شرت یقه گرد نخ پنبه سفید",
        name_en: "Classic White Crewneck Tee",
        category: "tshirt",
        slot: "slot_top",
        placement: { anchor: "torso", offset_x_percent: 0, offset_y_percent: 22, scale: 1.0, z_index: 30 },
        replacement_rules: { replaces_slot: "slot_top", compatible_slots: ["slot_bottom", "slot_outer", "slot_shoes"] },
        style_details: { primary_color_fa: "سفید صدفی", color_hex: "#ffffff", fabric_type: "۱۰۰٪ پنبه", fit_style: "regular", estimated_price_toman: 680000 }
      },
      example_json_bottom: {
        garment_id: "PNT-JEAN-001",
        name_fa: "شلوار جین راسته سرمه‌ای",
        name_en: "Navy Straight Fit Jeans",
        category: "jeans",
        slot: "slot_bottom",
        placement: { anchor: "waist", offset_x_percent: 0, offset_y_percent: 53, scale: 1.0, z_index: 20 },
        replacement_rules: { replaces_slot: "slot_bottom", compatible_slots: ["slot_top", "slot_outer", "slot_shoes"] },
        style_details: { primary_color_fa: "سرمه‌ای نیل", color_hex: "#1d4ed8", fabric_type: "دنیم اعلا", fit_style: "regular", estimated_price_toman: 1450000 }
      }
    });
  });

  // Stores
  app.get('/api/stores', (req, res) => {
    const stores = db.getAllStores();
    const enriched = stores.map((s) => {
      const prods = db.getAllProducts(s.slug);
      return {
        ...s,
        productsCount: prods.length,
        slotsAvailable: Array.from(new Set(prods.map((p) => p.slot))),
      };
    });
    res.json(enriched);
  });

  app.post('/api/stores', (req, res) => {
    try {
      const created = db.createStore(req.body);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/stores/:storeSlug', (req, res) => {
    const store = db.getStoreBySlug(req.params.storeSlug);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const products = db.getAllProducts(store.slug);
    res.json({ ...store, productsCount: products.length, products });
  });

  // All Products across all stores (Universal Catalog Sync)
  app.get('/api/products', (req, res) => {
    const slot = req.query.slot as GarmentSlot | undefined;
    const products = db.getAllProducts(undefined, slot);
    res.json(products);
  });

  // Store Products
  app.get('/api/stores/:storeSlug/products', (req, res) => {
    const { storeSlug } = req.params;
    const slot = req.query.slot as GarmentSlot | undefined;
    const products = db.getAllProducts(storeSlug, slot);
    res.json(products);
  });

  // Upload Clothing with Companion AI JSON Specification
  const handleProductUpload = (req: express.Request, res: express.Response) => {
    try {
      const storeSlug = req.params.storeSlug || req.body.storeSlug || 'zara-modern';
      const store = db.getStoreBySlug(storeSlug);
      const storeName = store ? store.nameFa : (req.body.storeName || 'فروشگاه اختصاصی');

      const body = req.body || {};
      const {
        image, // Base64 data url or public URL
        jsonSpec, // The companion AI JSON string or object
        customTitle,
        customPrice,
      } = body;

      if (!image) {
        return res.status(400).json({ error: 'ارسال تصویر شفاف لباس (image) الزامی است.' });
      }

      // Parse and normalize the companion AI JSON
      const normalizedSpec = normalizeGarmentAiSpec(
        jsonSpec || {},
        customTitle || 'لباس جدید استاندارد'
      );

      const title = customTitle || normalizedSpec.name_fa || 'لباس جدید';
      const price = customPrice ? Number(customPrice) : normalizedSpec.style_details.estimated_price_toman || 850000;
      const newId = `prod-${storeSlug}-${Date.now()}`;

      // Convert large base64 into a physical file on disk to prevent bloated JSON payloads
      let finalImageUrl = image;
      if (typeof image === 'string' && image.startsWith('data:image')) {
        try {
          const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
          if (match) {
            const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
            const fileName = `${newId}.${ext}`;
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
            finalImageUrl = `/api/uploads/${fileName}`;
          }
        } catch (fileErr) {
          console.warn('[server.ts] Could not write file to disk, using data URL:', fileErr);
        }
      }

      const newProduct: ClothingProduct = {
        id: newId,
        storeSlug,
        storeName,
        title,
        price,
        category: normalizedSpec.category,
        slot: normalizedSpec.slot,
        imageUrl: finalImageUrl,
        placement: normalizedSpec.placement,
        spec: normalizedSpec,
        createdAt: new Date().toISOString(),
      };

      const saved = db.createProduct(newProduct);
      res.status(201).json({
        success: true,
        product: saved,
        storeSlug,
        message: `لباس "${saved.title}" با اسلات "${saved.slot}" در دیتابیس ذخیره شد.`,
      });
    } catch (err: any) {
      console.error('[POST products] Error:', err);
      res.status(500).json({ error: 'خطا در ثبت محصول: ' + err.message });
    }
  };

  app.post('/api/stores/:storeSlug/products', handleProductUpload);
  app.post('/api/products', handleProductUpload);

  // Delete product
  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // --- CLIENT SERVING (Vite Dev vs Static Dist) ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(200).send(`Server is running, but dist/index.html was not found. Run npm run build first.`);
      }
    });
  }

  app.listen(PORT, () => {
    console.log(`[AI Virtual Fitting Server] Active on http://localhost:${PORT}`);
  });
}

startServer();
