-- Functions for Admin Panel to securely retrieve aggregated data across RLS

CREATE OR REPLACE FUNCTION get_admin_vendor_ratings()
RETURNS TABLE (
    vendor_id UUID,
    rating NUMERIC
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.vendor_id,
        ROUND(AVG(r.product_rating)::numeric, 1) as rating
    FROM 
        public.order_reviews r
    INNER JOIN 
        public.orders o ON r.order_id = o.id
    GROUP BY 
        o.vendor_id;
END;
$$;

-- Grant access to authenticated and anon users since admin UI uses anon key for now
GRANT EXECUTE ON FUNCTION get_admin_vendor_ratings() TO public;
GRANT EXECUTE ON FUNCTION get_admin_vendor_ratings() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_vendor_ratings() TO authenticated;
