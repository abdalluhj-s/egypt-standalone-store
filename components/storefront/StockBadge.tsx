'use client';

interface StockBadgeProps {
  stockQuantity: number;
}

export default function StockBadge({ stockQuantity }: StockBadgeProps) {
  if (stockQuantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
        نفدت الكمية حالياً
      </span>
    );
  }

  if (stockQuantity <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
        متبقي {stockQuantity === 1 ? 'قطعة واحدة فقط!' : `${stockQuantity} قطع فقط!`} بالمستودع
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
      متوفر بالمخزون ({stockQuantity} قطعة)
    </span>
  );
}
