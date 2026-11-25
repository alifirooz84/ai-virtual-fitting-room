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
  Maximize2
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
      // Create snapshot from canvas
      const node = canvasRef.current;
      if (!node) return;

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1380;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Studio dark gradient background
      const grad = ctx.createRadialGradient(512, 600, 100, 512, 600, 800);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1380);

      // Draw active slots in z-index order
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
            link.download = `vton-outfit-set-${Date.now()}.png`;
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
    <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 overflow-hidden shadow-2xl relative min-h-[640px] lg:min-h-[760px]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-bold">
            ✦
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>بوم مانکن پرو سه‌بعدی</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {totalPieces} لباس فعال
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              تراز مختصات از فایل‌های JSON هوش مصنوعی و جایگزینی اختصاصی در هر اسلات
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
                ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="نمایش / پنهان‌سازی سیلوئت مانکن"
          >
            {showSilhouette ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => (prev === 1 ? 1.15 : 1))}
            className="p-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="بزرگنمایی"
          >
            {zoom === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClearAll}
            disabled={totalPieces === 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              totalPieces > 0
                ? 'bg-slate-800 text-rose-300 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              totalPieces > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="دانلود عکس کامل ست پرو شده"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'در حال ثبت...' : 'دانلود ست'}</span>
          </button>
        </div>
      </div>

      {/* Center Mannequin Stage Canvas */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 select-none">
        {/* Background Studio Light Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[420px] h-[580px] bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-2xl"></div>
        </div>

        {/* Scalable Container */}
        <div
          ref={canvasRef}
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease-out' }}
          className="relative w-[340px] sm:w-[400px] md:w-[460px] h-[640px] sm:h-[700px] rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-2xl flex items-center justify-center overflow-hidden"
        >
          {/* Subtle Grid / Floor Line */}
          <div className="absolute bottom-10 left-8 right-8 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono tracking-wider">
            VIRTUAL MANNEQUIN FRAME 480 × 740
          </div>

          {/* 1. Underlying 3D Invisible Mannequin Body Wireframe Silhouette */}
          {showSilhouette && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-slate-800/60 stroke-current"
              viewBox="0 0 480 740"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head / Neck */}
              <ellipse cx="240" cy="95" rx="36" ry="46" strokeWidth="1.5" strokeDasharray="4 4"/>
              <path d="M 226,140 L 226,170 M 254,140 L 254,170" strokeWidth="1.5"/>

              {/* Shoulders & Torso */}
              <path
                d="M 140,185 Q 240,165 340,185 L 320,380 Q 240,390 160,380 Z"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Waist line */}
              <line x1="160" y1="380" x2="320" y2="380" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6"/>

              {/* Legs */}
              <path
                d="M 160,385 L 175,630 L 220,630 L 235,460 L 245,460 L 260,630 L 305,630 L 320,385"
                strokeWidth="1.5"
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
                className="w-full h-full object-contain drop-shadow-xl"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_shoes')}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-rose-500 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
                title="حذف کفش از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. LAYER 20: BOTTOMWEAR / PANTS / JEANS (Z-Index: 20)     */}
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
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_bottom')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-rose-500 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
                title="حذف شلوار از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. LAYER 30: TOPWEAR / T-SHIRT / SHIRT (Z-Index: 30)      */}
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
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_top')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-rose-500 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
                title="حذف تی‌شرت از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. LAYER 40: OUTERWEAR / JACKET / COAT (Z-Index: 40)      */}
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
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot('slot_outer')}
                className="absolute top-4 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-rose-500 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
                title="حذف کت از ست"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Slot Status Pills */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 z-10">
        {/* Top slot pill */}
        <div
          className={`p-2 rounded-2xl border text-center transition-all ${
            topItem
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block font-medium">بالاتنه (Top)</span>
          <span className="text-xs font-bold truncate block mt-0.5">
            {topItem ? topItem.title : 'انتخاب تی‌شرت'}
          </span>
        </div>

        {/* Bottom slot pill */}
        <div
          className={`p-2 rounded-2xl border text-center transition-all ${
            bottomItem
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block font-medium">پایین‌تنه (Bottom)</span>
          <span className="text-xs font-bold truncate block mt-0.5">
            {bottomItem ? bottomItem.title : 'انتخاب شلوار'}
          </span>
        </div>

        {/* Outer slot pill */}
        <div
          className={`p-2 rounded-2xl border text-center transition-all ${
            outerItem
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block font-medium">لباس‌رو (Outer)</span>
          <span className="text-xs font-bold truncate block mt-0.5">
            {outerItem ? outerItem.title : 'کت یا کاپشن'}
          </span>
        </div>

        {/* Shoes slot pill */}
        <div
          className={`p-2 rounded-2xl border text-center transition-all ${
            shoesItem
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block font-medium">کفش (Shoes)</span>
          <span className="text-xs font-bold truncate block mt-0.5">
            {shoesItem ? shoesItem.title : 'انتخاب کفش'}
          </span>
        </div>
      </div>
    </div>
  );
};
