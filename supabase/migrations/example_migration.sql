-- Migration: example_migration
-- Created at: 2025-03-01T15:59:00.000Z
-- Description: 
-- This is an example migration file to demonstrate the format and structure.
-- This file is for reference only and should not be applied to the database.

-- Example: Create a new table for product reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX product_reviews_product_id_idx ON product_reviews(product_id);
CREATE INDEX product_reviews_user_id_idx ON product_reviews(user_id);

-- Add RLS policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view product reviews"
  ON product_reviews
  FOR SELECT
  USING (true);

-- Only authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
  ON product_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the review author can update their reviews
CREATE POLICY "Users can update their own reviews"
  ON product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Only the review author can delete their reviews
CREATE POLICY "Users can delete their own reviews"
  ON product_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: This is just an example and should not be applied to the database.
-- To create a real migration, use:
-- npm run db:create-migration your_migration_name
