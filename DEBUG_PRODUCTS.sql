-- ============================================================================
-- DEBUG: Check if products are actually being saved to the database
-- ============================================================================

-- 1. Check if ANY products exist in the database
SELECT COUNT(*) as total_products FROM products;

-- 2. List ALL products with full details
SELECT 
    id,
    vendor_id,
    name,
    category,
    price,
    unit,
    stock,
    description,
    CASE 
        WHEN images IS NULL THEN 'NULL'
        WHEN jsonb_array_length(images) = 0 THEN 'Empty Array []'
        ELSE jsonb_array_length(images)::text || ' images'
    END as images_status,
    image_url,
    highlights,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC;

-- 3. Check the most recent product (the one you just added)
SELECT 
    id,
    name,
    category,
    price,
    stock,
    images,
    image_url,
    vendor_id,
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 1;

-- 4. Check if the images column exists and has correct type
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
AND column_name IN ('images', 'image_url', 'highlights');

-- 5. Check RLS policies on products table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text as using_expression,
    with_check::text as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'products';

-- 6. Test if products are visible without RLS (as superuser)
-- This will show if RLS is blocking access
SET ROLE postgres;
SELECT id, name, category, vendor_id FROM products LIMIT 5;
RESET ROLE;
