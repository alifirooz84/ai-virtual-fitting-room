import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { AI_COMPANION_SPEC_PROMPT_FA, AI_COMPANION_SPEC_PROMPT_EN } from '../data/aiPromptGuide';

interface AiPromptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPromptGuideModal: React.FC<AiPromptGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedFa, setCopiedFa] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);
  const [langTab, setLangTab] = useState<'fa' | 'en'>('fa');

  if (!isOpen) return null;

  const handleCopyFa = () => {
    navigator.clipboard.writeText(AI_COMPANION_SPEC_PROMPT_FA);
    setCopiedFa(true);
    setTimeout(() => setCopiedFa(false), 2200);
  };

  const handleCopyEn = () => {
    navigator.clipboard.writeText(AI_COMPANION_SPEC_PROMPT_EN);
    setCopiedEn(true);
    setTimeout(() => setCopiedEn(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        dir="rtl"
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-900"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
              ✦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>پرامپت هوش مصنوعی جهت استخراج فایل JSON لباس</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                  Slot Layer Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                این پرامپت را همراه با عکس لباس به جمنای (Gemini) یا ChatGPT بدهید تا فایل JSON دقیق مختصات و لایه‌ها را به شما بدهد.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Why Slot Architecture Solves the Replacement Problem */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-black text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>چرا این پرامپت مشکل جایگزینی اشتباه شلوار با تی‌شرت را حل می‌کند؟</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              هوش مصنوعی برای هر لباس یک <strong>اسلات فیزیکی (Slot)</strong> و ترتیب لایه‌بندی ارتفاعی (Z-Index) تعریف می‌کند:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="font-bold text-amber-700">👕 اسلات بالاتنه (slot_top):</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  تی‌شرت روی کمر شلوار می‌نشیند و فقط با تی‌شرت دیگر جایگزین می‌شود.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="font-bold text-blue-700">👖 اسلات پایین‌تنه (slot_bottom):</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  شلوار دقیقاً زیر لبه تی‌شرت فیکس می‌شود و فقط با شلوار دیگر تعویض می‌گردد.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="font-bold text-emerald-700">🧥 اسلات لباس‌رو (slot_outer):</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  کت و کاپشن روی تی‌شرت قرار می‌گیرد و بدون حذف تی‌شرت روی آن لایه‌بندی می‌شود.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="font-bold text-purple-700">👟 اسلات کفش (slot_shoes):</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  کفش در پایین‌ترین سطح قرار می‌گیرد و شلوار در بالای آن است.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Selector & Copy Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLangTab('fa')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    langTab === 'fa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  متن پرامپت فارسی
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    langTab === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English Prompt
                </button>
              </div>

              <button
                type="button"
                onClick={langTab === 'fa' ? handleCopyFa : handleCopyEn}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {(langTab === 'fa' ? copiedFa : copiedEn) ? (
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
              {langTab === 'fa' ? AI_COMPANION_SPEC_PROMPT_FA : AI_COMPANION_SPEC_PROMPT_EN}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
