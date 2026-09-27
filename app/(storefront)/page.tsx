import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/storefront/ProductCard';
import { Sparkles, ShieldCheck, Truck, Zap } from 'lucide-react';

export const runtime = 'edge';
export const revalidate = 60; // Edge ISR cache

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'تيشيرت أوفر سايز Heavyweight قطن مصري 100%',
    slug: 'heavyweight-oversized-tee',
    category: 'Streetwear',
    base_price: 450,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop',
    ],
    is_active: true,
  },
  {
    id: 'prod-2',
    title: 'سويت شيرت هودي ثقيل مبطن Cairo Edition',
    slug: 'cairo-fleece-hoodie',
    category: 'Winter Collection',
    base_price: 750,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop',
    ],
    is_active: true,
  },
  {
    id: 'prod-3',
    title: 'بنطلون كارجو Urban عملي متعدد الجيوب',
    slug: 'urban-cargo-pants',
    category: 'Bottoms',
    base_price: 580,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop',
    ],
    is_active: true,
  },
  {
    id: 'prod-4',
    title: 'تيشيرت بيسك فائق النعومة Premium Cotton',
    slug: 'basic-cotton-crewneck',
    category: 'Streetwear',
    base_price: 390,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop',
    ],
    is_active: true,
  },
];

export default async function HomePage() {
  let products = FALLBACK_PRODUCTS;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, base_price, images, category, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      products = data as any;
    }
  } catch {
    // If Supabase not connected yet, use fallback products
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4 text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-neutral-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            كولكشن 2026 الحصري للسوق المصري
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            أقوى خامات القطن المصري بتصاميم عصرية وسرعة خارقة
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            استمتع بتجربة شراء فورية في ثوانٍ معدودة. دفع عند الاستلام أو عبر إنستاباي، مع شحن سريع
            لكافة محافظات مصر.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>تحويل إنستاباي فوري</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-sky-400" />
              <span>شحن سريع لـ 27 محافظة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>معاينة قبل الاستلام</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-900">
              أحدث التشكيلات والمنتجات
            </h2>
            <p className="text-xs text-neutral-500">
              اختر مقاسك ولونك المفضل مع حاسبة المقاسات الذكية
            </p>
          </div>
          <span className="text-xs font-bold text-neutral-400">
            عرض {products.length} منتجات
          </span>
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
