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
