
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
  image_url text, -- Store the storage URL here (deprecated, use images array)
  images jsonb default '[]'::jsonb, -- Array of image URLs
  price numeric not null default 0,
  unit text, -- e.g., 'kg', 'piece'
  stock numeric default 0,
  category text,
  description text,
  highlights jsonb default '[]'::jsonb, -- Array of {title, value} objects
  
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

