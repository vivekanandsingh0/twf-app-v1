-- ============================================================================
-- IMAGE DIAGNOSTIC - Run this to check image data
-- ============================================================================

-- 1. Check the most recent product's image data
SELECT 
    '=== MOST RECENT PRODUCT IMAGE DATA ===' as section,
    id,
    name,
    category,
    images,
    image_url,
    jsonb_typeof(images) as images_type,
    CASE 
        WHEN jsonb_typeof(images) = 'array' THEN jsonb_array_length(images)
        ELSE NULL
    END as images_count,
    CASE 
        WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) > 0 THEN images->>0
        ELSE NULL
    END as first_image_url
FROM products
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check if product-images bucket is public
SELECT 
    '=== STORAGE BUCKET STATUS ===' as section,
    id,
    name,
    public,
    CASE 
        WHEN public = true THEN '✅ Public (images will load)'
        ELSE '❌ NOT Public (images will NOT load)'
    END as status
FROM storage.buckets
WHERE id = 'product-images';

-- 3. Check if any images exist in storage
SELECT 
    '=== IMAGES IN STORAGE ===' as section,
    COUNT(*) as total_images,
    MAX(created_at) as most_recent_upload
FROM storage.objects
WHERE bucket_id = 'product-images';

-- 4. List recent uploaded images
SELECT 
    '=== RECENT UPLOADS ===' as section,
    name as file_name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'product-images'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check all products with their image status
SELECT 
    '=== ALL PRODUCTS IMAGE STATUS ===' as section,
    name,
    category,
    CASE 
        WHEN images IS NULL THEN '❌ NULL'
        WHEN jsonb_typeof(images) != 'array' THEN '❌ Not an array'
        WHEN jsonb_array_length(images) = 0 THEN '⚠️  Empty array'
        ELSE '✅ Has ' || jsonb_array_length(images)::text || ' images'
    END as image_status,
    images->>0 as first_image_preview
FROM products
ORDER BY created_at DESC;
