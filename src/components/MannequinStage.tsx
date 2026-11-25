import React, { useRef, useState, useEffect } from 'react';
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
import { removeWhiteBackground, transparencyCache } from '../utils/imageProcessing';

interface MannequinGarmentImageProps {
  src: string;
  alt: string;
  className?: string;
}

const MannequinGarmentImage: React.FC<MannequinGarmentImageProps> = ({ src, alt, className }) => {
  const [cleanSrc, setCleanSrc] = useState<string>(() => transparencyCache.get(src) || src);

  useEffect(() => {
    let active = true;
    if (src && !src.startsWith('data:image/svg')) {
      if (transparencyCache.has(src)) {
        setCleanSrc(transparencyCache.get(src)!);
      } else {
        removeWhiteBackground(src).then((cleaned) => {
          if (active) setCleanSrc(cleaned);
        });
      }
    } else {
      setCleanSrc(src);
    }
    return () => {
      active = false;
    };
  }, [src]);

  return <img src={cleanSrc} alt={alt} className={className} crossOrigin="anonymous" />;
};

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

  // Golden Anatomical Proportions (40% Torso to 60% Legs):
  // Tops: centered around 27%, hem terminates at waistline ~38%.
  const calcTopY = topItem
    ? (topItem.placement.offset_y_percent && topItem.placement.offset_y_percent >= 20 && topItem.placement.offset_y_percent <= 34
        ? topItem.placement.offset_y_percent
        : 27)
    : 27;

  const calcOuterY = outerItem
    ? (outerItem.placement.offset_y_percent && outerItem.placement.offset_y_percent >= 20 && outerItem.placement.offset_y_percent <= 34
        ? outerItem.placement.offset_y_percent
        : 27)
    : 27;

  // Bottoms: waistband begins at ~37% under top hem, legs flow down to ~84%
  const calcBottomY = bottomItem
    ? (bottomItem.placement.offset_y_percent && bottomItem.placement.offset_y_percent >= 52 && bottomItem.placement.offset_y_percent <= 66
        ? bottomItem.placement.offset_y_percent
        : 60)
    : 60;

  // Shoes: tuck directly underneath pant cuffs at 84% with zero floating gap!
  const calcShoesY = shoesItem
    ? (shoesItem.placement.offset_y_percent && shoesItem.placement.offset_y_percent >= 80 && shoesItem.placement.offset_y_percent <= 87
        ? shoesItem.placement.offset_y_percent
        : 84)
    : 84;

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

      if (slotsToDraw.length === 0) {
        setIsExporting(false);
        return;
      }

      Promise.all(
        slotsToDraw.map((garment) =>
          removeWhiteBackground(garment.imageUrl).then((cleanUrl) => ({
            garment,
            cleanUrl,
          }))
        )
      ).then((items) => {
        let loadedCount = 0;
        items.forEach(({ garment, cleanUrl }) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const slotScale = garment.slot === 'slot_bottom'
              ? (garment.placement.scale ? Math.max(garment.placement.scale, 1.15) : 1.20)
              : garment.slot === 'slot_shoes'
              ? (garment.placement.scale ? Math.min(garment.placement.scale, 0.85) : 0.82)
              : garment.slot === 'slot_outer'
              ? (garment.placement.scale ? Math.min(garment.placement.scale, 0.98) : 0.92)
              : (garment.placement.scale ? Math.min(garment.placement.scale, 0.90) : 0.85);

            const effectiveY = garment.slot === 'slot_bottom' ? calcBottomY : garment.slot === 'slot_shoes' ? calcShoesY : garment.slot === 'slot_outer' ? calcOuterY : calcTopY;
            const yPos = (effectiveY / 100) * 1380;
            const baseW = garment.slot === 'slot_bottom' ? 580 : garment.slot === 'slot_shoes' ? 440 : 490;
            const w = baseW * slotScale;
            const h = baseW * slotScale;
            const xPos = 512 - w / 2;

            ctx.drawImage(img, xPos, yPos - 50, w, h);
            loadedCount++;
            if (loadedCount === items.length) {
              const link = document.createElement('a');
              link.download = `vton-studio-outfit-${Date.now()}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              setIsExporting(false);
            }
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === items.length) {
              setIsExporting(false);
            }
          };
          img.src = cleanUrl;
        });
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

          {/* 1. Underlying 3D Invisible Mannequin Body Anatomical Silhouette */}
          {showSilhouette && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
              viewBox="0 0 480 740"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mannequinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#f1f5f9" stopOpacity="0.80" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Head / Oval Stylized Mannequin Head */}
              <ellipse cx="240" cy="78" rx="28" ry="38" fill="url(#mannequinGrad)" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Sleek Neck */}
              <path d="M 226,112 L 226,145 Q 226,152 220,154 M 254,112 L 254,145 Q 254,152 260,154" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />

              {/* Full Anatomical Body Contour (Torso + Pelvis + Legs) */}
              <path
                d="M 220,154 
                   C 195,156 160,165 142,176
                   C 134,182 136,192 144,198
                   C 162,212 178,245 174,282
                   C 172,305 160,326 156,345
                   C 152,364 162,430 172,490
                   C 178,525 186,590 190,635
                   L 214,635
                   C 216,585 220,520 226,460
                   C 230,420 236,365 240,355
                   C 244,365 250,420 254,460
                   C 260,520 264,585 266,635
                   L 290,635
                   C 294,590 302,525 308,490
                   C 318,430 328,364 324,345
                   C 320,326 308,305 306,282
                   C 302,245 318,212 336,198
                   C 344,192 346,182 338,176
                   C 320,165 285,156 260,154
                   Z"
                fill="url(#mannequinGrad)"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />

              {/* Waist Guideline Indicator (Anatomical 40/60 Split at y=282) */}
              <line x1="174" y1="282" x2="306" y2="282" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />

              {/* Feet Pedestal Contact Baselines */}
              <ellipse cx="202" cy="640" rx="20" ry="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
              <ellipse cx="278" cy="640" rx="20" ry="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            </svg>
          )}

          {/* ======================================================== */}
          {/* 2. LAYER 10: SHOES / FOOTWEAR (Z-Index: 10)               */}
          {/* ======================================================== */}
          {shoesItem && (
            <div
              style={{
                top: `${calcShoesY}%`,
                zIndex: shoesItem.placement.z_index || 10,
                transform: `translate(-50%, -50%) scale(${shoesItem.placement.scale ? Math.min(shoesItem.placement.scale, 0.85) : 0.82})`,
              }}
              className="absolute left-1/2 w-[60%] aspect-[2.2/1] transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.22)]"
            >
              <MannequinGarmentImage
                src={shoesItem.imageUrl}
                alt={shoesItem.title}
                className="w-full h-full object-contain"
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
                top: `${calcBottomY}%`,
                zIndex: bottomItem.placement.z_index || 20,
                transform: `translate(-50%, -50%) scale(${bottomItem.placement.scale ? Math.max(bottomItem.placement.scale, 1.15) : 1.20})`,
              }}
              className="absolute left-1/2 w-[74%] aspect-[3/4] transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.18)]"
            >
              <MannequinGarmentImage
                src={bottomItem.imageUrl}
                alt={bottomItem.title}
                className="w-full h-full object-contain"
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
          {/* 4. LAYER 30: TOPWEAR / T-SHIRT / HOODIE (Z-Index: 30)      */}
          {/* ======================================================== */}
          {topItem && (
            <div
              style={{
                top: `${calcTopY}%`,
                zIndex: topItem.placement.z_index || 30,
                transform: `translate(-50%, -50%) scale(${topItem.placement.scale ? Math.min(topItem.placement.scale, 0.90) : 0.85})`,
              }}
              className="absolute left-1/2 w-[64%] aspect-square transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_14px_22px_rgba(0,0,0,0.22)] drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]"
            >
              <MannequinGarmentImage
                src={topItem.imageUrl}
                alt={topItem.title}
                className="w-full h-full object-contain"
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
                top: `${calcOuterY}%`,
                zIndex: outerItem.placement.z_index || 40,
                transform: `translate(-50%, -50%) scale(${outerItem.placement.scale ? Math.min(outerItem.placement.scale, 0.98) : 0.92})`,
              }}
              className="absolute left-1/2 w-[68%] aspect-square transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_18px_26px_rgba(0,0,0,0.26)] drop-shadow-[0_5px_8px_rgba(0,0,0,0.14)]"
            >
              <MannequinGarmentImage
                src={outerItem.imageUrl}
                alt={outerItem.title}
                className="w-full h-full object-contain"
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
