import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        dir="rtl"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              ✦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>پرامپت هوش مصنوعی جهت استخراج فایل JSON لباس</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  Slot-Based VTON
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                این پرامپت را همراه با عکس لباس به هوش مصنوعی (ChatGPT 4o, Gemini, Claude) بدهید تا فایل JSON را تولید کند.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Why Slot Architecture Solves the Replacement Problem */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>چرا این پرامپت مشکل جایگزینی اشتباه شلوار با تی‌شرت را برای همیشه حل می‌کند؟</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              بر اساس این پرامپت، هوش مصنوعی برای هر لباس یک <strong>اسلات ساختاری (Slot)</strong> و لایه ارتفاع تعیین می‌کند:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-amber-400">👕 اسلات بالاتنه (slot_top):</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  فقط تی‌شرت، پیراهن یا تاپ با تی‌شرت بعدی جایگزین می‌شود.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-blue-400">👖 اسلات پایین‌تنه (slot_bottom):</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  فقط شلوار با شلوار بعدی جایگزین می‌شود و تی‌شرت سر جای خود می‌ماند!
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-emerald-400">🧥 اسلات لباس‌رو (slot_outer):</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  کت و کاپشن در لایه رویی (Z=40) روی تی‌شرت می‌نشیند و تی‌شرت حذف نمی‌شود.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-purple-400">👟 اسلات کفش (slot_shoes):</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  کفش در پایین‌ترین سطح (Z=10) با کفش بعدی جایگزین می‌شود.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Selector & Copy Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLangTab('fa')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    langTab === 'fa' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  متن پرامپت فارسی
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    langTab === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English Prompt
                </button>
              </div>

              <button
                type="button"
                onClick={langTab === 'fa' ? handleCopyFa : handleCopyEn}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {(langTab === 'fa' ? copiedFa : copiedEn) ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی کردن پرامپت</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Content */}
            <div
              dir={langTab === 'en' ? 'ltr' : 'rtl'}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto selection:bg-amber-500 selection:text-black"
            >
              {langTab === 'fa' ? AI_COMPANION_SPEC_PROMPT_FA : AI_COMPANION_SPEC_PROMPT_EN}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
