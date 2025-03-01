# Multilingual Product System

This document describes the implementation of the multilingual product system in the SenseBy CBD webshop.

## Overview

The multilingual product system allows product and category content (names, descriptions, etc.) to be translated into multiple languages. The system uses a flexible approach with a JSONB field in the database to store translations for each language.

## Database Schema

The implementation adds a `translations` JSONB field to both the `products` and `categories` tables:

```sql
ALTER TABLE public.products ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.categories ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries on translations
CREATE INDEX IF NOT EXISTS idx_products_translations ON public.products USING GIN (translations);
CREATE INDEX IF NOT EXISTS idx_categories_translations ON public.categories USING GIN (translations);
```

## Data Structure

The `translations` field uses the following structure:

```json
{
  "nl": {
    "name": "Dutch product name",
    "description": "Dutch product description"
  },
  "de": {
    "name": "German product name",
    "description": "German product description"
  },
  "fr": {
    "name": "French product name",
    "description": "French product description"
  }
}
```

## TypeScript Types

The Product and Category interfaces have been updated to include the translations field:

```typescript
export interface Product {
  // Existing fields...
  translations?: {
    [locale: string]: {
      name?: string;
      description?: string;
    }
  };
}

export interface Category {
  // Existing fields...
  translations?: {
    [locale: string]: {
      name?: string;
      description?: string;
    }
  };
}
```

## Database Functions

The database functions in `lib/db.ts` have been updated to handle translations:

1. Helper functions to localize products and categories:
   - `localizeProduct(product, locale)`: Applies translations to a product based on the current locale
   - `localizeCategory(category, locale)`: Applies translations to a category based on the current locale

2. Updated database functions to accept a locale parameter:
   - `getProducts(filters, locale)`
   - `getProductBySlug(slug, locale)`
   - `getFeaturedProducts(locale)`
   - `getRelatedProducts(productId, categoryId, limit, locale)`
   - `getCategories(locale)`
   - `getCategoryBySlug(slug, locale)`

## Pages and Components

The following pages and components have been updated to use the localized data:

1. Product detail page (`pages/products/[slug].tsx`)
2. Product category page (`pages/products/category/[slug].tsx`)
3. Products index page (`pages/products/index.tsx`)
4. Related products component (`components/blocks/product/RelatedProducts.tsx`)

## URL Structure

The URL structure for products and categories remains the same, but the slugs are translated based on the current locale. For example:

- English: `/products/full-spectrum-cbd-oil-1000mg`
- Dutch: `/products/full-spectrum-cbd-olie-1000mg`
- German: `/products/full-spectrum-cbd-öl-1000mg`
- French: `/products/huile-cbd-spectre-complet-1000mg`

This is handled by the slug utility functions in `lib/utils/slugs.ts`.

## Admin Interface

A new admin page has been created to manage translations:

- `pages/admin/translations.tsx`: Provides an interface for adding and editing translations for products and categories

## Sample Data

A script has been created to add sample translations to the database:

- `scripts/add-sample-translations.js`: Adds Dutch, German, and French translations for product and category names and descriptions

## How to Add New Translations

### Using the Admin Interface

1. Navigate to `/admin/translations`
2. Select a product or category from the list
3. Add or edit translations for each language
4. Click "Save Translations"

### Using the API

To add translations programmatically, use the Supabase client:

```typescript
const { error } = await supabase
  .from('products')
  .update({
    translations: {
      nl: {
        name: "Dutch name",
        description: "Dutch description"
      },
      // Add other languages as needed
    }
  })
  .eq('id', productId);
```

## Future Improvements

1. **Translation of Product Specifications**: Currently, only the name and description fields are translated. In the future, we could extend this to include product specifications.

2. **Automated Translation**: Integrate with a translation API to provide automatic translation suggestions.

3. **Translation Memory**: Implement a translation memory system to reuse translations across similar products.

4. **Translation Workflow**: Add a workflow for translators with approval processes.

5. **SEO Improvements**: Add translated meta tags and structured data for better SEO in different languages.
