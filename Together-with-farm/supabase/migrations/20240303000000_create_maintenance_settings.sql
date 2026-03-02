-- Create Maintenance Settings Table
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
    app_type TEXT PRIMARY KEY CHECK (app_type IN ('User', 'Vendor')),
    is_active BOOLEAN DEFAULT FALSE,
    message TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone needs to know if app is in maintenance)
CREATE POLICY "Allow public read access to maintenance settings" 
ON public.maintenance_settings FOR SELECT USING (true);

-- Insert initial rows
INSERT INTO public.maintenance_settings (app_type, is_active, message)
VALUES 
    ('User', FALSE, 'Our app is currently undergoing scheduled maintenance. Please check back later.'),
    ('Vendor', FALSE, 'The vendor dashboard is currently in maintenance mode. We will be back shortly.')
ON CONFLICT (app_type) DO NOTHING;
