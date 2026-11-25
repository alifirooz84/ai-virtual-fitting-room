import React, { useState } from 'react';
import { Store, Plus, MapPin, X, Check, ArrowRight } from 'lucide-react';
import { StoreProfile, ClothingProduct } from '../types/clothing';
import { apiFetch } from '../utils/api';

interface StoreDirectoryModalProps {
  stores: StoreProfile[];
  currentStoreSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectStore: (storeSlug: string) => void;
  onStoreCreated: (store: StoreProfile) => void;
  products: ClothingProduct[];
}

export const StoreDirectoryModal: React.FC<StoreDirectoryModalProps> = ({
  stores,
  currentStoreSlug,
  isOpen,
  onClose,
  onSelectStore,
  onStoreCreated,
  products,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [nameFa, setNameFa] = useState('');
  const [city, setCity] = useState('تهران');
  const [description, setDescription] = useState('');
  const [logoEmoji, setLogoEmoji] = useState('🛍️');

  if (!isOpen) return null;

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    try {
      const res = await apiFetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameFa: nameFa.trim(),
          nameEn: nameFa.trim(),
          city: city.trim() || 'تهران',
          description: description.trim() || 'بوتیک پوشاک اختصاصی',
          logoEmoji: logoEmoji.trim() || '🛍️',
        }),
      });

      if (res.ok) {
        const created = await res.json();
        onStoreCreated(created);
        onSelectStore(created.slug);
        setIsCreating(false);
        setNameFa('');
        setDescription('');
      }
    } catch {
      const slug = nameFa.trim().toLowerCase().replace(/\s+/g, '-');
      const fallback: StoreProfile = {
        id: `store-${Date.now()}`,
        slug,
        nameFa: nameFa.trim(),
        nameEn: nameFa.trim(),
        city: city.trim() || 'تهران',
        description: description.trim() || 'بوتیک پوشاک اختصاصی',
        logoEmoji: logoEmoji.trim() || '🛍️',
        badge: 'بوتیک جدید',
        themeColor: '#1e293b',
        createdAt: new Date().toISOString(),
      };
      onStoreCreated(fallback);
      onSelectStore(fallback.slug);
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        dir="rtl"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              🏬
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                فهرست فروشگاه‌ها و بوتیک‌های فعال
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                هر فروشگاه صفحه اختصاصی، دیتابیس کاتالوگ و اتاق پرو مجزای خود را دارد.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {!isCreating ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  فروشگاه مورد نظر خود را برای ورود به اتاق پرو انتخاب کنید:
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت بوتیک جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {stores.map((s) => {
                  const isCurrent = s.slug === currentStoreSlug;
                  const storeProds = products.filter((p) => p.storeSlug === s.slug);

                  return (
                    <div
                      key={s.slug}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30 shadow-lg'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-md">
                          {s.logoEmoji || '🛍️'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white truncate">
                              {s.nameFa}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shrink-0">
                                در حال مشاهده
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {s.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{s.city}</span>
                            </span>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">
                              {storeProds.length} لباس در کاتالوگ
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectStore(s.slug);
                          onClose();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-center ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>فروشگاه فعال</span>
                          </>
                        ) : (
                          <>
                            <span>ورود به فروشگاه</span>
                            <span>←</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">مشخصات فروشگاه جدید:</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  بازگشت به فهرست
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نام فروشگاه / برند:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بوتیک الگانس تهران"
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">شهر:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="تهران، اصفهان، شیراز..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ایموجی لوگو:</label>
                  <input
                    type="text"
                    value={logoEmoji}
                    onChange={(e) => setLogoEmoji(e.target.value)}
                    placeholder="🛍️ یا 🏛️ یا ✨"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">توضیحات کوتاه سبک فروشگاه:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: مجموعه تخصصی لباس‌های مجلسی و اسپرت..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
              >
                ثبت و ورود به این فروشگاه
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
