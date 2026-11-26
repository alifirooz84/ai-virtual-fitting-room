import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Shirt,
  ShoppingBag,
  Database,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
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
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const activePieces = Object.values(activeOutfit).filter(Boolean) as ClothingProduct[];
  const activePiecesCount = activePieces.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 py-2.5 transition-all shadow-xs">
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
              استودیو پرو آنلاین و استایلینگ لایه‌ای | Smart Virtual Try-On
            </span>
          </div>
        </div>

        {/* Center: Clean Customer Navigation */}
        <nav className="flex items-center gap-2">
          {activeView === 'upload' ? (
            <button
              type="button"
              onClick={() => onChangeView('tryon')}
              className="px-4 py-2 rounded-2xl text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به اتاق پرو مجازی</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/90 text-xs font-bold text-slate-700">
              <Shirt className="w-4 h-4 text-amber-500" />
              <span>اتاق پرو اختصاصی مشتریان</span>
            </div>
          )}
        </nav>

        {/* Left side: Outfit Status & Discreet Admin Tools Dropdown */}
        <div className="flex items-center gap-2.5 relative">
          {/* Active Outfit Counter Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900">
              {activePiecesCount > 0 ? `${activePiecesCount} لباس تن مانکن` : 'مانکن خالی'}
            </span>
          </div>

          {/* Discreet Admin / Merchant Tools Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              title="ابزارهای مدیریت، آپلود لباس و تنظیمات فنی"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">ابزارهای مدیریت</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isAdminMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAdminMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    پنل مدیریت فروشگاه و توسعه
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeView('upload');
                      setIsAdminMenuOpen(false);
                    }}
                    className="w-full text-right px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>آپلود لباس جدید و فایل JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenPromptGuide();
                      setIsAdminMenuOpen(false);
                    }}
                    className="w-full text-right px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>راهنمای پرامپت هوش مصنوعی</span>
                  </button>

                  <a
                    href="/api/setup.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsAdminMenuOpen(false)}
                    className="w-full text-right px-3.5 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                  >
                    <Database className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>اتصال دیتابیس هاست (MySQL)</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
