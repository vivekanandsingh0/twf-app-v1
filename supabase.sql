--1st--
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

GRANT EXECUTE ON FUNCTION public.admin_set_vendor_approved(UUID, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_set_vendor_approved(UUID, BOOLEAN) TO authenticated;

NOTIFY pgrst, 'reload schema';

--2nd--
-- Create Categories Table
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

-- Storage bucket for category images
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon update category images" ON storage.objects;

CREATE POLICY "Public read category images" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Anon upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');
CREATE POLICY "Anon delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'categories');
CREATE POLICY "Anon update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'categories');

-- Push pre-filled categories instantly so your apps don't turn blank
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


-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';


--3rd--
-- Create App Updates Table
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

-- Enable RLS
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app updates
CREATE POLICY "Allow public read access to app updates" 
ON public.app_updates FOR SELECT USING (true);

-- Allow public update access (for admin usage)
CREATE POLICY "Allow public update access to app updates" 
ON public.app_updates FOR ALL USING (true) WITH CHECK (true);

-- Insert initial row
INSERT INTO public.app_updates (id, latest_version, min_mandatory_version, message, is_active)
VALUES 
    (1, '1.0.0', '1.0.0', 'A new version of the app is available! Please update to enjoy the latest features.', FALSE)
ON CONFLICT (id) DO NOTHING;

--4th--
-- Create Maintenance Settings Table
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
    app_type TEXT PRIMARY KEY CHECK (app_type IN ('User', 'Vendor')),
    is_active BOOLEAN DEFAULT FALSE,
    message TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone needs to know if app is in maintenance)
CREATE POLICY "Allow public read access to maintenance settings" 
ON public.maintenance_settings FOR SELECT USING (true);

-- Allow public update access (for admin usage)
CREATE POLICY "Allow public update access to maintenance settings" 
ON public.maintenance_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert initial rows
INSERT INTO public.maintenance_settings (app_type, is_active, message)
VALUES 
    ('User', FALSE, 'Our app is currently undergoing scheduled maintenance. Please check back later.'),
    ('Vendor', FALSE, 'The vendor dashboard is currently in maintenance mode. We will be back shortly.')
ON CONFLICT (app_type) DO NOTHING;

--5th--
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

--6th--
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

--7th--
-- Create order_reviews table
CREATE TABLE IF NOT EXISTS public.order_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_rating INTEGER NOT NULL CHECK (product_rating >= 1 AND product_rating <= 5),
    driver_rating INTEGER NOT NULL CHECK (driver_rating >= 1 AND driver_rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public profiles can view all reviews" 
    ON public.order_reviews FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own reviews" 
    ON public.order_reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
    ON public.order_reviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON public.order_reviews FOR DELETE 
    USING (auth.uid() = user_id);

--8th--
-- Create app_settings table for admin-configurable settings
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default delivery charge settings
INSERT INTO app_settings (key, value) VALUES 
    ('delivery_charges', '{"min_order_for_free_delivery": 200, "delivery_fee": 30}')
ON CONFLICT (key) DO NOTHING;

-- Allow public read access
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_settings" ON app_settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update app_settings" ON app_settings
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can insert app_settings" ON app_settings
    FOR INSERT WITH CHECK (true);


--9th--
-- Add preorder and discount fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_duration INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'instant';
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;

-- Add preorder fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'instant';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;


--10th--
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


--11th--
-- Migration: Alter existing articles table to add missing columns
-- The articles table already exists with a different schema, so we ALTER it.

-- Add 'status' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published'));

-- Add 'image_url' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add 'content' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS content TEXT;

-- Add 'type' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS type TEXT;

-- Add 'tag' column if it doesn't exist (may already exist as 'tags')
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS tag TEXT;

-- Add 'time' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS time TEXT NOT NULL DEFAULT '5 min read';

-- Add 'category' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Tips';

-- Add 'updated_at' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS if not already enabled
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Anon can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Anon can update articles" ON public.articles;
DROP POLICY IF EXISTS "Anon can delete articles" ON public.articles;

-- Recreate policies
CREATE POLICY "Anyone can read published articles"
    ON public.articles FOR SELECT
    USING (true);

CREATE POLICY "Anon can insert articles"
    ON public.articles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anon can update articles"
    ON public.articles FOR UPDATE
    USING (true);

CREATE POLICY "Anon can delete articles"
    ON public.articles FOR DELETE
    USING (true);

-- Create storage bucket for article images (safe if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete article images" ON storage.objects;

CREATE POLICY "Public read article images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'articles');

CREATE POLICY "Anon upload article images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'articles');

CREATE POLICY "Anon delete article images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'articles');

--12th--
-- Allow users to update their own orders (specifically to cancel them)
-- This policy allows users to update the status of their own orders to 'Cancelled'

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create a new policy that allows users to update their own orders
-- Specifically allowing status updates to 'Cancelled'
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updating to Cancelled status
    status = 'Cancelled'
    -- Or keep the same status (for other updates if needed)
    OR status = (SELECT status FROM public.orders WHERE id = orders.id)
  )
);

