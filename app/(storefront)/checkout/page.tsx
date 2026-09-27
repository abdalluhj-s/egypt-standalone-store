'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/useCartStore';
import { EGYPT_GOVERNORATES, GOVERNORATES_ARABIC, getShippingFee, Governorate } from '@/lib/constants/egypt';
import InstaPayBox from '@/components/storefront/InstaPayBox';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, UploadCloud, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState<Governorate>('Cairo');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'InstaPay'>('COD');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = mounted ? getTotalPrice() : 0;
  const shippingFee = getShippingFee(governorate);
  const grandTotal = subtotal + shippingFee;

  if (mounted && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">سلة المشتريات فارغة</h2>
        <p className="text-xs text-neutral-500">
          يجب إضافة منتجات أولاً قبل التوجه لصفحة إتمام الشراء.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white"
        >
          <ArrowRight className="h-4 w-4" />
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  const handleOrderSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Egyptian mobile number format
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(phone.trim())) {
      setErrorMsg('يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً (مثال: 01012345678)');
      return;
    }

    if (paymentMethod === 'InstaPay' && !receiptFile) {
      setErrorMsg('يرجى رفع صورة إيصال التحويل عبر إنستاباي لتأكيد طلبك وفحص الدفع');
      return;
    }

    try {
      setSubmitting(true);
      let uploadedReceiptPath: string | null = null;

      // Handle InstaPay receipt upload if provided
      if (paymentMethod === 'InstaPay' && receiptFile) {
        try {
          const supabase = createClient();
          const fileExt = receiptFile.name.split('.').pop();
          const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, receiptFile);

          if (!uploadError && uploadData) {
            uploadedReceiptPath = uploadData.path;
          }
        } catch (err) {
          // If Supabase storage is not configured yet, continue order submission
          console.warn('Receipt upload fallback:', err);
        }
      }

      // Submit order to API route
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone: phone.trim(),
          governorate,
          city,
          address,
          landmark: landmark || null,
          payment_method: paymentMethod,
          receipt_url: uploadedReceiptPath,
          total_amount: grandTotal,
          items: items.map((i) => ({
            product_id: i.productId,
            variant_id: i.variantId,
            title: i.title,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة لاحقاً');
      }

      clearCart();

      // Redirect to WhatsApp or Success Confirmation Page
      if (result.whatsappUrl) {
        window.location.href = result.whatsappUrl;
      } else {
        router.push(`/order-success?id=${result.orderId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-neutral-900">إتمام الشراء السريع (Guest Checkout)</h1>
        <p className="text-xs text-neutral-500">
          لا يلزم تسجيل حساب - أدخل بيانات التوصيل المباشر وسيصلك الطلب حتى باب المنزل
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleOrderSubmission} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Shipping info */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>1. بيانات الشحن والتوصيل</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  الاسم ثلاثي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="محمد أحمد علي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  رقم الموبايل (المسجل عليه واتساب) *
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-left focus:border-black focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  المحافظة *
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value as Governorate)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none bg-white"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {GOVERNORATES_ARABIC[gov]} ({gov}) - شحن {getShippingFee(gov)} ج.م
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  المدينة / الحي / المنطقة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="المعادي / الدقي / سموحة..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                العنوان بالتفصيل (اسم الشارع / رقم العمارة / الشقة) *
              </label>
              <input
                type="text"
                required
                placeholder="شارع 9، عمارة 15، الدور الرابع، شقة 8"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                علامة مميزة (اختياري)
              </label>
              <input
                type="text"
                placeholder="بجوار صيدلية العزبي / أمام المسجد الكبير"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>2. طريقة الدفع</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-black bg-neutral-50 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 accent-black"
                />
                <div>
                  <span className="block text-xs font-bold text-neutral-900">
                    الدفع عند الاستلام (كاش)
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-0.5">
                    تدفع للمندوب نقداً عند استلام الشحنة ومعاينتها
                  </span>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  paymentMethod === 'InstaPay'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'InstaPay'}
                  onChange={() => setPaymentMethod('InstaPay')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    تحويل فوري إنستاباي (InstaPay)
                    <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] text-white">
                      موصى به
                    </span>
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-0.5">
                    تحويل مباشر عبر تطبيق إنستاباي لحساب المتجر
                  </span>
                </div>
              </label>
            </div>

            {/* InstaPay Info Box & Receipt Upload */}
            {paymentMethod === 'InstaPay' && (
              <div className="space-y-4 pt-2">
                <InstaPayBox
                  ipaAddress={process.env.NEXT_PUBLIC_INSTAPAY_ADDRESS || 'egyptwear@instapay'}
                  amount={grandTotal}
                />

                <div className="rounded-xl border border-dashed border-neutral-300 p-4 bg-neutral-50/60 text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-neutral-400" />
                  <label className="mt-2 block cursor-pointer">
                    <span className="text-xs font-bold text-neutral-800 underline">
                      {receiptFile ? receiptFile.name : 'اضغط هنا لرفع صورة إيصال التحويل (Screenshot) *'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    يدعم صور JPG, PNG حتى 5 ميجابايت
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items & Totals Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              ملخص الطلب ({items.length} قطع)
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 text-xs">
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <Image src={item.image} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-right">
                    <span className="block font-bold text-neutral-900 line-clamp-1">
                      {item.title}
                    </span>
                    <span className="block text-[10px] text-neutral-500">
                      {item.color} | {item.size} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-neutral-800">
                    {(item.price * item.quantity).toLocaleString('en-EG')} ج.م
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>إجمالي المنتجات</span>
                <span className="font-mono font-bold">{subtotal.toLocaleString('en-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>مصاريف الشحن ({GOVERNORATES_ARABIC[governorate]})</span>
                <span className="font-mono font-bold">{shippingFee} ج.م</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between items-baseline text-sm font-black">
                <span>المبلغ الإجمالي للدفع</span>
                <span className="font-mono text-xl text-black">
                  {grandTotal.toLocaleString('en-EG')} ج.م
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-black py-4 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-neutral-800 transition active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب الآن وإرساله عبر واتساب ⚡'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>بياناتك محمية تماماً ولا نشاركها مع أي طرف ثالث</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
