CREATE TABLE IF NOT EXISTS public.market_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_section_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES public.market_sections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, product_id)
);

ALTER TABLE public.market_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_section_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active market sections" ON public.market_sections FOR SELECT USING (true);
CREATE POLICY "Anon can insert market sections" ON public.market_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can update market sections" ON public.market_sections FOR UPDATE USING (true);
CREATE POLICY "Anon can delete market sections" ON public.market_sections FOR DELETE USING (true);

CREATE POLICY "Anyone can view section products" ON public.market_section_products FOR SELECT USING (true);
CREATE POLICY "Anon can insert section products" ON public.market_section_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can delete section products" ON public.market_section_products FOR DELETE USING (true);
