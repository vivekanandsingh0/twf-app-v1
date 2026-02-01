-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT UNIQUE,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('User', 'Vendor')) DEFAULT 'User',
  gender TEXT DEFAULT 'Male',
  dob TEXT,
  avatar_url TEXT,
  experience TEXT,
  farm_size TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- ADDRESSES
-- ==========================================
-- Drop table if exists to ensure schema update
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

-- ==========================================
-- FARMERS / VENDORS (Spotlight)
-- ==========================================
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

-- ==========================================
-- PRODUCTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'Roots', 'Leafy', 'Hydroponic'
  price NUMERIC NOT NULL,
  unit TEXT, -- '/kg', '/bunch'
  discount TEXT, -- '-40%'
  special_offer TEXT, -- 'Limited Time Deal'
  image_url TEXT,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING (true);

-- ==========================================
-- ORDERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
  total_amount NUMERIC DEFAULT 0,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  customer_phone TEXT,
  payment_method TEXT,
  shipping_fee NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('Paid', 'COD')) DEFAULT 'COD',
  delivery_address TEXT,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
CREATE POLICY "Users can view their own orders."
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
CREATE POLICY "Users can insert their own orders."
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- ORDER ITEMS
-- ==========================================
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

-- ==========================================
-- VENDOR PROFILE REQUESTS (For Approval Workflow)
-- ==========================================
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

-- Admins (Assuming allow all for now or check user role in real app)
DROP POLICY IF EXISTS "Admins can view all requests" ON public.vendor_profile_requests;
CREATE POLICY "Admins can view all requests"
  ON public.vendor_profile_requests FOR SELECT
  USING (true);
  
DROP POLICY IF EXISTS "Admins can update requests" ON public.vendor_profile_requests;
CREATE POLICY "Admins can update requests"
  ON public.vendor_profile_requests FOR UPDATE
  USING (true);


-- ==========================================
-- MIGRATION / UPDATES FOR EXISTING TABLES
-- Run this entire file to update your database schema
-- ==========================================

-- Ensure 'profiles' table has the new Vendor fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS farm_size TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Ensure 'farmers' and 'products' exist (already covered by CREATE IF NOT EXISTS above)
-- Ensure 'vendor_profile_requests' exists (already covered above)
