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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
        {/* Right side (RTL): Brand Logo */}
        <div
          onClick={() => onChangeView('tryon')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ✦
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
              <span>پرو مجازی</span>
              <span className="text-amber-500">هوشمند</span>
            </span>
            <span className="text-[10px] text-slate-500 block -mt-1 font-medium">
              3D AI Virtual Fitting Room
            </span>
          </div>
        </div>

        {/* Center: Clean 2-Tab Navigation */}
        <nav className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => onChangeView('tryon')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'tryon'
                ? 'bg-white text-slate-950 shadow-sm font-black border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Shirt className="w-4 h-4 text-amber-500" />
            <span>اتاق پرو مجازی</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'upload'
                ? 'bg-white text-slate-950 shadow-sm font-black border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-500" />
            <span>آپلود لباس و فایل JSON</span>
          </button>
        </nav>

        {/* Left side: AI Prompt Button & Outfit Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPromptGuide}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer"
            title="مشاهده پرامپت استخراج فایل JSON لباس از هوش مصنوعی"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>پرامپت JSON هوش مصنوعی</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900">
              {activePiecesCount > 0 ? `${activePiecesCount} لباس تن مانکن` : 'مانکن خالی'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
