# Incremental Static Regeneration (ISR) Implementation

This document explains the implementation of Incremental Static Regeneration (ISR) for product pages in the SenseBy CBD webshop.

## Overview

Incremental Static Regeneration (ISR) allows you to create or update static pages after you've built your site. With ISR, you can retain the benefits of static generation while still keeping your content fresh.

## Implementation Details

### 1. Product Pages

The product detail pages (`pages/products/[slug].tsx`) use ISR with the following configuration:

- `fallback: true` in `getStaticPaths` - This allows pages to be generated on-demand when a user visits a product page that wasn't pre-rendered at build time.
- `revalidate: 600` in `getStaticProps` - This means that product pages will be regenerated in the background at most once every 10 minutes if they receive traffic.
- Enhanced fallback UI - A skeleton loading state is shown while the page is being generated on-demand.

### 2. Category Pages

The category pages (`pages/products/category/[slug].tsx`) use ISR with the following configuration:

- `fallback: true` in `getStaticPaths` - This allows pages to be generated on-demand when a user visits a category page that wasn't pre-rendered at build time.
- `revalidate: 1800` in `getStaticProps` - This means that category pages will be regenerated in the background at most once every 30 minutes if they receive traffic.
- Enhanced fallback UI - A skeleton loading state is shown while the page is being generated on-demand.

### 3. Products Index Page

The products index page (`pages/products/index.tsx`) uses ISR with the following configuration:

- `revalidate: 900` in `getStaticProps` - This means that the products index page will be regenerated in the background at most once every 15 minutes if it receives traffic.

### 4. On-Demand Revalidation

We've implemented an API route (`pages/api/revalidate.ts`) that allows for on-demand revalidation of static pages. This is useful when you want to update a page immediately after content changes, without waiting for the revalidation period to expire.

## How to Use On-Demand Revalidation

You can trigger on-demand revalidation by making a POST request to the revalidation API endpoint:

```bash
curl -X POST "https://yourdomain.com/api/revalidate?secret=your_secret_token&path=/products/product-slug"
```

Where:
- `your_secret_token` is the value of the `REVALIDATION_TOKEN` environment variable
- `/products/product-slug` is the path of the page you want to revalidate

### Environment Variables

To use the on-demand revalidation API, you need to set the following environment variable:

```
REVALIDATION_TOKEN=your_secret_token
```

This token is used to authenticate requests to the revalidation API.

## Revalidation Strategy

We've implemented a tiered revalidation strategy based on the importance and frequency of updates for different types of pages:

1. **Product Detail Pages** - Revalidate every 10 minutes (600 seconds)
   - These pages contain critical information like prices and availability that need to be kept up-to-date.

2. **Products Index Page** - Revalidate every 15 minutes (900 seconds)
   - This page shows all products and needs to be updated relatively frequently to show new products and price changes.

3. **Category Pages** - Revalidate every 30 minutes (1800 seconds)
   - These pages change less frequently than individual product pages.

## Benefits of ISR

1. **Fast Initial Page Load** - Pages are served as static HTML, providing optimal performance.
2. **Always Fresh Content** - Pages are regenerated in the background, ensuring content stays up-to-date.
3. **Improved SEO** - Static pages are fully rendered and indexable by search engines.
4. **Reduced Database Load** - Pages are only regenerated periodically, reducing the load on your database.
5. **Graceful Fallbacks** - Users see a loading state while pages are being generated on-demand.

## Troubleshooting

If you notice that pages are not being updated as expected:

1. **Check Revalidation Periods** - Make sure the revalidation periods are appropriate for your content update frequency.
2. **Verify On-Demand Revalidation** - Ensure that the `REVALIDATION_TOKEN` environment variable is set correctly.
3. **Check Server Logs** - Look for any errors in the server logs related to revalidation.
4. **Force Revalidation** - Use the on-demand revalidation API to force a page to be regenerated.
