-- Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view active categories" 
ON public.categories FOR SELECT USING (true);

-- Allow public update access (for admin usage)
CREATE POLICY "Anon can manage categories" 
ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for category images
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete category images" ON storage.objects;

CREATE POLICY "Public read category images" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Anon upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');
CREATE POLICY "Anon delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'categories');
CREATE POLICY "Anon update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'categories');

-- Insert default categories manually to prevent blank apps
INSERT INTO public.categories (name, image_url, display_order)
VALUES 
    ('Vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2568&auto=format&fit=crop', 1),
    ('Fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop', 2),
    ('Meats', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=2670&auto=format&fit=crop', 3),
    ('Seafood', 'https://images.unsplash.com/photo-1615141982880-19ed7e6642f3?q=80&w=2564&auto=format&fit=crop', 4),
    ('Dairy & Eggs', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=2574&auto=format&fit=crop', 5),
    ('Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2672&auto=format&fit=crop', 6)
ON CONFLICT (name) DO NOTHING;
