import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Send,
  X,
  Layers,
} from 'lucide-react';
import { ActiveOutfit, GarmentSlot, ClothingProduct } from '../types/clothing';
import { resolveGarmentImageUrl } from '../utils/api';

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

  const SLOTS_CONFIG: Array<{ key: GarmentSlot; title: string; layerNote: string; icon: string }> = [
    { key: 'slot_outer', title: 'لباس‌رو (کت / کاپشن)', layerNote: 'لایه رویی (Z: 40)', icon: '🧥' },
    { key: 'slot_top', title: 'بالاتنه (تی‌شرت / پیراهن)', layerNote: 'روی کمر شلوار (Z: 30)', icon: '👕' },
    { key: 'slot_bottom', title: 'پایین‌تنه (شلوار / جین)', layerNote: 'زیر تی‌شرت (Z: 20)', icon: '👖' },
    { key: 'slot_shoes', title: 'کفش و کتانی', layerNote: 'پایین‌ترین لایه (Z: 10)', icon: '👟' },
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
    <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs h-full">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>اجزای ست منتخب پرو</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ترتیب فیزیکی لایه‌های لباس روی مانکن
          </p>
        </div>

        {activeItems.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            پاک کردن همه
          </button>
        )}
      </div>

      {/* Layer Slots Breakdown */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
        {SLOTS_CONFIG.map(({ key, title, layerNote, icon }) => {
          const item = activeOutfit[key];

          return (
            <div
              key={key}
              className={`p-3 rounded-2xl border transition-all ${
                item
                  ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 border-dashed'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>{icon}</span>
                  <span>{title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {layerNote}
                </span>
              </div>

              {item ? (
                <div className="flex items-center gap-2.5 mt-2 bg-white p-2 rounded-xl border border-slate-200">
                  <img
                    src={resolveGarmentImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-11 h-11 object-contain rounded-lg bg-slate-50 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] font-black text-amber-600 mt-0.5">
                      {item.price.toLocaleString()} تومان
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(key)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف این لباس از ست"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 text-center py-2 font-medium">
                  هنوز لباسی برای این اسلات انتخاب نشده
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Total & Order Action */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-bold">مجموع قیمت ست کامل:</span>
          <span className="text-base font-black text-slate-900">
            {totalPrice.toLocaleString()} تومان
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOrderModalOpen(true)}
          disabled={activeItems.length === 0}
          className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
            activeItems.length > 0
              ? 'bg-slate-900 hover:bg-black text-white cursor-pointer hover:shadow-md'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>ثبت سفارش و خرید ست ({activeItems.length} تکه)</span>
        </button>
      </div>

      {/* Checkout Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {orderPlaced ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-black text-slate-900">سفارش شما با موفقیت ثبت شد!</h3>
                <p className="text-xs text-slate-500">
                  به زودی از فروشگاه جهت هماهنگی ارسال با شما تماس گرفته خواهد شد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <span>تکمیل سفارش ست لباس انتخابی</span>
                </h3>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">تعداد لباس:</span>
                    <span className="font-bold text-slate-900">{activeItems.length} تکه</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">مبلغ نهایی:</span>
                    <span className="font-bold text-amber-600">{totalPrice.toLocaleString()} تومان</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400"
                    placeholder="مثال: علی فیروزآبادی"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس همراه:</label>
                  <input
                    type="tel"
                    required
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400"
                    placeholder="09123456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">آدرس پستی جهت ارسال:</label>
                  <textarea
                    rows={2}
                    required
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400"
                    placeholder="استان، شهر، خیابان..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>تأیید و ارسال سفارش</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
