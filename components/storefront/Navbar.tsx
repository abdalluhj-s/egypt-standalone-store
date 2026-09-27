'use client';

import Link from 'next/link';
import { ShoppingBag, Search, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white font-extrabold text-lg tracking-wider group-hover:scale-105 transition-transform">
              E
            </span>
            <div className="flex flex-col text-right">
              <span className="text-base font-black tracking-tight text-neutral-900 leading-none">
                EGYPT WEAR
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 tracking-wider">
                STANDALONE STORE
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-neutral-600">
            <Link href="/" className="hover:text-black transition">
              المتجر
            </Link>
            <Link href="/track" className="hover:text-black transition flex items-center gap-1">
              تتبع شحنتك
            </Link>
            <Link
              href="/admin"
              className="text-neutral-400 hover:text-neutral-800 transition flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              لوحة التحكم
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/track"
            className="md:hidden flex items-center justify-center rounded-xl border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            تتبع طلبك
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">السلة</span>
            {mounted && totalItems > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
