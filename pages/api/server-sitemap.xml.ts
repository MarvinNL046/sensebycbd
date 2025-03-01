import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import { GetServerSideProps } from 'next';
import { 
  getProducts, 
  getCategories, 
  getBlogPosts, 
  getBlogCategories 
} from '../../lib/db';
import { getTranslatedProductSlug, getTranslatedCategorySlug } from '../../lib/utils/slugs';

// @ts-ignore - Type mismatch between next-sitemap and Next.js types
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Fetch all products, categories, blog posts, and blog categories from the database
  const { data: products } = await getProducts();
  const { data: categories } = await getCategories();
  const { data: blogPosts } = await getBlogPosts();
  const { data: blogCategories } = await getBlogCategories();
  
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
  
  // Add blog post URLs to sitemap
  if (blogPosts && blogPosts.length > 0) {
    for (const post of blogPosts) {
      // Create alternateRefs for each locale
      const alternateRefs = locales.map(locale => ({
        href: `${siteUrl}/${locale}/blog/${post.slug}`,
        hreflang: locale,
      }));
      
      // Add entry for each locale
      locales.forEach(locale => {
        fields.push({
          loc: `${siteUrl}/${locale}/blog/${post.slug}`,
          lastmod: post.updated_at || post.published_at || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
          alternateRefs,
        });
      });
    }
  }
  
  // Add blog category URLs to sitemap
  if (blogCategories && blogCategories.length > 0) {
    for (const category of blogCategories) {
      // Create alternateRefs for each locale
      const alternateRefs = locales.map(locale => ({
        href: `${siteUrl}/${locale}/blog/category/${category.slug}`,
        hreflang: locale,
      }));
      
      // Add entry for each locale
      locales.forEach(locale => {
        fields.push({
          loc: `${siteUrl}/${locale}/blog/category/${category.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
          alternateRefs,
        });
      });
    }
  }
  
  // Add main blog page to sitemap
  locales.forEach(locale => {
    const alternateRefs = locales.map(l => ({
      href: `${siteUrl}/${l}/blog`,
      hreflang: l,
    }));
    
    fields.push({
      loc: `${siteUrl}/${locale}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.8,
      alternateRefs,
    });
  });
  
  return getServerSideSitemap(ctx as any, fields);
};

// Default export to prevent next.js errors
export default function Sitemap() {}
