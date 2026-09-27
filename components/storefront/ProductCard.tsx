import Image from 'next/image';
import Link from 'next/link';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    base_price: number;
    images: string[];
    category: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const thumbnail =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop';

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white transition-all hover:border-neutral-400 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Image
          src={thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-neutral-800 shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 text-right">
        <div>
          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between border-t border-neutral-100 pt-2.5">
          <span className="text-[11px] font-semibold text-neutral-400">السعر</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm sm:text-base font-black text-black">
              {product.base_price.toLocaleString('en-EG')}
            </span>
            <span className="text-[11px] font-bold text-neutral-600">ج.م</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
