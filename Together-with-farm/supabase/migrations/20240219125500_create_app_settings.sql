CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access so apps can fetch configuration without auth if needed (or with anon key)
DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
CREATE POLICY "Public read app settings" ON public.app_settings FOR SELECT USING (true);

-- For simplicity in development, allow anon updates. In production, restrict to admin role.
DROP POLICY IF EXISTS "Anon all app settings" ON public.app_settings;
CREATE POLICY "Anon all app settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default value
INSERT INTO public.app_settings (key, value, description)
VALUES ('vendor_support_phone', '919999999999', 'Phone number for vendor support')
ON CONFLICT (key) DO NOTHING;
