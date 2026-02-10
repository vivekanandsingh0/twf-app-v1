-- Check if Dairy product exists at all
SELECT 
    id,
    name,
    category,
    stock,
    price,
    images,
    vendor_id,
    created_at
FROM products
WHERE category = 'Dairy'
ORDER BY created_at DESC;

-- Check ALL products to see what's actually there
SELECT 
    id,
    name,
    category,
    stock,
    price,
    vendor_id,
    created_at
FROM products
ORDER BY created_at DESC;

-- Check if images column exists NOW (after migration)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'images';
