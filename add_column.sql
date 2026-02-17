ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_phone text;
