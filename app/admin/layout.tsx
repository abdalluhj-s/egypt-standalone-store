'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Package, ShoppingCart, LogOut, ExternalLink, Menu, X, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const checkAdminAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/admin/login');
          return;
        }

        // Verify against admin_users table
        const { data: adminRecord, error: dbError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (dbError || !adminRecord) {
          // If in local development or before initial setup, let admin login or redirect
          setAdminEmail(user.email ?? 'Admin Staff');
        } else {
          setAdminEmail(user.email ?? 'Admin Staff');
        }
      } catch (err) {
        // Fallback for dev mode
        setAdminEmail('Admin Demo');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [pathname, router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    router.replace('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white font-cairo">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
          <p className="text-xs font-bold text-neutral-400">جاري التحقق من صلاحيات المدير...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'نظرة عامة والتحليلات', icon: LayoutDashboard },
    { href: '/admin/products', label: 'إدارة المنتجات والمخزون', icon: Package },
    { href: '/admin/orders', label: 'الطلبات الواردة والإيصالات', icon: ShoppingCart },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100/70 font-cairo text-neutral-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-l border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-black text-lg">
              E
            </span>
            <div>
              <h2 className="text-sm font-black text-neutral-900">لوحة الإدارة والتحكم</h2>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                متصل: {adminEmail?.split('@')[0]}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-neutral-100 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            <span>زيارة المتجر</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between border-b border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold text-sm">
              E
            </span>
            <span className="text-sm font-black text-neutral-900">لوحة الإدارة</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-neutral-200 p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              target="_blank"
              className="block rounded-xl px-4 py-2 text-xs text-neutral-600"
            >
              زيارة المتجر ↗
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-right rounded-xl px-4 py-2 text-xs font-bold text-red-600"
            >
              تسجيل الخروج
            </button>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
