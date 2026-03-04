-- Coupons system table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2), -- Maximum absolute discount for percentage types
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    usage_limit INTEGER, -- Total times this coupon can be used across all users
    usage_limit_per_user INTEGER DEFAULT 1, -- Times a single user can use it
    specific_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, -- specific product constraint
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track coupon usages
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT now()
);

-- Add coupon details to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10, 2) DEFAULT 0;

-- RLS Policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons
FOR SELECT USING (is_active = true);

-- Users can view their own overage usage
CREATE POLICY "Users can view their own coupon usages" ON public.coupon_usages
FOR SELECT USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage coupons" ON public.coupons USING (true);
CREATE POLICY "Admins can manage coupon usages" ON public.coupon_usages USING (true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
