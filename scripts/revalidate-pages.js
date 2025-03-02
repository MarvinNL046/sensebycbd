// Script to revalidate pages when products or content are updated
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Vercel deployment URL
const VERCEL_DEPLOYMENT_URL = process.env.VERCEL_DEPLOYMENT_URL || 'https://sensebycbd.com';

// Revalidation secret (should be set in .env.local and Vercel environment variables)
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

if (!REVALIDATION_SECRET) {
  console.error('REVALIDATION_SECRET is not set in .env.local');
  process.exit(1);
}

/**
 * Revalidate a specific path
 * @param {string} path - The path to revalidate (e.g., '/products/product-1')
 * @returns {Promise<boolean>} - Whether the revalidation was successful
 */
async function revalidatePath(path) {
  try {
    console.log(`Revalidating path: ${path}`);
    
    // Call the revalidate API endpoint
    const response = await fetch(`${VERCEL_DEPLOYMENT_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: REVALIDATION_SECRET,
        path,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Error revalidating ${path}: ${error}`);
      return false;
    }
    
    const result = await response.json();
    console.log(`Successfully revalidated ${path}: ${JSON.stringify(result)}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error revalidating ${path}: ${error.message}`);
    return false;
  }
}

/**
 * Revalidate multiple paths
 * @param {string[]} paths - The paths to revalidate
 * @returns {Promise<{success: string[], failed: string[]}>} - The results of the revalidation
 */
async function revalidatePaths(paths) {
  const results = {
    success: [],
    failed: [],
  };
  
  for (const path of paths) {
    const success = await revalidatePath(path);
    
    if (success) {
      results.success.push(path);
    } else {
      results.failed.push(path);
    }
  }
  
  return results;
}

/**
 * Revalidate all product pages
 * @returns {Promise<{success: string[], failed: string[]}>} - The results of the revalidation
 */
async function revalidateAllProducts() {
  console.log('Revalidating all product pages...');
  
  // Paths to revalidate
  const paths = [
    '/products', // Main products page
    '/en/products', // Language-specific products pages
    '/nl/products',
    '/de/products',
    '/fr/products',
  ];
  
  // Add individual product pages
  // In a real implementation, you would fetch the product slugs from the database
  // For now, we'll just use a placeholder
  console.log('Note: In a real implementation, you would fetch product slugs from the database');
  
  return revalidatePaths(paths);
}

/**
 * Revalidate all blog pages
 * @returns {Promise<{success: string[], failed: string[]}>} - The results of the revalidation
 */
async function revalidateAllBlogPosts() {
  console.log('Revalidating all blog pages...');
  
  // Paths to revalidate
  const paths = [
    '/blog', // Main blog page
    '/en/blog', // Language-specific blog pages
    '/nl/blog',
    '/de/blog',
    '/fr/blog',
  ];
  
  // Add individual blog post pages
  // In a real implementation, you would fetch the blog post slugs from the database
  // For now, we'll just use a placeholder
  console.log('Note: In a real implementation, you would fetch blog post slugs from the database');
  
  return revalidatePaths(paths);
}

/**
 * Revalidate the homepage
 * @returns {Promise<boolean>} - Whether the revalidation was successful
 */
async function revalidateHomepage() {
  console.log('Revalidating homepage...');
  
  // Paths to revalidate
  const paths = [
    '/', // Main homepage
    '/en', // Language-specific homepages
    '/nl',
    '/de',
    '/fr',
  ];
  
  const results = await revalidatePaths(paths);
  
  return results.success.length > 0;
}

/**
 * Revalidate a specific product
 * @param {string} slug - The product slug
 * @returns {Promise<boolean>} - Whether the revalidation was successful
 */
async function revalidateProduct(slug) {
  console.log(`Revalidating product: ${slug}`);
  
  // Paths to revalidate
  const paths = [
    `/products/${slug}`, // Main product page
    `/en/products/${slug}`, // Language-specific product pages
    `/nl/products/${slug}`,
    `/de/products/${slug}`,
    `/fr/products/${slug}`,
    '/products', // Main products page
    '/en/products', // Language-specific products pages
    '/nl/products',
    '/de/products',
    '/fr/products',
  ];
  
  const results = await revalidatePaths(paths);
  
  return results.success.length > 0;
}

