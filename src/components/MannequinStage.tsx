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
import { resolveGarmentImageUrl } from '../utils/api';

interface MannequinGarmentImageProps {
  src: string;
  alt: string;
  className?: string;
}

const MannequinGarmentImage: React.FC<MannequinGarmentImageProps> = ({ src, alt, className }) => {
  const resolved = resolveGarmentImageUrl(src);
  const [cleanSrc, setCleanSrc] = useState<string>(() => transparencyCache.get(resolved) || resolved);

  useEffect(() => {
    let active = true;
    const targetUrl = resolveGarmentImageUrl(src);
    if (targetUrl && !targetUrl.startsWith('data:image/svg')) {
      if (transparencyCache.has(targetUrl)) {
        setCleanSrc(transparencyCache.get(targetUrl)!);
      } else {
        removeWhiteBackground(targetUrl).then((cleaned) => {
          if (active) setCleanSrc(cleaned);
        });
      }
    } else {
      setCleanSrc(targetUrl);
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
  const [mannequinMode, setMannequinMode] = useState<'real' | 'ghost'>('real');
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const topItem = activeOutfit.slot_top;
  const bottomItem = activeOutfit.slot_bottom;
  const outerItem = activeOutfit.slot_outer;
  const shoesItem = activeOutfit.slot_shoes;

  const totalPieces = Object.values(activeOutfit).filter(Boolean).length;

  // Golden Anatomical Proportions (40% Torso to 60% Legs):
  // Tops: centered around 34%, collar emerges at 20-22% right under the neck, hem at waistline ~46%.
  const calcTopY = topItem
    ? (topItem.placement.offset_y_percent && topItem.placement.offset_y_percent >= 28 && topItem.placement.offset_y_percent <= 38
        ? topItem.placement.offset_y_percent
        : 34)
    : 34;

  const calcOuterY = outerItem
    ? (outerItem.placement.offset_y_percent && outerItem.placement.offset_y_percent >= 28 && outerItem.placement.offset_y_percent <= 38
        ? outerItem.placement.offset_y_percent
        : 34)
    : 34;

  // Bottoms: waistband begins at ~45% under top hem, legs flow down to ~82%
  const calcBottomY = bottomItem
    ? (bottomItem.placement.offset_y_percent && bottomItem.placement.offset_y_percent >= 58 && bottomItem.placement.offset_y_percent <= 68
        ? bottomItem.placement.offset_y_percent
        : 64)
    : 64;

  // Shoes: tuck directly underneath pant cuffs at 88% with zero floating gap!
  const calcShoesY = shoesItem
    ? (shoesItem.placement.offset_y_percent && shoesItem.placement.offset_y_percent >= 84 && shoesItem.placement.offset_y_percent <= 92
        ? shoesItem.placement.offset_y_percent
        : 88)
    : 88;

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
          removeWhiteBackground(resolveGarmentImageUrl(garment.imageUrl)).then((cleanUrl) => ({
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
          {/* Mannequin Style Mode Selector: Real 3D Studio vs Ghost */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMannequinMode('real');
                setShowSilhouette(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                mannequinMode === 'real' && showSilhouette
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="تن کردن لباس‌ها روی مانکن رئال ۳بعدی استودیویی"
            >
              <span>🧍‍♂️</span>
              <span className="hidden sm:inline">مانکن رئال</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMannequinMode('ghost');
                setShowSilhouette(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                mannequinMode === 'ghost' && showSilhouette
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="نمایش مانکن نامرئی (Ghost Mannequin)"
            >
              <span>👻</span>
              <span className="hidden sm:inline">مانکن نامرئی</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSilhouette(!showSilhouette)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showSilhouette
                ? 'bg-amber-50 text-amber-600 border-amber-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900'
            }`}
            title="نمایش / پنهان‌سازی کالبد مانکن"
          >
            {showSilhouette ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => (prev === 1 ? 1.15 : 1))}
            className="p-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
          <div className="absolute bottom-6 left-12 right-12 h-6 bg-slate-500/25 rounded-[100%] blur-sm pointer-events-none"></div>
          <div className="absolute bottom-3 text-[10px] text-slate-400 font-mono tracking-wider">
            {mannequinMode === 'real' ? '✦ 3D REAL STUDIO MANNEQUIN ✦' : '3D GHOST MANNEQUIN STUDIO'}
          </div>

          {/* 1. Underlying Mannequin Layer: Realistic 3D Studio Body OR Ghost Silhouette */}
          {showSilhouette && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
              viewBox="0 0 480 740"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Real 3D Studio Mannequin Body Gradients */}
                <linearGradient id="realBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="18%" stopColor="#e2e8f0" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="82%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                <linearGradient id="head3DGrad" x1="25%" y1="0%" x2="75%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#f1f5f9" />
                  <stop offset="80%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                <linearGradient id="armLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="40%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                <linearGradient id="armRightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                <linearGradient id="pedestalPlateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="30%" stopColor="#f8fafc" />
                  <stop offset="70%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>

                {/* Ghost Mannequin Translucent Gradient */}
                <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#f1f5f9" stopOpacity="0.80" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.75" />
                </linearGradient>

                <filter id="bodyShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
              </defs>

              {mannequinMode === 'real' ? (
                /* ======================================================== */
                /* REAL 3D SCULPTED BOUTIQUE MANNEQUIN BODY                 */
                /* ======================================================== */
                <g filter="url(#bodyShadow)">
                  {/* Studio Pedestal Stand Plate */}
                  <ellipse cx="240" cy="655" rx="110" ry="14" fill="url(#pedestalPlateGrad)" stroke="#64748b" strokeWidth="1.2" />
                  <ellipse cx="240" cy="652" rx="90" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" opacity="0.7" />
                  {/* Stand vertical connection rods to ankles */}
                  <line x1="202" y1="620" x2="202" y2="652" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                  <line x1="278" y1="620" x2="278" y2="652" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

                  {/* 1. Mannequin Legs & Feet (Extending from under pants/shorts to shoes) */}
                  {/* Left Leg */}
                  <path
                    d="M 174,380
                       C 168,430 174,480 182,520
                       C 188,550 192,590 194,625
                       L 214,625
                       C 216,590 220,550 224,520
                       C 228,480 234,430 238,380
                       Z"
                    fill="url(#realBodyGrad)"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  {/* Left Foot */}
                  <ellipse cx="204" cy="630" rx="14" ry="7" fill="url(#realBodyGrad)" stroke="#94a3b8" strokeWidth="1" />

                  {/* Right Leg */}
                  <path
                    d="M 242,380
                       C 246,430 252,480 256,520
                       C 260,550 264,590 266,625
                       L 286,625
                       C 288,590 292,550 298,520
                       C 306,480 312,430 306,380
                       Z"
                    fill="url(#realBodyGrad)"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  {/* Right Foot */}
                  <ellipse cx="276" cy="630" rx="14" ry="7" fill="url(#realBodyGrad)" stroke="#94a3b8" strokeWidth="1" />

                  {/* 2. Mannequin Pelvis & Torso (Waist & Midriff connecting top to pants) */}
                  <path
                    d="M 148,188
                       C 142,210 160,250 168,285
                       C 174,312 176,335 174,380
                       C 190,390 220,395 240,395
                       C 260,395 290,390 306,380
                       C 304,335 306,312 312,285
                       C 320,250 338,210 332,188
                       C 310,182 280,175 258,172
                       L 222,172
                       C 200,175 170,182 148,188
                       Z"
                    fill="url(#realBodyGrad)"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />

                  {/* Defined Waist & Anatomical Midriff Shadowing */}
                  <path d="M 188,320 Q 240,330 292,320" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 205,355 Q 240,362 275,355" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

                  {/* 3. Mannequin Left Arm (Emerging naturally through t-shirt/jacket sleeves) */}
                  <path
                    d="M 148,188
                       C 134,205 124,240 126,285
                       C 128,320 134,360 142,400
                       C 145,414 152,425 156,424
                       C 160,423 158,410 155,398
                       C 150,360 148,320 146,285
                       C 146,250 156,220 164,198
                       Z"
                    fill="url(#armLeftGrad)"
                    stroke="#94a3b8"
                    strokeWidth="1.1"
                  />
                  {/* Left Hand / Wrist Contours */}
                  <ellipse cx="150" cy="416" rx="6" ry="12" fill="url(#armLeftGrad)" stroke="#94a3b8" strokeWidth="0.8" />

                  {/* 4. Mannequin Right Arm */}
                  <path
                    d="M 332,188
                       C 346,205 356,240 354,285
                       C 352,320 346,360 338,400
                       C 335,414 328,425 324,424
                       C 320,423 322,410 325,398
                       C 330,360 332,320 334,285
                       C 334,250 324,220 316,198
                       Z"
                    fill="url(#armRightGrad)"
                    stroke="#94a3b8"
                    strokeWidth="1.1"
                  />
                  {/* Right Hand / Wrist Contours */}
                  <ellipse cx="330" cy="416" rx="6" ry="12" fill="url(#armRightGrad)" stroke="#94a3b8" strokeWidth="0.8" />

                  {/* 5. Sculpted Neck with Clavicles (Visible right above garment neckline) */}
                  <path
                    d="M 224,118
                       L 223,168
                       Q 223,176 212,180
                       L 268,180
                       Q 257,176 257,168
                       L 256,118
                       Z"
                    fill="url(#realBodyGrad)"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />
                  {/* Clavicle / Collarbone 3D Highlights (Right above shirt collar) */}
                  <path d="M 214,180 Q 240,188 266,180" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 226,176 Q 240,182 254,176" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                  {/* 6. Sculpted Luxury Abstract Mannequin Head */}
                  <ellipse cx="240" cy="74" rx="27" ry="36" fill="url(#head3DGrad)" stroke="#94a3b8" strokeWidth="1.2" />
                  {/* Temple / Brow Sheen */}
                  <ellipse cx="236" cy="64" rx="14" ry="18" fill="#ffffff" opacity="0.45" />
                  {/* Chin / Jawline Contour */}
                  <path d="M 226,98 Q 240,110 254,98" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                </g>
              ) : (
                /* ======================================================== */
                /* GHOST MANNEQUIN MINIMALIST SILHOUETTE                     */
                /* ======================================================== */
                <g>
                  {/* Head Oval */}
                  <ellipse cx="240" cy="78" rx="28" ry="38" fill="url(#ghostGrad)" stroke="#cbd5e1" strokeWidth="1.2" />
                  {/* Sleek Neck */}
                  <path d="M 226,112 L 226,145 Q 226,152 220,154 M 254,112 L 254,145 Q 254,152 260,154" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />

                  {/* Ghost Mannequin Body Contour */}
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
                    fill="url(#ghostGrad)"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                  />

                  {/* Waist Guideline */}
                  <line x1="174" y1="282" x2="306" y2="282" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
                  {/* Feet Base */}
                  <ellipse cx="202" cy="640" rx="20" ry="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                  <ellipse cx="278" cy="640" rx="20" ry="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                </g>
              )}
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
