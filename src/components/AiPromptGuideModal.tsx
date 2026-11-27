import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
  ShieldCheck,
  Camera,
  Layers,
  FileCode,
} from 'lucide-react';
import {
  GHOST_MANNEQUIN_IMAGE_PROMPT_EN,
  GHOST_MANNEQUIN_IMAGE_PROMPT_FA,
  LAYERED_APPAREL_IMAGE_PROMPT_EN,
  LAYERED_APPAREL_IMAGE_PROMPT_FA,
  AI_COMPANION_SPEC_PROMPT_FA,
  AI_COMPANION_SPEC_PROMPT_EN,
} from '../data/aiPromptGuide';

interface AiPromptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPromptGuideModal: React.FC<AiPromptGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Main Tab: 'image' | 'layered' | 'json'
  const [mainTab, setMainTab] = useState<'image' | 'layered' | 'json'>('image');
  const [langTab, setLangTab] = useState<'fa' | 'en'>('en');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentContent =
    mainTab === 'image'
      ? langTab === 'en'
        ? GHOST_MANNEQUIN_IMAGE_PROMPT_EN
        : GHOST_MANNEQUIN_IMAGE_PROMPT_FA
      : mainTab === 'layered'
      ? langTab === 'en'
        ? LAYERED_APPAREL_IMAGE_PROMPT_EN
        : LAYERED_APPAREL_IMAGE_PROMPT_FA
      : langTab === 'en'
      ? AI_COMPANION_SPEC_PROMPT_EN
      : AI_COMPANION_SPEC_PROMPT_FA;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        dir="rtl"
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-900"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
              ✦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>مرجع پرامپت‌های استودیو پرو مجازی هوش مصنوعی</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تولید لباس ۳بعدی بر اساس الگوریتم یکپارچه ابعاد و مختصات (تراز ۱۰۰٪ اتوماتیک بدون نیاز به جابجایی دستی)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Feature Selector: Image Prompt vs Layered Prompt vs JSON Spec Prompt */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setMainTab('image');
              setLangTab('en');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              mainTab === 'image'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>۱. پرامپت جامع تولید ۳بعدی (الگوریتم یکپارچه)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab('layered');
              setLangTab('en');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              mainTab === 'layered'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>۲. پالتو و کاپشن جلوباز (سینه خالی و شفاف)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainTab('json');
              setLangTab('fa');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              mainTab === 'json'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>۳. مشخصات و JSON کالیبراسیون طلایی</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {mainTab === 'image' ? (
            /* Explanation for Zero-Tilt Image Prompt */
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-black text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>چگونه این پرامپت چرخش بدنه و زاویه سه‌چهارم (3/4 Angle) را حذف می‌کند؟</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                هوش‌های مصنوعی تصویری معمولاً لباس را در ژست‌های مایل یا زاویه‌دار تولید می‌کنند که باعث می‌شود هودی یا تی‌شرت روی شلوار کج بایستد. این پرامپت قوانین زیر را قفل می‌کند:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-amber-800">📐 زاویه ۰ درجه ارتوگرافیک:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    دوربین کاملاً مستقیم و هم‌سطح سینه، بدون پرسپکتیو اریب یا چرخش زاویه‌ای.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-blue-800">⚖️ تقارن افقی دقیق شانه و لبه:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    هر دو شانه در یک ارتفاع و لبه پایینی کاملاً افقی و صاف.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-emerald-800">👕 مانکن نامرئی سه‌بعدی:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    یقه خالی و مارک پشت لباس مشخص با عمق سه‌بعدی و بدون شخص یا مانکن فیزیکی.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-purple-800">✨ حذف کادر سفید دور لباس:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    خروجی PNG شفاف با آلفا = 0؛ به علاوه پاک‌کن هوشمند تعبیه‌شده در سیستم.
                  </p>
                </div>
              </div>
            </div>
          ) : mainTab === 'layered' ? (
            /* Explanation for Layered Fashion (Sweater over Shirt / Coat over Tee) */
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-black text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>راز تولید کاپشن و پالتوی جلوباز با نمایش کامل تی‌شرت زیرین (بدون پوشاندن سینه)</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                هوش‌های مصنوعی در حالت عادی داخل کاپشن را با آستر زرد/مشکی یا دیواره پشتی پر می‌کنند که باعث می‌شود تی‌شرت زیرین پوشانده شود. این پرامپت با ۳ ترفند معماری مهندسی‌شده این مشکل را ریشه‌ای حل می‌کند:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-amber-800">🪽 بازشوی بال‌مانند (Winged Drape):</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    جلوی کاپشن/پالتو کاملاً باز و با زاویه ۳۵ درجه به طرفین متمایل می‌شود تا حداقل ۴۰٪ عرض سینه برای نمایش کامل تی‌شرت آزاد باشد.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-emerald-800">🎽 فضای خالی شفاف (Hollow Void):</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    به هوش مصنوعی صریحاً دستور داده شده که هیچ پارچه یا آستر پشتی نکشد و فضای بین دو زیپ کاملاً خالی و شفاف به پس‌زمینه باشد.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-blue-800">⚡ برش هوشمند آستر در نرم‌افزار:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    حتی اگر عکسی با آستر بسته آپلود کنید، دکمه «برش آستر زیپ» در نوار بالای استودیو آن را درجا برایتان خالی و شفاف می‌کند!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Explanation for JSON Auto-Snap */
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-black text-blue-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>چرا دیگر نیازی به جابجایی دستی لباس موقع آپلود نیست؟</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                این پرامپت به جمنای یا چت‌جی‌پی‌تی دستور می‌دهد مختصات کالیبراسیون استاندارد خط کمر را تولید کند:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-amber-700">👕 بالاتنه (Tops / Hoodies):</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ارتفاع پیش‌فرض 30% — لبه پایینی لباس دقیقاً روی لبه کمر شلوار قرار می‌گیرد.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="font-bold text-blue-700">👖 پایین‌تنه (Pants / Jeans):</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ارتفاع پیش‌فرض 64% — فاق و کمر شلوار زیر لبه هودی قرار گرفته و هیچ فاصله‌ای خالی نمی‌ماند.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Selector & Copy Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    langTab === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English (پیشنهادی برای Midjourney / Flux / Gemini)
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('fa')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    langTab === 'fa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  راهنمای فارسی
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>کپی کردن پرامپت</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Content */}
            <div
              dir={langTab === 'en' ? 'ltr' : 'rtl'}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto selection:bg-amber-500 selection:text-black"
            >
              {currentContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
