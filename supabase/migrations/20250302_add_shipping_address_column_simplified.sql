-- Add shipping_address column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Copy data from shipping_info to shipping_address
UPDATE orders
SET shipping_address = shipping_info
WHERE shipping_info IS NOT NULL AND shipping_address IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN orders.shipping_address IS 'Shipping address information as a JSON object. Added as a hotfix to prevent errors with code that expects this column.';
