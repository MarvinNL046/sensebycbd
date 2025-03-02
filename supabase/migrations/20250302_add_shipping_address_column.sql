-- Add shipping_address column to orders table as a hotfix
-- This migration adds the shipping_address column to the orders table
-- to prevent errors when the code tries to access this column

-- Check if the column already exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'shipping_address'
    ) THEN
        -- Add the shipping_address column
        ALTER TABLE orders
        ADD COLUMN shipping_address JSONB;

        -- Copy data from shipping_info to shipping_address for existing records
        UPDATE orders
        SET shipping_address = shipping_info
        WHERE shipping_info IS NOT NULL;
    END IF;
END $$;

-- Add a comment to the column
COMMENT ON COLUMN orders.shipping_address IS 'Shipping address information as a JSON object. Added as a hotfix to prevent errors with code that expects this column.';
