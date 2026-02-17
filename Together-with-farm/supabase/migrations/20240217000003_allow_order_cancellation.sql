-- Allow users to update their own orders (specifically to cancel them)
-- This policy allows users to update the status of their own orders to 'Cancelled'

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create a new policy that allows users to update their own orders
-- Specifically allowing status updates to 'Cancelled'
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updating to Cancelled status
    status = 'Cancelled'
    -- Or keep the same status (for other updates if needed)
    OR status = (SELECT status FROM public.orders WHERE id = orders.id)
  )
);

-- Also ensure users can read their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);
