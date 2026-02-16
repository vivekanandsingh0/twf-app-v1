-- ============================================================================
-- SUPABASE COMPLETE SETUP FOR TOGETHER WITH FARM
-- ============================================================================
-- This file contains all necessary SQL queries to set up the backend database.
-- Run these commands in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Enable Essentials
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- 2. Create Enum Types for Statuses
-- ----------------------------------------------------------------------------
create type user_role as enum ('User', 'Vendor', 'Admin');
create type order_status as enum ('Pending', 'Confirmed', 'Preparing', 'Ready', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled');
create type ticket_status as enum ('Open', 'Pending', 'Resolved', 'Closed');

-- 3. USERS & PROFILES
-- ----------------------------------------------------------------------------
-- Create a public profiles table that links to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  phone_number text unique,
  full_name text,
  user_type user_role default 'User',
  avatar_url text,
  bio text,
  farm_details jsonb, -- For vendors (farm size, experience, etc.)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

-- 4. PRODUCTS & INVENTORY
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  category text not null, -- e.g., 'Vegetables', 'Fruits', 'Grains'
  price numeric not null check (price >= 0),
  unit text default 'kg', -- e.g., 'kg', 'piece', 'bundle'
  stock_quantity numeric default 0 check (stock_quantity >= 0),
  images text[], -- Array of image URLs
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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


-- 5. ORDERS & TRANSACTIONS
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null, -- The buyer
  vendor_id uuid references public.profiles(id) not null, -- The seller
  items jsonb not null, -- Array of items: [{ product_id, title, quantity, price }]
  total_amount numeric not null check (total_amount >= 0),
  status order_status default 'Pending',
  delivery_address text not null,
  payment_method text default 'COD', -- 'COD', 'Online'
  payment_status text default 'Pending', -- 'Pending', 'Paid', 'Failed'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies
create policy "Users can view their own orders" 
  on orders for select using (auth.uid() = user_id);

create policy "Vendors can view orders assigned to them" 
  on orders for select using (auth.uid() = vendor_id);

create policy "Users can create orders" 
  on orders for insert with check (auth.uid() = user_id);

create policy "Vendors can update order status" 
  on orders for update using (auth.uid() = vendor_id);


-- 6. SUPPORT TICKETS (For User-Admin Communication)
-- ----------------------------------------------------------------------------
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  subject text not null,
  status ticket_status default 'Open',
  -- Store chat history as JSONB array: 
  -- [{ "sender": "user"|"admin", "message": "text", "timestamp": "ISOstring" }]
  messages jsonb default '[]'::jsonb, 
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.tickets enable row level security;

-- Policies
create policy "Users can view their own tickets"
  on tickets for select using (auth.uid() = user_id);

create policy "Users can create tickets"
  on tickets for insert with check (auth.uid() = user_id);

create policy "Users can update their own tickets (add messages)"
  on tickets for update using (auth.uid() = user_id);

-- Note: Admins need a separate policy or service role access to view all tickets.
-- For standard setup, we can allow anyone with 'Admin' role in access_control (if implemented)
-- Or imply Service Role usage for the Admin Panel.

-- 7. STORAGE BUCKETS (For Images)
-- ----------------------------------------------------------------------------
-- Run this in the Storage section, but here is the logic:
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies (Allow public read, auth write)
create policy "Public Access" 
  on storage.objects for select using ( bucket_id in ('product-images', 'avatars') );

create policy "Auth Upload" 
  on storage.objects for insert with check ( auth.role() = 'authenticated' );

create policy "Owner Delete" 
  on storage.objects for delete using ( auth.uid() = owner );


-- ============================================================================
-- END OF SETUP
-- ============================================================================
