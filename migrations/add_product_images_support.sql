-- Migration: Add Product Images Support
-- This migration adds support for multiple product images and sets up storage

-- 1. Add images column to products table (if not exists)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- 2. Create product-images storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for product-images bucket

-- Allow public read access to product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access to Product Images'
  ) THEN
    CREATE POLICY "Public Access to Product Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to upload product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated Upload to Product Images'
  ) THEN
    CREATE POLICY "Authenticated Upload to Product Images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Allow users to update their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own product images'
  ) THEN
    CREATE POLICY "Users can update own product images"
    ON storage.objects FOR UPDATE
    USING (auth.uid() = owner)
    WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow users to delete their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own product images'
  ) THEN
    CREATE POLICY "Users can delete own product images"
    ON storage.objects FOR DELETE
    USING (auth.uid() = owner AND bucket_id = 'product-images');
  END IF;
END $$;

-- 4. Reload schema cache (critical for API to recognize changes)
NOTIFY pgrst, 'reload config';
