-- ==============================================================================
-- STANDALONE E-COMMERCE FOR EGYPT - COMPLETE SUPABASE MIGRATION
-- Paste this entire script into your Supabase SQL Editor and click 'Run'.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_payment_method') THEN
        CREATE TYPE order_payment_method AS ENUM ('COD', 'InstaPay', 'Online');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'cancelled');
    END IF;
END $$;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON public.products(is_active, category);

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    price_override NUMERIC(10, 2) CHECK (price_override >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method order_payment_method NOT NULL DEFAULT 'COD',
    status order_status NOT NULL DEFAULT 'pending',
    receipt_url TEXT,
    verification_code VARCHAR(6),
    is_verified BOOLEAN DEFAULT false,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 6. Admin Roles Table (Secure mapping for authenticated staff)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Security Helper Function: Checks if requesting user is verified admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    );
$$;

-- 7. Row Level Security Policies (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" 
    ON public.products FOR SELECT 
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
CREATE POLICY "Admin full access on products" 
    ON public.products FOR ALL 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());

-- Variant Policies
DROP POLICY IF EXISTS "Public can view variants of active products" ON public.product_variants;
CREATE POLICY "Public can view variants of active products" 
    ON public.product_variants FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE products.id = product_variants.product_id 
            AND (products.is_active = true OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Admin full access on variants" ON public.product_variants;
CREATE POLICY "Admin full access on variants" 
    ON public.product_variants FOR ALL 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());

-- Orders Policies
DROP POLICY IF EXISTS "Public guest can insert orders" ON public.orders;
CREATE POLICY "Public guest can insert orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order by id or phone" ON public.orders;
CREATE POLICY "Public can view order by id or phone" 
    ON public.orders FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admin can view and update orders" ON public.orders;
CREATE POLICY "Admin can view and update orders" 
    ON public.orders FOR ALL 
    USING (public.is_admin()) 
    WITH CHECK (public.is_admin());

-- Admin Users Policies
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
    ON public.admin_users FOR SELECT
    USING (public.is_admin());

-- 8. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public product images read" ON storage.objects;
CREATE POLICY "Public product images read" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin manage product images" ON storage.objects;
CREATE POLICY "Admin manage product images" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Public insert receipts" ON storage.objects;
CREATE POLICY "Public insert receipts" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Admin view receipts" ON storage.objects;
CREATE POLICY "Admin view receipts" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'receipts' AND public.is_admin());

-- ==============================================================================
-- 9. Sample Initial Products Seed (Egyptian Streetwear Collection)
-- ==============================================================================
DO $$
DECLARE
    prod1_id UUID;
    prod2_id UUID;
    prod3_id UUID;
BEGIN
    -- Product 1: Heavyweight Oversized Tee
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'heavyweight-oversized-tee') THEN
        INSERT INTO public.products (title, slug, description, category, base_price, images, is_active)
        VALUES (
            'تيشيرت أوفر سايز Heavyweight قطن مصري 100%',
            'heavyweight-oversized-tee',
            'تيشيرت أوفر سايز فاخر مصنوع من أجود أنواع القطن المصري المعالج ضد الانكماش بوزن 280 جرام.',
            'Streetwear',
            450.00,
            ARRAY[
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop'
            ],
            true
        ) RETURNING id INTO prod1_id;

        INSERT INTO public.product_variants (product_id, size, color, stock_quantity, price_override)
        VALUES 
            (prod1_id, 'M', 'Black', 2, NULL),
            (prod1_id, 'L', 'Black', 15, NULL),
            (prod1_id, 'XL', 'Black', 8, NULL),
            (prod1_id, 'M', 'Off-White', 5, NULL),
            (prod1_id, 'L', 'Off-White', 12, NULL),
            (prod1_id, 'XL', 'Off-White', 1, NULL);
    END IF;

    -- Product 2: Premium Fleece Hoodie
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'cairo-fleece-hoodie') THEN
        INSERT INTO public.products (title, slug, description, category, base_price, images, is_active)
        VALUES (
            'سويت شيرت هودي ثقيل مطرز Cairo Edition',
            'cairo-fleece-hoodie',
            'هودي شتوي ثقيل مبطن بفرو ناعم مع تطريز راقي عالي الجودة وتصميم عصري مريح.',
            'Winter Collection',
            750.00,
            ARRAY[
                'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop'
            ],
            true
        ) RETURNING id INTO prod2_id;

        INSERT INTO public.product_variants (product_id, size, color, stock_quantity, price_override)
        VALUES 
            (prod2_id, 'L', 'Charcoal Grey', 10, NULL),
            (prod2_id, 'XL', 'Charcoal Grey', 4, NULL),
            (prod2_id, 'L', 'Dark Olive', 6, NULL);
    END IF;

    -- Product 3: Minimal Cargo Pants
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'urban-cargo-pants') THEN
        INSERT INTO public.products (title, slug, description, category, base_price, images, is_active)
        VALUES (
            'بنطلون كارجو Urban عملي متعدد الجيوب',
            'urban-cargo-pants',
            'بنطلون كارجو مريح بجيوب عملية وخامة قطنية ممتازة تناسب الاستخدام اليومي الشاق.',
            'Bottoms',
            580.00,
            ARRAY[
                'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop'
            ],
            true
        ) RETURNING id INTO prod3_id;

        INSERT INTO public.product_variants (product_id, size, color, stock_quantity, price_override)
        VALUES 
            (prod3_id, '32', 'Khaki', 7, NULL),
            (prod3_id, '34', 'Khaki', 14, NULL),
            (prod3_id, '36', 'Khaki', 3, NULL);
    END IF;
END $$;
