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
