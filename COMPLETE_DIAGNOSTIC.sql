-- ============================================================================
-- COMPLETE DIAGNOSTIC - Run this to see EVERYTHING
-- ============================================================================

-- 1. Check if products exist at all
SELECT 
    '=== TOTAL PRODUCTS ===' as section,
    COUNT(*) as total_products 
FROM products;

-- 2. List ALL products (regardless of stock)
SELECT 
    '=== ALL PRODUCTS (FULL DETAILS) ===' as section,
    id,
    name,
    category,
    price,
    stock,
    vendor_id,
    CASE 
        WHEN images IS NULL THEN 'NULL'
        WHEN jsonb_typeof(images) = 'array' THEN 
            CASE 
                WHEN jsonb_array_length(images) = 0 THEN 'Empty Array []'
                ELSE jsonb_array_length(images)::text || ' images: ' || images::text
            END
        ELSE 'Invalid type: ' || jsonb_typeof(images)
    END as images_info,
    image_url,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC;

-- 3. Check products with stock > 0 (what user app sees)
SELECT 
    '=== PRODUCTS WITH STOCK > 0 (USER APP VIEW) ===' as section,
    id,
    name,
    category,
    stock,
    vendor_id
FROM products
WHERE stock > 0
ORDER BY created_at DESC;

-- 4. Check products with stock = 0 or NULL (hidden from user app)
SELECT 
    '=== PRODUCTS WITH STOCK = 0 OR NULL (HIDDEN) ===' as section,
    id,
    name,
    category,
    stock,
    vendor_id
FROM products
WHERE stock IS NULL OR stock <= 0
ORDER BY created_at DESC;

-- 5. Verify images column exists
SELECT 
    '=== IMAGES COLUMN CHECK ===' as section,
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
AND column_name IN ('images', 'image_url', 'highlights');

-- 6. Check storage bucket
SELECT 
    '=== STORAGE BUCKET ===' as section,
    id, 
    name, 
    public, 
    created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- 7. Check RLS policies on products table
SELECT 
    '=== PRODUCTS TABLE RLS POLICIES ===' as section,
    policyname,
    cmd,
    permissive,
    roles,
    qual::text as using_condition,
    with_check::text as with_check_condition
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'products'
ORDER BY cmd;

-- 8. Check storage policies
SELECT 
    '=== STORAGE POLICIES ===' as section,
    policyname,
    cmd,
    qual::text as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%Product Images%'
ORDER BY cmd;

-- 9. Check the most recent product in detail
SELECT 
    '=== MOST RECENT PRODUCT (DETAILED) ===' as section,
    id,
    name,
    category,
    price,
    unit,
    stock,
    description,
    images,
    image_url,
    highlights,
    vendor_id,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC
LIMIT 1;

-- 10. Count products by category
SELECT 
    '=== PRODUCTS BY CATEGORY ===' as section,
    category,
    COUNT(*) as count,
    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock_count,
    SUM(CASE WHEN stock <= 0 OR stock IS NULL THEN 1 ELSE 0 END) as out_of_stock_count
FROM products
GROUP BY category
ORDER BY count DESC;
