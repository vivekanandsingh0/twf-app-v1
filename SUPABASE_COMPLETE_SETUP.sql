-- ============================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR TWF APP
-- ============================================================================
-- This file consolidates all SQL scripts for setting up the Supabase database
-- Run this in your Supabase SQL Editor to set up everything from scratch
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: CORE SCHEMA - TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1.1 PROFILES TABLE (Users & Vendors)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  
  -- Vendor Specific Fields
  user_type TEXT CHECK (user_type IN ('User', 'Vendor', 'Admin')) DEFAULT 'User',
  business_name TEXT,
  experience TEXT,
  farm_size TEXT,
  bio TEXT,
  shop_status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
  
  -- Profile & Personal Info
  gender TEXT DEFAULT 'Male',
  dob TEXT,
  profile_image TEXT,
  avatar_url TEXT,
  address TEXT, 
  
  -- Structured Data
  bank_details JSONB, -- { account_holder_name, bank_name, account_number, ifsc_code }
  addresses JSONB DEFAULT '[]'::jsonb, -- Array of address objects from AddressContext
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on Signup (Optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, user_type)
  VALUES (new.id, new.phone, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'user_type', 'User'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 1.2 ADDRESSES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.addresses CASCADE;

CREATE TABLE public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT, -- 'Home', 'Office', etc.
  address TEXT NOT NULL,
  city TEXT,
  pincode TEXT,
  landmark TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own addresses." ON public.addresses;
CREATE POLICY "Users can view their own addresses."
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses." ON public.addresses;
CREATE POLICY "Users can insert their own addresses."
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses." ON public.addresses;
CREATE POLICY "Users can update their own addresses."
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses." ON public.addresses;
CREATE POLICY "Users can delete their own addresses."
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 1.3 FARMERS / VENDORS TABLE (Spotlight)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  tag TEXT, -- 'FEATURED VENDOR', etc.
  rating NUMERIC DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers are viewable by everyone." ON public.farmers;
CREATE POLICY "Farmers are viewable by everyone."
  ON public.farmers FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 1.4 PRODUCTS TABLE (Vendor Inventory)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'Roots', 'Leafy', 'Hydroponic', 'Dairy', 'Seafood', etc.
  
  -- Pricing & Stock
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT, -- e.g., 'kg', 'piece', '/kg', '/bunch'
  stock NUMERIC DEFAULT 0,
  discount TEXT, -- '-40%'
  special_offer TEXT, -- 'Limited Time Deal'
  
  -- Images (supports multiple images)
  image_url TEXT, -- Deprecated, use images array instead
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  
  -- Additional Details
  highlights JSONB DEFAULT '[]'::jsonb, -- Array of {title, value} objects
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can insert their own products" ON public.products;
CREATE POLICY "Vendors can insert their own products" 
  ON products FOR INSERT WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
CREATE POLICY "Vendors can update their own products" 
  ON products FOR UPDATE USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;
CREATE POLICY "Vendors can delete their own products" 
  ON products FOR DELETE USING (auth.uid() = vendor_id);

-- -----------------------------------------------------------------------------
-- 1.5 ORDERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL, -- Customer
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Vendor
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ordered items with qty, price
  total_amount NUMERIC NOT NULL DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  
  status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
  
  -- Payment & Delivery Details
  payment_status TEXT CHECK (payment_status IN ('Paid', 'COD', 'Pending')) DEFAULT 'Pending',
  payment_method TEXT, -- 'UPI', 'COD', etc.
  customer_phone TEXT,
  delivery_address TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
CREATE POLICY "Users can see their own orders" 
  ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can see orders assigned to them" ON public.orders;
CREATE POLICY "Vendors can see orders assigned to them" 
  ON orders FOR SELECT USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can update status of their orders" ON public.orders;
CREATE POLICY "Vendors can update status of their orders" 
  ON orders FOR UPDATE USING (auth.uid() = vendor_id);

-- -----------------------------------------------------------------------------
-- 1.6 ORDER ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
CREATE POLICY "Users can view their own order items."
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own order items." ON public.order_items;
CREATE POLICY "Users can insert their own order items."
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 1.7 VENDOR PROFILE REQUESTS TABLE (For Approval Workflow)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_profile_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE public.vendor_profile_requests ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own requests
DROP POLICY IF EXISTS "Vendors can view their own requests" ON public.vendor_profile_requests;
CREATE POLICY "Vendors can view their own requests"
  ON public.vendor_profile_requests FOR SELECT
  USING (auth.uid() = vendor_id);

-- Vendors can insert their own requests
DROP POLICY IF EXISTS "Vendors can insert their own requests" ON public.vendor_profile_requests;
CREATE POLICY "Vendors can insert their own requests"
  ON public.vendor_profile_requests FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

-- Admins can view all requests
DROP POLICY IF EXISTS "Admins can view all requests" ON public.vendor_profile_requests;
CREATE POLICY "Admins can view all requests"
  ON public.vendor_profile_requests FOR SELECT
  USING (true);
  
-- Admins can update requests
DROP POLICY IF EXISTS "Admins can update requests" ON public.vendor_profile_requests;
CREATE POLICY "Admins can update requests"
  ON public.vendor_profile_requests FOR UPDATE
  USING (true);

-- ============================================================================
-- SECTION 2: STORAGE SETUP
-- ============================================================================

-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Create storage policies
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

-- ============================================================================
-- SECTION 3: RELOAD SCHEMA CACHE
-- ============================================================================
-- Critical for PostgREST/Supabase API to recognize all changes
NOTIFY pgrst, 'reload config';

-- ============================================================================
-- SECTION 4: VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify everything is set up correctly

-- 4.1 Check if images column exists in products table
SELECT 
    'IMAGES COLUMN CHECK' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - images column exists'
        ELSE '❌ FAIL - images column MISSING'
    END as result
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'images';

-- 4.2 Check if highlights column exists in products table
SELECT 
    'HIGHLIGHTS COLUMN CHECK' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - highlights column exists'
        ELSE '❌ FAIL - highlights column MISSING'
    END as result
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'highlights';

-- 4.3 Check product-images bucket exists
SELECT 
    'STORAGE BUCKET CHECK' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - product-images bucket exists and is public'
        ELSE '❌ FAIL - product-images bucket MISSING or not public'
    END as result
FROM storage.buckets
WHERE id = 'product-images' AND public = true;

-- 4.4 Check storage policies exist
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

-- 4.5 Show detailed column info for products table
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('images', 'image_url', 'highlights', 'vendor_id', 'stock', 'category', 'price')
ORDER BY column_name;

-- 4.6 Check RLS policies on products table
SELECT 
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

-- 4.7 Count all tables
SELECT 
    'TABLES COUNT' as test,
    COUNT(*) || ' tables created' as result
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- ============================================================================
-- SECTION 5: DIAGNOSTIC QUERIES (Optional - for troubleshooting)
-- ============================================================================

-- 5.1 Check if ANY products exist in the database
-- SELECT COUNT(*) as total_products FROM products;

-- 5.2 List ALL products with full details
-- SELECT 
--     id,
--     vendor_id,
--     name,
--     category,
--     price,
--     unit,
--     stock,
--     description,
--     CASE 
--         WHEN images IS NULL THEN 'NULL'
--         WHEN jsonb_array_length(images) = 0 THEN 'Empty Array []'
--         ELSE jsonb_array_length(images)::text || ' images'
--     END as images_status,
--     image_url,
--     highlights,
--     created_at,
--     updated_at
-- FROM products
-- ORDER BY created_at DESC;

-- 5.3 Check what's in the images column for products
-- SELECT 
--     id,
--     name,
--     category,
--     images,
--     image_url,
--     CASE 
--         WHEN images IS NULL THEN 'NULL'
--         WHEN jsonb_typeof(images) = 'array' THEN 
--             CASE 
--                 WHEN jsonb_array_length(images) = 0 THEN 'Empty Array'
--                 ELSE 'Has ' || jsonb_array_length(images)::text || ' images'
--             END
--         ELSE 'Invalid type'
--     END as images_status,
--     created_at
-- FROM products
-- ORDER BY created_at DESC
-- LIMIT 5;

-- 5.4 Check if images are actually uploaded to storage
-- SELECT 
--     name,
--     id,
--     bucket_id,
--     created_at
-- FROM storage.objects
-- WHERE bucket_id = 'product-images'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- 5.5 Check DELETE policy on products
-- SELECT 
--     policyname,
--     cmd,
--     permissive,
--     roles,
--     qual::text as using_condition
-- FROM pg_policies
-- WHERE schemaname = 'public' 
-- AND tablename = 'products'
-- AND cmd = 'DELETE';

-- 5.6 Check current user ID (for debugging permissions)
-- SELECT auth.uid() as current_user_id;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
-- If all verification queries show ✅ PASS, your database is ready!
-- ============================================================================
