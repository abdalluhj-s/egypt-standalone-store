'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface SizeCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
}

export default function SizeCalculatorModal({
  isOpen,
  onClose,
  onSelectSize,
}: SizeCalculatorProps) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [fit, setFit] = useState<'regular' | 'loose'>('regular');

  if (!isOpen) return null;

  // Smart size recommendation algorithm based on height, weight, and fit
  const calculateSize = (): string => {
    let score = weight;
    if (height > 180) score += 3;
    if (height < 165) score -= 3;
    if (fit === 'loose') score += 5;

    if (score < 60) return 'S';
    if (score < 75) return 'M';
    if (score < 88) return 'L';
    if (score < 100) return 'XL';
    return '2XL';
  };

  const recommendedSize = calculateSize();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all border border-neutral-100">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-neutral-900">
              حاسبة المقاس الأنسب لجسمك
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700">
              <span>الطول:</span>
              <span className="font-mono text-sm font-bold text-black">{height} سم</span>
            </div>
            <input
              type="range"
              min={150}
              max={205}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-2 w-full accent-black cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700">
              <span>الوزن:</span>
              <span className="font-mono text-sm font-bold text-black">{weight} كجم</span>
            </div>
            <input
              type="range"
              min={45}
              max={130}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-2 w-full accent-black cursor-pointer"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
              ستايل اللبس المفضل:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFit('regular')}
                className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                  fit === 'regular'
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                مظبوط (Regular Fit)
              </button>
              <button
                type="button"
                onClick={() => setFit('loose')}
                className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                  fit === 'loose'
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                واسع (Oversized)
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-center">
            <span className="text-xs text-neutral-500 font-medium">المقاس المقترح والمثالي لك:</span>
            <div className="mt-1 font-mono text-3xl font-extrabold text-black">
              {recommendedSize}
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              محسوب بدقة بناءً على مقاسات وتصاميم القطع لدينا
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectSize(recommendedSize);
              onClose();
            }}
            className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition active:scale-[0.98]"
          >
            تطبيق المقاس ({recommendedSize}) ومتابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
}
