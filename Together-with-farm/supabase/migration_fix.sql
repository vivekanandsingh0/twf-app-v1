
-- ==========================================
-- UPDATE SCRIPT TO FIX RELATIONSHIPS
-- ==========================================

-- 1. Update ORDERS Table
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE public.orders ADD COLUMN payment_method TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_fee') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_fee NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT CHECK (payment_status IN ('Paid', 'COD')) DEFAULT 'COD';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'vendor_id') THEN
        ALTER TABLE public.orders ADD COLUMN vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Update PRODUCTS Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'vendor_id') THEN
        ALTER TABLE public.products ADD COLUMN vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Reload Schema Cache (Important for PostgREST to see new columns/FKs)
NOTIFY pgrst, 'reload schema';
