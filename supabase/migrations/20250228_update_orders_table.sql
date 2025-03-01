-- Update orders table to match the expected structure in db.ts

-- First, drop existing constraints and indexes
ALTER TABLE IF EXISTS public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
DROP INDEX IF EXISTS idx_orders_user_id;

-- Rename total to total_amount (only if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total'
    ) THEN
        ALTER TABLE public.orders RENAME COLUMN total TO total_amount;
    END IF;
END $$;

-- Add missing columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_info JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_info JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;

-- Drop shipping_address column (after migrating data if needed)
-- In a production environment, you would first migrate the data:
-- UPDATE public.orders SET shipping_info = jsonb_build_object('address', shipping_address);
ALTER TABLE public.orders DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_id;

-- Recreate constraints and indexes
ALTER TABLE public.order_items 
  ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) 
  REFERENCES public.orders(id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
