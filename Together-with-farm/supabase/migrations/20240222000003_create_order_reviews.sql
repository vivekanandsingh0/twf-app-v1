CREATE TABLE IF NOT EXISTS public.order_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_rating INTEGER NOT NULL CHECK (product_rating BETWEEN 1 AND 5),
    driver_rating INTEGER NOT NULL CHECK (driver_rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.order_reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.order_reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update own reviews" ON public.order_reviews
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete own reviews" ON public.order_reviews
    FOR DELETE USING (true);
