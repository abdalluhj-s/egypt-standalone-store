import Navbar from '@/components/storefront/Navbar';
import PWAInstallPrompt from '@/components/storefront/PWAInstallPrompt';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-10 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-white font-bold text-xs">
              E
            </span>
            <span className="font-bold text-black tracking-wider">EGYPT WEAR</span>
          </div>
          <p className="text-neutral-400">
            أقوى منصة تجارة إلكترونية مستقلة للملابس في مصر - سرعة فائقة ودفع فوري عبر إنستاباي
          </p>
          <div className="flex justify-center gap-4 text-[11px] font-semibold text-neutral-400 pt-2">
            <span>شحن سريع لجميع المحافظات</span>
            <span>•</span>
            <span>دفع عند الاستلام أو إنستاباي</span>
            <span>•</span>
            <span>معاينة واسترجاع سهل</span>
          </div>
          <p className="text-[10px] text-neutral-300 pt-4">
            © {new Date().getFullYear()} Egypt Wear. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
