-- Add preorder and discount fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_duration INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'instant';
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;

-- Add preorder fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'instant';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;
