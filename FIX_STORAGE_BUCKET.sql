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
