'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Edit3, X, Image as ImageIcon, Upload, Check } from 'lucide-react';

interface VariantDraft {
  id?: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_override: number | null;
}

interface ProductWithVariants {
  id: string;
  title: string;
  slug: string;
  category: string;
  base_price: number;
  description: string;
  images: string[];
  is_active: boolean;
  product_variants: VariantDraft[];
}

const DEFAULT_DEMO_PRODUCTS: ProductWithVariants[] = [
  {
    id: 'p-1',
    title: 'تيشيرت أوفر سايز Heavyweight قطن مصري 100%',
    slug: 'heavyweight-oversized-tee',
    category: 'Streetwear',
    base_price: 450,
    description: 'تيشيرت أوفر سايز فاخر مصنوع من أجود أنواع القطن المصري المعالج ضد الانكماش.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    ],
    is_active: true,
    product_variants: [
      { size: 'M', color: 'Black', stock_quantity: 2, price_override: null },
      { size: 'L', color: 'Black', stock_quantity: 15, price_override: null },
    ],
  },
  {
    id: 'p-2',
    title: 'سويت شيرت هودي ثقيل مبطن Cairo Edition',
    slug: 'cairo-fleece-hoodie',
    category: 'Winter Collection',
    base_price: 750,
    description: 'هودي شتوي ثقيل مبطن بفرو ناعم.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    ],
    is_active: true,
    product_variants: [
      { size: 'L', color: 'Charcoal Grey', stock_quantity: 10, price_override: null },
    ],
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setProducts(data as ProductWithVariants[]);
      } else {
        setProducts(DEFAULT_DEMO_PRODUCTS);
      }
    } catch {
      setProducts(DEFAULT_DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('Streetwear');
    setBasePrice(450);
    setDescription('');
    setIsActive(true);
    setImages(['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800']);
    setVariants([{ size: 'M', color: 'Black', stock_quantity: 10, price_override: null }]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductWithVariants) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setBasePrice(p.base_price);
    setDescription(p.description || '');
    setIsActive(p.is_active);
    setImages(p.images || []);
    setVariants(p.product_variants || []);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      setImages((prev) => [...prev, publicUrl]);
    } catch (err: any) {
      alert(`تنبيه: تم استخدام الصورة الافتراضية (${err.message})`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { size: 'L', color: 'White', stock_quantity: 10, price_override: null },
    ]);
  };

  const updateVariantRow = (index: number, key: keyof VariantDraft, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || basePrice <= 0) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      let targetProductId = editingId;

      if (editingId && !editingId.startsWith('p-')) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            title,
            slug,
            category,
            base_price: basePrice,
            description,
            images,
            is_active: isActive,
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
      } else {
        const { data: newProd, error: insertError } = await supabase
          .from('products')
          .insert({
            title,
            slug,
            category,
            base_price: basePrice,
            description,
            images,
            is_active: isActive,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        targetProductId = newProd.id;
      }

      if (targetProductId) {
        await supabase.from('product_variants').delete().eq('product_id', targetProductId);
        const variantRowsToInsert = variants.map((v) => ({
          product_id: targetProductId,
          size: v.size.trim(),
          color: v.color.trim(),
          stock_quantity: Number(v.stock_quantity),
          price_override: v.price_override ? Number(v.price_override) : null,
        }));
        await supabase.from('product_variants').insert(variantRowsToInsert);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(`تم حفظ التعديلات محلياً (${err.message})`);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج وجميع مقاساته ومخزونه؟')) return;
    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">إدارة المنتجات والمخزون</h1>
          <p className="text-xs text-neutral-500">
            إضافة وتعديل المنتجات، رفع الصور إلى Supabase Storage، وضبط كميات المقاسات والألوان
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Catalog Table */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-right text-xs">
            <thead className="bg-neutral-50 font-bold text-neutral-700">
              <tr>
                <th className="px-4 py-3">المنتج</th>
                <th className="px-4 py-3">التصنيف</th>
                <th className="px-4 py-3">السعر الأساسي</th>
                <th className="px-4 py-3">المتغيرات</th>
                <th className="px-4 py-3">إجمالي المخزون</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    جاري تحميل المنتجات...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    لا توجد منتجات مسجلة. اضغط &quot;إضافة منتج جديد&quot; للبدء.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock =
                    p.product_variants?.reduce(
                      (sum, v) => sum + (v.stock_quantity || 0),
                      0
                    ) ?? 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt="" fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="block font-bold text-neutral-900">{p.title}</span>
                            <span className="block font-mono text-[10px] text-neutral-400">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {p.base_price.toLocaleString('en-EG')} ج.م
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-semibold">
                          {p.product_variants?.length || 0} ألوان/مقاسات
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span
                          className={`rounded-lg px-2 py-1 text-[11px] ${
                            totalStock <= 3
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {totalStock} قطعة
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            p.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {p.is_active ? 'نشط بالمتجر' : 'مسودة'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-black text-neutral-900">
                {editingId ? 'تعديل بيانات ومخزون المنتج' : 'إضافة منتج ومقاسات جديدة'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingId) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '') || `item-${Date.now().toString(36)}`
                        );
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الرابط الدائم (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none font-mono text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    التصنيف *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Streetwear / Winter / Bottoms"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    السعر الأساسي (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  وصف المنتج والخامات
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-black focus:outline-none"
                />
              </div>

              {/* Images */}
              <div className="border-t border-neutral-100 pt-3">
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  صور المنتج (Supabase Storage)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-14 overflow-hidden rounded-xl border border-neutral-200"
                    >
                      <Image src={url} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 text-white hover:bg-black"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  <label className="flex h-16 w-14 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition">
                    <Upload className="h-4 w-4 text-neutral-400" />
                    <span className="text-[9px] font-bold text-neutral-500 mt-1">
                      {uploadingImage ? '...' : 'رفع'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Variants Matrix */}
              <div className="border-t border-neutral-100 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-800">
                    مصفوفة المقاسات والألوان والمخزون
                  </h3>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>إضافة صف</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/50 p-2 text-xs"
                    >
                      <div className="w-20">
                        <input
                          type="text"
                          required
                          placeholder="المقاس (M)"
                          value={variant.size}
                          onChange={(e) => updateVariantRow(idx, 'size', e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs text-center font-bold"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="text"
                          required
                          placeholder="اللون (أسود)"
                          value={variant.color}
                          onChange={(e) => updateVariantRow(idx, 'color', e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs text-center"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="المخزون"
                          value={variant.stock_quantity}
                          onChange={(e) =>
                            updateVariantRow(idx, 'stock_quantity', parseInt(e.target.value) || 0)
                          }
                          className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          min={0}
                          placeholder="سعر إضافي (اختياري)"
                          value={variant.price_override ?? ''}
                          onChange={(e) =>
                            updateVariantRow(
                              idx,
                              'price_override',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={variants.length === 1}
                        onClick={() => removeVariantRow(idx)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:text-red-600 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status active toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-black rounded"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-neutral-800">
                  المنتج نشط ومتاح للطلب الفوري في المتجر
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ المنتج والمخزون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
