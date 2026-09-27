'use client';

import { useState } from 'react';
import { Copy, Check, QrCode, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface InstaPayBoxProps {
  ipaAddress: string;
  amount: number;
}

export default function InstaPayBox({ ipaAddress, amount }: InstaPayBoxProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ipaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older mobile webviews
      const textArea = document.createElement('textarea');
      textArea.value = ipaAddress;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    ipaAddress
  )}`;

  return (
    <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Smartphone className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold text-emerald-950">
            بيانات التحويل عبر إنستاباي (InstaPay)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 underline hover:text-emerald-900 transition"
        >
          <QrCode className="h-3.5 w-3.5" />
          {showQr ? 'إخفاء الـ QR' : 'إظهار الـ QR Code'}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-2.5 shadow-sm">
        <div className="text-right">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            عنوان الدفع اللحظي (IPA)
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-neutral-900" dir="ltr">
            {ipaAddress}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>تم النسخ!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>نسخ العنوان</span>
            </>
          )}
        </button>
      </div>

      {showQr && (
        <div className="mt-3 flex flex-col items-center justify-center rounded-xl bg-white p-4 border border-emerald-200">
          <div className="relative h-44 w-44 overflow-hidden rounded-lg border border-neutral-100 p-2 shadow-inner">
            <Image
              src={qrCodeUrl}
              alt="InstaPay QR Code"
              width={180}
              height={180}
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-neutral-700">
            امسح الكود من تطبيق إنستاباي للتحويل فوراً بمبلغ{' '}
            <span className="font-bold text-emerald-700 font-mono">
              {amount.toLocaleString('en-EG')} ج.م
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
