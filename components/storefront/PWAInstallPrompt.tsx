'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-40 sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 rounded-2xl bg-neutral-900 p-4 text-white shadow-2xl border border-neutral-800 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black font-bold">
            <Download className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold">تثبيت التطبيق على هاتفك</h4>
            <p className="text-[11px] text-neutral-300">
              لتصفح أسرع وفوري بضغطة زر وبدون استهلاك للإنترنت
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="rounded-full p-1 text-neutral-400 hover:text-white transition"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 rounded-xl bg-white py-2 text-xs font-bold text-black hover:bg-neutral-100 transition active:scale-[0.98]"
        >
          تثبيت التطبيق الآن
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="rounded-xl border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}
