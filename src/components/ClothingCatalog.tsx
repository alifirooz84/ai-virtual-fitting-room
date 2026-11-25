import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Filter, Sparkles, Shirt } from 'lucide-react';
import { ClothingProduct, GarmentSlot, ActiveOutfit } from '../types/clothing';

interface ClothingCatalogProps {
  products: ClothingProduct[];
  activeOutfit: ActiveOutfit;
  onToggleGarment: (garment: ClothingProduct) => void;
  storeName: string;
}

const SLOT_TABS: Array<{ id: GarmentSlot | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'همه لباس‌ها', icon: '✦' },
  { id: 'slot_top', label: 'تی‌شرت و پیراهن', icon: '👕' },
  { id: 'slot_bottom', label: 'شلوار و جین', icon: '👖' },
  { id: 'slot_outer', label: 'کت و کاپشن', icon: '🧥' },
  { id: 'slot_shoes', label: 'کفش و کتانی', icon: '👟' },
];

export const ClothingCatalog: React.FC<ClothingCatalogProps> = ({
  products,
  activeOutfit,
  onToggleGarment,
  storeName,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<GarmentSlot | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Set of actively worn product IDs for instant O(1) checks
  const wornProductIds = useMemo(() => {
    return new Set(
      (Object.values(activeOutfit).filter(Boolean) as ClothingProduct[]).map((p) => p.id)
    );
  }, [activeOutfit]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Slot filter
      if (selectedSlot !== 'all' && p.slot !== selectedSlot) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = p.title.toLowerCase().includes(q);
        const mCat = p.category.toLowerCase().includes(q);
        const mColor = (p.spec.style_details?.primary_color_fa || '').toLowerCase().includes(q);
        if (!mTitle && !mCat && !mColor) return false;
      }
      return true;
    });
  }, [products, selectedSlot, searchQuery]);

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl h-full max-h-[820px]">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <span>کالکشن لباس‌های {storeName}</span>
          </h2>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            {filteredProducts.length} مدل
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          برای پرو هر لباس روی آن کلیک کنید؛ لباس‌های هم‌رده به صورت خودکار جایگزین می‌شوند.
        </p>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در بین لباس‌های این فروشگاه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-500/70 focus:outline-none text-white placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Slot Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3 border-b border-slate-800/80">
        {SLOT_TABS.map((tab) => {
          const isActive = selectedSlot === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSlot(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-102'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Garment Cards Grid */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-0.5">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            لباسی در این دسته‌بندی یافت نشد.
          </div>
        ) : (
          filteredProducts.map((garment) => {
            const isEquipped = wornProductIds.has(garment.id);

            return (
              <div
                key={garment.id}
                onClick={() => onToggleGarment(garment)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  isEquipped
                    ? 'bg-amber-500/10 border-amber-500/70 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/50 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                  <img
                    src={garment.imageUrl}
                    alt={garment.title}
                    className="max-w-full max-h-full object-contain drop-shadow-md"
                  />
                  {isEquipped && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </div>

                {/* Garment Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {garment.slot === 'slot_top'
                        ? 'بالاتنه'
                        : garment.slot === 'slot_bottom'
                        ? 'پایین‌تنه'
                        : garment.slot === 'slot_outer'
                        ? 'لباس‌رو'
                        : 'کفش'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {garment.spec.style_details?.primary_color_fa}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                    {garment.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-amber-400">
                      {garment.price.toLocaleString()} تومان
                    </span>
                  </div>
                </div>

                {/* Button / Check Icon */}
                <div className="shrink-0">
                  {isEquipped ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>پرو شده</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 group-hover:text-white transition-colors flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>پرو</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
