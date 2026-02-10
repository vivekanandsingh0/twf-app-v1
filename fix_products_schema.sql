-- Fix Missing Columns in Products Table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;

-- Force Schema Cache Reload (Important for PostgREST/Supabase API to recognize new columns)
NOTIFY pgrst, 'reload config';
