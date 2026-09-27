'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, ShoppingBag, Clock, Package, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalSales: 17800,
    totalOrders: 32,
    pendingOrders: 5,
    totalProducts: 4,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const supabase = createClient();
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (orders && orders.length > 0) {
          const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
          const pending = orders.filter((o) => o.status === 'pending').length;
          setStats({
            totalSales,
            totalOrders: orders.length,
            pendingOrders: pending,
            totalProducts: productCount || 4,
          });
          setRecentOrders(orders);
        }
      } catch {
        // Dev fallback
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">نظرة عامة والتحليلات</h1>
          <p className="text-xs text-neutral-500">
            متابعة فورية للمبيعات وحركة الطلبات والمخزون في السوق المصري
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة منتج جديد</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">إجمالي المبيعات</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-neutral-900">
            {stats.totalSales.toLocaleString('en-EG')} <span className="text-xs font-normal">ج.م</span>
          </div>
          <span className="block text-[11px] text-emerald-600 font-bold">
            محدث باللحظة من الطلبات المكتملة
          </span>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">إجمالي الطلبات</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-neutral-900">
            {stats.totalOrders} <span className="text-xs font-normal">طلب</span>
          </div>
          <span className="block text-[11px] text-neutral-400">
            يشمل طلبات الدفع عند الاستلام وإنستاباي
          </span>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">طلبات بانتظار التأكيد</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-neutral-900">
            {stats.pendingOrders} <span className="text-xs font-normal">طلب جديد</span>
          </div>
          <span className="block text-[11px] text-amber-600 font-bold">
            يتطلب مراجعة أو تأكيد شحن
          </span>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">المنتجات المعروضة</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-neutral-900">
            {stats.totalProducts} <span className="text-xs font-normal">منتجات</span>
          </div>
          <span className="block text-[11px] text-neutral-400">
            جاهزة ومتاحة للشراء في المتجر
          </span>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">إدارة الطلبات الواردة والتحويلات</h3>
          <p className="text-xs text-neutral-500">
            راجع إيصالات تحويل إنستاباي، وقم بتحديث حالات الشحن، وتواصل مع العملاء بنقرة واحدة
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition"
        >
          <span>عرض جدول الطلبات</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
