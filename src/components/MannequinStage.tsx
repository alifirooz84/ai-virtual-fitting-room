import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  Sliders,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Check,
  Palette,
  Camera,
} from 'lucide-react';
import { ActiveOutfit, GarmentSlot, ClothingProduct } from '../types/clothing';
import { removeWhiteBackground, transparencyCache } from '../utils/imageProcessing';
import { resolveGarmentImageUrl } from '../utils/api';

interface MannequinGarmentImageProps {
  src: string;
  alt: string;
  className?: string;
  slot?: 'slot_top' | 'slot_bottom' | 'slot_outer' | 'slot_shoes' | string;
}

const MannequinGarmentImage: React.FC<MannequinGarmentImageProps> = ({ src, alt, className, slot }) => {
  const resolved = resolveGarmentImageUrl(src);
  const cacheKey = slot ? `${resolved}_${slot}` : resolved;
  const [cleanSrc, setCleanSrc] = useState<string>(() => transparencyCache.get(cacheKey) || resolved);

  useEffect(() => {
    let active = true;
    const targetUrl = resolveGarmentImageUrl(src);
    if (targetUrl && !targetUrl.startsWith('data:image/svg')) {
      const key = slot ? `${targetUrl}_${slot}` : targetUrl;
      if (transparencyCache.has(key)) {
        setCleanSrc(transparencyCache.get(key)!);
      } else {
        removeWhiteBackground(targetUrl, {
          slot,
          normalizeScale: true,
          colorTolerance: 40,
          luminanceThreshold: 125,
        }).then((cleaned) => {
          transparencyCache.set(key, cleaned);
          if (active) setCleanSrc(cleaned);
        });
      }
    } else {
      setCleanSrc(targetUrl);
    }
    return () => {
      active = false;
    };
  }, [src, slot]);

  return <img src={cleanSrc} alt={alt} className={className} crossOrigin="anonymous" />;
};

export type MannequinTheme = 'charcoal' | 'sand' | 'skin' | 'ghost';
export type CameraPreset = 'full' | 'top' | 'bottom';
export type TuckMode = 'untucked' | 'tucked';

interface MannequinStageProps {
  activeOutfit: ActiveOutfit;
  onRemoveSlot: (slot: GarmentSlot) => void;
  onClearAll: () => void;
  availableProducts?: ClothingProduct[];
  onSelectProduct?: (product: ClothingProduct) => void;
}

