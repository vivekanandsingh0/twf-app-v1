-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT UNIQUE,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('User', 'Vendor')) DEFAULT 'User',
  gender TEXT DEFAULT 'Male',
  dob TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- ADDRESSES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT, -- 'Home', 'Office', etc.
  address TEXT NOT NULL,
  city TEXT,
  zip_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses."
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses."
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses."
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders."
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

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

CREATE POLICY "Users can view their own order items."
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own order items."
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
