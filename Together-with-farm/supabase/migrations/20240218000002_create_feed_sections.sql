-- Create feed_sections table
CREATE TABLE IF NOT EXISTS public.feed_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feed_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active sections"
    ON public.feed_sections FOR SELECT USING (true);

CREATE POLICY "Anon can insert sections"
    ON public.feed_sections FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update sections"
    ON public.feed_sections FOR UPDATE USING (true);

CREATE POLICY "Anon can delete sections"
    ON public.feed_sections FOR DELETE USING (true);

-- Add section_id to articles table
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.feed_sections(id) ON DELETE SET NULL;

-- Insert default sections
INSERT INTO public.feed_sections (name, description, display_order)
VALUES
    ('All Articles', 'All published articles', 0)
ON CONFLICT DO NOTHING;
