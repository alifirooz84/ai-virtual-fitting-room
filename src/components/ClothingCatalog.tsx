import React, { useState, useMemo } from 'react';
import { Search, Check, Trash2 } from 'lucide-react';
import { ClothingProduct, GarmentSlot, ActiveOutfit } from '../types/clothing';
import { resolveGarmentImageUrl } from '../utils/api';

interface ClothingCatalogProps {
  products: ClothingProduct[];
  activeOutfit: ActiveOutfit;
  onToggleGarment: (garment: ClothingProduct) => void;
  onDeleteProduct?: (id: string) => void;
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
  onDeleteProduct,
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
    <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs h-full max-h-[820px]">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <span>کالکشن لباس‌ها</span>
          </h2>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {filteredProducts.length} مدل
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          روی هر لباس کلیک کنید تا تن مانکن ست شود (تی‌شرت با تی‌شرت، و شلوار با شلوار جایگزین می‌شود).
        </p>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در بین لباس‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Slot Category Tabs */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-100">
        {SLOT_TABS.map((tab) => {
          const isActive = selectedSlot === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSlot(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Clothing Grid */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-3xl block mb-2">🛍️</span>
            <p className="text-xs">هیچ لباسی در این دسته‌بندی یافت نشد.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isEquipped = wornProductIds.has(product.id);
            const slotTitle =
              product.slot === 'slot_top'
                ? 'بالاتنه (روی شلوار)'
                : product.slot === 'slot_bottom'
                ? 'پایین‌تنه (زیر تی‌شرت)'
                : product.slot === 'slot_outer'
                ? 'لباس‌رو (کت)'
                : 'کفش';

            return (
              <div
                key={product.id}
                onClick={() => onToggleGarment(product)}
                className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  isEquipped
                    ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-2 ring-amber-400/20'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Garment Preview Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                  <img
                    src={resolveGarmentImageUrl(product.imageUrl)}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  {isEquipped && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {slotTitle}
                    </span>
                    {product.spec.style_details?.fabric_type && (
                      <span className="text-[10px] text-slate-500 truncate">
                        • {product.spec.style_details.fabric_type}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-amber-600">
                      {product.price.toLocaleString()} تومان
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold transition-colors ${
                          isEquipped ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      >
                        {isEquipped ? '✓ تن مانکن' : '+ انتخاب برای پرو'}
                      </span>
                      {onDeleteProduct && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`آیا از حذف لباس "${product.title}" از دیتابیس مطمئن هستید؟`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="حذف این لباس از دیتابیس"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
