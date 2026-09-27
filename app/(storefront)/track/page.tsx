'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, Package, CheckCircle2, Clock, Truck, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

interface OrderTrackingResult {
  id: string;
  customer_name: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
  total_amount: number;
  created_at: string;
  city: string;
  governorate: string;
  items: any[];
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderTrackingResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchVal: string) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const supabase = createClient();
      const isUUID = searchVal.trim().length > 20;

      let dbQuery = supabase
        .from('orders')
        .select('id, customer_name, status, total_amount, created_at, city, governorate, items');

      if (isUUID) {
        dbQuery = dbQuery.eq('id', searchVal.trim());
      } else {
        dbQuery = dbQuery.eq('phone', searchVal.trim());
      }

      const { data, error } = await dbQuery.order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as OrderTrackingResult[]);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'shipped':
        return 3;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
          <Truck className="h-3.5 w-3.5 text-neutral-900" />
          خدمة التتبع الذاتي للطلبات
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">تتبع مسار شحنتك</h1>
        <p className="text-xs text-neutral-500">
          أدخل رقم هاتفك المسجل به الطلب أو كود الطلب لمعرفة أحدث مستجدات الشحن
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="رقم الهاتف (مثل: 01012345678) أو كود الطلب..."
          className="flex-1 rounded-2xl border border-neutral-300 p-3.5 text-xs text-right focus:border-black focus:outline-none bg-white shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          <span>{loading ? 'بحث...' : 'تتبع'}</span>
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-4">
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-400">رقم الطلب</span>
                      <div className="font-mono text-base font-black text-black">
                        #{order.id.slice(0, 8)}
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <span className="text-[11px] font-semibold text-neutral-400">تاريخ الطلب</span>
                      <div className="text-xs font-bold text-neutral-700">
                        {new Date(order.created_at).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Status Stages */}
                  {order.status === 'cancelled' ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-800 border border-red-200">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span>تم إلغاء هذا الطلب. للتفاصيل يرجى التواصل مع الدعم.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-neutral-500">مسار الشحن والتوصيل:</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div
                          className={`rounded-2xl p-3 border text-xs font-bold transition-all ${
                            currentStep >= 1
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                          }`}
                        >
                          <Clock className="mx-auto h-4 w-4 mb-1" />
                          <span>1. تم الاستلام</span>
                        </div>
                        <div
                          className={`rounded-2xl p-3 border text-xs font-bold transition-all ${
                            currentStep >= 2
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                          }`}
                        >
                          <CheckCircle2 className="mx-auto h-4 w-4 mb-1" />
                          <span>2. تم التجهيز</span>
                        </div>
                        <div
                          className={`rounded-2xl p-3 border text-xs font-bold transition-all ${
                            currentStep >= 3
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                          }`}
                        >
                          <Truck className="mx-auto h-4 w-4 mb-1" />
                          <span>3. مع المندوب</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Destination & Total */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-neutral-100 pt-4 text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span>
                        مكان التسليم: <b>{order.city}</b>، <b>{order.governorate}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500">المبلغ الإجمالي:</span>
                      <span className="font-mono text-sm font-black text-black">
                        {order.total_amount.toLocaleString('en-EG')} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center space-y-2">
              <Package className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="text-xs font-bold text-neutral-700">
                لم نعثر على أي طلبات مسجلة بهذه البيانات
              </p>
              <p className="text-[11px] text-neutral-400">
                تأكد من إدخال رقم الهاتف بشكل صحيح، أو تواصل معنا عبر واتساب للمساعدة.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">جاري التحميل...</div>}>
      <TrackContent />
    </Suspense>
  );
}