-- Also ensure users can read their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

--13th--
-- Create a function to allow users to delete their own account
-- This function runs with 'security definer' privileges to allow deleting from auth.users

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Check for Active Orders
  -- Active statuses: Pending, Confirmed, Processing, Shipped, Out for Delivery
  -- Inactive: Delivered, Cancelled, Returned
  if exists (
    select 1 from public.orders
    where user_id = current_user_id
    and status not in ('Delivered', 'Cancelled', 'Returned')
  ) then
    raise exception 'Action Failed: You have active orders. Please cancel or complete them before deleting your account.';
  end if;

  -- 2. Delete Profile and User Data
  -- We delete from profiles first. If foreign keys are set to CASCADE, this might auto-delete orders.
  -- If not, we manually delete to be clean.
  delete from public.notifications where user_id = current_user_id;
  delete from public.addresses where user_id = current_user_id;
  
  -- Delete orders and items if not cascading
  -- (Assuming cascade might handle it, but explicit is safer for a clean wipe)
  delete from public.order_items where order_id in (select id from public.orders where user_id = current_user_id);
  delete from public.orders where user_id = current_user_id;
  
  delete from public.profiles where id = current_user_id;

  -- 3. Delete from Auth Users (The actual account)
  delete from auth.users where id = current_user_id;
end;
$$;

--14th--
-- Update policies to allow anonymous (public) access for the Admin Panel
-- Since the Admin Panel currently doesn't have authentication, we need to allow 'anon' role to update these policies.

