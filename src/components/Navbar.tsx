import React from 'react';
import {
  Sparkles,
  Store,
  Camera,
  Shirt,
  HelpCircle,
  ShoppingBag,
  ChevronDown
} from 'lucide-react';
import { StoreProfile, ActiveOutfit, ClothingProduct } from '../types/clothing';

interface NavbarProps {
  currentStore: StoreProfile;
  activeOutfit: ActiveOutfit;
  activeView: 'tryon' | 'upload' | 'prompt-guide';
  onChangeView: (view: 'tryon' | 'upload' | 'prompt-guide') => void;
  onOpenStoreModal: () => void;
  onOpenPromptGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStore,
  activeOutfit,
  activeView,
  onChangeView,
  onOpenStoreModal,
  onOpenPromptGuide,
}) => {
  const activePieces = Object.values(activeOutfit).filter(Boolean) as ClothingProduct[];
  const activePiecesCount = activePieces.length;
  const totalPrice = activePieces.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
        {/* Right side (in RTL): Brand & Store Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            onClick={() => onChangeView('tryon')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ✦
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1">
                <span>VTON</span>
                <span className="text-amber-400">STUDIO</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
                پرو مجازی هوشمند مانکن
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          {/* Store Selector Pill */}
          <button
            type="button"
            onClick={onOpenStoreModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-slate-200 transition-all cursor-pointer group hover:border-amber-500/50"
            title="تغییر فروشگاه یا انتخاب بوتیک دیگر"
          >
            <span className="text-base">{currentStore.logoEmoji || '🛍️'}</span>
            <div className="text-right">
              <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                {currentStore.nameFa}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {currentStore.city}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => onChangeView('tryon')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'tryon'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>اتاق پرو مجازی</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>آپلود لباس و فایل JSON</span>
          </button>

          <button
            type="button"
            onClick={onOpenPromptGuide}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>پرامپت هوش مصنوعی</span>
          </button>
        </nav>

        {/* Left side: Active Outfit Snapshot & Total Price */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] text-slate-400 font-medium">مجموع قیمت ست</span>
            <span className="text-xs font-black text-amber-400">
              {totalPrice.toLocaleString()} تومان
            </span>
          </div>

          <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {activePiecesCount > 0 ? `${activePiecesCount} تکه ست شده` : 'بوم خالی'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
