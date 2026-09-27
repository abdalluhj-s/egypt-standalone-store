'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  ExternalLink,
  MessageCircle,
  Phone,
  Eye,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'cancelled';

interface OrderItem {
  product_id: string;
  title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  landmark: string | null;
  total_amount: number;
  payment_method: 'COD' | 'InstaPay' | 'Online';
  status: OrderStatus;
  receipt_url: string | null;
  items: OrderItem[];
  created_at: string;
}

const DEFAULT_DEMO_ORDERS: Order[] = [
  {
    id: 'eg-92837482',
    customer_name: 'أحمد محمود',
    phone: '01012345678',
    governorate: 'Cairo',
    city: 'المعادي',
    address: 'شارع 9، عمارة 24، الدور الثالث',
    landmark: 'بجوار محطة المترو',
    total_amount: 500,
    payment_method: 'InstaPay',
    status: 'pending',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
    items: [
      {
        product_id: 'prod-1',
        title: 'تيشيرت أوفر سايز Heavyweight قطن مصري 100%',
        size: 'L',
        color: 'Black',
        quantity: 1,
        price: 450,
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'eg-84920193',
    customer_name: 'سارة إبراهيم',
    phone: '01298765432',
    governorate: 'Giza',
    city: 'الدقي',
    address: 'شارع مصدق، برج الأطباء',
    landmark: 'أمام بنك مصر',
    total_amount: 800,
    payment_method: 'COD',
    status: 'confirmed',
    receipt_url: null,
    items: [
      {
        product_id: 'prod-2',
        title: 'سويت شيرت هودي ثقيل Cairo Edition',
        size: 'M',
        color: 'Charcoal Grey',
        quantity: 1,
        price: 750,
      },
    ],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        setOrders(data as Order[]);
      } else {
        const filtered =
          filterStatus === 'all'
            ? DEFAULT_DEMO_ORDERS
            : DEFAULT_DEMO_ORDERS.filter((o) => o.status === filterStatus);
        setOrders(filtered);
      }
    } catch {
      const filtered =
        filterStatus === 'all'
          ? DEFAULT_DEMO_ORDERS
          : DEFAULT_DEMO_ORDERS.filter((o) => o.status === filterStatus);
      setOrders(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const supabase = createClient();
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(`تنبيه: تم تحديث الحالة محلياً`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const viewInstaPayReceipt = async (filePath: string) => {
    if (filePath.startsWith('http')) {
      setSelectedReceipt(filePath);
      return;
    }

    try {
      const supabase = createClient();
      const cleanPath = filePath.replace(/^receipts\//, '');
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(cleanPath, 300);

      if (!error && data?.signedUrl) {
        setSelectedReceipt(data.signedUrl);
      } else {
        setSelectedReceipt(filePath);
      }
    } catch {
      setSelectedReceipt(filePath);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">إدارة ومتابعة الطلبات</h1>
          <p className="text-xs text-neutral-500">
            مراجعة طلبات الشراء، فحص إيصالات إنستاباي، وتحديث حالات الشحن للمناديب
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'جديد (انتظار)' },
            { id: 'confirmed', label: 'تم التأكيد' },
            { id: 'shipped', label: 'مع المندوب' },
            { id: 'cancelled', label: 'ملغي' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                filterStatus === st.id
                  ? 'bg-black text-white shadow-sm'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-right text-xs">
            <thead className="bg-neutral-50 font-bold text-neutral-700">
              <tr>
                <th className="px-4 py-3">رقم الطلب والتاريخ</th>
                <th className="px-4 py-3">العميل والعنوان المصري</th>
                <th className="px-4 py-3">المنتجات المطلوبة</th>
                <th className="px-4 py-3">طريقة الدفع والإيصال</th>
                <th className="px-4 py-3">المبلغ الإجمالي</th>
                <th className="px-4 py-3">الحالة الحالية</th>
                <th className="px-4 py-3 text-left">تحديث المرحلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    جاري تحميل الطلبات...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    لا توجد طلبات مطابقة للفلتر المحدد
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/50 transition">
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-xs font-black text-neutral-900 block">
                        #{o.id.slice(0, 8)}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-bold text-neutral-900">{o.customer_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${o.phone}`}
                          dir="ltr"
                          className="font-mono text-[11px] text-neutral-600 hover:text-black hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {o.phone}
                        </a>
                        <a
                          href={`https://wa.me/2${o.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-3 w-3" />
                          واتساب
                        </a>
                      </div>
                      <div className="text-[11px] text-neutral-600 mt-1">
                        {o.address}، {o.city}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500">
                        {o.governorate} {o.landmark && `(علامة: ${o.landmark})`}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        {o.items?.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-bold text-black">{item.quantity}x</span>{' '}
                            <span>{item.title}</span>{' '}
                            <span className="text-[10px] text-neutral-500">
                              ({item.size}/{item.color})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold">
                        {o.payment_method === 'InstaPay' ? 'إنستاباي' : 'دفع عند الاستلام'}
                      </span>
                      {o.payment_method === 'InstaPay' && o.receipt_url && (
                        <button
                          type="button"
                          onClick={() => viewInstaPayReceipt(o.receipt_url!)}
                          className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-700 underline hover:text-emerald-900"
                        >
                          <Eye className="h-3 w-3" />
                          معاينة الإيصال
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top font-mono font-bold text-neutral-900">
                      {o.total_amount.toLocaleString('en-EG')} ج.م
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                          o.status
                        )}`}
                      >
                        {o.status === 'pending' && 'قيد المراجعة'}
                        {o.status === 'confirmed' && 'تم التأكيد'}
                        {o.status === 'shipped' && 'مع المندوب'}
                        {o.status === 'cancelled' && 'ملغي'}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top text-left">
                      <select
                        disabled={updatingId === o.id}
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, e.target.value as OrderStatus)
                        }
                        className="rounded-xl border border-neutral-300 bg-white p-1.5 text-xs font-bold focus:border-black focus:outline-none"
                      >
                        <option value="pending">قيد المراجعة (Pending)</option>
                        <option value="confirmed">تأكيد وتجهيز (Confirmed)</option>
                        <option value="shipped">شحن مع المندوب (Shipped)</option>
                        <option value="cancelled">إلغاء الطلب (Cancelled)</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* InstaPay Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] max-w-lg w-full overflow-hidden rounded-3xl bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                إيصال تحويل إنستاباي للطلب
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-black hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200">
              <Image
                src={selectedReceipt}
                alt="InstaPay Transfer Receipt"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
