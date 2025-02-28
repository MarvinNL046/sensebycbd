import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import { GetServerSideProps } from 'next';
import { getProducts, getCategories } from '../../lib/db';
import { getTranslatedProductSlug, getTranslatedCategorySlug } from '../../lib/utils/slugs';

// @ts-ignore - Type mismatch between next-sitemap and Next.js types
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Fetch all products and categories from the database
  const { data: products } = await getProducts();
  const { data: categories } = await getCategories();
  
  const siteUrl = 'https://sensebycbd.com';
  const locales = ['en', 'nl', 'de', 'fr'];
  const fields: ISitemapField[] = [];
  
  // Add product URLs to sitemap
  if (products && products.length > 0) {
    for (const product of products) {
      // Create alternateRefs for each locale
      const alternateRefs = locales.map(locale => ({
        href: `${siteUrl}/${locale}/products/${product.categories?.slug || 'all'}/${getTranslatedProductSlug(product.slug, locale)}`,
        hreflang: locale,
      }));
      
      // Add entry for each locale
      locales.forEach(locale => {
        fields.push({
          loc: `${siteUrl}/${locale}/products/${product.categories?.slug || 'all'}/${getTranslatedProductSlug(product.slug, locale)}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.9,
          alternateRefs,
        });
      });
    }
  }
  
  // Add category URLs to sitemap
  if (categories && categories.length > 0) {
    for (const category of categories) {
      // Create alternateRefs for each locale
      const alternateRefs = locales.map(locale => ({
        href: `${siteUrl}/${locale}/products/category/${getTranslatedCategorySlug(category.slug, locale)}`,
        hreflang: locale,
      }));
      
      // Add entry for each locale
      locales.forEach(locale => {
        fields.push({
          loc: `${siteUrl}/${locale}/products/category/${getTranslatedCategorySlug(category.slug, locale)}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
          alternateRefs,
        });
      });
    }
  }
  
  return getServerSideSitemap(ctx as any, fields);
};

// Default export to prevent next.js errors
export default function Sitemap() {}
