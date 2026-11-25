import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Send,
  X
} from 'lucide-react';
import { ActiveOutfit, GarmentSlot, ClothingProduct } from '../types/clothing';

interface OutfitSummaryPanelProps {
  activeOutfit: ActiveOutfit;
  onRemoveSlot: (slot: GarmentSlot) => void;
  onClearAll: () => void;
}

export const OutfitSummaryPanel: React.FC<OutfitSummaryPanelProps> = ({
  activeOutfit,
  onRemoveSlot,
  onClearAll,
}) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const SLOTS_CONFIG: Array<{ key: GarmentSlot; title: string; icon: string }> = [
    { key: 'slot_top', title: 'بالاتنه (تی‌شرت / پیراهن)', icon: '👕' },
    { key: 'slot_bottom', title: 'پایین‌تنه (شلوار / جین)', icon: '👖' },
    { key: 'slot_outer', title: 'لباس‌رو (کت / کاپشن)', icon: '🧥' },
    { key: 'slot_shoes', title: 'کفش و کتانی', icon: '👟' },
  ];

  const activeItems = Object.values(activeOutfit).filter(Boolean) as ClothingProduct[];
  const totalPrice = activeItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      setIsOrderModalOpen(false);
      setOrderName('');
      setOrderPhone('');
      setOrderAddress('');
    }, 2800);
  };

  return (
    <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl h-full">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>اجزای ست منتخب پرو</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            {activeItems.length} تکه از ۴ تکه لباس انتخاب شده است
          </span>
        </div>

        {activeItems.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
          >
            حذف همه
          </button>
        )}
      </div>

      {/* Slots Breakdown List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
        {SLOTS_CONFIG.map(({ key, title, icon }) => {
          const item = activeOutfit[key];

          return (
            <div
              key={key}
              className={`p-3 rounded-2xl border transition-all ${
                item
                  ? 'bg-slate-950/80 border-slate-700/80 shadow-md'
                  : 'bg-slate-950/30 border-dashed border-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <span>{icon}</span>
                  <span>{title}</span>
                </span>
                {item && (
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(key)}
                    className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="حذف این تکه"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {item ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.title}
                    </h4>
                    <span className="text-xs font-black text-amber-400 block mt-0.5">
                      {item.price.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 font-medium py-1">
                  هیچ موردی انتخاب نشده است
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total & Checkout Section */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">جمع کل ست طراحی‌شده</span>
            <span className="text-sm sm:text-base font-black text-white">
              {totalPrice.toLocaleString()} تومان
            </span>
          </div>
          <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl">
            {activeItems.length} لباس
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOrderModalOpen(true)}
          disabled={activeItems.length === 0}
          className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            activeItems.length > 0
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>ثبت سفارش و خرید ست</span>
        </button>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black text-white">ثبت سفارش اینترنتی ست</h3>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderPlaced ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-black text-white">سفارش شما با موفقیت ثبت شد!</h4>
                <p className="text-xs text-slate-400">
                  فاکتور خرید به همراه عکس ست برای شما ارسال گردید.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">شماره تماس (جهت هماهنگی ارسال):</label>
                  <input
                    type="tel"
                    required
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">آدرس پستی:</label>
                  <textarea
                    rows={2}
                    required
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="شهر، خیابان، پلاک، واحد..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">مبلغ قابل پرداخت:</span>
                  <span className="font-black text-amber-400">{totalPrice.toLocaleString()} تومان</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition-all shadow-md mt-2 cursor-pointer"
                >
                  تأیید و پرداخت نهایی سفارش
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
