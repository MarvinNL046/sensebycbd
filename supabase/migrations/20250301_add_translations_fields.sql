-- Add translations field to products and categories tables

-- Add JSONB translations field to products table
ALTER TABLE public.products ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;

-- Add JSONB translations field to categories table
ALTER TABLE public.categories ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries on translations
CREATE INDEX IF NOT EXISTS idx_products_translations ON public.products USING GIN (translations);
CREATE INDEX IF NOT EXISTS idx_categories_translations ON public.categories USING GIN (translations);

-- Comment on columns
COMMENT ON COLUMN public.products.translations IS 'Stores multilingual translations for product fields like name and description';
COMMENT ON COLUMN public.categories.translations IS 'Stores multilingual translations for category fields like name and description';