-- Drop the authenticated-only policy if it exists (to avoid confusion, though multiple policies are OR'ed)
drop policy if exists "Allow authenticated insert/update" on public.app_policies;

-- Create a new policy allowing ALL access to public (anon + authenticated)
create policy "Allow public full access"
on public.app_policies for all
to public
using (true)
with check (true);

--15th--
-- Create a table for app policies/legal pages
create table if not exists public.app_policies (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.app_policies enable row level security;

-- Create policies for public read visibility
create policy "Allow public read access"
on public.app_policies for select
to public
using (true);

-- Create policies for admin write access (authenticated users or specific role if you have roles)
-- For now, allowing all authenticated users to update/insert for simplicity, assuming only admins login to admin panel.
create policy "Allow authenticated insert/update"
on public.app_policies for all
to authenticated
using (true)
with check (true);

-- Insert initial rows
insert into public.app_policies (slug, title, content)
values
  ('terms-conditions', 'Terms & Conditions', '<h1>Terms and Conditions</h1><p>Welcome to Together with Farm. These are our terms...</p>'),
  ('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>'),
  ('privacy-security', 'Privacy & Security', '<h1>Privacy & Security</h1><p>We secure your data...</p>')
on conflict (slug) do nothing;


--16th--
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'alert', 'promo', 'order', 'success'
    target_type TEXT NOT NULL, -- 'Specific', 'All', 'AllUsers', 'AllVendors'
    target_id UUID, -- userId if Specific
    promo_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_target_id ON notifications(target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all read access for now to simplify (or refine based on auth)
-- Ideally:
-- Users can see where target_type='All' OR 'AllUsers' OR (target_type='Specific' AND target_id = auth.uid())
-- Vendors can see where target_type='All' OR 'AllVendors' OR (target_type='Specific' AND target_id = auth.uid())
-- Admins can see all.

-- For simplicity in this migration step (and since Admin uses anon key often in this codebase or service role not fully separated in frontend code being shown), 
-- we will allow SELECT for authenticated users.
-- We will refine filtering in the application logic or improved policies later if needed.

CREATE POLICY "Enable read access for all users" ON notifications
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON notifications
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON notifications
    FOR UPDATE
    USING (true);

CREATE POLICY "Enable delete for authenticated users" ON notifications
    FOR DELETE
    USING (true);


--17th--
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_phone text;

--18th--
create table tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  subject text not null,
  status text default 'Open' check (status in ('Open', 'Closed', 'Pending')),
  messages jsonb default '[]'::jsonb, -- Stores chat history efficiently
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (Security)
alter table tickets enable row level security;

-- Policies
create policy "Users can view own tickets" on tickets for select using (auth.uid() = user_id);
create policy "Users can insert own tickets" on tickets for insert with check (auth.uid() = user_id);
create policy "Users can update own tickets" on tickets for update using (auth.uid() = user_id);
create policy "Admins can view all tickets" on tickets for select using (true); -- Adjust if you have admin roles
create policy "Admins can update all tickets" on tickets for update using (true); 

--19th--
-- ============================================================================
-- FIX: Ensure Storage Bucket Exists and is Configured Correctly
-- ============================================================================

-- 1. Check if bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';

-- 2. If the above returns 0 rows, create the bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Ensure bucket is public (if it exists but not public)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- 4. Drop and recreate storage policies (to fix any permission issues)
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- Create fresh policies
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Upload to Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
USING (auth.uid() = owner AND bucket_id = 'product-images');

-- 5. Reload schema cache
NOTIFY pgrst, 'reload config';

-- 6. Verify everything is set up
SELECT 
    'Bucket Check' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Bucket exists and is public'
        ELSE '❌ Bucket missing'
    END as result
FROM storage.buckets
WHERE id = 'product-images' AND public = true;

SELECT 
    'Policies Check' as test,
    COUNT(*)::text || ' policies exist (should be 4)' as result
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%';

--20th--
-- ============================================================================
-- IMAGE DIAGNOSTIC - Run this to check image data
-- ============================================================================

-- 1. Check the most recent product's image data
SELECT 
    '=== MOST RECENT PRODUCT IMAGE DATA ===' as section,
    id,
    name,
    category,
    images,
    image_url,
    jsonb_typeof(images) as images_type,
    CASE 
        WHEN jsonb_typeof(images) = 'array' THEN jsonb_array_length(images)
        ELSE NULL
    END as images_count,
    CASE 
        WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) > 0 THEN images->>0
        ELSE NULL
    END as first_image_url
FROM products
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check if product-images bucket is public
SELECT 
    '=== STORAGE BUCKET STATUS ===' as section,
    id,
    name,
    public,
    CASE 
        WHEN public = true THEN '✅ Public (images will load)'
        ELSE '❌ NOT Public (images will NOT load)'
    END as status
FROM storage.buckets
WHERE id = 'product-images';

-- 3. Check if any images exist in storage
SELECT 
    '=== IMAGES IN STORAGE ===' as section,
    COUNT(*) as total_images,
    MAX(created_at) as most_recent_upload
FROM storage.objects
WHERE bucket_id = 'product-images';

-- 4. List recent uploaded images
SELECT 
    '=== RECENT UPLOADS ===' as section,
    name as file_name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'product-images'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check all products with their image status
SELECT 
    '=== ALL PRODUCTS IMAGE STATUS ===' as section,
    name,
    category,
    CASE 
        WHEN images IS NULL THEN '❌ NULL'
        WHEN jsonb_typeof(images) != 'array' THEN '❌ Not an array'
        WHEN jsonb_array_length(images) = 0 THEN '⚠️  Empty array'
        ELSE '✅ Has ' || jsonb_array_length(images)::text || ' images'
    END as image_status,
    images->>0 as first_image_preview
FROM products
ORDER BY created_at DESC;


--21th--
-- CRITICAL: Run this to verify migration was applied correctly
-- If ANY of these return 0 rows, the migration FAILED

-- 1. Check images column exists
SELECT 
    'IMAGES COLUMN CHECK' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - images column exists'
        ELSE '❌ FAIL - images column MISSING'
    END as result
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'images';

-- 2. Check product-images bucket exists
SELECT 
    'STORAGE BUCKET CHECK' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - product-images bucket exists'
        ELSE '❌ FAIL - product-images bucket MISSING'
    END as result
FROM storage.buckets
WHERE id = 'product-images';

-- 3. Check storage policies exist
SELECT 
    'STORAGE POLICIES CHECK' as test,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ PASS - All 4 storage policies exist'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL - Only ' || COUNT(*) || ' policies exist (need 4)'
        ELSE '❌ FAIL - NO storage policies exist'
    END as result
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%';

-- 4. Show detailed column info
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('images', 'image_url', 'highlights', 'vendor_id', 'stock')
ORDER BY column_name;

-- 5. If migration failed, run this to fix it:
/*
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
NOTIFY pgrst, 'reload config';
*/


--22nd--
-- ============================================================================
-- COMPLETE DIAGNOSTIC - Run this to see EVERYTHING
-- ============================================================================

-- 1. Check if products exist at all
SELECT 
    '=== TOTAL PRODUCTS ===' as section,
    COUNT(*) as total_products 
FROM products;

-- 2. List ALL products (regardless of stock)
SELECT 
    '=== ALL PRODUCTS (FULL DETAILS) ===' as section,
    id,
    name,
    category,
    price,
    stock,
    vendor_id,
    CASE 
        WHEN images IS NULL THEN 'NULL'
        WHEN jsonb_typeof(images) = 'array' THEN 
            CASE 
                WHEN jsonb_array_length(images) = 0 THEN 'Empty Array []'
                ELSE jsonb_array_length(images)::text || ' images: ' || images::text
            END
        ELSE 'Invalid type: ' || jsonb_typeof(images)
    END as images_info,
    image_url,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC;

-- 3. Check products with stock > 0 (what user app sees)
SELECT 
    '=== PRODUCTS WITH STOCK > 0 (USER APP VIEW) ===' as section,
    id,
    name,
    category,
    stock,
    vendor_id
FROM products
WHERE stock > 0
ORDER BY created_at DESC;

-- 4. Check products with stock = 0 or NULL (hidden from user app)
SELECT 
    '=== PRODUCTS WITH STOCK = 0 OR NULL (HIDDEN) ===' as section,
    id,
    name,
    category,
    stock,
    vendor_id
FROM products
WHERE stock IS NULL OR stock <= 0
ORDER BY created_at DESC;

-- 5. Verify images column exists
SELECT 
    '=== IMAGES COLUMN CHECK ===' as section,
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
AND column_name IN ('images', 'image_url', 'highlights');

-- 6. Check storage bucket
SELECT 
    '=== STORAGE BUCKET ===' as section,
    id, 
    name, 
    public, 
    created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- 7. Check RLS policies on products table
SELECT 
    '=== PRODUCTS TABLE RLS POLICIES ===' as section,
    policyname,
    cmd,
    permissive,
    roles,
    qual::text as using_condition,
    with_check::text as with_check_condition
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'products'
ORDER BY cmd;

-- 8. Check storage policies
SELECT 
    '=== STORAGE POLICIES ===' as section,
    policyname,
    cmd,
    qual::text as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%'
ORDER BY cmd;

-- 9. Check the most recent product in detail
SELECT 
    '=== MOST RECENT PRODUCT (DETAILED) ===' as section,
    id,
    name,
    category,
    price,
    unit,
    stock,
    description,
    images,
    image_url,
    highlights,
    vendor_id,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC
LIMIT 1;

-- 10. Count products by category
SELECT 
    '=== PRODUCTS BY CATEGORY ===' as section,
    category,
    COUNT(*) as count,
    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock_count,
    SUM(CASE WHEN stock <= 0 OR stock IS NULL THEN 1 ELSE 0 END) as out_of_stock_count
FROM products
GROUP BY category
ORDER BY count DESC;

--23rd--
-- ============================================================================
-- VERIFICATION QUERIES - Run these to verify the migration was successful
-- ============================================================================

-- 1. Check if 'images' column exists in products table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'images';
-- Expected: Should return 1 row with data_type = 'jsonb' and default = '''[]''::jsonb'

-- 2. Check if 'product-images' bucket exists
SELECT id, name, public, created_at
FROM storage.buckets 
WHERE id = 'product-images';
-- Expected: Should return 1 row with public = true

-- 3. Check all storage policies for product-images
SELECT policyname, cmd, qual::text as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%'
ORDER BY cmd;
-- Expected: Should return 4 rows (SELECT, INSERT, UPDATE, DELETE)

-- 4. List ALL products to see if any exist
SELECT id, name, category, 
       CASE 
           WHEN images IS NULL THEN 'NULL'
           WHEN jsonb_array_length(images) = 0 THEN 'Empty Array'
           ELSE 'Has Images: ' || jsonb_array_length(images)::text
       END as images_status,
       image_url,
       created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
-- This will show you existing products and their image status

--24th--
-- ============================================================================
-- PRODUCT IMAGES MIGRATION - Run this in Supabase SQL Editor
-- ============================================================================
-- This script will:
-- 1. Add 'images' column to products table
-- 2. Create 'product-images' storage bucket
-- 3. Set up storage policies for image uploads
-- 4. Reload the schema cache
-- ============================================================================

-- Step 1: Add images column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Step 2: Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Set up storage policies

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- Create new policies
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Upload to Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
USING (auth.uid() = owner AND bucket_id = 'product-images');

-- Step 4: Reload schema cache (critical!)
NOTIFY pgrst, 'reload config';

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify the migration)
-- ============================================================================

-- Check if images column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'images';

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check storage policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%';


--25th--
-- Fix Missing Columns in Products Table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;

-- Force Schema Cache Reload (Important for PostgREST/Supabase API to recognize new columns)
NOTIFY pgrst, 'reload config';


-- 1. Create product-images Bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Allow Public Read Access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- 3. Allow Authenticated Uploads
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- 4. Allow Users to Update/Delete Own Images
create policy "Users can update own images"
on storage.objects for update
using ( auth.uid() = owner )
with check ( bucket_id = 'product-images' );

create policy "Users can delete own images"
on storage.objects for delete
using ( auth.uid() = owner and bucket_id = 'product-images' );

-- 5. Fix Missing Columns in Products Table (Just in case)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;

-- 6. Reload Schema Cache (Critical for API)
NOTIFY pgrst, 'reload config';

--26th--
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;

--27th--

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Users & Vendors)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  phone_number text,
  full_name text,
  email text,
  
  -- Vendor Specific Fields
  user_type text check (user_type in ('User', 'Vendor', 'Admin')) default 'User',
  business_name text,
  experience text,
  farm_size text,
  bio text,
  shop_status text default 'Active', -- 'Active', 'Inactive'
  
  -- Profile & Personal Info
  gender text,
  dob text,
  profile_image text,
  address text, 
  
  -- Structured Data
  bank_details jsonb, -- { account_holder_name, bank_name, account_number, ifsc_code }
  addresses jsonb default '[]'::jsonb, -- Array of address objects from AddressContext
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- Trigger to create profile on Signup (Optional but recommended)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, phone_number, full_name, user_type)
  values (new.id, new.phone, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'user_type', 'User'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 2. PRODUCTS TABLE (Vendor Inventory)
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.profiles(id) on delete cascade not null,
  
  name text not null,
  image_url text, -- Store the storage URL here
  price numeric not null default 0,
  unit text, -- e.g., 'kg', 'piece'
  stock numeric default 0,
  category text,
  description text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies
create policy "Products are viewable by everyone" 
  on products for select using (true);

create policy "Vendors can insert their own products" 
  on products for insert with check (auth.uid() = vendor_id);

create policy "Vendors can update their own products" 
  on products for update using (auth.uid() = vendor_id);

create policy "Vendors can delete their own products" 
  on products for delete using (auth.uid() = vendor_id);


-- -----------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- -----------------------------------------------------------------------------
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  
  user_id uuid references public.profiles(id) not null, -- Customer
  vendor_id uuid references public.profiles(id) not null, -- Vendor
  
  items jsonb not null default '[]'::jsonb, -- Array of ordered items with qty, price
  total_amount numeric not null default 0,
  shipping_fee numeric default 0,
  
  status text default 'Pending', -- 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  
  -- Payment & Delivery Details
  payment_status text default 'Pending', -- 'Paid', 'COD', 'Pending'
  payment_method text, -- 'UPI', 'COD', etc.
  customer_phone text,
  delivery_address text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies
create policy "Users can see their own orders" 
  on orders for select using (auth.uid() = user_id);

create policy "Vendors can see orders assigned to them" 
  on orders for select using (auth.uid() = vendor_id);

create policy "Users can create orders" 
  on orders for insert with check (auth.uid() = user_id);

create policy "Vendors can update status of their orders" 
  on orders for update using (auth.uid() = vendor_id);


-- -----------------------------------------------------------------------------
-- 4. STORAGE BUCKETS (If you use Storage for Images)
-- -----------------------------------------------------------------------------
-- You will need to create a bucket named 'images' in the Supabase Dashboard -> Storage
-- Policy below allows public read and authenticated upload

-- insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- create policy "Images are publicly accessible"
--   on storage.objects for select using ( bucket_id = 'images' );

-- create policy "Anyone can upload images"
--   on storage.objects for insert with check ( bucket_id = 'images' AND auth.role() = 'authenticated' );


-------------end--------
--------------end---------
----------------end---------
------------------end---------
