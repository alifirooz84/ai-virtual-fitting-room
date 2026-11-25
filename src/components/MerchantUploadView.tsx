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
  Layers,
  Shirt,
  Database,
} from 'lucide-react';
import { StoreProfile, ClothingProduct, GarmentSlot, GarmentAiSpec } from '../types/clothing';
import { normalizeGarmentAiSpec } from '../data/aiPromptGuide';
import { apiFetch } from '../utils/api';
import { dbStorage } from '../utils/dbStorage';
import { removeWhiteBackground } from '../utils/imageProcessing';

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
  const selectedStoreSlug = currentStore.slug;

  // 1. Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [autoRemoveBg, setAutoRemoveBg] = useState<boolean>(true);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);

  // 2. Companion JSON State
  const [jsonInput, setJsonInput] = useState<string>('');
  const [parsedSpec, setParsedSpec] = useState<GarmentAiSpec | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // 3. Real-time Calibration Adjustments (Auto-Snap Standard Coordinates)
  const [offsetY, setOffsetY] = useState<number>(30);
  const [scale, setScale] = useState<number>(1.0);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(850000);
  const [selectedSlotManual, setSelectedSlotManual] = useState<GarmentSlot | null>(null);
  const [showManualSliders, setShowManualSliders] = useState<boolean>(false);

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

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1024;
    canvas.height = videoRef.current.videoHeight || 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      stopCamera();
      setInputMode('upload');
      if (autoRemoveBg) {
        setIsProcessingBg(true);
        try {
          const cleaned = await removeWhiteBackground(dataUrl);
          setImagePreview(cleaned);
        } catch {
          setImagePreview(dataUrl);
        } finally {
          setIsProcessingBg(false);
        }
      } else {
        setImagePreview(dataUrl);
      }
    }
  };

  const handleManualCleanBg = async () => {
    if (!imagePreview) return;
    setIsProcessingBg(true);
    const activeSlot = selectedSlotManual || parsedSpec?.slot || 'slot_top';
    try {
      const cleaned = await removeWhiteBackground(imagePreview, {
        colorTolerance: 35,
        luminanceThreshold: 205,
        normalizeScale: true,
        slot: activeSlot,
      });
      setImagePreview(cleaned);
    } catch (e: any) {
      console.warn('Manual clean error:', e);
    } finally {
      setIsProcessingBg(false);
    }
  };

  const applySlotSelection = (slot: GarmentSlot) => {
    setSelectedSlotManual(slot);
    if (slot === 'slot_bottom') {
      setOffsetY(64);
      setScale(1.0);
    } else if (slot === 'slot_outer') {
      setOffsetY(30);
      setScale(1.05);
    } else if (slot === 'slot_shoes') {
      setOffsetY(88);
      setScale(0.85);
    } else {
      setOffsetY(30);
      setScale(1.0);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const rawData = evt.target?.result as string;
        if (autoRemoveBg) {
          setIsProcessingBg(true);
          try {
            const cleaned = await removeWhiteBackground(rawData);
            setImagePreview(cleaned);
          } catch {
            setImagePreview(rawData);
          } finally {
            setIsProcessingBg(false);
          }
        } else {
          setImagePreview(rawData);
        }

        const inferredName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (!customTitle) {
          setCustomTitle(inferredName);
        }
        // Auto-detect slot from file name if no JSON loaded yet
        if (!parsedSpec) {
          const lower = (file.name + ' ' + inferredName).toLowerCase();
          if (lower.includes('شلوار') || lower.includes('جین') || lower.includes('pant') || lower.includes('jean') || lower.includes('دامن')) {
            applySlotSelection('slot_bottom');
          } else if (lower.includes('کت') || lower.includes('کاپشن') || lower.includes('هودی') || lower.includes('پالتو') || lower.includes('jacket') || lower.includes('hoodie')) {
            applySlotSelection('slot_outer');
          } else if (lower.includes('کفش') || lower.includes('کتانی') || lower.includes('کتونی') || lower.includes('shoe') || lower.includes('sneaker')) {
            applySlotSelection('slot_shoes');
          } else {
            applySlotSelection('slot_top');
          }
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
      setSelectedSlotManual(normalized.slot);

      // Populate form and canonical auto-snap coordinates
      if (normalized.name_fa) setCustomTitle(normalized.name_fa);
      if (normalized.style_details?.estimated_price_toman) setCustomPrice(normalized.style_details.estimated_price_toman);

      // Canonical Auto-Snap Anchors
      if (normalized.slot === 'slot_bottom') {
        setOffsetY(64);
        setScale(1.0);
      } else if (normalized.slot === 'slot_outer') {
        setOffsetY(30);
        setScale(1.05);
      } else if (normalized.slot === 'slot_shoes') {
        setOffsetY(88);
        setScale(0.85);
      } else {
        setOffsetY(30);
        setScale(1.0);
      }
    } catch (e: any) {
      setJsonError('فرمت فایل JSON نامعتبر است. لطفاً ساختار استاندارد را کپی کنید.');
    }
  };

  // Reset to auto alignment
  const handleAutoAlign = () => {
    const targetSlot = selectedSlotManual || parsedSpec?.slot || 'slot_top';
    applySlotSelection(targetSlot);
  };

  // Helper to ensure uploaded images are ultra-lightweight WebP without filling up browser storage
  const compressImageIfNeeded = async (dataUrl: string, slot: string = 'slot_top'): Promise<string> => {
    let sourceToCompress = dataUrl;
    if (autoRemoveBg) {
      try {
        sourceToCompress = await removeWhiteBackground(dataUrl, { normalizeScale: true, slot });
      } catch {}
    }
    return new Promise((resolve) => {
      if (sourceToCompress.startsWith('data:image/svg')) {
        return resolve(sourceToCompress);
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(sourceToCompress);
        ctx.drawImage(img, 0, 0, width, height);

        // WebP format preserves full alpha transparency while reducing size from 2MB to ~70KB!
        try {
          const webpData = canvas.toDataURL('image/webp', 0.85);
          if (webpData && webpData.startsWith('data:image/webp') && webpData.length < sourceToCompress.length) {
            return resolve(webpData);
          }
        } catch {}

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(sourceToCompress);
      img.src = sourceToCompress;
    });
  };

  // Submit and Save Product to Store Database
  const handleSaveProduct = async () => {
    if (!imagePreview) {
      setErrorMessage('لطفاً ابتدا تصویر لباس را بارگذاری کنید.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const activeSlot = selectedSlotManual || parsedSpec?.slot || 'slot_top';

      // 1. Optimize image resolution into lightweight WebP and normalize standard sizing
      const optimizedImage = await compressImageIfNeeded(imagePreview, activeSlot);
      const currentSpec = parsedSpec || normalizeGarmentAiSpec({ slot: activeSlot }, customTitle || 'لباس جدید');
      currentSpec.slot = activeSlot;
      currentSpec.placement.offset_y_percent = offsetY;
      currentSpec.placement.scale = scale;
      currentSpec.placement.z_index = activeSlot === 'slot_outer' ? 40 : activeSlot === 'slot_top' ? 30 : activeSlot === 'slot_bottom' ? 20 : 10;
      currentSpec.name_fa = customTitle || currentSpec.name_fa;

      const newProductId = `prod-${Date.now()}`;
      const productObj: ClothingProduct = {
        id: newProductId,
        storeSlug: selectedStoreSlug,
        storeName: currentStore.nameFa,
        title: customTitle || currentSpec.name_fa,
        price: customPrice,
        category: currentSpec.category,
        slot: currentSpec.slot,
        imageUrl: optimizedImage,
        placement: currentSpec.placement,
        spec: currentSpec,
        createdAt: new Date().toISOString(),
      };

      // 2. Persist in IndexedDB (Unlimited storage quota, zero product drop)
      await dbStorage.saveProduct(productObj);

      // 3. Update React parent state immediately
      onProductCreated(productObj);
      setSaveSuccess(productObj);

      // 4. Send to backend server database (cPanel PHP / Node.js)
      try {
        const res = await apiFetch(`/api/stores/${selectedStoreSlug}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: optimizedImage,
            jsonSpec: currentSpec,
            customTitle: customTitle || currentSpec.name_fa,
            customPrice,
            storeSlug: selectedStoreSlug,
            storeName: currentStore.nameFa,
          }),
        }, 8000);

        if (res.ok) {
          const data = await res.json();
          if (data && data.product) {
            if (data.product.imageUrl) {
              productObj.imageUrl = data.product.imageUrl;
              await dbStorage.saveProduct(productObj);
            }
          }
        }
      } catch (networkErr) {
        console.warn('[Sync to Server] Offline-first saved in IndexedDB:', networkErr);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'خطا در ذخیره‌سازی محصول');
    } finally {
      setIsSaving(false);
    }
  };

  const detectedSlotTitle =
    parsedSpec?.slot === 'slot_top'
      ? 'بالاتنه (روی کمر شلوار)'
      : parsedSpec?.slot === 'slot_bottom'
      ? 'پایین‌تنه (زیر تی‌شرت)'
      : parsedSpec?.slot === 'slot_outer'
      ? 'لباس‌رو (روی همه)'
      : parsedSpec?.slot === 'slot_shoes'
      ? 'کفش و کتانی'
      : 'در انتظار فایل JSON';

  return (
    <div className="max-w-[1500px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center text-xl font-bold">
            📸
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>آپلود تصویر ۳بعدی و فایل JSON مشخصات لباس</span>
              <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                Auto-Layer Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تصویر بدون پس‌زمینه را همراه با فایل JSON خروجی هوش مصنوعی آپلود کنید تا جایگاه فیزیکی (زیر یا رو بودن) خودکار تنظیم و در دیتابیس ذخیره شود.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/setup.php"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="تنظیم خودکار اتصال به دیتابیس MySQL هاست و ساخت جداول"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>اتصال دیتابیس MySQL هاست</span>
          </a>

          <button
            type="button"
            onClick={onOpenPromptGuide}
            className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>کپی پرامپت هوش مصنوعی (جمنای / ChatGPT)</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 3-Column Layout: Left (Image), Middle (JSON), Right (Live Visual Mannequin Fit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Image Upload / Camera (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">۱. دریافت عکس شفاف لباس:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setInputMode('upload');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  inputMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
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
                  inputMode === 'camera' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>دوربین زنده</span>
              </button>
            </div>
          </div>

          {inputMode === 'camera' ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-400 bg-black aspect-square flex flex-col items-center justify-center shadow-inner">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>ثبت و برش عکس</span>
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/20 relative overflow-hidden group">
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleImageFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <img
                    src={imagePreview}
                    alt="پیش‌نمایش لباس"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-xl">
                    کلیک برای تغییر عکس
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      عکس مانکن نامرئی شفاف را اینجا رها کنید
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      فرمت‌های PNG شفاف، WebP یا JPEG
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs">
                    انتخاب فایل از سیستم
                  </span>
                </div>
              )}
            </label>
          )}

          {/* Smart Auto-Cutout / White Background Eraser Control */}
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>حذف هوشمند کادر سفید (Zero-Box):</span>
              </span>
              <button
                type="button"
                onClick={() => setAutoRemoveBg(!autoRemoveBg)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                  autoRemoveBg
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                {autoRemoveBg ? '✓ فعال (توصیه‌شده)' : 'غیرفعال'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              اگر خروجی هوش مصنوعی کادر مستطیلی سفید داشته باشد، سیستم به طور خودکار کادر سفید را شفاف می‌کند تا روی کمر شلوار نیفتد.
            </p>
            {imagePreview && (
              <button
                type="button"
                onClick={handleManualCleanBg}
                disabled={isProcessingBg}
                className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isProcessingBg ? 'animate-spin' : ''}`} />
                <span>{isProcessingBg ? 'در حال شفاف‌سازی کادر...' : 'شفاف‌سازی و حذف کادر سفید همین عکس'}</span>
              </button>
            )}
          </div>

          {/* Quick info */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>پشتیبانی از فرمت PNG شفاف (Alpha) و تبدیل خودکار</span>
            </p>
            <p className="text-[10px] leading-relaxed">
              تصویر می‌تواند خروجی مستقیم پرامپت جمنای یا عکاسی از مانکن نامرئی بوتیک شما باشد.
            </p>
          </div>
        </div>

        {/* Column 2: Companion JSON Ingestion (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">۲. آپلود فایل JSON مشخصات لباس:</span>
            <label className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              <span>انتخاب فایل .json</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleJsonFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Detected Slot and Layer Badge */}
          {parsedSpec ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تراز هوشمند لایه‌ها تشخیص داده شد:</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200">
                  اسلات: {parsedSpec.slot}
                </span>
              </div>
              <div className="text-xs text-emerald-900 space-y-1">
                <p>• <strong>جایگاه:</strong> {detectedSlotTitle}</p>
                <p>• <strong>ترتیب لایه (Z-Index):</strong> {offsetY}% ارتفاع (Z: {parsedSpec.placement.z_index})</p>
                <p>• <strong>نام لباس:</strong> {parsedSpec.name_fa}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500">
              فایل JSON حاوی اطلاعات اسلات (`slot_top`, `slot_bottom` و...) و مختصات قرارگیری است تا سیستم بداند لباس دقیقاً کجای بدن و زیر یا روی چه لباسی می‌افتد.
            </div>
          )}

          {/* JSON Textarea / Editor */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              یا محتوای JSON هوش مصنوعی را مستقیماً اینجا پیست کنید:
            </label>
            <textarea
              rows={8}
              dir="ltr"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                applyJsonSpec(e.target.value);
              }}
              placeholder={`{\n  "name_fa": "تی‌شرت نخ پنبه سفید",\n  "slot": "slot_top",\n  "placement": {\n    "anchor": "torso",\n    "offset_y_percent": 22,\n    "scale": 1.0,\n    "z_index": 30\n  }\n}`}
              className="w-full p-3 rounded-2xl text-xs font-mono bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-amber-400 focus:bg-white resize-none"
            />
          </div>

          {jsonError && (
            <p className="text-xs text-rose-600 font-bold">{jsonError}</p>
          )}

          {/* Editable title and price */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">نام لباس:</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="نام لباس"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">قیمت (تومان):</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                placeholder="850000"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Column 3: Live Mannequin Preview & Registration (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">۳. پیش‌نمایش زنده تن مانکن:</span>
              <button
                type="button"
                onClick={handleAutoAlign}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                title="تراز خودکار بر اساس JSON"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تراز خودکار</span>
              </button>
            </div>

            {/* Mannequin Preview Box */}
            <div className="relative aspect-[3/4] rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Wireframe Silhouette */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none text-slate-300 stroke-current opacity-70"
                viewBox="0 0 480 740"
                fill="none"
              >
                <ellipse cx="240" cy="95" rx="36" ry="46" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M 140,185 Q 240,165 340,185 L 320,380 Q 240,390 160,380 Z" strokeWidth="1.2" strokeDasharray="3 3" />
                <line x1="160" y1="380" x2="320" y2="380" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <path d="M 160,385 L 175,630 L 220,630 L 235,460 L 245,460 L 260,630 L 305,630 L 320,385" strokeWidth="1.2" strokeDasharray="4 4" />
              </svg>

              {/* Rendered Uploaded Clothing with Dynamic Aspect Ratio */}
              {imagePreview ? (
                <div
                  style={{
                    top: `${offsetY}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                  }}
                  className={`absolute left-1/2 transition-all duration-200 pointer-events-none ${
                    (selectedSlotManual === 'slot_bottom' || (!selectedSlotManual && parsedSpec?.slot === 'slot_bottom'))
                      ? 'w-[68%] aspect-[3/4]'
                      : (selectedSlotManual === 'slot_outer' || (!selectedSlotManual && parsedSpec?.slot === 'slot_outer'))
                      ? 'w-[82%] aspect-square'
                      : (selectedSlotManual === 'slot_shoes' || (!selectedSlotManual && parsedSpec?.slot === 'slot_shoes'))
                      ? 'w-[72%] aspect-[2/1]'
                      : 'w-[76%] aspect-square'
                  }`}
                >
                  <img
                    src={imagePreview}
                    alt="پیش‌نمایش"
                    className="w-full h-full object-contain filter drop-shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-400 p-4">
                  <Shirt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">پس از انتخاب عکس و JSON، لباس تن مانکن نشان داده می‌شود</p>
                </div>
              )}
            </div>

            {/* Auto-Snap Standard Status Banner (Zero Manual Adjustments Needed!) */}
            <div className="mt-3.5 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تراز هوشمند خودکار (Auto-Snap) فعال است</span>
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-700 font-bold">
                  بدون نیاز به جابجایی
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                مختصات فیزیکی لباس (ارتفاع {offsetY}% و مقیاس {scale.toFixed(2)}x) به طور خودکار منطبق با خط کمر و لایه‌بندی تن مانکن قفل شده است.
              </p>

              {/* Quick Slot Category Selector */}
              <div className="pt-2 border-t border-emerald-200/60">
                <span className="text-[10px] font-bold text-slate-600 block mb-1.5">نوع لباس جهت کالیبراسیون فوری:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => applySlotSelection('slot_top')}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      (selectedSlotManual === 'slot_top' || (!selectedSlotManual && parsedSpec?.slot === 'slot_top'))
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👕 بالاتنه (روی شلوار)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySlotSelection('slot_bottom')}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      (selectedSlotManual === 'slot_bottom' || (!selectedSlotManual && parsedSpec?.slot === 'slot_bottom'))
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👖 پایین‌تنه (زیر تی‌شرت)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySlotSelection('slot_outer')}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      (selectedSlotManual === 'slot_outer' || (!selectedSlotManual && parsedSpec?.slot === 'slot_outer'))
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🧥 لباس‌رو (روی همه)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySlotSelection('slot_shoes')}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      (selectedSlotManual === 'slot_shoes' || (!selectedSlotManual && parsedSpec?.slot === 'slot_shoes'))
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👟 کفش و کتانی
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Collapsible Sliders for edge-cases */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowManualSliders(!showManualSliders)}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>{showManualSliders ? '▼ پنهان کردن تنظیم دستی' : '◀ تنظیمات دستی مختصات (پیشرفته - اختیاری)'}</span>
              </button>

              {showManualSliders && (
                <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span className="font-bold">موقعیت ارتفاعی دستی (Offset Y):</span>
                    <span className="font-mono font-bold text-amber-600">{offsetY}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-700 pt-1">
                    <span className="font-bold">مقیاس ابعاد دستی (Scale):</span>
                    <span className="font-mono font-bold text-amber-600">{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleSaveProduct}
              disabled={isSaving || !imagePreview}
              className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                imagePreview && !isSaving
                  ? 'bg-slate-900 hover:bg-black text-white hover:scale-102 cursor-pointer shadow-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{isSaving ? 'در حال ثبت در دیتابیس...' : 'ذخیره لباس در دیتابیس فروشگاه'}</span>
            </button>

            {saveSuccess && (
              <button
                type="button"
                onClick={() => onTryOnNow(saveSuccess)}
                className="w-full py-2.5 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>پرو فوری همین لباس روی مانکن</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
