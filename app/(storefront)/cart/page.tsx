'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-xs text-neutral-400">جاري تحميل سلة المشتريات...</p>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">سلة المشتريات فارغة</h2>
          <p className="mt-1 text-xs text-neutral-500">
            لم تقم بإضافة أي منتجات للسلة بعد. استكشف أحدث تشكيلاتنا وأضف ما يعجبك!
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
          >
            <ArrowRight className="h-4 w-4" />
            تصفح المنتجات والبدء في التسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">سلة المشتريات</h1>
          <p className="text-xs text-neutral-500">مراجعة المنتجات والكميات قبل إتمام الشراء</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-800 underline transition"
        >
          تفريغ السلة بالكامل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>

              <div className="flex flex-1 flex-col justify-between text-right">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
                      <span>اللون: <b className="text-black">{item.color}</b></span>
                      <span>•</span>
                      <span>المقاس: <b className="text-black">{item.size}</b></span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 transition"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.variantId, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-neutral-700 hover:bg-neutral-200 transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-black px-2">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-neutral-700 hover:bg-neutral-200 transition disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-left font-mono font-bold text-neutral-900 text-sm">
                    {(item.price * item.quantity).toLocaleString('en-EG')} ج.م
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            ملخص الحساب
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>إجمالي المنتجات</span>
              <span className="font-mono font-bold text-neutral-900">
                {totalPrice.toLocaleString('en-EG')} ج.م
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>مصاريف الشحن التقديرية</span>
              <span className="text-[11px] text-neutral-500">
                تحسب حسب المحافظة (50 - 70 ج.م)
              </span>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-neutral-900">المجموع قبل الشحن</span>
            <span className="font-mono text-lg font-black text-black">
              {totalPrice.toLocaleString('en-EG')} ج.م
            </span>
          </div>

          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition active:scale-[0.98]"
          >
            المتابعة إلى إتمام الشراء والدفع
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>طلب فوري بدون إنشاء حساب وبأعلى درجات الأمان</span>
          </div>
        </div>
      </div>
    </div>
  );
}
