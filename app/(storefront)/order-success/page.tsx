'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package, Smartphone } from 'lucide-react';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
          تم استلام طلبك بنجاح!
        </span>
        <h1 className="text-2xl font-black text-neutral-900">
          شكراً لتسوقك مع Egypt Wear
        </h1>
        <p className="text-xs text-neutral-600 leading-relaxed">
          تم تسجيل طلبك بنجاح في نظامنا، وسيتم التواصل معك هاتفياً أو عبر واتساب لتأكيد موعد
          الشحن والتسليم.
        </p>
      </div>

      {orderId && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm text-right space-y-2">
          <span className="text-[11px] font-semibold text-neutral-400">رقم تعريف الطلب:</span>
          <div className="font-mono text-xs sm:text-sm font-bold text-neutral-900 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 break-all select-all">
            {orderId}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        {orderId ? (
          <Link
            href={`/track?query=${orderId}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
          >
            <Package className="h-4 w-4" />
            تتبع حالة الطلب والشحنة
          </Link>
        ) : (
          <Link
            href="/track"
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
          >
            <Package className="h-4 w-4" />
            صفحة تتبع الطلبات
          </Link>
        )}

        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمتجر
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">جاري التحميل...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
