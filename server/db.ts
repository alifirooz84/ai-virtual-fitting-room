import fs from 'fs';
import path from 'path';
import { StoreProfile, ClothingProduct, GarmentSlot } from '../src/types/clothing';
import { INITIAL_STORES, INITIAL_PRODUCTS } from '../src/data/mockStoresAndProducts';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const STORES_FILE = path.join(DATA_DIR, 'stores.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

export class JsonDatabase {
  private stores: Map<string, StoreProfile> = new Map();
  private products: Map<string, ClothingProduct> = new Map();

  constructor() {
    this.ensureDataDir();
    this.initData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private initData() {
    try {
      // 1. Stores
      if (fs.existsSync(STORES_FILE)) {
        const raw = fs.readFileSync(STORES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((s) => this.stores.set(s.slug, s));
        } else {
          this.seedStores();
        }
      } else {
        this.seedStores();
      }

      // 2. Products
      if (fs.existsSync(PRODUCTS_FILE)) {
        const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
          }

          let migratedCount = 0;
          list.forEach((p) => {
            // Auto-extract bloated base64 images into physical disk files
            if (p.imageUrl && typeof p.imageUrl === 'string' && p.imageUrl.startsWith('data:image')) {
              try {
                const match = p.imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
                if (match) {
                  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
                  const fileName = `${p.id}.${ext}`;
                  const filePath = path.join(uploadsDir, fileName);
                  fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
                  p.imageUrl = `/api/uploads/${fileName}`;
                  migratedCount++;
                }
              } catch (err) {
                console.warn('[JsonDatabase] Could not extract base64 for product:', p.id, err);
              }
            } else if (p.imageUrl && typeof p.imageUrl === 'string' && p.imageUrl.startsWith('/uploads/')) {
              p.imageUrl = '/api' + p.imageUrl;
              migratedCount++;
            }
            this.products.set(p.id, p);
          });

          if (migratedCount > 0) {
            console.log(`[JsonDatabase] Successfully migrated/normalized ${migratedCount} product image URLs in server/data/products.json`);
            this.saveProducts();
          }
        } else {
          this.seedProducts();
        }
      } else {
        this.seedProducts();
      }
    } catch (e) {
      console.warn('[JsonDatabase] Disk read fallback to defaults:', e);
      this.seedStores();
      this.seedProducts();
    }
  }

  private seedStores() {
    INITIAL_STORES.forEach((s) => this.stores.set(s.slug, s));
    this.saveStores();
  }

  private seedProducts() {
    INITIAL_PRODUCTS.forEach((p) => this.products.set(p.id, p));
    this.saveProducts();
  }

  private saveStores() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(STORES_FILE, JSON.stringify(Array.from(this.stores.values()), null, 2), 'utf-8');
    } catch (e) {
      console.error('[JsonDatabase] Error saving stores:', e);
    }
  }

  private saveProducts() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(Array.from(this.products.values()), null, 2), 'utf-8');
    } catch (e) {
      console.error('[JsonDatabase] Error saving products:', e);
    }
  }

  // --- Store Operations ---
  public getAllStores(): StoreProfile[] {
    return Array.from(this.stores.values());
  }

  public getStoreBySlug(slug: string): StoreProfile | undefined {
    return this.stores.get(slug);
  }

  public createStore(data: Partial<StoreProfile>): StoreProfile {
    const slug = (data.slug || data.nameFa || `store-${Date.now()}`)
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '');

    const newStore: StoreProfile = {
      id: data.id || `store-${Date.now()}`,
      slug: slug || `store-${Date.now()}`,
      nameFa: data.nameFa || 'فروشگاه جدید',
      nameEn: data.nameEn || 'New Store Boutique',
      city: data.city || 'تهران',
      description: data.description || 'بوتیک پوشاک و استایل شیک',
      badge: data.badge || 'بوتیک همکار',
      logoEmoji: data.logoEmoji || '🛍️',
      themeColor: data.themeColor || '#1e293b',
      createdAt: new Date().toISOString(),
    };

    this.stores.set(newStore.slug, newStore);
    this.saveStores();
    return newStore;
  }

  // --- Product Operations ---
  public getAllProducts(storeSlug?: string, slot?: GarmentSlot): ClothingProduct[] {
    let list = Array.from(this.products.values());
    if (storeSlug && storeSlug !== 'all') {
      list = list.filter((p) => p.storeSlug === storeSlug);
    }
    if (slot) {
      list = list.filter((p) => p.slot === slot);
    }
    return list;
  }

  public getProductById(id: string): ClothingProduct | undefined {
    return this.products.get(id);
  }

  public createProduct(product: ClothingProduct): ClothingProduct {
    this.products.set(product.id, product);
    this.saveProducts();
    return product;
  }

  public deleteProduct(id: string): boolean {
    const deleted = this.products.delete(id);
    if (deleted) {
      this.saveProducts();
    }
    return deleted;
  }
}

export const db = new JsonDatabase();
