-- Migration to allow guest orders by making user_id nullable and updating RLS policies

-- First, drop the existing foreign key constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Make user_id column nullable
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add the foreign key constraint back, but allow NULL values
ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id);

-- Add a new RLS policy to allow guest orders (where user_id is NULL)
CREATE POLICY "Guests can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Add a policy to allow guests to view their own orders
CREATE POLICY "Guests can view their own orders"
  ON public.orders
  FOR SELECT
  USING (user_id IS NULL);

-- Update the order_items policies to allow guest orders
CREATE POLICY "Guests can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id IS NULL));

CREATE POLICY "Guests can view their own order items"
  ON public.order_items
  FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id IS NULL));
