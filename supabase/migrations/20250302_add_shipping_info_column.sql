-- Add shipping_info column to orders table for backward compatibility

-- First check if the column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
    AND column_name = 'shipping_info'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE public.orders ADD COLUMN shipping_info JSONB;
    
    -- Copy data from shipping_address to shipping_info for existing orders
    UPDATE public.orders
    SET shipping_info = shipping_address::jsonb
    WHERE shipping_address IS NOT NULL;
  END IF;
END
$$;

-- Add a trigger to keep shipping_info and shipping_address in sync
CREATE OR REPLACE FUNCTION public.sync_order_shipping_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- When shipping_address is updated but shipping_info is not
  IF (NEW.shipping_address IS NOT NULL AND NEW.shipping_address IS DISTINCT FROM OLD.shipping_address) THEN
    -- Try to parse shipping_address as JSON and store in shipping_info
    BEGIN
      NEW.shipping_info = NEW.shipping_address::jsonb;
    EXCEPTION WHEN OTHERS THEN
      -- If parsing fails, store as a JSON string
      NEW.shipping_info = to_jsonb(NEW.shipping_address);
    END;
  END IF;
  
  -- When shipping_info is updated but shipping_address is not
  IF (NEW.shipping_info IS NOT NULL AND NEW.shipping_info IS DISTINCT FROM OLD.shipping_info) THEN
    -- Convert shipping_info to a string and store in shipping_address
    NEW.shipping_address = NEW.shipping_info::text;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS sync_order_shipping_fields_trigger ON public.orders;

-- Create the trigger
CREATE TRIGGER sync_order_shipping_fields_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_shipping_fields();
