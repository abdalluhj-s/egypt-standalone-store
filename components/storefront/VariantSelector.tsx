'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Ruler, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import StockBadge from './StockBadge';
import SizeCalculatorModal from './SizeCalculatorModal';

export interface Variant {
  id: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_override?: number | null;
}

export interface ProductDetailsProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    base_price: number;
    images: string[];
    variants: Variant[];
  };
}

export default function VariantSelector({ product }: ProductDetailsProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color))),
    [product.variants]
  );

  const sizes = useMemo(() => {
    return Array.from(
      new Set(
        product.variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
      )
    );
  }, [product.variants, selectedColor]);

  const activeVariant = useMemo(() => {
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  const currentPrice = activeVariant?.price_override ?? product.base_price;
  const isOutOfStock = (activeVariant?.stock_quantity ?? 0) <= 0;
  const activeStock = activeVariant?.stock_quantity ?? 0;

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return;
    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      size: activeVariant.size,
      color: activeVariant.color,
      price: currentPrice,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      maxStock: activeStock,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-neutral-100 border border-neutral-200">
          <Image
            src={
              product.images?.[activeImageIndex] ||
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'
            }
            alt={product.title}
            fill
            priority
            className="object-cover transition-all duration-300"
          />
        </div>

        {/* Thumbnails */}
        {product.images?.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-black ring-2 ring-black/10'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Options & Buy Box */}
      <div className="flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          <div>
            <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
              {product.category}
            </span>
            <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 leading-tight">
              {product.title}
            </h1>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-black">
                {currentPrice.toLocaleString('en-EG')}
              </span>
              <span className="text-sm font-bold text-neutral-600">جنيه مصري</span>
            </div>
          </div>

          {/* Scarcity badge */}
          <div>
            <StockBadge stockQuantity={activeStock} />
          </div>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                اللون: <span className="text-black font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      const firstValid = product.variants.find((v) => v.color === color)?.size;
                      if (firstValid) setSelectedSize(firstValid);
                    }}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                      selectedColor === color
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Swatches + Recommender Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                المقاس: <span className="text-black font-semibold">{selectedSize}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 underline hover:text-black transition"
              >
                <Ruler className="h-3.5 w-3.5" />
                حاسبة المقاس الأنسب
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border px-5 py-2.5 text-xs font-mono font-bold transition-all ${
                    selectedSize === size
                      ? 'border-black bg-black text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-xs font-bold uppercase text-neutral-500 mb-1">
                تفاصيل وخامة المنتج:
              </h4>
              <p className="text-xs leading-relaxed text-neutral-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons (Desktop & Standard) */}
        <div className="space-y-3 pt-6 border-t border-neutral-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold transition-all active:scale-[0.98] ${
                addedToast
                  ? 'bg-emerald-600 text-white'
                  : 'border-2 border-black bg-white text-black hover:bg-neutral-50'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {addedToast ? (
                <>
                  <Check className="h-4 w-4" />
                  تمت الإضافة للسلة!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  إضافة إلى السلة
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 rounded-2xl bg-black py-3.5 px-6 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="h-4 w-4 fill-white" />
              شراء الآن والدفع السريع
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar (Mobile Only Viewport Trigger) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-neutral-200 bg-white/95 backdrop-blur-md p-3 px-4 sm:hidden">
        <div>
          <span className="block text-[10px] text-neutral-500">المجموع للقطعة</span>
          <span className="font-mono text-base font-black text-black">
            {currentPrice.toLocaleString('en-EG')} ج.م
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="rounded-xl border border-black px-3.5 py-2 text-xs font-bold text-black"
          >
            {addedToast ? 'تمت!' : 'السلة'}
          </button>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-md"
          >
            <Zap className="h-3.5 w-3.5 fill-white" />
            شراء فوري
          </button>
        </div>
      </div>

      {/* Size Calculator Modal */}
      <SizeCalculatorModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onSelectSize={(size) => {
          if (sizes.includes(size)) {
            setSelectedSize(size);
          }
        }}
      />
    </div>
  );
}
