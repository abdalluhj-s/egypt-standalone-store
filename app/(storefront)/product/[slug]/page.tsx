import { createClient } from '@/lib/supabase/server';
import VariantSelector from '@/components/storefront/VariantSelector';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const FALLBACK_PRODUCTS_DETAILED: Record<string, any> = {
  'heavyweight-oversized-tee': {
    id: 'prod-1',
    title: 'تيشيرت أوفر سايز Heavyweight قطن مصري 100%',
    slug: 'heavyweight-oversized-tee',
    category: 'Streetwear',
    base_price: 450,
    description: `تيشيرت أوفر سايز فاخر مصنوع من أجود أنواع القطن المصري المعالج ضد الانكماش بوزن 280 جرام.
• قطن مصري 100% طويل التيلة
• قصة أوفر سايز مريحة وعصرية
• ياقة دائرية متينة مع درزات مزدوجة
• ألوان ثابتة مقاومة للغسيل المتكرر`,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop',
    ],
    variants: [
      { id: 'v1', size: 'M', color: 'Black', stock_quantity: 2, price_override: null },
      { id: 'v2', size: 'L', color: 'Black', stock_quantity: 15, price_override: null },
      { id: 'v3', size: 'XL', color: 'Black', stock_quantity: 8, price_override: null },
      { id: 'v4', size: 'M', color: 'Off-White', stock_quantity: 5, price_override: null },
      { id: 'v5', size: 'L', color: 'Off-White', stock_quantity: 12, price_override: null },
      { id: 'v6', size: 'XL', color: 'Off-White', stock_quantity: 1, price_override: null },
    ],
  },
  'cairo-fleece-hoodie': {
    id: 'prod-2',
    title: 'سويت شيرت هودي ثقيل مبطن Cairo Edition',
    slug: 'cairo-fleece-hoodie',
    category: 'Winter Collection',
    base_price: 750,
    description: `هودي شتوي ثقيل مبطن بفرو ناعم مع تطريز راقي عالي الجودة وتصميم عصري مريح.
• بطانة داخلية فائقة الدفء
• جيب كانغرو أمامي مريح
• كابيشون مزدوج برباط تضييق متين`,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop',
    ],
    variants: [
      { id: 'v7', size: 'L', color: 'Charcoal Grey', stock_quantity: 10, price_override: null },
      { id: 'v8', size: 'XL', color: 'Charcoal Grey', stock_quantity: 4, price_override: null },
      { id: 'v9', size: 'L', color: 'Dark Olive', stock_quantity: 6, price_override: null },
    ],
  },
  'urban-cargo-pants': {
    id: 'prod-3',
    title: 'بنطلون كارجو Urban عملي متعدد الجيوب',
    slug: 'urban-cargo-pants',
    category: 'Bottoms',
    base_price: 580,
    description: `بنطلون كارجو مريح بجيوب عملية وخامة قطنية ممتازة تناسب الاستخدام اليومي الشاق.
• خامة جبردين قطن مرن ومريح
• 6 جيوب عملية لتخزين متعلقاتك
• استك استريتش عند الكاحل لمظهر أنيق`,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop',
    ],
    variants: [
      { id: 'v10', size: '32', color: 'Khaki', stock_quantity: 7, price_override: null },
      { id: 'v11', size: '34', color: 'Khaki', stock_quantity: 14, price_override: null },
      { id: 'v12', size: '36', color: 'Khaki', stock_quantity: 3, price_override: null },
    ],
  },
  'basic-cotton-crewneck': {
    id: 'prod-4',
    title: 'تيشيرت بيسك فائق النعومة Premium Cotton',
    slug: 'basic-cotton-crewneck',
    category: 'Streetwear',
    base_price: 390,
    description: `تيشيرت بيسك يومي خفيف ومريح لا غنى عنه، مصنع من أنقى خيوط القطن المصري بنسبة 100%.`,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop',
    ],
    variants: [
      { id: 'v13', size: 'M', color: 'White', stock_quantity: 20, price_override: null },
      { id: 'v14', size: 'L', color: 'White', stock_quantity: 15, price_override: null },
      { id: 'v15', size: 'XL', color: 'White', stock_quantity: 8, price_override: null },
    ],
  },
};

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  let product = FALLBACK_PRODUCTS_DETAILED[params.slug];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('slug', params.slug)
      .single();

    if (!error && data) {
      product = {
        ...data,
        variants: data.product_variants || [],
      };
    }
  } catch {
    // If Supabase call fails, use fallback
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black transition"
        >
          <ArrowRight className="h-4 w-4" />
          <span>الرجوع إلى المتجر</span>
        </Link>
      </div>

      <VariantSelector product={product} />
    </div>
  );
}
