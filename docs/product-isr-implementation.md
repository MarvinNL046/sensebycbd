# Product System & ISR Implementation Guide

This document outlines how to implement Incremental Static Regeneration (ISR) for product pages in the SenseBy CBD webshop.

## What is ISR?

Incremental Static Regeneration (ISR) allows you to create or update static pages after you've built your site. With ISR, you can retain the benefits of static generation while still keeping your content fresh.

## Implementation Steps

### 1. Product Detail Page with All Blocks

First, ensure your product detail page (`pages/products/[slug].tsx`) includes all necessary product blocks:

```tsx
import { GetStaticProps, GetStaticPaths } from 'next';
import { Layout } from '../../components/layout/Layout';
import { SEO } from '../../lib/seo/SEO';
import { ProductGallery } from '../../components/blocks/product/ProductGallery';
import { ProductInfo } from '../../components/blocks/product/ProductInfo';
import { ProductSpecifications } from '../../components/blocks/product/ProductSpecifications';
import { RelatedProducts } from '../../components/blocks/product/RelatedProducts';
import { ProductSchema } from '../../lib/schema/ProductSchema';
import { getProductBySlug, getProducts } from '../../lib/db';
import { Product } from '../../types/product';

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  if (!product) return null;
  
  return (
    <Layout>
      <SEO 
        title={`${product.name} | SenseBy CBD`}
        description={product.description.substring(0, 160)}
        keywords={`CBD, ${product.name}, ${product.category?.name || ''}`}
      />
      
      <ProductSchema product={product} />
      
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductGallery 
            mainImage={product.image_url} 
            additionalImages={product.additional_images || []} 
            productName={product.name}
          />
          
          <ProductInfo product={product} />
        </div>
        
        {product.specifications && (
          <div className="mb-12">
            <ProductSpecifications specifications={product.specifications} />
          </div>
        )}
        
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: products } = await getProducts({ limit: 20 });
  
  const paths = products?.map((product) => ({
    params: { slug: product.slug },
  })) || [];
  
  return {
    paths,
    fallback: 'blocking', // Enable ISR
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  
  const { data: product, error } = await getProductBySlug(slug);
  
  if (error || !product) {
    return {
      notFound: true,
    };
  }
  
  const { data: relatedProducts = [] } = await getProducts({
    category: product.category?.slug,
    exclude: [product.id],
    limit: 4,
  });
  
  return {
    props: {
      product,
      relatedProducts,
    },
    revalidate: 60 * 60, // Revalidate every hour (ISR)
  };
};
```

### 2. Implement ISR for Product Pages

The key to implementing ISR is:

1. Set `fallback: 'blocking'` in `getStaticPaths` to enable ISR
2. Add the `revalidate` property to the return object in `getStaticProps`

```tsx
export const getStaticPaths: GetStaticPaths = async () => {
  // ...
  return {
    paths,
    fallback: 'blocking', // Enable ISR
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // ...
  return {
    props: {
      // ...
    },
    revalidate: 60 * 60, // Revalidate every hour (ISR)
  };
};
```

### 3. Create generateStaticParams for All Dynamic Routes

Next.js 13+ introduced `generateStaticParams` as a replacement for `getStaticPaths`. If you're using the App Router, update your implementation:

```tsx
// app/products/[slug]/page.tsx
export async function generateStaticParams() {
  const { data: products } = await getProducts({ limit: 20 });
  
  return products?.map((product) => ({
    slug: product.slug,
  })) || [];
}
```

Apply this pattern to all dynamic routes:

- `app/products/[slug]/page.tsx`
- `app/products/category/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/blog/category/[slug]/page.tsx`

### 4. Implement Product Filtering and Search Functionality

Add filtering and search to the products listing page:

```tsx
// pages/products/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getProducts, getCategories } from '../../lib/db';
import { Product, Category } from '../../types/product';

interface ProductsPageProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductsPage({ initialProducts, categories }: ProductsPageProps) {
  const router = useRouter();
  const { query } = router;
  
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState(query.search as string || '');
  const [selectedCategory, setSelectedCategory] = useState(query.category as string || '');
  const [priceRange, setPriceRange] = useState({
    min: query.minPrice ? Number(query.minPrice) : 0,
    max: query.maxPrice ? Number(query.maxPrice) : 200,
  });
  
  // Update URL when filters change
  useEffect(() => {
    const newQuery: any = {};
    
    if (searchTerm) newQuery.search = searchTerm;
    if (selectedCategory) newQuery.category = selectedCategory;
    if (priceRange.min > 0) newQuery.minPrice = priceRange.min;
    if (priceRange.max < 200) newQuery.maxPrice = priceRange.max;
    
    router.push({
      pathname: '/products',
      query: newQuery,
    }, undefined, { shallow: true });
    
    // Fetch filtered products
    fetchFilteredProducts();
  }, [searchTerm, selectedCategory, priceRange]);
  
  const fetchFilteredProducts = async () => {
    const { data } = await getProducts({
      search: searchTerm,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
    
    setProducts(data || []);
  };
  
  // Render product filters and product grid
  // ...
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { data: products } = await getProducts({
    search: query.search as string,
    category: query.category as string,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
  });
  
  const { data: categories } = await getCategories();
  
  return {
    props: {
      initialProducts: products || [],
      categories: categories || [],
    },
  };
};
```

### 5. Implement Translated URL Slugs

To implement translated URL slugs, modify your database schema and update your getStaticPaths/generateStaticParams functions:

1. Update the products table to store translated slugs:

```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug_translations JSONB;
```

2. Update your product data to include translated slugs:

```sql
UPDATE public.products
SET slug_translations = jsonb_build_object(
  'en', slug,
  'nl', 'dutch-version-of-slug',
  'de', 'german-version-of-slug',
  'fr', 'french-version-of-slug'
);
```

3. Update getStaticPaths to generate paths for each locale:

```tsx
export const getStaticPaths: GetStaticPaths = async ({ locales = ['en'] }) => {
  const { data: products } = await getProducts({ limit: 20 });
  
  const paths = products?.flatMap((product) => 
    locales.map(locale => ({
      params: { 
        slug: product.slug_translations?.[locale] || product.slug 
      },
      locale
    }))
  ) || [];
  
  return {
    paths,
    fallback: 'blocking',
  };
};
```

4. Update getProductBySlug to handle translated slugs:

```tsx
export async function getProductBySlug(slug: string, locale: string = 'en') {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:category_id(id, name, slug)
    `)
    .or(`slug.eq.${slug},slug_translations->>${locale}.eq.${slug}`)
    .single();
    
  return { data, error };
}
```

## On-Demand Revalidation

You can also implement on-demand revalidation using the Next.js API route:

```tsx
// pages/api/revalidate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Path to revalidate
    const path = req.query.path as string;
    
    if (!path) {
      return res.status(400).json({ message: 'Path is required' });
    }
    
    // Revalidate the specific path
    await res.revalidate(path);
    
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue to show the last successfully generated page
    return res.status(500).send('Error revalidating');
  }
}
```

This API can be called when products are updated in the admin panel or via webhooks from Supabase.

## Testing ISR

To test ISR functionality:

1. Build your site: `npm run build`
2. Start the production server: `npm run start`
3. Visit a product page
4. Update the product in Supabase
5. Wait for the revalidation period or trigger on-demand revalidation
6. Refresh the page to see the updated content

## Performance Considerations

- Choose an appropriate revalidation interval based on how frequently your product data changes
- For products that change frequently (e.g., stock levels), use a shorter revalidation period
- For more static content, use a longer revalidation period to reduce database load
- Consider implementing staggered revalidation for different product types
