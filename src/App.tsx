import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MannequinStage } from './components/MannequinStage';
import { ClothingCatalog } from './components/ClothingCatalog';
import { OutfitSummaryPanel } from './components/OutfitSummaryPanel';
import { MerchantUploadView } from './components/MerchantUploadView';
import { AiPromptGuideModal } from './components/AiPromptGuideModal';
import { INITIAL_STORES, INITIAL_PRODUCTS } from './data/mockStoresAndProducts';
import { StoreProfile, ClothingProduct, GarmentSlot, ActiveOutfit } from './types/clothing';
import { apiFetch } from './utils/api';
import { dbStorage } from './utils/dbStorage';
import { Sparkles } from 'lucide-react';

export default function App() {
  // 1. Navigation View: 'tryon' (fitting room) vs 'upload' (upload photo & JSON spec)
  const [activeView, setActiveView] = useState<'tryon' | 'upload'>('tryon');

  // 2. Stores State
  const [stores, setStores] = useState<StoreProfile[]>(INITIAL_STORES);
  const [currentStoreSlug, setCurrentStoreSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('store');
      if (param) return param;
    }
    return INITIAL_STORES[0]?.slug || 'zara-modern';
  });

  const currentStore = useMemo(() => {
    return stores.find((s) => s.slug === currentStoreSlug) || stores[0] || INITIAL_STORES[0];
  }, [stores, currentStoreSlug]);

  // 3. Products State
  const [products, setProducts] = useState<ClothingProduct[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 4. Modals State
  const [isPromptGuideOpen, setIsPromptGuideOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch stores from server
  const fetchStores = useCallback(async () => {
    try {
      const res = await apiFetch('/api/stores', undefined, 8000);
      const isJson = res.ok && (res.headers.get('content-type')?.includes('application/json') || false);
      if (isJson) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
          // If currentStoreSlug is not present in server stores, sync to first valid store
          if (!data.some((s: any) => s.slug === currentStoreSlug)) {
            setCurrentStoreSlug(data[0].slug);
          }
        }
      }
    } catch {
      // Use fallback
    }
  }, [currentStoreSlug]);

  // Fetch products with IndexedDB local persistence + Server API sync (Cross-device persistence)
  const fetchProducts = useCallback(async () => {
    // 1. Get locally cached items from IndexedDB
    const localCustom = await dbStorage.migrateFromLocalStorage();

    let serverProducts: ClothingProduct[] = [];
    try {
      // 1. First try universal /api/products (to get all user uploads across all browser sessions)
      let res = await apiFetch('/api/products', undefined, 8000);
      let isJson = res.ok && (res.headers.get('content-type')?.includes('application/json') || false);
      if (isJson) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          serverProducts = data;
        }
      }

      // 2. If universal products is empty or not yet deployed on server, fetch from active store
      if (serverProducts.length === 0) {
        const targetSlug = currentStoreSlug || 'atelier-milano';
        res = await apiFetch(`/api/stores/${targetSlug}/products`, undefined, 8000);
        isJson = res.ok && (res.headers.get('content-type')?.includes('application/json') || false);
        if (isJson) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            serverProducts = data;
          }
        }
      }

      // 3. Fallback to atelier-milano if currentStore was different
      if (serverProducts.length === 0 && currentStoreSlug !== 'atelier-milano') {
        res = await apiFetch('/api/stores/atelier-milano/products', undefined, 8000);
        isJson = res.ok && (res.headers.get('content-type')?.includes('application/json') || false);
        if (isJson) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            serverProducts = data;
          }
        }
      }

      // Synchronize server products into local IndexedDB for instant offline access
      if (serverProducts.length > 0) {
        for (const sp of serverProducts) {
          await dbStorage.saveProduct(sp);
        }
      }
    } catch (err) {
      console.warn('[App.tsx] Server product sync warning:', err);
    }

    // Merge: Server database products + local IndexedDB + Initial showroom products
    const seen = new Set<string>();
    const merged: ClothingProduct[] = [];
    [...serverProducts, ...localCustom, ...INITIAL_PRODUCTS].forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    });
    setProducts(merged);
    setIsLoading(false);
  }, [currentStoreSlug]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Store Selection
  const handleSelectStore = (slug: string) => {
    setCurrentStoreSlug(slug);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('store', slug);
      window.history.pushState(null, '', url.toString());
    }
    const store = stores.find((s) => s.slug === slug);
    showNotification(`وارد فروشگاه "${store?.nameFa || slug}" شدید.`);
  };

  // Initial default outfit for the active store
  const initialDefaultOutfit = useMemo<ActiveOutfit>(() => {
    const storeProds = INITIAL_PRODUCTS.filter((p) => p.storeSlug === currentStoreSlug);
    const top = storeProds.find((p) => p.slot === 'slot_top');
    const bottom = storeProds.find((p) => p.slot === 'slot_bottom');
    const outer = storeProds.find((p) => p.slot === 'slot_outer');
    const shoes = storeProds.find((p) => p.slot === 'slot_shoes');

    return {
      slot_top: top,
      slot_bottom: bottom,
      slot_outer: outer,
      slot_shoes: shoes,
    };
  }, [currentStoreSlug]);

  // Active Outfit State: key-value dictionary per slot
  const [activeOutfit, setActiveOutfit] = useState<ActiveOutfit>(initialDefaultOutfit);

  // When store changes, update outfit with items from that store if available
  useEffect(() => {
    setActiveOutfit(initialDefaultOutfit);
  }, [initialDefaultOutfit]);

  /**
   * SLOT REPLACEMENT ENGINE:
   * 1. Clicking an already equipped item -> un-equips it.
   * 2. Clicking an item of the SAME slot (e.g. Pants B when Pants A is equipped) ->
   *    replaces ONLY Pants A with Pants B! T-shirt is NEVER touched!
   * 3. Clicking an item of a DIFFERENT slot (e.g. Pants when T-shirt is equipped) ->
   *    layers seamlessly onto the mannequin!
   */
  const handleToggleGarment = useCallback(
    (garment: ClothingProduct) => {
      setActiveOutfit((prev) => {
        const currentItemInSlot = prev[garment.slot];

        // 1. If exact same item is clicked, remove it
        if (currentItemInSlot?.id === garment.id) {
          showNotification(`لباس "${garment.title}" از ست پرو برداشته شد.`);
          return {
            ...prev,
            [garment.slot]: undefined,
          };
        }

        // 2. Otherwise, assign to this slot (automatically replacing previous item of this slot)
        const slotTitle =
          garment.slot === 'slot_top'
            ? 'بالاتنه'
            : garment.slot === 'slot_bottom'
            ? 'پایین‌تنه'
            : garment.slot === 'slot_outer'
            ? 'لباس‌رو'
            : 'کفش';

        if (currentItemInSlot) {
          showNotification(
            `"${garment.title}" جایگزین "${currentItemInSlot.title}" در اسلات ${slotTitle} شد.`
          );
        } else {
          showNotification(`"${garment.title}" در اسلات ${slotTitle} ست شد.`);
        }

        return {
          ...prev,
          [garment.slot]: garment,
        };
      });
    },
    []
  );

  // Remove individual slot
  const handleRemoveSlot = useCallback((slot: GarmentSlot) => {
    setActiveOutfit((prev) => {
      const removed = prev[slot];
      if (removed) {
        showNotification(`لباس "${removed.title}" از ست برداشته شد.`);
      }
      return {
        ...prev,
        [slot]: undefined,
      };
    });
  }, []);

  // Clear entire outfit
  const handleClearAll = useCallback(() => {
    setActiveOutfit({});
    showNotification('تمام لباس‌ها از روی مانکن برداشته شدند.');
  }, []);

  // Handle Product Created from Upload View
  const handleProductCreated = useCallback(
    (newProduct: ClothingProduct) => {
      setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
      showNotification(`لباس "${newProduct.title}" در دیتابیس با موفقیت ثبت شد!`);
    },
    []
  );

  // Handle Product Deletion from Database
  const handleDeleteProduct = useCallback(async (id: string) => {
    await dbStorage.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    apiFetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    showNotification('لباس از دیتابیس حذف شد.');
  }, []);

  // Immediate Try-On of newly uploaded product
  const handleTryOnNow = useCallback(
    (product: ClothingProduct) => {
      handleToggleGarment(product);
      setActiveView('tryon');
    },
    [handleToggleGarment]
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-500/40 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Clean Header */}
      <Navbar
        activeOutfit={activeOutfit}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenPromptGuide={() => setIsPromptGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        {activeView === 'upload' ? (
          /* ======================================================== */
          /* 1. UPLOAD VIEW WITH PHOTO & COMPANION JSON SPEC          */
          /* ======================================================== */
          <MerchantUploadView
            currentStore={currentStore}
            stores={stores}
            onProductCreated={handleProductCreated}
            onTryOnNow={handleTryOnNow}
            onOpenPromptGuide={() => setIsPromptGuideOpen(true)}
            onSelectStore={handleSelectStore}
          />
        ) : (
          /* ======================================================== */
          /* 2. CUSTOMER VIRTUAL TRY-ON FITTING ROOM (3-COLUMN STUDIO) */
          /* ======================================================== */
          <div className="flex-1 flex flex-col gap-4">
            {/* Studio 3-Column Layout */}
            <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6 min-h-[calc(100vh-140px)]">
              {/* Left Column: Clothing Catalog */}
              <ClothingCatalog
                products={products}
                activeOutfit={activeOutfit}
                onToggleGarment={handleToggleGarment}
                onDeleteProduct={handleDeleteProduct}
                storeName={currentStore.nameFa}
              />

              {/* Center Column: 3D Ghost Mannequin Stage */}
              <MannequinStage
                activeOutfit={activeOutfit}
                onRemoveSlot={handleRemoveSlot}
                onClearAll={handleClearAll}
              />

              {/* Right Column: Active Outfit Pieces Breakdown & Order */}
              <OutfitSummaryPanel
                activeOutfit={activeOutfit}
                onRemoveSlot={handleRemoveSlot}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        )}
      </main>

      {/* AI Master Prompt Guide Modal */}
      <AiPromptGuideModal
        isOpen={isPromptGuideOpen}
        onClose={() => setIsPromptGuideOpen(false)}
      />
    </div>
  );
}
