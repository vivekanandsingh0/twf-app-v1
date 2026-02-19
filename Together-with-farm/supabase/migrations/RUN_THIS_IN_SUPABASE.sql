    -- ============================================================
    -- COMPLETE SETUP: Run this entire file in Supabase SQL Editor
    -- ============================================================

    -- 1. ALTER articles table to add all required columns
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'));
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tag TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS time TEXT NOT NULL DEFAULT '5 min read';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Tips';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- 2. Create feed_sections table
    CREATE TABLE IF NOT EXISTS public.feed_sections (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Add section_id to articles
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.feed_sections(id) ON DELETE SET NULL;

    -- 4. Enable RLS on both tables
    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.feed_sections ENABLE ROW LEVEL SECURITY;

    -- 5. Articles RLS policies
    DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
    DROP POLICY IF EXISTS "Anon can insert articles" ON public.articles;
    DROP POLICY IF EXISTS "Anon can update articles" ON public.articles;
    DROP POLICY IF EXISTS "Anon can delete articles" ON public.articles;

    CREATE POLICY "Anyone can read published articles" ON public.articles FOR SELECT USING (true);
    CREATE POLICY "Anon can insert articles" ON public.articles FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anon can update articles" ON public.articles FOR UPDATE USING (true);
    CREATE POLICY "Anon can delete articles" ON public.articles FOR DELETE USING (true);

    -- 6. Feed sections RLS policies
    DROP POLICY IF EXISTS "Anyone can read active sections" ON public.feed_sections;
    DROP POLICY IF EXISTS "Anon can insert sections" ON public.feed_sections;
    DROP POLICY IF EXISTS "Anon can update sections" ON public.feed_sections;
    DROP POLICY IF EXISTS "Anon can delete sections" ON public.feed_sections;

    CREATE POLICY "Anyone can read active sections" ON public.feed_sections FOR SELECT USING (true);
    CREATE POLICY "Anon can insert sections" ON public.feed_sections FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anon can update sections" ON public.feed_sections FOR UPDATE USING (true);
    CREATE POLICY "Anon can delete sections" ON public.feed_sections FOR DELETE USING (true);

    -- 7. Storage bucket for article images
    INSERT INTO storage.buckets (id, name, public) VALUES ('articles', 'articles', true) ON CONFLICT (id) DO NOTHING;

    DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anon upload article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anon delete article images" ON storage.objects;

    CREATE POLICY "Public read article images" ON storage.objects FOR SELECT USING (bucket_id = 'articles');
    CREATE POLICY "Anon upload article images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'articles');
    CREATE POLICY "Anon delete article images" ON storage.objects FOR DELETE USING (bucket_id = 'articles');

-- 8. Add GPS pin columns to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_latitude DOUBLE PRECISION;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_longitude DOUBLE PRECISION;
