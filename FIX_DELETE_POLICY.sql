-- Check DELETE policies on products table
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual::text as using_condition,
    with_check::text as with_check_condition
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'products'
AND cmd = 'DELETE'
ORDER BY policyname;

-- If no DELETE policy exists, create one:
-- DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;

CREATE POLICY "Vendors can delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = vendor_id);

-- Reload schema
NOTIFY pgrst, 'reload config';

-- Verify the policy was created
SELECT 
    policyname,
    cmd,
    qual::text as using_condition
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'products'
AND cmd = 'DELETE';
