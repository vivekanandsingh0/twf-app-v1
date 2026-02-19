-- Migration: Alter existing articles table to add missing columns
-- The articles table already exists with a different schema, so we ALTER it.

-- Add 'status' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published'));

-- Add 'image_url' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add 'content' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS content TEXT;

-- Add 'type' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS type TEXT;

-- Add 'tag' column if it doesn't exist (may already exist as 'tags')
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS tag TEXT;

-- Add 'time' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS time TEXT NOT NULL DEFAULT '5 min read';

-- Add 'category' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Tips';

-- Add 'updated_at' column if it doesn't exist
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS if not already enabled
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Anon can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Anon can update articles" ON public.articles;
DROP POLICY IF EXISTS "Anon can delete articles" ON public.articles;

-- Recreate policies
CREATE POLICY "Anyone can read published articles"
    ON public.articles FOR SELECT
    USING (true);

CREATE POLICY "Anon can insert articles"
    ON public.articles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anon can update articles"
    ON public.articles FOR UPDATE
    USING (true);

CREATE POLICY "Anon can delete articles"
    ON public.articles FOR DELETE
    USING (true);

-- Create storage bucket for article images (safe if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete article images" ON storage.objects;

CREATE POLICY "Public read article images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'articles');

CREATE POLICY "Anon upload article images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'articles');

CREATE POLICY "Anon delete article images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'articles');
