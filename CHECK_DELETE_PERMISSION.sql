-- Check the DELETE policy details
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual::text as using_condition
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'products'
AND cmd = 'DELETE';

-- Check if the current user can delete
-- First, let's see what the current auth.uid() is
SELECT auth.uid() as current_user_id;

-- Check a specific product's vendor_id
SELECT 
    id,
    name,
    vendor_id,
    auth.uid() as current_user_id,
    CASE 
        WHEN vendor_id = auth.uid() THEN '✅ Can delete (vendor_id matches)'
        ELSE '❌ Cannot delete (vendor_id does not match)'
    END as can_delete
FROM products
ORDER BY created_at DESC
LIMIT 5;
