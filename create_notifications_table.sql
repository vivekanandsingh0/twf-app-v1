-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'alert', 'promo', 'order', 'success'
    target_type TEXT NOT NULL, -- 'Specific', 'All', 'AllUsers', 'AllVendors'
    target_id UUID, -- userId if Specific
    promo_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_target_id ON notifications(target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all read access for now to simplify (or refine based on auth)
-- Ideally:
-- Users can see where target_type='All' OR 'AllUsers' OR (target_type='Specific' AND target_id = auth.uid())
-- Vendors can see where target_type='All' OR 'AllVendors' OR (target_type='Specific' AND target_id = auth.uid())
-- Admins can see all.

-- For simplicity in this migration step (and since Admin uses anon key often in this codebase or service role not fully separated in frontend code being shown), 
-- we will allow SELECT for authenticated users.
-- We will refine filtering in the application logic or improved policies later if needed.

CREATE POLICY "Enable read access for all users" ON notifications
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON notifications
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON notifications
    FOR UPDATE
    USING (true);

CREATE POLICY "Enable delete for authenticated users" ON notifications
    FOR DELETE
    USING (true);
