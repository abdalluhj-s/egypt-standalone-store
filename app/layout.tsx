import type { Metadata, Viewport } from 'next';
import './globals.css';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Egypt Wear | متجر الملابس المصري العصري',
  description: 'منصة التجارة الإلكترونية المصرية المستقلة - أسرع تجربة تسوق بدون أي بطء',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#fcfcfc] text-neutral-900 selection:bg-neutral-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
