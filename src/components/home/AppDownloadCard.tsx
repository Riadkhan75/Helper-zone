import React, { useState } from 'react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { 
  DownloadCloud, 
  Smartphone, 
  Sparkles, 
  Share2, 
  PlusSquare, 
  CheckCircle, 
  X, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const AppDownloadCard: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running in standalone mode (installed), don't show the prompt
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
      }
    } else {
      // Show guided instructions for iOS / mobile browsers without native prompt
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Home Page App Download Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-indigo-700/50">
        {/* Background glow decoration */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left Info Column */}
          <div className="flex items-start gap-4">
            {/* App Icon preview */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-900/60 rounded-[14px] flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-yellow-300 bg-yellow-400/15 border border-yellow-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> PWA মোবাইল অ্যাপ
                </span>
                <span className="text-[11px] font-medium text-indigo-200">
                  প্লে-স্টোর ছাড়াই ইনস্টল
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                ক্যাম্পাস হেল্প জোন অ্যাপ ফোনে ডাউনলোড করুন
              </h3>

              <p className="text-xs text-indigo-100/90 leading-relaxed max-w-xl">
                এক ক্লিকে আপনার ফোনে সরাসরি অ্যাপ হিসেবে ইনস্টল করুন। হোম স্ক্রিন থেকে ফুল-স্ক্রিনে দ্রুত প্রবেশ করুন এবং অফলাইনে হ্যান্ডনোট দেখুন।
              </p>

              {/* Feature Tags */}
              <div className="flex items-center gap-3 pt-1 text-[11px] text-indigo-200 flex-wrap">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  দ্রুত লোডিং
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  কোনো বাড়তি স্পেস অপচয় নেই
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-purple-300" />
                  হোম স্ক্রিন আইকন
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Column */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <button
              onClick={handleInstallClick}
              className="flex-1 md:flex-initial px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-yellow-500/20 active:scale-98"
            >
              <DownloadCloud className="w-4 h-4 text-slate-950" />
              <span>{isInstallable ? 'অ্যাপ ইনস্টল করুন' : 'অ্যাপ ডাউনলোড ও ইনস্টল'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-3.5 py-1.5 text-xs text-indigo-200 hover:text-white hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>কীভাবে ইনস্টল করবেন?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guided Install Instructions Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">মোবাইলে অ্যাপ ইনস্টল করার নিয়ম</h3>
                  <p className="text-[11px] text-slate-500">খুব সহজে যেকোনো স্মার্টফোনে ইনস্টল করুন</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Steps based on Device */}
            {isIOS ? (
              /* iPhone / iPad Safari instructions */
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-900 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ১
                  </span>
                  <div>
                    <strong className="block text-slate-900">শেয়ার (Share) আইকনে চাপুন</strong>
                    <p className="text-slate-600 mt-0.5">
                      Safari ব্রাউজারের নিচের বারে থাকা <strong>Share</strong> বোতামে (<Share2 className="w-3.5 h-3.5 inline text-indigo-600" />) ক্লিক করুন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-purple-900 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ২
                  </span>
                  <div>
                    <strong className="block text-slate-900">"Add to Home Screen" নির্বাচন করুন</strong>
                    <p className="text-slate-600 mt-0.5">
                      তালিকাটি স্ক্রল করে <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-purple-600" />) অপশনে চাপুন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ৩
                  </span>
                  <div>
                    <strong className="block text-slate-900">উপরে 'Add' চাপুন</strong>
                    <p className="text-slate-600 mt-0.5">
                      অ্যাপটি সরাসরি আপনার হোম স্ক্রিনে আইকন হিসেবে যুক্ত হয়ে যাবে!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Android Chrome / Edge instructions */
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-900 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ১
                  </span>
                  <div>
                    <strong className="block text-slate-900">ব্রাউজারের ৩ ডট মেনু (⋮) চাপুন</strong>
                    <p className="text-slate-600 mt-0.5">
                      Chrome ব্রাউজারের উপরে ডান কোণে থাকা ৩টি বিন্দুতে (⋮) ক্লিক করুন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-purple-900 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ২
                  </span>
                  <div>
                    <strong className="block text-slate-900">"Install app" বা "Add to Home screen" নির্বাচন করুন</strong>
                    <p className="text-slate-600 mt-0.5">
                      মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> বোতামে চাপুন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ৩
                  </span>
                  <div>
                    <strong className="block text-slate-900">ইনস্টল নিশ্চিত করুন</strong>
                    <p className="text-slate-600 mt-0.5">
                      পপ-আপে 'Install' চাপুন। কয়েক সেকেন্ডেই আপনার ফোনে অ্যাপ হিসেবে ইনস্টল হয়ে যাবে!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                বুঝেছি, ধন্যবাদ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
