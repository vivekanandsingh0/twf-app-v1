-- Create app_settings table for admin-configurable settings
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default delivery charge settings
INSERT INTO app_settings (key, value) VALUES 
    ('delivery_charges', '{"min_order_for_free_delivery": 200, "delivery_fee": 30}')
ON CONFLICT (key) DO NOTHING;

-- Allow public read access
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_settings" ON app_settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update app_settings" ON app_settings
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can insert app_settings" ON app_settings
    FOR INSERT WITH CHECK (true);
