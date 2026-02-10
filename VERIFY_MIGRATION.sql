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
