import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileCode,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Check,
  RefreshCw,
  Store,
  Layers
} from 'lucide-react';
import { StoreProfile, ClothingProduct, GarmentSlot, GarmentAiSpec } from '../types/clothing';
import { normalizeGarmentAiSpec } from '../data/aiPromptGuide';
import { apiFetch } from '../utils/api';

interface MerchantUploadViewProps {
  currentStore: StoreProfile;
  stores: StoreProfile[];
  onProductCreated: (product: ClothingProduct) => void;
  onTryOnNow: (product: ClothingProduct) => void;
  onOpenPromptGuide: () => void;
  onSelectStore: (storeSlug: string) => void;
}

export const MerchantUploadView: React.FC<MerchantUploadViewProps> = ({
  currentStore,
  stores,
  onProductCreated,
  onTryOnNow,
  onOpenPromptGuide,
  onSelectStore,
}) => {
  const [selectedStoreSlug, setSelectedStoreSlug] = useState<string>(currentStore.slug);

  // 1. Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // 2. Companion JSON State
  const [jsonInput, setJsonInput] = useState<string>('');
  const [parsedSpec, setParsedSpec] = useState<GarmentAiSpec | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // 3. Real-time Calibration Adjustments
  const [offsetY, setOffsetY] = useState<number>(22);
  const [scale, setScale] = useState<number>(1.0);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(850000);

  // 4. Save Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<ClothingProduct | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera Management
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1024 }, height: { ideal: 1024 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMessage('دسترسی به دوربین برقرار نشد: ' + err.message);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1024;
    canvas.height = videoRef.current.videoHeight || 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setImagePreview(dataUrl);
      stopCamera();
      setInputMode('upload');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImagePreview(evt.target?.result as string);
        if (!customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle JSON File Upload
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setJsonInput(text);
        applyJsonSpec(text);
      };
      reader.readAsText(file);
    }
  };

  // Parse and Apply JSON Spec
  const applyJsonSpec = (rawText: string) => {
    setJsonError(null);
    try {
      if (!rawText.trim()) return;
      const parsed = JSON.parse(rawText);
      const normalized = normalizeGarmentAiSpec(parsed, customTitle || 'لباس جدید');
      setParsedSpec(normalized);

      // Populate form and calibration controls
      if (normalized.name_fa) setCustomTitle(normalized.name_fa);
      if (normalized.style_details?.estimated_price_toman) setCustomPrice(normalized.style_details.estimated_price_toman);
      if (typeof normalized.placement?.offset_y_percent === 'number') setOffsetY(normalized.placement.offset_y_percent);
      if (typeof normalized.placement?.scale === 'number') setScale(normalized.placement.scale);
    } catch (e: any) {
      setJsonError('فرمت فایل JSON نامعتبر است: ' + e.message);
    }
  };

  // Auto-fill sample JSON template
  const handleGenerateSampleJson = (slotType: GarmentSlot) => {
    const sampleSpecs = {
      slot_top: {
        garment_id: `TOP-${Date.now().toString().slice(-4)}`,
        name_fa: 'تی‌شرت یقه گرد پنبه‌ای طرحدار',
        name_en: 'Graphic Cotton Crewneck Tee',
        category: 'tshirt',
        slot: 'slot_top',
        placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 22, scale: 1.0, z_index: 30 },
        replacement_rules: { replaces_slot: 'slot_top', compatible_slots: ['slot_bottom', 'slot_outer', 'slot_shoes'] },
        style_details: { primary_color_fa: 'مشکی', color_hex: '#18181b', fabric_type: '۱۰۰٪ نخ پنبه', fit_style: 'regular', estimated_price_toman: 750000 },
      },
      slot_bottom: {
        garment_id: `PNT-${Date.now().toString().slice(-4)}`,
        name_fa: 'شلوار جین راسته سرمه‌ای پاییزه',
        name_en: 'Indigo Straight Leg Denim Jeans',
        category: 'jeans',
        slot: 'slot_bottom',
        placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 53, scale: 1.0, z_index: 20 },
        replacement_rules: { replaces_slot: 'slot_bottom', compatible_slots: ['slot_top', 'slot_outer', 'slot_shoes'] },
        style_details: { primary_color_fa: 'سرمه‌ای نیل', color_hex: '#1d4ed8', fabric_type: 'دنیم اعلا', fit_style: 'regular', estimated_price_toman: 1350000 },
      },
      slot_outer: {
        garment_id: `JKT-${Date.now().toString().slice(-4)}`,
        name_fa: 'کاپشن بومبر خلبانی زیتونی',
        name_en: 'Olive Flight Bomber Jacket',
        category: 'jacket',
        slot: 'slot_outer',
        placement: { anchor: 'shoulders', offset_x_percent: 0, offset_y_percent: 20, scale: 1.05, z_index: 40 },
        replacement_rules: { replaces_slot: 'slot_outer', compatible_slots: ['slot_top', 'slot_bottom', 'slot_shoes'] },
        style_details: { primary_color_fa: 'سبز زیتونی', color_hex: '#4d5d43', fabric_type: 'نایلون ضدآب با آستر نارنجی', fit_style: 'regular', estimated_price_toman: 2250000 },
      },
      slot_shoes: {
        garment_id: `SHS-${Date.now().toString().slice(-4)}`,
        name_fa: 'کتانی چرم سفید رترو',
        name_en: 'Retro White Leather Court Sneakers',
        category: 'shoes',
        slot: 'slot_shoes',
        placement: { anchor: 'feet', offset_x_percent: 0, offset_y_percent: 84, scale: 0.85, z_index: 10 },
        replacement_rules: { replaces_slot: 'slot_shoes', compatible_slots: ['slot_top', 'slot_bottom', 'slot_outer'] },
        style_details: { primary_color_fa: 'سفید صدفی', color_hex: '#ffffff', fabric_type: 'چرم مصنوعی و کفی رابر', fit_style: 'regular', estimated_price_toman: 1650000 },
      },
      slot_accessory: {
        garment_id: `ACC-${Date.now().toString().slice(-4)}`,
        name_fa: 'کلاه لبه‌دار بیسبال مشکی',
        name_en: 'Black Minimal Baseball Cap',
        category: 'accessory',
        slot: 'slot_accessory',
        placement: { anchor: 'head', offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
        replacement_rules: { replaces_slot: 'slot_accessory', compatible_slots: ['slot_top', 'slot_bottom', 'slot_outer', 'slot_shoes'] },
        style_details: { primary_color_fa: 'مشکی', color_hex: '#111827', fabric_type: 'کتان ۱۰۰٪', fit_style: 'regular', estimated_price_toman: 350000 },
      },
    }[slotType];

    const jsonStr = JSON.stringify(sampleSpecs, null, 2);
    setJsonInput(jsonStr);
    applyJsonSpec(jsonStr);
  };

  // Save to Store Database
  const handleSaveToDatabase = async () => {
    if (!imagePreview) {
      setErrorMessage('لطفاً ابتدا تصویر لباس را انتخاب کنید.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Build final spec with real-time slider updates
      const currentSpec = parsedSpec || normalizeGarmentAiSpec({}, customTitle || 'لباس جدید');
      currentSpec.placement.offset_y_percent = offsetY;
      currentSpec.placement.scale = scale;
      currentSpec.name_fa = customTitle || currentSpec.name_fa;

      const res = await apiFetch(`/api/stores/${selectedStoreSlug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          jsonSpec: currentSpec,
          customTitle: customTitle || currentSpec.name_fa,
          customPrice,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'خطا در ثبت اطلاعات در سرور');
      }

      const data = await res.json();
      setSaveSuccess(data.product);
      onProductCreated(data.product);
    } catch (e: any) {
      setErrorMessage(e.message || 'خطا در ذخیره‌سازی محصول');
    } finally {
      setIsSaving(false);
    }
  };

  const activeTargetStore = stores.find((s) => s.slug === selectedStoreSlug) || currentStore;

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl font-bold">
            📸
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>صفحه آپلود لباس با تصویر و فایل JSON هوش مصنوعی</span>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                Dual Ingestion
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              عکس بدون پس‌زمینه لباس را به همراه فایل JSON کالیبراسیون مختصات بارگذاری کنید تا در دیتابیس فروشگاه مقصد ذخیره شود.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPromptGuide}
          className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>مشاهده پرامپت استخراج JSON از هوش مصنوعی</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 3-Column Layout: Left (Image), Middle (JSON), Right (Live Visual Mannequin Fit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Image Upload / Camera (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">۱. دریافت عکس شفاف لباس:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setInputMode('upload');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  inputMode === 'upload' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                آپلود فایل
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('camera');
                  startCamera();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  inputMode === 'camera' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>دوربین زنده</span>
              </button>
            </div>
          </div>

          {inputMode === 'camera' ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-500 bg-black aspect-square flex flex-col items-center justify-center shadow-inner">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>ثبت عکس لباس (Capture)</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {!imagePreview ? (
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-900/60 aspect-square">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-300" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    عکس لباس را اینجا بکشید یا کلیک کنید
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    ترجیحاً تصویر شفاف RGBA PNG (مانکن نامرئی)
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>
              ) : (
                <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-transparency-grid aspect-square flex items-center justify-center group shadow-md">
                  <img src={imagePreview} alt="Preview" className="max-h-[85%] max-w-[85%] object-contain drop-shadow-xl" />
                  <label className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-900 text-white shadow-md cursor-pointer border border-slate-700 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تعویض عکس</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Title & Price Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">نام یا عنوان لباس:</label>
              <input
                type="text"
                placeholder="مثال: تی‌شرت نخی یقه گرد"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">قیمت فروش (تومان):</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Companion JSON Ingestion & Spec Editor (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>۲. بارگذاری فایل JSON هوش مصنوعی:</span>
            </span>

            <label className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700 transition-colors">
              انتخاب فایل JSON
              <input type="file" accept=".json,application/json" onChange={handleJsonFileUpload} className="hidden" />
            </label>
          </div>

          <p className="text-[11px] text-slate-400">
            فایل JSON مشخص می‌کند این لباس در کدام اسلات قرار می‌گیرد و جایگزین چه نوع لباسی خواهد شد.
          </p>

          {/* Quick Preset Buttons if user hasn't generated one yet */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500">یا انتخاب الگوی آماده JSON برای تست:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleGenerateSampleJson('slot_top')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-right"
              >
                👕 الگوی تی‌شرت (Top)
              </button>
              <button
                type="button"
                onClick={() => handleGenerateSampleJson('slot_bottom')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-right"
              >
                👖 الگوی شلوار (Bottom)
              </button>
              <button
                type="button"
                onClick={() => handleGenerateSampleJson('slot_outer')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-right"
              >
                🧥 الگوی کت/کاپشن (Outer)
              </button>
              <button
                type="button"
                onClick={() => handleGenerateSampleJson('slot_shoes')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-right"
              >
                👟 الگوی کفش (Shoes)
              </button>
            </div>
          </div>

          {/* JSON Textarea Editor */}
          <div className="flex-1 flex flex-col min-h-[220px]">
            <textarea
              dir="ltr"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                applyJsonSpec(e.target.value);
              }}
              placeholder='{\n  "slot": "slot_top",\n  "placement": { "offset_y_percent": 22 }\n}'
              className="flex-1 w-full p-3 font-mono text-[11px] rounded-2xl bg-slate-950 border border-slate-700 text-emerald-400 focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {jsonError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
              {jsonError}
            </div>
          )}

          {parsedSpec && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">اسلات تخصیص‌یافته:</span>
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {parsedSpec.slot}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">قانون جایگزینی:</span>
                <span className="font-bold text-emerald-400">
                  فقط جایگزین {parsedSpec.slot === 'slot_bottom' ? 'شلوارها' : parsedSpec.slot === 'slot_top' ? 'تی‌شرت‌ها' : parsedSpec.slot === 'slot_outer' ? 'کت‌ها' : 'کفش‌ها'} می‌شود
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Live Visual Mannequin Fit & Fine-Tuner (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>۳. پیش‌نمایش تراز زنده روی مانکن:</span>
            </span>
          </div>

          {/* Mannequin Preview Container */}
          <div className="relative aspect-[3/4] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Mannequin guide wireframe */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-slate-800/60 stroke-current"
              viewBox="0 0 300 400"
              fill="none"
            >
              <ellipse cx="150" cy="50" rx="20" ry="26" strokeWidth="1" strokeDasharray="3 3"/>
              <path d="M 90,100 Q 150,90 210,100 L 195,210 Q 150,215 105,210 Z" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="105" y1="210" x2="195" y2="210" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
              <path d="M 105,215 L 115,350 L 140,350 L 148,255 L 152,255 L 160,350 L 185,350 L 195,215" strokeWidth="1" strokeDasharray="3 3"/>
            </svg>

            {/* Placed Garment based on Y slider and Scale */}
            {imagePreview ? (
              <div
                style={{
                  top: `${offsetY}%`,
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
                className="absolute w-[70%] aspect-square transition-all duration-150 pointer-events-none flex items-center justify-center"
              >
                <img src={imagePreview} alt="Placed Garment" className="max-w-full max-h-full object-contain drop-shadow-xl" />
              </div>
            ) : (
              <div className="text-center text-slate-600 text-xs p-4">
                عکس لباس را در ستون ۱ آپلود کنید تا جانمایی آن بر اساس فایل JSON نمایش داده شود.
              </div>
            )}
          </div>

          {/* Real-time Fine-Tuner Sliders */}
          <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">موقعیت عمودی روی مانکن (Y):</span>
                <span className="font-mono text-amber-400 font-bold">{offsetY}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">اندازه و مقیاس (Scale):</span>
                <span className="font-mono text-amber-400 font-bold">{scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.02"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Save Action Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSaving || !imagePreview}
              className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isSaving || !imagePreview
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:scale-[1.01]'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>در حال ذخیره در دیتابیس فروشگاه {activeTargetStore.nameFa}...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>ذخیره مستقیم در دیتابیس فروشگاه {activeTargetStore.nameFa}</span>
                </>
              )}
            </button>

            {saveSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between gap-2 animate-in zoom-in-95">
                <div>
                  <h5 className="text-xs font-black text-emerald-300">در دیتابیس این فروشگاه ثبت گردید!</h5>
                  <p className="text-[10px] text-slate-400">شناسه: {saveSuccess.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onTryOnNow(saveSuccess)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  پرو فوری روی مانکن ←
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
