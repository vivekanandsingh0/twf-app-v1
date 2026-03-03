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

-- 16. Create Maintenance Settings Table
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
    app_type TEXT PRIMARY KEY CHECK (app_type IN ('User', 'Vendor')),
    is_active BOOLEAN DEFAULT FALSE,
    message TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to maintenance settings" ON public.maintenance_settings;
CREATE POLICY "Allow public read access to maintenance settings" ON public.maintenance_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update access to maintenance settings" ON public.maintenance_settings;
CREATE POLICY "Allow public update access to maintenance settings" ON public.maintenance_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.maintenance_settings (app_type, is_active, message)
VALUES 
    ('User', FALSE, 'Our app is currently undergoing scheduled maintenance. Please check back later.'),
    ('Vendor', FALSE, 'The vendor dashboard is currently in maintenance mode. We will be back shortly.')
ON CONFLICT (app_type) DO NOTHING;

-- 17. Create App Updates Table
CREATE TABLE IF NOT EXISTS public.app_updates (
    id INT PRIMARY KEY DEFAULT 1,
    latest_version TEXT NOT NULL DEFAULT '1.0.0',
    min_mandatory_version TEXT NOT NULL DEFAULT '1.0.0',
    update_link TEXT,
    message TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to app updates" ON public.app_updates;
CREATE POLICY "Allow public read access to app updates" ON public.app_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update access to app updates" ON public.app_updates;
CREATE POLICY "Allow public update access to app updates" ON public.app_updates FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.app_updates (id, latest_version, min_mandatory_version, message, is_active)
VALUES 
    (1, '1.0.0', '1.0.0', 'A new version of the app is available! Please update to enjoy the latest features.', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 18. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon can manage categories" ON public.categories;
CREATE POLICY "Anon can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon update category images" ON storage.objects;

CREATE POLICY "Public read category images" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Anon upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');
CREATE POLICY "Anon delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'categories');
CREATE POLICY "Anon update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'categories');

INSERT INTO public.categories (name, image_url, display_order)
VALUES 
    ('Vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2568&auto=format&fit=crop', 1),
    ('Fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop', 2),
    ('Meats', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=2670&auto=format&fit=crop', 3),
    ('Seafood', 'https://images.unsplash.com/photo-1615141982880-19ed7e6642f3?q=80&w=2564&auto=format&fit=crop', 4),
    ('Dairy & Eggs', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=2574&auto=format&fit=crop', 5),
    ('Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2672&auto=format&fit=crop', 6)
ON CONFLICT (name) DO NOTHING;

-- Create Payout Requests Table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Completed, Rejected
    admin_notes TEXT,
    transaction_id TEXT,
    bank_name TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view own payout requests" ON public.payout_requests;
CREATE POLICY "Vendors can view own payout requests" ON public.payout_requests FOR SELECT USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can insert own payout requests" ON public.payout_requests;
CREATE POLICY "Vendors can insert own payout requests" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Anon can manage payout requests" ON public.payout_requests;
CREATE POLICY "Anon can manage payout requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);


-- Add foreign key constraint between payout_requests and profiles
ALTER TABLE public.payout_requests DROP CONSTRAINT IF EXISTS fk_payout_requests_profiles;
ALTER TABLE public.payout_requests DROP CONSTRAINT IF EXISTS payout_requests_vendor_id_fkey;

ALTER TABLE public.payout_requests 
ADD CONSTRAINT payout_requests_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Vendor Spotlights Table
CREATE TABLE IF NOT EXISTS public.vendor_spotlights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vendor_spotlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Spotlights are viewable by everyone" ON public.vendor_spotlights;
CREATE POLICY "Spotlights are viewable by everyone" ON public.vendor_spotlights FOR SELECT USING (true);

DROP POLICY IF EXISTS "Spotlights can be managed by all" ON public.vendor_spotlights;
CREATE POLICY "Spotlights can be managed by all" ON public.vendor_spotlights FOR ALL USING (true) WITH CHECK (true);

-- Add vendor_approved column to profiles for approval workflow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vendor_approved BOOLEAN DEFAULT false;
-- Set all existing vendors to approved so they are not locked out
UPDATE public.profiles SET vendor_approved = true WHERE user_type = 'Vendor' AND vendor_approved IS NOT true;

-- RPC function for admin to approve/unapprove vendors (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_set_vendor_approved(vendor_uuid UUID, approved BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET vendor_approved = approved
    WHERE id = vendor_uuid;
END;
$$;

-- Allow anyone to call this function (admin panel uses anon key)
GRANT EXECUTE ON FUNCTION public.admin_set_vendor_approved(UUID, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_set_vendor_approved(UUID, BOOLEAN) TO authenticated;

-- RPC function for admin to COMPLETELY delete a vendor and all their data
CREATE OR REPLACE FUNCTION public.admin_delete_vendor_completely(vendor_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Delete tickets (user_id FK to auth.users)
    DELETE FROM public.tickets WHERE user_id = vendor_uuid;

    -- 2. Delete notifications (if user_id FK exists)
    BEGIN
        DELETE FROM public.notifications WHERE user_id = vendor_uuid;
    EXCEPTION WHEN undefined_table OR undefined_column THEN
        -- Table or column doesn't exist, skip
    END;

    -- 3. Delete order reviews for ALL orders involving this vendor
    DELETE FROM public.order_reviews WHERE order_id IN (
        SELECT id FROM public.orders WHERE vendor_id = vendor_uuid OR user_id = vendor_uuid
    );

    -- 4. Delete orders (both as vendor and as customer)
    DELETE FROM public.orders WHERE vendor_id = vendor_uuid;
    DELETE FROM public.orders WHERE user_id = vendor_uuid;

    -- 5. Delete market_section_products referencing this vendor's products
    DELETE FROM public.market_section_products WHERE product_id IN (
        SELECT id FROM public.products WHERE vendor_id = vendor_uuid
    );

    -- 6. Delete products
    DELETE FROM public.products WHERE vendor_id = vendor_uuid;

    -- 7. Delete payout requests
    DELETE FROM public.payout_requests WHERE vendor_id = vendor_uuid;

    -- 8. Delete delivery partners
    DELETE FROM public.delivery_partners WHERE vendor_id = vendor_uuid;

    -- 9. Delete vendor spotlights
    DELETE FROM public.vendor_spotlights WHERE vendor_id = vendor_uuid;

    -- 10. Delete the profile (addresses are JSON inside profile)
    DELETE FROM public.profiles WHERE id = vendor_uuid;

    -- 11. Delete the auth user so the phone number is freed up
    DELETE FROM auth.users WHERE id = vendor_uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_vendor_completely(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_vendor_completely(UUID) TO authenticated;

-- RPC function for admin to get ALL orders (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_get_all_orders()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            o.*,
            json_build_object(
                'id', c.id,
                'full_name', c.full_name,
                'phone_number', c.phone_number,
                'user_type', c.user_type
            ) as customer,
            json_build_object(
                'id', v.id,
                'full_name', v.full_name,
                'phone_number', v.phone_number,
                'user_type', v.user_type
            ) as vendor
        FROM public.orders o
        LEFT JOIN public.profiles c ON o.user_id = c.id
        LEFT JOIN public.profiles v ON o.vendor_id = v.id
        ORDER BY o.created_at DESC
    ) t;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_orders() TO anon;
GRANT EXECUTE ON FUNCTION public.admin_get_all_orders() TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
