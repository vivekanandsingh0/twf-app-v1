    -- ============================================================
    -- COMPLETE SETUP: Run this entire file in Supabase SQL Editor
    -- ============================================================

    -- 1. ALTER articles table to add all required columns
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'));
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tag TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS time TEXT NOT NULL DEFAULT '5 min read';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Tips';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- 2. Create feed_sections table
    CREATE TABLE IF NOT EXISTS public.feed_sections (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Add section_id to articles
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.feed_sections(id) ON DELETE SET NULL;

    -- 4. Enable RLS on both tables
    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.feed_sections ENABLE ROW LEVEL SECURITY;

    -- 5. Articles RLS policies
    DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
    DROP POLICY IF EXISTS "Anon can insert articles" ON public.articles;
    DROP POLICY IF EXISTS "Anon can update articles" ON public.articles;
    DROP POLICY IF EXISTS "Anon can delete articles" ON public.articles;

    CREATE POLICY "Anyone can read published articles" ON public.articles FOR SELECT USING (true);
    CREATE POLICY "Anon can insert articles" ON public.articles FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anon can update articles" ON public.articles FOR UPDATE USING (true);
    CREATE POLICY "Anon can delete articles" ON public.articles FOR DELETE USING (true);

    -- 6. Feed sections RLS policies
    DROP POLICY IF EXISTS "Anyone can read active sections" ON public.feed_sections;
    DROP POLICY IF EXISTS "Anon can insert sections" ON public.feed_sections;
    DROP POLICY IF EXISTS "Anon can update sections" ON public.feed_sections;
    DROP POLICY IF EXISTS "Anon can delete sections" ON public.feed_sections;

    CREATE POLICY "Anyone can read active sections" ON public.feed_sections FOR SELECT USING (true);
    CREATE POLICY "Anon can insert sections" ON public.feed_sections FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anon can update sections" ON public.feed_sections FOR UPDATE USING (true);
    CREATE POLICY "Anon can delete sections" ON public.feed_sections FOR DELETE USING (true);

    -- 7. Storage bucket for article images
    INSERT INTO storage.buckets (id, name, public) VALUES ('articles', 'articles', true) ON CONFLICT (id) DO NOTHING;

    DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anon upload article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anon delete article images" ON storage.objects;

    CREATE POLICY "Public read article images" ON storage.objects FOR SELECT USING (bucket_id = 'articles');
    CREATE POLICY "Anon upload article images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'articles');
    CREATE POLICY "Anon delete article images" ON storage.objects FOR DELETE USING (bucket_id = 'articles');

-- 8. Add GPS pin columns to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_latitude DOUBLE PRECISION;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_longitude DOUBLE PRECISION;

-- 9. Delivery Partners table
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view delivery partners" ON public.delivery_partners;
DROP POLICY IF EXISTS "Vendors can insert delivery partners" ON public.delivery_partners;
DROP POLICY IF EXISTS "Vendors can delete delivery partners" ON public.delivery_partners;

CREATE POLICY "Anyone can view delivery partners" ON public.delivery_partners FOR SELECT USING (true);
CREATE POLICY "Vendors can insert delivery partners" ON public.delivery_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors can delete delivery partners" ON public.delivery_partners FOR DELETE USING (true);

-- 10. Storage bucket for delivery partner photos
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-partners', 'delivery-partners', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read delivery partner photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload delivery partner photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete delivery partner photos" ON storage.objects;

CREATE POLICY "Public read delivery partner photos" ON storage.objects FOR SELECT USING (bucket_id = 'delivery-partners');
CREATE POLICY "Anon upload delivery partner photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'delivery-partners');
CREATE POLICY "Anon delete delivery partner photos" ON storage.objects FOR DELETE USING (bucket_id = 'delivery-partners');

-- 11. Add Delivery Partner columns to Orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner_photo TEXT;

-- 12. Add Bank Details to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_details JSONB;

-- 13. Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
CREATE POLICY "Public read app settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon all app settings" ON public.app_settings;
CREATE POLICY "Anon all app settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.app_settings (key, value, description)
VALUES ('vendor_support_phone', '919999999999', 'Phone number for vendor support')
ON CONFLICT (key) DO NOTHING;

-- 14. Add RPC functions for Admin Dashboard to bypass RLS
CREATE OR REPLACE FUNCTION get_admin_vendor_ratings()
RETURNS TABLE (
    vendor_id UUID,
    rating NUMERIC
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.vendor_id,
        ROUND(AVG(r.product_rating)::numeric, 1) as rating
    FROM 
        public.order_reviews r
    INNER JOIN 
        public.orders o ON r.order_id = o.id
    GROUP BY 
        o.vendor_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_vendor_ratings() TO public;
GRANT EXECUTE ON FUNCTION get_admin_vendor_ratings() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_vendor_ratings() TO authenticated;
CREATE TABLE IF NOT EXISTS public.market_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_section_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES public.market_sections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, product_id)
);

ALTER TABLE public.market_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_section_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active market sections" ON public.market_sections FOR SELECT USING (true);
CREATE POLICY "Anon can insert market sections" ON public.market_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can update market sections" ON public.market_sections FOR UPDATE USING (true);
CREATE POLICY "Anon can delete market sections" ON public.market_sections FOR DELETE USING (true);

CREATE POLICY "Anyone can view section products" ON public.market_section_products FOR SELECT USING (true);
CREATE POLICY "Anon can insert section products" ON public.market_section_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can delete section products" ON public.market_section_products FOR DELETE USING (true);
