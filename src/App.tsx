import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MannequinStage } from './components/MannequinStage';
import { ClothingCatalog } from './components/ClothingCatalog';
import { OutfitSummaryPanel } from './components/OutfitSummaryPanel';
import { MerchantUploadView } from './components/MerchantUploadView';
import { AiPromptGuideModal } from './components/AiPromptGuideModal';
import { StoreDirectoryModal } from './components/StoreDirectoryModal';
import { INITIAL_STORES, INITIAL_PRODUCTS } from './data/mockStoresAndProducts';
import { StoreProfile, ClothingProduct, GarmentSlot, ActiveOutfit } from './types/clothing';
import { apiFetch } from './utils/api';
import { Sparkles, Store, Camera, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Navigation View: 'tryon' (fitting room) vs 'upload' (merchant ingestion)
  const [activeView, setActiveView] = useState<'tryon' | 'upload' | 'prompt-guide'>('tryon');

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
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [isPromptGuideOpen, setIsPromptGuideOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch stores from server
  const fetchStores = useCallback(async () => {
    try {
      const res = await apiFetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
        }
      }
    } catch {
      // Use fallback
    }
  }, []);

  // Fetch products for current store
  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/stores/${currentStoreSlug}/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      }
    } catch {
      // Use fallback
    } finally {
      setIsLoading(false);
    }
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
      fetchProducts();
      showNotification(`لباس "${newProduct.title}" در دیتابیس فروشگاه ${newProduct.storeName} ذخیره شد!`);
    },
    [fetchProducts]
  );

  // Immediate Try-On of newly uploaded product
  const handleTryOnNow = useCallback(
    (product: ClothingProduct) => {
      handleToggleGarment(product);
      setActiveView('tryon');
    },
    [handleToggleGarment]
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-500/40 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Luxury Header */}
      <Navbar
        currentStore={currentStore}
        activeOutfit={activeOutfit}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        onOpenPromptGuide={() => setIsPromptGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        {activeView === 'upload' ? (
          /* ======================================================== */
          /* 1. MERCHANT UPLOAD VIEW WITH COMPANION JSON SPEC         */
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
          /* 2. CUSTOMER VIRTUAL TRY-ON FITTING ROOM (3-COLUMN LUXURY) */
          /* ======================================================== */
          <div className="flex-1 flex flex-col gap-4">
            {/* Store Profile Highlight Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 border border-slate-800 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                  {currentStore.logoEmoji || '🛍️'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      ویترین اختصاصی
                    </span>
                    <h1 className="text-sm sm:text-base font-black text-white">
                      {currentStore.nameFa}
                    </h1>
                    <span className="text-xs text-slate-400">({currentStore.city})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {currentStore.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView('upload')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📸 آپلود لباس و JSON برای این فروشگاه</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>تغییر فروشگاه</span>
                </button>
              </div>
            </div>

            {/* Studio 3-Column Layout */}
            <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6 min-h-[calc(100vh-160px)]">
              {/* Left Column: Store Clothing Catalog */}
              <ClothingCatalog
                products={products}
                activeOutfit={activeOutfit}
                onToggleGarment={handleToggleGarment}
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

      {/* Store Directory Modal */}
      <StoreDirectoryModal
        stores={stores}
        currentStoreSlug={currentStoreSlug}
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSelectStore={handleSelectStore}
        onStoreCreated={(s) => {
          setStores((prev) => [...prev, s]);
          fetchStores();
        }}
        products={products}
      />

      {/* AI Master Prompt Guide Modal */}
      <AiPromptGuideModal
        isOpen={isPromptGuideOpen}
        onClose={() => setIsPromptGuideOpen(false)}
      />
    </div>
  );
}