export const MannequinStage: React.FC<MannequinStageProps> = ({
  activeOutfit,
  onRemoveSlot,
  onClearAll,
  availableProducts = [],
  onSelectProduct,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [mannequinTheme, setMannequinTheme] = useState<MannequinTheme>('charcoal');
  const [tuckMode, setTuckMode] = useState<TuckMode>('untucked');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('full');
  const [isFineTuningOpen, setIsFineTuningOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Live Fine-Tuning Overrides (Calibrated Golden Proportion Standards)
  const [topOffsetY, setTopOffsetY] = useState(28.0);
  const [topScale, setTopScale] = useState(0.96);
  const [bottomOffsetY, setBottomOffsetY] = useState(67.0);
  const [bottomScale, setBottomScale] = useState(1.00);
  const [outerOffsetY, setOuterOffsetY] = useState(44.5);
  const [outerScale, setOuterScale] = useState(1.00);
  const [shoesOffsetY, setShoesOffsetY] = useState(92.0);
  const [shoesScale, setShoesScale] = useState(0.90);
  const [isSleeveTrimActive, setIsSleeveTrimActive] = useState(true);
  const [sleeveTrimPercent, setSleeveTrimPercent] = useState(18);
  const [isOuterVoidMaskActive, setIsOuterVoidMaskActive] = useState(false);
  const [outerVoidWidthPercent, setOuterVoidWidthPercent] = useState(24);
  const [hasLayeredCollar, setHasLayeredCollar] = useState(false);

  // 3D Spatial Parallax Tilt (Dynamic depth on mouse movement)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 7; // -7 to +7 deg
    const rotateX = -((y - centerY) / centerY) * 6; // -6 to +6 deg
    setTilt({ rotateX, rotateY });
  };

  const handleStageMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const topItem = activeOutfit.slot_top;
  const bottomItem = activeOutfit.slot_bottom;
  const outerItem = activeOutfit.slot_outer;
  const shoesItem = activeOutfit.slot_shoes;

  const totalPieces = Object.values(activeOutfit).filter(Boolean).length;

  // Auto-Snap Waistline & Collar: Seamless overlap between topwear, coat collar, and pants
  useEffect(() => {
    const rawTitle = (topItem?.title || '').toLowerCase();
    const isHoodie = topItem?.category === 'hoodie' || rawTitle.includes('هودی') || rawTitle.includes('hoodie');
    const isShirtOrPolo = topItem?.category === 'shirt' || rawTitle.includes('پیراهن') || rawTitle.includes('پلوشرت') || rawTitle.includes('polo');
    const isTurtleneck = rawTitle.includes('اسکی') || rawTitle.includes('turtle') || rawTitle.includes('یقه ایستاده');

    if (outerItem) {
      // When outerwear (coat/jacket) is worn, topwear collar snuggles up to match coat neckline with 0 gap
      if (isTurtleneck) {
        setTopOffsetY(26.5);
        setTopScale(0.96);
      } else if (isHoodie) {
        setTopOffsetY(27.0);
        setTopScale(0.96);
      } else if (isShirtOrPolo) {
        setTopOffsetY(27.5);
        setTopScale(0.96);
      } else {
        // Standard crewneck / graphic T-shirt: sits perfectly nested inside coat collar and lapels
        setTopOffsetY(28.0);
        setTopScale(0.96);
      }
    } else {
      // Worn standalone (no outerwear): sits at natural lower neck / shoulder base
      setTopOffsetY(31.5);
      setTopScale(0.96);
    }
  }, [topItem?.id, topItem?.title, topItem?.category, !!outerItem]);

  useEffect(() => {
    const isCropped =
      bottomItem?.title?.includes('کراپ') ||
      bottomItem?.title?.toLowerCase().includes('crop');

    setBottomOffsetY(isCropped ? 65.5 : 67.0);
    setBottomScale(1.00);
  }, [bottomItem?.id, bottomItem?.title]);

  useEffect(() => {
    const isLongCoat =
      outerItem?.category === 'coat' ||
      outerItem?.title?.includes('پالتو') ||
      outerItem?.title?.includes('بارانی') ||
      outerItem?.title?.toLowerCase().includes('coat') ||
      outerItem?.title?.toLowerCase().includes('trench');

    setOuterOffsetY(isLongCoat ? 44.5 : 31.5);
    setOuterScale(1.00);

    // Auto-harmonize layering behavior: trim inner sleeves
    if (outerItem) {
      setIsSleeveTrimActive(true);
      setSleeveTrimPercent(18);
      setIsOuterVoidMaskActive(false);
      setOuterVoidWidthPercent(24);
    }
  }, [outerItem?.id, outerItem?.title, outerItem?.category]);

  useEffect(() => {
    setShoesOffsetY(92.0);
    setShoesScale(0.90);
  }, [shoesItem?.id]);

  // Dynamic Camera Transform Style
  const cameraTransform = useMemo(() => {
    if (cameraPreset === 'top') {
      return 'scale(1.36) translateY(12%)';
    }
    if (cameraPreset === 'bottom') {
      return 'scale(1.36) translateY(-18%)';
    }
    return 'scale(1) translateY(0)';
  }, [cameraPreset]);

  // AI Outfit Matcher & Stylist Intelligence
  const outfitAiAnalysis = useMemo(() => {
    if (totalPieces === 0) {
      return {
        score: 0,
        label: 'استیج خالی است',
        tip: 'یک بالاتنه یا پایین‌تنه از کاتالوگ انتخاب کنید تا آنالیز هوشمند استایل فعال شود.',
        recommendedPiece: null as ClothingProduct | null,
      };
    }

    let score = 70;
    let label = 'استایل روزمره کژوال';
    let tip = 'ترکیب لباس‌ها مناسب است.';
    let recommendedPiece: ClothingProduct | null = null;

    if (topItem && bottomItem) {
      score = 94;
      label = 'ست هماهنگ استریت‌ویر (Streetwear Trend)';
      tip = 'ترکیب رنگ بالاتنه و دنیم پایین‌تنه بسیار شیک و چشم‌نواز است.';

      // Suggest shoes if missing
      if (!shoesItem && availableProducts.length > 0) {
        const shoe = availableProducts.find((p) => p.slot === 'slot_shoes');
        if (shoe) {
          tip = 'پیشنهاد هوش مصنوعی: اضافه کردن کتانی چرم سفید این ست را ۱۰۰٪ کامل می‌کند.';
          recommendedPiece = shoe;
        }
      } else if (!outerItem && availableProducts.length > 0) {
        const jacket = availableProducts.find((p) => p.slot === 'slot_outer');
        if (jacket) {
          tip = 'پیشنهاد هوش مصنوعی: پوشیدن هودی یا کت سبک روی این ترکیب، استایل شما را پرمیوم می‌کند.';
          recommendedPiece = jacket;
        }
      }
    } else if (topItem && !bottomItem) {
      score = 80;
      label = 'بالاتنه انتخاب شد';
      tip = 'برای مشاهده تناسب اندام، یک شلوار جین بگ یا کتان به مانکن اضافه کنید.';
      const pant = availableProducts.find((p) => p.slot === 'slot_bottom');
      if (pant) recommendedPiece = pant;
    } else if (bottomItem && !topItem) {
      score = 80;
      label = 'پایین‌تنه انتخاب شد';
      tip = 'یک تیشرت نخی یا دورس اورسایز برای تکمیل بالاتنه انتخاب کنید.';
      const top = availableProducts.find((p) => p.slot === 'slot_top');
      if (top) recommendedPiece = top;
    }

    if (outerItem) score = Math.min(100, score + 5);
    if (shoesItem) score = Math.min(100, score + 4);

    return { score, label, tip, recommendedPiece };
  }, [topItem, bottomItem, outerItem, shoesItem, availableProducts, totalPieces]);

  // Export High-Res Composite Snapshot
  const handleDownloadSnapshot = () => {
    setIsExporting(true);
    setTimeout(() => {
      const node = canvasRef.current;
      if (!node) return;

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1420;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Studio crisp radial background
      const grad = ctx.createRadialGradient(512, 600, 100, 512, 600, 850);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1420);

      // Floor pedestal shadow
      ctx.beginPath();
      ctx.ellipse(512, 1340, 340, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.fill();

      // Slots in visual order depending on tuck mode
      const slotsToDraw = tuckMode === 'tucked'
        ? [shoesItem, topItem, bottomItem, outerItem].filter(Boolean) as ClothingProduct[]
        : [shoesItem, bottomItem, topItem, outerItem].filter(Boolean) as ClothingProduct[];

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
              ? bottomScale
              : garment.slot === 'slot_shoes'
              ? shoesScale
              : garment.slot === 'slot_outer'
              ? outerScale
              : topScale;

            const effectiveY = garment.slot === 'slot_bottom'
              ? bottomOffsetY
              : garment.slot === 'slot_shoes'
              ? shoesOffsetY
              : garment.slot === 'slot_outer'
              ? outerOffsetY
              : topOffsetY;

            const yPos = (effectiveY / 100) * 1420;
            const stageH = 1420;
            const isLongCoat = garment.category === 'coat' || garment.title?.includes('پالتو') || garment.title?.includes('بارانی') || garment.title?.toLowerCase().includes('coat');
            
            let slotH = stageH * 0.30;
            let slotW = 590;
            if (garment.slot === 'slot_bottom') {
              slotH = stageH * 0.51;
              slotW = 570;
            } else if (garment.slot === 'slot_shoes') {
              slotH = stageH * 0.12;
              slotW = 530;
            } else if (garment.slot === 'slot_outer') {
              slotH = isLongCoat ? stageH * 0.62 : stageH * 0.36;
              slotW = 760;
            }

            const w = slotW * slotScale;
            const h = slotH * slotScale;
            const xPos = 512 - w / 2;

            if (garment.slot === 'slot_outer' && isOuterVoidMaskActive) {
              const offCanvas = document.createElement('canvas');
              offCanvas.width = w;
              offCanvas.height = h;
              const offCtx = offCanvas.getContext('2d');
              if (offCtx) {
                offCtx.drawImage(img, 0, 0, w, h);
                offCtx.globalCompositeOperation = 'destination-out';
                offCtx.beginPath();
                const halfW = (outerVoidWidthPercent / 100) * w * 0.5;
                const midX = w / 2;
                offCtx.moveTo(midX, h * 0.20);
                offCtx.lineTo(midX - halfW, h * 0.32);
                offCtx.lineTo(midX - halfW, h * 1.0);
                offCtx.lineTo(midX + halfW, h * 1.0);
                offCtx.lineTo(midX + halfW, h * 0.32);
                offCtx.closePath();
                offCtx.fill();
                ctx.drawImage(offCanvas, xPos, yPos - 50, w, h);
              } else {
                ctx.drawImage(img, xPos, yPos - 50, w, h);
              }
            } else {
              ctx.drawImage(img, xPos, yPos - 50, w, h);
            }
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
            if (loadedCount === items.length) setIsExporting(false);
          };
          img.src = cleanUrl;
        });
      });
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 overflow-hidden shadow-xs relative min-h-[660px] lg:min-h-[780px]">
      {/* 1. TOP STUDIO TOOLBAR & AI STYLING HEADER */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 shrink-0 z-20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Studio Brand & Active Count */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center text-sm font-black shadow-xs">
              ✦
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>استیج استودیویی پرو هوشمند ۳بعدی</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {totalPieces} لباس تن مانکن
                </span>
              </h2>
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mannequin Theme Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMannequinTheme('charcoal'); setShowSilhouette(true); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mannequinTheme === 'charcoal' && showSilhouette
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مانکن زغالی مات استودیویی (کنتراست فوق‌العاده برای دیدن رنگ و فرم لباس)"
              >
                <span>🖤</span>
                <span className="hidden xl:inline">زغالی مات</span>
              </button>

              <button
                type="button"
                onClick={() => { setMannequinTheme('sand'); setShowSilhouette(true); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mannequinTheme === 'sand' && showSilhouette
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مانکن استودیویی سنگی / عاجی"
              >
                <span>🏛️</span>
                <span className="hidden xl:inline">استودیویی</span>
              </button>

              <button
                type="button"
                onClick={() => { setMannequinTheme('skin'); setShowSilhouette(true); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mannequinTheme === 'skin' && showSilhouette
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مانکن با رنگ پوست طبیعی"
              >
                <span>👤</span>
                <span className="hidden xl:inline">رئال</span>
              </button>

              <button
                type="button"
                onClick={() => { setMannequinTheme('ghost'); setShowSilhouette(true); }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mannequinTheme === 'ghost' && showSilhouette
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مانکن نامرئی (Ghost)"
              >
                <span>👻</span>
                <span className="hidden xl:inline">نامرئی</span>
              </button>
            </div>

            {/* Tuck-In / Untucked Toggle */}
            <button
              type="button"
              onClick={() => setTuckMode((prev) => (prev === 'untucked' ? 'tucked' : 'untucked'))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                tuckMode === 'tucked'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="تغییر نحوه پوشش: پیراهن داخل شلوار (Tuck-in) یا روی شلوار (Untucked)"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">
                {tuckMode === 'tucked' ? 'استایل: داخل شلوار' : 'استایل: روی شلوار'}
              </span>
            </button>

            {/* Smart Sleeve Trimming for Outerwear (پالتو / کت روی تی‌شرت) */}
            {outerItem && (
              <>
                <button
                  type="button"
                  onClick={() => setIsSleeveTrimActive((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSleeveTrimActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="برش هوشمند آستین لباس زیر پالتو برای جلوگیری از بیرون‌زدگی لبه‌های تی‌شرت"
                >
                  <span>✂️</span>
                  <span className="hidden sm:inline">
                    {isSleeveTrimActive ? 'برش آستین زیر: فعال' : 'برش آستین زیر: خاموش'}
                  </span>
                </button>

                {/* Smart Outerwear Inner Zipper Void Cutter (برش آستر داخل زیپ پالتو/کاپشن) */}
                <button
                  type="button"
                  onClick={() => setIsOuterVoidMaskActive((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isOuterVoidMaskActive
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="برش هوشمند آستر یا پارچه پشتی داخل زیپ کاپشن/پالتو برای دیده شدن کامل تی‌شرت و طرح سینه"
                >
                  <span>🎽</span>
                  <span className="hidden sm:inline">
                    {isOuterVoidMaskActive ? 'برش آستر زیپ: فعال' : 'برش آستر زیپ: خاموش'}
                  </span>
                </button>
              </>
            )}

            {/* Layered White Shirt Collar Toggle (استایل پیراهن زیر پلیور/کت مثل فشن بلاگرها) */}
            <button
              type="button"
              onClick={() => setHasLayeredCollar((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                hasLayeredCollar
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="افزودن یقه پیراهن سفید کلاسیک روی دورس، پلیور یا پالتو (استایل لایه‌ای شیک اینستاگرامی)"
            >
              <span>👔</span>
              <span className="hidden sm:inline">
                {hasLayeredCollar ? 'یقه پیراهن زیر: فعال' : 'یقه پیراهن زیر'}
              </span>
            </button>

            {/* Camera View Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCameraPreset('top')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  cameraPreset === 'top' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="بزرگنمایی و زوم روی بالاتنه، یقه و آستین‌ها"
              >
                👕 بالاتنه
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('full')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  cameraPreset === 'full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="نمای تمام‌قد استودیو"
              >
                🧍 تمام‌قد
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset('bottom')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  cameraPreset === 'bottom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="بزرگنمایی روی شلوار، فاق و دمپا"
              >
                👖 شلوار
              </button>
            </div>

            {/* Interactive Live Fine-Tuner Toggle */}
            <button
              type="button"
              onClick={() => setIsFineTuningOpen(!isFineTuningOpen)}
              className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isFineTuningOpen
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="تنظیم دقیق زنده ارتفاع و اندازه لباس‌ها روی مانکن"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Clear Outfit */}
            <button
              type="button"
              onClick={onClearAll}
              disabled={totalPieces === 0}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                totalPieces > 0
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 cursor-pointer'
                  : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
              title="پاک کردن کل ست مانکن"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Download Final Outfit Snapshot */}
            <button
              type="button"
              onClick={handleDownloadSnapshot}
              disabled={totalPieces === 0 || isExporting}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                totalPieces > 0
                  ? 'bg-slate-900 hover:bg-black text-white hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="دانلود عکس باکیفیت ست نهایی"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{isExporting ? 'خروجی...' : 'دانلود ست'}</span>
            </button>
          </div>
        </div>

        {/* AI Outfit Intelligence Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-50 to-indigo-500/10 border border-slate-200/80 rounded-2xl p-2.5 px-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              ⚡
            </div>
            <div className="text-xs">
              <span className="font-black text-slate-900 ml-1.5">{outfitAiAnalysis.label}</span>
              <span className="text-slate-500">{outfitAiAnalysis.tip}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {outfitAiAnalysis.recommendedPiece && onSelectProduct && (
              <button
                type="button"
                onClick={() => onSelectProduct(outfitAiAnalysis.recommendedPiece!)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                title={`افزودن ${outfitAiAnalysis.recommendedPiece.title} به ست`}
              >
                <span>+</span>
                <span>افزودن پیشنهاد: {outfitAiAnalysis.recommendedPiece.title || 'محصول'}</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-xs font-black text-slate-800">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>هماهنگی: {outfitAiAnalysis.score}٪</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE FINE-TUNER DRAWER (COLLAPSIBLE) */}
      {isFineTuningOpen && (
        <div className="bg-slate-900 text-white rounded-2xl p-3 my-2 shadow-lg border border-slate-800 transition-all z-20">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>تنظیم هوشمند ابعاد و ارتفاع روی مانکن (Real-time Calibration)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const isCrop = bottomItem?.title?.includes('کراپ') || bottomItem?.title?.toLowerCase().includes('crop');
                const isCoat = outerItem?.category === 'coat' || outerItem?.title?.includes('پالتو') || outerItem?.title?.includes('بارانی') || outerItem?.title?.toLowerCase().includes('coat');
                const rawTitle = (topItem?.title || '').toLowerCase();
                const isHoodie = topItem?.category === 'hoodie' || rawTitle.includes('هودی') || rawTitle.includes('hoodie');
                const isShirtOrPolo = topItem?.category === 'shirt' || rawTitle.includes('پیراهن') || rawTitle.includes('پلوشرت') || rawTitle.includes('polo');
                const isTurtleneck = rawTitle.includes('اسکی') || rawTitle.includes('turtle') || rawTitle.includes('یقه ایستاده');
                const targetTopY = outerItem ? (isTurtleneck ? 26.5 : isHoodie ? 27.0 : isShirtOrPolo ? 27.5 : 28.0) : 31.5;

                setTopOffsetY(targetTopY);
                setTopScale(0.96);
                setBottomOffsetY(isCrop ? 65.5 : 67.0);
                setBottomScale(1.00);
                setOuterOffsetY(isCoat ? 44.5 : 31.5);
                setOuterScale(1.00);
                setShoesOffsetY(92.0);
                setShoesScale(0.90);
                setIsSleeveTrimActive(true);
                setSleeveTrimPercent(18);
                setIsOuterVoidMaskActive(false);
                setOuterVoidWidthPercent(24);
                setHasLayeredCollar(false);
              }}
              className="text-[10px] text-amber-400 hover:underline cursor-pointer"
            >
              بازنشانی به تناسبات طلایی استودیویی
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Topwear Control */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>بالاتنه (تی‌شرت / هودی):</span>
                <span className="text-[11px] text-amber-400 font-mono">
                  Y: {topOffsetY}% | {topScale.toFixed(2)}x
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">ارتفاع Y:</span>
                  <input
                    type="range"
                    min="20"
                    max="44"
                    step="0.5"
                    value={topOffsetY}
                    onChange={(e) => setTopOffsetY(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">مقیاس:</span>
                  <input
                    type="range"
                    min="0.75"
                    max="1.10"
                    step="0.02"
                    value={topScale}
                    onChange={(e) => setTopScale(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Bottomwear Control */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>پایین‌تنه (شلوار / جین):</span>
                <span className="text-[11px] text-amber-400 font-mono">
                  Y: {bottomOffsetY}% | {bottomScale.toFixed(2)}x
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">ارتفاع Y:</span>
                  <input
                    type="range"
                    min="55"
                    max="78"
                    step="0.5"
                    value={bottomOffsetY}
                    onChange={(e) => setBottomOffsetY(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">مقیاس:</span>
                  <input
                    type="range"
                    min="0.85"
                    max="1.25"
                    step="0.02"
                    value={bottomScale}
                    onChange={(e) => setBottomScale(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Outerwear & Sleeve Trim Control */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>لباس‌رو (کت / پالتو):</span>
                <span className="text-[11px] text-amber-400 font-mono">
                  Y: {outerOffsetY}% | {outerScale.toFixed(2)}x
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">ارتفاع Y:</span>
                  <input
                    type="range"
                    min="24"
                    max="55"
                    step="0.5"
                    value={outerOffsetY}
                    onChange={(e) => setOuterOffsetY(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">مقیاس:</span>
                  <input
                    type="range"
                    min="0.88"
                    max="1.25"
                    step="0.02"
                    value={outerScale}
                    onChange={(e) => setOuterScale(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="pt-1 border-t border-slate-700/60 flex items-center justify-between">
                  <label className="text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSleeveTrimActive}
                      onChange={(e) => setIsSleeveTrimActive(e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <span>برش آستین زیر پالتو</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {isSleeveTrimActive ? `${sleeveTrimPercent}%` : 'خاموش'}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-700/60 flex items-center justify-between">
                  <label className="text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOuterVoidMaskActive}
                      onChange={(e) => setIsOuterVoidMaskActive(e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <span>برش آستر داخل زیپ</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {isOuterVoidMaskActive ? `${outerVoidWidthPercent}%` : 'خاموش'}
                  </span>
                </div>
                {isOuterVoidMaskActive && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">فضای زیپ:</span>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      step="1"
                      value={outerVoidWidthPercent}
                      onChange={(e) => setOuterVoidWidthPercent(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footwear Control */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>کفش و کتانی:</span>
                <span className="text-[11px] text-amber-400 font-mono">
                  Y: {shoesOffsetY}% | {shoesScale.toFixed(2)}x
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">ارتفاع Y:</span>
                  <input
                    type="range"
                    min="78"
                    max="94"
                    step="0.5"
                    value={shoesOffsetY}
                    onChange={(e) => setShoesOffsetY(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-12">مقیاس:</span>
                  <input
                    type="range"
                    min="0.75"
                    max="1.15"
                    step="0.02"
                    value={shoesScale}
                    onChange={(e) => setShoesScale(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CENTER STUDIO CANVAS WITH SCULPTED 3D MANNEQUIN BODY */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-2 select-none">
        {/* Studio Ambient Rim Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[660px] bg-gradient-to-b from-amber-100/40 via-slate-100/40 to-slate-200/50 rounded-full blur-3xl"></div>
        </div>

        {/* Scalable Studio Pod with 3D Spatial Parallax */}
        <div
          ref={canvasRef}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${cameraTransform}`,
            transformStyle: 'preserve-3d',
            transition: tilt.rotateX === 0 && tilt.rotateY === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.08s ease-out',
          }}
          className="relative w-[340px] sm:w-[400px] md:w-[460px] h-[640px] sm:h-[700px] rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100/90 border border-slate-200/90 shadow-2xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* Studio Pedestal Base & Soft Contact Shadow */}
          <div className="absolute bottom-6 left-12 right-12 h-6 bg-slate-600/20 rounded-[100%] blur-sm pointer-events-none"></div>
          <div className="absolute bottom-2.5 text-[9px] text-slate-400 font-mono tracking-widest uppercase">
            {mannequinTheme === 'charcoal'
              ? '✦ 3D CHARCOAL STUDIO MANNEQUIN ✦'
              : mannequinTheme === 'sand'
              ? '✦ 3D ALABASTER STUDIO SCULPT ✦'
              : mannequinTheme === 'skin'
              ? '✦ 3D REALISTIC ATELIER BODY ✦'
              : '✦ 3D GHOST MANNEQUIN STUDIO ✦'}
          </div>

          {/* Studio Ambient Harmonization Filter */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-slate-900/10 pointer-events-none mix-blend-overlay rounded-3xl z-30" />

          {/* 3.1 UNDERLYING 3D MANNEQUIN BODY SVG */}
          {showSilhouette && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
              viewBox="0 0 480 740"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 1. Theme Charcoal (Deep Velvet Obsidian with Rim Light) */}
                <linearGradient id="charcoalBody" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="25%" stopColor="#1e293b" />
                  <stop offset="60%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="charcoalHead" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="40%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* 2. Theme Sand (Studio Sandstone / Alabaster) */}
                <linearGradient id="sandBody" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="30%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <linearGradient id="sandHead" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                {/* 3. Theme Skin (Warm Natural Flesh Contour) */}
                <linearGradient id="skinBody" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c2977d" />
                  <stop offset="35%" stopColor="#e0b69e" />
                  <stop offset="65%" stopColor="#f1cdb7" />
                  <stop offset="100%" stopColor="#a67c63" />
                </linearGradient>
                <linearGradient id="skinHead" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#f5dac8" />
                  <stop offset="50%" stopColor="#e0b69e" />
                  <stop offset="100%" stopColor="#a67c63" />
                </linearGradient>

                {/* 4. Ghost Outline */}
                <linearGradient id="ghostFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.75" />
                </linearGradient>

                {/* Pedestal Chrome Base */}
                <linearGradient id="chromeBase" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="30%" stopColor="#f8fafc" />
                  <stop offset="70%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Deep Drop Shadow for Body Volume */}
                <filter id="studio3dShadow" x="-15%" y="-10%" width="130%" height="120%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.22" />
                </filter>
              </defs>

              {mannequinTheme !== 'ghost' ? (
                /* ======================================================== */
                /* FULL SCULPTED 3D STUDIO MANNEQUIN BODY                   */
                /* ======================================================== */
                <g filter="url(#studio3dShadow)">
                  {/* Studio Pedestal Stand Base */}
                  <ellipse cx="240" cy="655" rx="115" ry="15" fill="url(#chromeBase)" stroke="#475569" strokeWidth="1.2" />
                  <ellipse cx="240" cy="652" rx="95" ry="10" fill="#ffffff" opacity="0.6" />
                  {/* Stand Connection Rods */}
                  <line x1="202" y1="620" x2="202" y2="652" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                  <line x1="278" y1="620" x2="278" y2="652" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

                  {/* 1. Mannequin Muscular Legs (Left & Right - Hidden when pants are worn) */}
                  {!bottomItem && (
                    <g>
                      {/* Left Leg */}
                      <path
                        d="M 174,380
                           C 166,430 172,485 180,525
                           C 186,555 190,590 192,630
                           L 216,630
                           C 218,590 222,555 226,525
                           C 230,485 236,430 238,380
                           Z"
                        fill={mannequinTheme === 'charcoal' ? 'url(#charcoalBody)' : mannequinTheme === 'skin' ? 'url(#skinBody)' : 'url(#sandBody)'}
                        stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                        strokeWidth="1.2"
                      />
                      {/* Left Foot */}
                      <ellipse
                        cx="204"
                        cy="634"
                        rx="15"
                        ry="8"
                        fill={mannequinTheme === 'charcoal' ? '#1e293b' : mannequinTheme === 'skin' ? '#c2977d' : '#94a3b8'}
                        stroke="#475569"
                        strokeWidth="1"
                      />

                      {/* Right Leg */}
                      <path
                        d="M 242,380
                           C 244,430 250,485 254,525
                           C 258,555 262,590 264,630
                           L 288,630
                           C 290,590 294,555 300,525
                           C 308,485 314,430 306,380
                           Z"
                        fill={mannequinTheme === 'charcoal' ? 'url(#charcoalBody)' : mannequinTheme === 'skin' ? 'url(#skinBody)' : 'url(#sandBody)'}
                        stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                        strokeWidth="1.2"
                      />
                      {/* Right Foot */}
                      <ellipse
                        cx="276"
                        cy="634"
                        rx="15"
                        ry="8"
                        fill={mannequinTheme === 'charcoal' ? '#1e293b' : mannequinTheme === 'skin' ? '#c2977d' : '#94a3b8'}
                        stroke="#475569"
                        strokeWidth="1"
                      />
                    </g>
                  )}

                  {/* 2. Mannequin Torso & Midriff (Hidden when shirt or jacket is worn) */}
                  {(!topItem && !outerItem) && (
                    <path
                      d="M 144,188
                         C 140,215 158,255 166,290
                         C 172,315 174,340 172,380
                         C 190,392 220,396 240,396
                         C 260,396 290,392 308,380
                         C 306,340 308,315 314,290
                         C 322,255 340,215 336,188
                         C 314,180 282,174 260,172
                         L 220,172
                         C 198,174 166,180 144,188
                         Z"
                      fill={mannequinTheme === 'charcoal' ? 'url(#charcoalBody)' : mannequinTheme === 'skin' ? 'url(#skinBody)' : 'url(#sandBody)'}
                      stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                      strokeWidth="1.2"
                    />
                  )}

                  {/* 3. Mannequin Arms & Hands (Hidden when shirt or jacket is worn) */}
                  {(!topItem && !outerItem) && (
                    <g>
                      {/* Left Arm */}
                      <path
                        d="M 148,188
                           C 142,208 138,245 140,290
                           C 142,325 146,365 150,405
                           C 152,416 156,424 158,422
                           C 160,420 158,410 156,400
                           C 152,365 148,325 148,290
                           C 148,250 152,218 158,196
                           Z"
                        fill={mannequinTheme === 'charcoal' ? 'url(#charcoalBody)' : mannequinTheme === 'skin' ? 'url(#skinBody)' : 'url(#sandBody)'}
                        stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                        strokeWidth="1.2"
                      />
                      <ellipse
                        cx="152"
                        cy="415"
                        rx="6"
                        ry="12"
                        fill={mannequinTheme === 'charcoal' ? '#1e293b' : mannequinTheme === 'skin' ? '#c2977d' : '#94a3b8'}
                        stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                        strokeWidth="1"
                      />

                      {/* Right Arm */}
                      <path
                        d="M 332,188
                           C 338,208 342,245 340,290
                           C 338,325 334,365 330,405
                           C 328,416 324,424 322,422
                           C 320,420 322,410 324,400
                           C 328,365 332,325 332,290
                           C 332,250 328,218 322,196
                           Z"
                        fill={mannequinTheme === 'charcoal' ? 'url(#charcoalBody)' : mannequinTheme === 'skin' ? 'url(#skinBody)' : 'url(#sandBody)'}
                        stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                        strokeWidth="1.2"
                      />
                      <ellipse
                        cx="328"
                        cy="415"
                        rx="6"
                        ry="12"
                        fill={mannequinTheme === 'charcoal' ? '#1e293b' : mannequinTheme === 'skin' ? '#c2977d' : '#94a3b8'}
                        stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                        strokeWidth="1"
                      />
                    </g>
                  )}

                  {/* 5. Cylindrical Solid Neck Filling Garment Collar */}
                  <path
                    d="M 222,112
                       L 220,172
                       Q 220,182 210,186
                       L 270,186
                       Q 260,182 260,172
                       L 258,112
                       Z"
                    fill={mannequinTheme === 'charcoal' ? 'url(#charcoalHead)' : mannequinTheme === 'skin' ? 'url(#skinHead)' : 'url(#sandHead)'}
                    stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                    strokeWidth="1.2"
                  />
                  {/* Collarbone / Clavicle 3D Highlights (Visible right above shirt collar) */}
                  <path d="M 212,186 Q 240,195 268,186" stroke={mannequinTheme === 'charcoal' ? '#64748b' : '#475569'} strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 224,181 Q 240,188 256,181" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

                  {/* 6. Sculpted Luxury Studio Oval Head */}
                  <ellipse
                    cx="240"
                    cy="72"
                    rx="28"
                    ry="37"
                    fill={mannequinTheme === 'charcoal' ? 'url(#charcoalHead)' : mannequinTheme === 'skin' ? 'url(#skinHead)' : 'url(#sandHead)'}
                    stroke={mannequinTheme === 'charcoal' ? '#475569' : '#64748b'}
                    strokeWidth="1.2"
                  />
                  {/* Temple / Jawline Sheen */}
                  <ellipse cx="236" cy="62" rx="14" ry="18" fill="#ffffff" opacity={mannequinTheme === 'charcoal' ? 0.25 : 0.45} />
                  <path d="M 226,96 Q 240,108 254,96" stroke={mannequinTheme === 'charcoal' ? '#64748b' : '#475569'} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                </g>
              ) : (
                /* ======================================================== */
                /* GHOST MANNEQUIN MINIMALIST SILHOUETTE                     */
                /* ======================================================== */
                <g>
                  {/* Studio Pedestal Stand Base */}
                  <ellipse cx="240" cy="650" rx="90" ry="12" fill="url(#ghostFill)" stroke="#cbd5e1" strokeWidth="1.2" />
                  {/* Elegant Minimalist Head */}
                  <ellipse cx="240" cy="74" rx="26" ry="36" fill="url(#ghostFill)" stroke="#cbd5e1" strokeWidth="1.2" />
                  {/* Slim Atelier Neck */}
                  <path d="M 226,110 L 226,160 Q 226,166 218,170 M 254,110 L 254,160 Q 254,166 262,170" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />

                  {/* Ghost Torso & Arms (Hidden when shirt or jacket is worn) */}
                  {(!topItem && !outerItem) && (
                    <path
                      d="M 218,170
                         C 200,172 182,176 168,184
                         C 160,190 158,204 158,220
                         C 158,245 160,280 162,310
                         C 162,335 162,360 162,380
                         C 180,392 210,396 240,396
                         C 270,396 300,392 318,380
                         C 318,360 318,335 318,310
                         C 320,280 322,245 322,220
                         C 322,204 320,190 312,184
                         C 298,176 280,172 262,170
                         Z"
                      fill="url(#ghostFill)"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Ghost Legs (Hidden when pants are worn) */}
                  {!bottomItem && (
                    <path
                      d="M 162,380
                         C 162,400 166,460 172,510
                         C 176,545 182,590 186,630
                         L 214,630
                         C 216,590 220,545 224,510
                         C 228,470 234,420 240,392
                         C 246,420 252,470 256,510
                         C 260,545 264,590 266,630
                         L 294,630
                         C 298,590 304,545 308,510
                         C 314,460 318,400 318,380
                         C 290,392 260,396 240,396
                         C 220,396 190,392 162,380
                         Z"
                      fill="url(#ghostFill)"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                  )}
                </g>
              )}
            </svg>
          )}

          {/* ======================================================== */}
          {/* 3.2 DEFAULT STUDIO SNEAKERS (when no shoes equipped)    */}
          {/* ======================================================== */}
          {!shoesItem && (
            <div
              style={{
                top: `${shoesOffsetY}%`,
                zIndex: 22,
                transform: `translate(-50%, -50%) translateZ(22px) scale(${shoesScale})`,
              }}
              className="absolute left-1/2 w-[54%] sm:w-[56%] aspect-[1.15/1] pointer-events-none opacity-90 filter drop-shadow-[0_14px_20px_rgba(0,0,0,0.28)]"
            >
              <svg viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="sneakerBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="sneakerSole" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>
                {/* Left Minimalist Studio White Sneaker */}
                <path d="M 38,88 C 42,66 66,54 94,58 C 114,62 126,74 132,94 L 34,94 Z" fill="url(#sneakerBody)" stroke="#94a3b8" strokeWidth="1.2" />
                <path d="M 32,94 L 134,94 L 132,106 L 33,106 Z" fill="url(#sneakerSole)" stroke="#64748b" strokeWidth="1.2" rx="2" />
                <path d="M 72,62 L 86,66 M 76,70 L 90,74 M 80,78 L 94,82" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Right Minimalist Studio White Sneaker */}
                <path d="M 168,94 C 174,74 186,62 206,58 C 234,54 258,66 262,88 L 266,94 Z" fill="url(#sneakerBody)" stroke="#94a3b8" strokeWidth="1.2" />
                <path d="M 166,94 L 268,94 L 267,106 L 168,106 Z" fill="url(#sneakerSole)" stroke="#64748b" strokeWidth="1.2" rx="2" />
                <path d="M 214,66 L 228,62 M 210,74 L 224,70 M 206,82 L 220,78" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.3 EQUIPPED SHOES (Z-Index: 22 - روی دمپای شلوار)        */}
          {/* ======================================================== */}
          {shoesItem && (
            <div
              style={{
                top: `${shoesOffsetY}%`,
                zIndex: 22,
                transform: `translate(-50%, -50%) translateZ(22px) scale(${shoesScale})`,
              }}
              className="absolute left-1/2 w-[52%] sm:w-[54%] h-[12%] transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_16px_22px_rgba(0,0,0,0.32)]"
            >
              <MannequinGarmentImage
                src={shoesItem.imageUrl}
                alt={shoesItem.title}
                slot="slot_shoes"
                className="w-full h-full object-contain object-bottom"
              />
              {/* Floor Contact Ground Shadow */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[85%] h-5 bg-black/45 blur-md rounded-full pointer-events-none" />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_shoes')}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer z-30"
                title="حذف کفش از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.4 BOTTOMWEAR / PANTS (Z-Index: 20 or 35 if Tucked)     */}
          {/* ======================================================== */}
          {bottomItem && (
            <div
              style={{
                top: `${bottomOffsetY}%`,
                zIndex: tuckMode === 'tucked' ? 35 : 20,
                transform: `translate(-50%, -50%) translateZ(20px) scale(${bottomScale})`,
              }}
              className="absolute left-1/2 w-[56%] sm:w-[58%] h-[51%] transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_18px_26px_rgba(0,0,0,0.30)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.16)]"
            >
              <MannequinGarmentImage
                src={bottomItem.imageUrl}
                alt={bottomItem.title}
                slot="slot_bottom"
                className="w-full h-full object-contain object-top"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_bottom')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer z-40"
                title="حذف شلوار از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.5 TOPWEAR / T-SHIRT (Z-Index: 30 or 25 if Tucked)      */}
          {/* ======================================================== */}
          {topItem && (
            <div
              style={{
                top: `${topOffsetY}%`,
                zIndex: tuckMode === 'tucked' ? 25 : 30,
                transform: `translate(-50%, -50%) translateZ(32px) scale(${topScale})`,
                clipPath:
                  outerItem && isSleeveTrimActive
                    ? `inset(0% ${sleeveTrimPercent}% 0% ${sleeveTrimPercent}%)`
                    : undefined,
                transition: 'clip-path 0.3s ease, transform 0.3s ease, top 0.3s ease',
              }}
              className="absolute left-1/2 w-[58%] sm:w-[60%] h-[30%] transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.28)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.16)]"
            >
              <MannequinGarmentImage
                src={topItem.imageUrl}
                alt={topItem.title}
                slot="slot_top"
                className="w-full h-full object-contain object-top"
              />
              {/* Natural Ambient Occlusion shadow from open outerwear lapels and collar onto inner topwear */}
              {outerItem && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none mix-blend-multiply opacity-60 rounded-2xl" />
                  <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/25 via-black/5 to-transparent pointer-events-none mix-blend-multiply opacity-75" />
                </>
              )}
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_top')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer z-40"
                title="حذف بالاتنه از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.6 OUTERWEAR / JACKET / COAT (Z-Index: 40 - روی همه)    */}
          {/* ======================================================== */}
          {outerItem && (() => {
            const isLongCoat =
              outerItem.category === 'coat' ||
              outerItem.title?.includes('پالتو') ||
              outerItem.title?.includes('بارانی') ||
              outerItem.title?.toLowerCase().includes('coat') ||
              outerItem.title?.toLowerCase().includes('trench');

            return (
              <div
                style={{
                  top: `${outerOffsetY}%`,
                  zIndex: 40,
                  transform: `translate(-50%, -50%) translateZ(52px) scale(${outerScale})`,
                  clipPath: isOuterVoidMaskActive
                    ? `polygon(0% 0%, 0% 100%, ${50 - outerVoidWidthPercent / 2}% 100%, ${50 - outerVoidWidthPercent / 2}% 32%, 50% 20%, ${50 + outerVoidWidthPercent / 2}% 32%, ${50 + outerVoidWidthPercent / 2}% 100%, 100% 100%, 100% 0%)`
                    : undefined,
                  transition: 'clip-path 0.3s ease, transform 0.3s ease, top 0.3s ease',
                }}
                className={`absolute left-1/2 w-[76%] sm:w-[78%] ${isLongCoat ? 'h-[62%]' : 'h-[36%]'} transition-all duration-300 pointer-events-auto group filter drop-shadow-[0_22px_32px_rgba(0,0,0,0.35)] drop-shadow-[0_6px_12px_rgba(0,0,0,0.20)]`}
              >
                <MannequinGarmentImage
                  src={outerItem.imageUrl}
                  alt={outerItem.title}
                  slot="slot_outer"
                  className="w-full h-full object-contain object-top"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSlot('slot_outer')}
                  className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md cursor-pointer z-50"
                  title="حذف کت / پالتو از ست"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 3.7 LAYERED WHITE SHIRT COLLAR OVERLAY (Z-Index: 45)      */}
          {/* ======================================================== */}
          {hasLayeredCollar && (
            <div
              style={{
                top: '27.5%',
                zIndex: 45,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute left-1/2 w-[34%] aspect-[2/1] pointer-events-none filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.24)] transition-all duration-300 animate-in fade-in zoom-in-95"
            >
              <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Inner Neck Band Shadow */}
                <path d="M 45,30 Q 80,44 115,30 Q 80,50 45,30 Z" fill="#94a3b8" opacity="0.45" />
                {/* Center Placket & Top Button */}
                <rect x="74" y="32" width="12" height="30" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="80" cy="42" r="2.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                <circle cx="80" cy="54" r="2.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                {/* Left Collar Wing */}
                <path
                  d="M 52,22
                     C 62,20 74,26 78,36
                     L 58,56
                     C 53,50 47,34 52,22 Z"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                <path d="M 54,24 L 76,35" stroke="#f1f5f9" strokeWidth="2" />
                {/* Right Collar Wing */}
                <path
                  d="M 108,22
                     C 98,20 86,26 82,36
                     L 102,56
                     C 107,50 113,34 108,22 Z"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                <path d="M 106,24 L 84,35" stroke="#f1f5f9" strokeWidth="2" />
                {/* Collar Edge Seams */}
                <path d="M 53,24 L 59,54 M 107,24 L 101,54" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM SLOT STATUS PILLS & QUICK STYLING INDICATORS */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 z-10 shrink-0">
        <div className={`p-2 rounded-xl text-center border transition-all ${
          topItem ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">
            بالاتنه {tuckMode === 'tucked' ? '(داخل شلوار)' : '(روی شلوار)'}
          </span>
          <span className="text-xs font-black truncate block mt-0.5">
            {topItem ? topItem.title : 'خالی'}
          </span>
        </div>

        <div className={`p-2 rounded-xl text-center border transition-all ${
          bottomItem ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">پایین‌تنه (جین/شلوار)</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {bottomItem ? bottomItem.title : 'خالی'}
          </span>
        </div>

        <div className={`p-2 rounded-xl text-center border transition-all ${
          outerItem ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">لباس‌رو (کت/کاپشن)</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {outerItem ? outerItem.title : 'خالی'}
          </span>
        </div>

        <div className={`p-2 rounded-xl text-center border transition-all ${
          shoesItem ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <span className="text-[10px] block font-bold">کفش و کتانی</span>
          <span className="text-xs font-black truncate block mt-0.5">
            {shoesItem ? shoesItem.title : 'کتانی استودیویی پیش‌فرض'}
          </span>
        </div>
      </div>
    </div>
  );
};
