import React from 'react';
import {
  Sparkles,
  Camera,
  Shirt,
  ShoppingBag,
} from 'lucide-react';
import { ActiveOutfit, ClothingProduct } from '../types/clothing';

interface NavbarProps {
  activeOutfit: ActiveOutfit;
  activeView: 'tryon' | 'upload';
  onChangeView: (view: 'tryon' | 'upload') => void;
  onOpenPromptGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeOutfit,
  activeView,
  onChangeView,
  onOpenPromptGuide,
}) => {
  const activePieces = Object.values(activeOutfit).filter(Boolean) as ClothingProduct[];
  const activePiecesCount = activePieces.length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
        {/* Right side (RTL): Brand Logo */}
        <div
          onClick={() => onChangeView('tryon')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ✦
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1">
              <span>پرو مجازی</span>
              <span className="text-amber-400">هوشمند</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
              Virtual Try-On Studio
            </span>
          </div>
        </div>

        {/* Center: Clean 2-Tab Navigation */}
        <nav className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => onChangeView('tryon')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'tryon'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>آپلود لباس و فایل JSON</span>
          </button>
        </nav>

        {/* Left side: AI Prompt Button & Outfit Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPromptGuide}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition-all cursor-pointer"
            title="مشاهده پرامپت استخراج فایل JSON لباس از هوش مصنوعی"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>پرامپت JSON هوش مصنوعی</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {activePiecesCount > 0 ? `${activePiecesCount} تکه ست شده` : 'مانکن خالی'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