/**
 * Revalidate a specific blog post
 * @param {string} slug - The blog post slug
 * @returns {Promise<boolean>} - Whether the revalidation was successful
 */
async function revalidateBlogPost(slug) {
  console.log(`Revalidating blog post: ${slug}`);
  
  // Paths to revalidate
  const paths = [
    `/blog/${slug}`, // Main blog post page
    `/en/blog/${slug}`, // Language-specific blog post pages
    `/nl/blog/${slug}`,
    `/de/blog/${slug}`,
    `/fr/blog/${slug}`,
    '/blog', // Main blog page
    '/en/blog', // Language-specific blog pages
    '/nl/blog',
    '/de/blog',
    '/fr/blog',
  ];
  
  const results = await revalidatePaths(paths);
  
  return results.success.length > 0;
}

/**
 * Revalidate a specific category
 * @param {string} slug - The category slug
 * @returns {Promise<boolean>} - Whether the revalidation was successful
 */
async function revalidateCategory(slug) {
  console.log(`Revalidating category: ${slug}`);
  
  // Paths to revalidate
  const paths = [
    `/products/category/${slug}`, // Main category page
    `/en/products/category/${slug}`, // Language-specific category pages
    `/nl/products/category/${slug}`,
    `/de/products/category/${slug}`,
    `/fr/products/category/${slug}`,
    '/products', // Main products page
    '/en/products', // Language-specific products pages
    '/nl/products',
    '/de/products',
    '/fr/products',
  ];
  
  const results = await revalidatePaths(paths);
  
  return results.success.length > 0;
}

/**
 * Revalidate a specific blog category
 * @param {string} slug - The blog category slug
 * @returns {Promise<boolean>} - Whether the revalidation was successful
 */
async function revalidateBlogCategory(slug) {
  console.log(`Revalidating blog category: ${slug}`);
  
  // Paths to revalidate
  const paths = [
    `/blog/category/${slug}`, // Main blog category page
    `/en/blog/category/${slug}`, // Language-specific blog category pages
    `/nl/blog/category/${slug}`,
    `/de/blog/category/${slug}`,
    `/fr/blog/category/${slug}`,
    '/blog', // Main blog page
    '/en/blog', // Language-specific blog pages
    '/nl/blog',
    '/de/blog',
    '/fr/blog',
  ];
  
  const results = await revalidatePaths(paths);
  
  return results.success.length > 0;
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node revalidate-pages.js all - Revalidate all pages');
    console.log('  node revalidate-pages.js products - Revalidate all product pages');
    console.log('  node revalidate-pages.js product [slug] - Revalidate a specific product');
    console.log('  node revalidate-pages.js blog - Revalidate all blog pages');
    console.log('  node revalidate-pages.js blogpost [slug] - Revalidate a specific blog post');
    console.log('  node revalidate-pages.js category [slug] - Revalidate a specific category');
    console.log('  node revalidate-pages.js blogcategory [slug] - Revalidate a specific blog category');
    console.log('  node revalidate-pages.js homepage - Revalidate the homepage');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'all':
      await revalidateHomepage();
      await revalidateAllProducts();
      await revalidateAllBlogPosts();
      break;
    case 'products':
      await revalidateAllProducts();
      break;
    case 'product':
      if (args.length < 2) {
        console.error('Error: Missing product slug');
        process.exit(1);
      }
      await revalidateProduct(args[1]);
      break;
    case 'blog':
      await revalidateAllBlogPosts();
      break;
    case 'blogpost':
      if (args.length < 2) {
        console.error('Error: Missing blog post slug');
        process.exit(1);
      }
      await revalidateBlogPost(args[1]);
      break;
    case 'category':
      if (args.length < 2) {
        console.error('Error: Missing category slug');
        process.exit(1);
      }
      await revalidateCategory(args[1]);
      break;
    case 'blogcategory':
      if (args.length < 2) {
        console.error('Error: Missing blog category slug');
        process.exit(1);
      }
      await revalidateBlogCategory(args[1]);
      break;
    case 'homepage':
      await revalidateHomepage();
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      process.exit(1);
  }
  
  console.log('Revalidation completed');
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
