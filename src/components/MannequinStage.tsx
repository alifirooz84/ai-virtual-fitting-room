import React, { useRef, useState } from 'react';
import {
  RotateCcw,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Layers,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ActiveOutfit, GarmentSlot, ClothingProduct } from '../types/clothing';

interface MannequinStageProps {
  activeOutfit: ActiveOutfit;
  onRemoveSlot: (slot: GarmentSlot) => void;
  onClearAll: () => void;
}

export const MannequinStage: React.FC<MannequinStageProps> = ({
  activeOutfit,
  onRemoveSlot,
  onClearAll,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const topItem = activeOutfit.slot_top;
  const bottomItem = activeOutfit.slot_bottom;
  const outerItem = activeOutfit.slot_outer;
  const shoesItem = activeOutfit.slot_shoes;

  const totalPieces = Object.values(activeOutfit).filter(Boolean).length;

  const handleDownloadSnapshot = () => {
    setIsExporting(true);
    setTimeout(() => {
      const node = canvasRef.current;
      if (!node) return;

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1380;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Studio crisp white radial background
      const grad = ctx.createRadialGradient(512, 600, 100, 512, 600, 800);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1380);

      // Floor pedestal shadow
      ctx.beginPath();
      ctx.ellipse(512, 1310, 320, 35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.fill();

      // Draw active slots strictly in z-index order (shoes -> bottom -> top -> outer)
      const slotsToDraw = [shoesItem, bottomItem, topItem, outerItem].filter(Boolean) as ClothingProduct[];

      let loadedCount = 0;
      if (slotsToDraw.length === 0) {
        setIsExporting(false);
        return;
      }

      slotsToDraw.forEach((garment) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const yPos = (garment.placement.offset_y_percent / 100) * 1380;
          const scale = garment.placement.scale || 1.0;
          const w = 580 * scale;
          const h = 580 * scale;
          const xPos = 512 - w / 2;

          ctx.drawImage(img, xPos, yPos - 50, w, h);
          loadedCount++;
          if (loadedCount === slotsToDraw.length) {
            const link = document.createElement('a');
            link.download = `vton-studio-outfit-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsExporting(false);
          }
        };
        img.src = garment.imageUrl;
      });
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 overflow-hidden shadow-xs relative min-h-[640px] lg:min-h-[760px]">
      {/* Top Studio Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center text-sm font-black">
            ✦
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span>استیج استودیویی پرو مانکن ۳بعدی</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                {totalPieces} لباس فعال
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              لایه‌بندی خودکار: شلوار زیر تی‌شرت، تی‌شرت روی کمر، و کت روی همه
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowSilhouette(!showSilhouette)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              showSilhouette
                ? 'bg-amber-50 text-amber-600 border-amber-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900'
            }`}
            title="نمایش / پنهان‌سازی سیلوئت مانکن"
          >
            {showSilhouette ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => (prev === 1 ? 1.15 : 1))}
            className="p-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="بزرگنمایی مانکن"
          >
            {zoom === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClearAll}
            disabled={totalPieces === 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              totalPieces > 0
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 cursor-pointer'
                : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
            }`}
            title="پاک کردن کل ست مانکن"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">پاک کردن ست</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSnapshot}
            disabled={totalPieces === 0 || isExporting}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              totalPieces > 0
                ? 'bg-slate-900 hover:bg-black text-white hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="دانلود تصویر باکیفیت ست نهایی"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExporting ? 'در حال خروجی...' : 'دانلود تصویر ست'}</span>
          </button>
        </div>
      </div>

      {/* Center White Studio Stage Canvas */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 select-none">
        {/* Soft Warm Studio Ambient Lights */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[480px] h-[640px] bg-gradient-to-b from-amber-100/40 via-slate-100/30 to-slate-200/40 rounded-full blur-3xl"></div>
        </div>

        {/* Scalable Container */}
        <div
          ref={canvasRef}
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease-out' }}
          className="relative w-[340px] sm:w-[400px] md:w-[460px] h-[640px] sm:h-[700px] rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100/80 border border-slate-200/90 shadow-xl flex items-center justify-center overflow-hidden"
        >
          {/* Studio Pedestal / Floor Shadow */}
          <div className="absolute bottom-8 left-14 right-14 h-5 bg-slate-400/20 rounded-[100%] blur-sm pointer-events-none"></div>
          <div className="absolute bottom-5 text-[10px] text-slate-400 font-mono tracking-wider">
            3D GHOST MANNEQUIN STUDIO
          </div>

          {/* 1. Underlying 3D Invisible Mannequin Body Wireframe Silhouette */}
          {showSilhouette && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-slate-300 stroke-current"
              viewBox="0 0 480 740"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head / Neck */}
              <ellipse cx="240" cy="95" rx="36" ry="46" strokeWidth="1.2" strokeDasharray="4 4"/>
              <path d="M 226,140 L 226,170 M 254,140 L 254,170" strokeWidth="1.2"/>

              {/* Shoulders & Torso */}
              <path
                d="M 140,185 Q 240,165 340,185 L 320,380 Q 240,390 160,380 Z"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Waist line (Waistband Snap Indicator) */}
              <line x1="160" y1="380" x2="320" y2="380" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>

              {/* Legs */}
              <path
                d="M 160,385 L 175,630 L 220,630 L 235,460 L 245,460 L 260,630 L 305,630 L 320,385"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Feet baseline */}
              <ellipse cx="198" cy="650" rx="28" ry="10" strokeWidth="1.2"/>
              <ellipse cx="282" cy="650" rx="28" ry="10" strokeWidth="1.2"/>
            </svg>
          )}

          {/* ======================================================== */}
          {/* 2. LAYER 10: SHOES / FOOTWEAR (Z-Index: 10)               */}
          {/* ======================================================== */}
          {shoesItem && (
            <div
              style={{
                top: `${shoesItem.placement.offset_y_percent}%`,
                zIndex: shoesItem.placement.z_index || 10,
                transform: `translate(-50%, -50%) scale(${shoesItem.placement.scale || 1.0})`,
              }}
              className="absolute left-1/2 w-[72%] aspect-[2/1] transition-all duration-300 pointer-events-auto group"
            >
              <img
                src={shoesItem.imageUrl}
                alt={shoesItem.title}
                className="w-full h-full object-contain filter drop-shadow-md"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_shoes')}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer"
                title="حذف کفش از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. LAYER 20: BOTTOMWEAR / PANTS (Z-Index: 20 - زیر تی‌شرت) */}
          {/* ======================================================== */}
          {bottomItem && (
            <div
              style={{
                top: `${bottomItem.placement.offset_y_percent}%`,
                zIndex: bottomItem.placement.z_index || 20,
                transform: `translate(-50%, -50%) scale(${bottomItem.placement.scale || 1.0})`,
              }}
              className="absolute left-1/2 w-[68%] aspect-[3/4] transition-all duration-300 pointer-events-auto group"
            >
              <img
                src={bottomItem.imageUrl}
                alt={bottomItem.title}
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_bottom')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer"
                title="حذف شلوار از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. LAYER 30: TOPWEAR / T-SHIRT (Z-Index: 30 - روی شلوار)  */}
          {/* ======================================================== */}
          {topItem && (
            <div
              style={{
                top: `${topItem.placement.offset_y_percent}%`,
                zIndex: topItem.placement.z_index || 30,
                transform: `translate(-50%, -50%) scale(${topItem.placement.scale || 1.0})`,
              }}
              className="absolute left-1/2 w-[76%] aspect-square transition-all duration-300 pointer-events-auto group"
            >
              <img
                src={topItem.imageUrl}
                alt={topItem.title}
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_top')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer"
                title="حذف تی‌شرت از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. LAYER 40: OUTERWEAR / JACKET (Z-Index: 40 - روی همه)  */}
          {/* ======================================================== */}
          {outerItem && (
            <div
              style={{
                top: `${outerItem.placement.offset_y_percent}%`,
                zIndex: outerItem.placement.z_index || 40,
                transform: `translate(-50%, -50%) scale(${outerItem.placement.scale || 1.05})`,
              }}
              className="absolute left-1/2 w-[82%] aspect-square transition-all duration-300 pointer-events-auto group"
            >
              <img
                src={outerItem.imageUrl}
                alt={outerItem.title}
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_outer')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer"
                title="حذف کت از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Slot Status Pills */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 z-10">
        <div className={`p-2 rounded-xl text-center border transition-all ${
          topItem ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">بالاتنه (روی شلوار)</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {topItem ? topItem.title : 'خالی'}
          </span>
        </div>

        <div className={`p-2 rounded-xl text-center border transition-all ${
          bottomItem ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">پایین‌تنه (زیر تی‌شرت)</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {bottomItem ? bottomItem.title : 'خالی'}
          </span>
        </div>

        <div className={`p-2 rounded-xl text-center border transition-all ${
          outerItem ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">لباس‌رو (کت/کاپشن)</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {outerItem ? outerItem.title : 'خالی'}
          </span>
        </div>

        <div className={`p-2 rounded-xl text-center border transition-all ${
          shoesItem ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">کفش و کتانی</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {shoesItem ? shoesItem.title : 'خالی'}
          </span>
        </div>
      </div>
    </div>
  );
};
