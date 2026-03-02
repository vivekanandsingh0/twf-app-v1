-- Create App Updates Table
CREATE TABLE IF NOT EXISTS public.app_updates (
    app_type TEXT PRIMARY KEY CHECK (app_type IN ('User', 'Vendor')),
    latest_version TEXT NOT NULL DEFAULT '1.0.0',
    min_mandatory_version TEXT NOT NULL DEFAULT '1.0.0',
    update_link TEXT,
    message TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to app updates" 
ON public.app_updates FOR SELECT USING (true);

-- Allow public update access (for admin usage)
CREATE POLICY "Allow public update access to app updates" 
ON public.app_updates FOR ALL USING (true) WITH CHECK (true);

-- Insert initial rows
INSERT INTO public.app_updates (app_type, latest_version, min_mandatory_version, message, is_active)
VALUES 
    ('User', '1.0.0', '1.0.0', 'A new version of the app is available! Please update to enjoy the latest features.', FALSE),
    ('Vendor', '1.0.0', '1.0.0', 'A new version of the vendor app is available! Update to improve performance.', FALSE)
ON CONFLICT (app_type) DO NOTHING;
