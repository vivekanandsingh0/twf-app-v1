-- Check what's in the images column for the products
SELECT 
    id,
    name,
    category,
    images,
    image_url,
    CASE 
        WHEN images IS NULL THEN 'NULL'
        WHEN jsonb_typeof(images) = 'array' THEN 
            CASE 
                WHEN jsonb_array_length(images) = 0 THEN 'Empty Array'
                ELSE 'Has ' || jsonb_array_length(images)::text || ' images'
            END
        ELSE 'Invalid type'
    END as images_status,
    created_at
FROM products
ORDER BY created_at DESC
LIMIT 5;

-- Check if images are actually uploaded to storage
SELECT 
    name,
    id,
    bucket_id,
    created_at
FROM storage.objects
WHERE bucket_id = 'product-images'
ORDER BY created_at DESC
LIMIT 10;
