import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for on-demand revalidation of static pages
 * 
 * This allows us to trigger revalidation when products are updated
 * without waiting for the revalidation time to expire
 * 
 * Example usage:
 * POST /api/revalidate?secret=your_secret_token&path=/products/product-slug
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATION_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Get the path to revalidate
    const path = req.query.path as string;
    
    if (!path) {
      return res.status(400).json({ message: 'Path is required' });
    }

    // Revalidate the path
    await res.revalidate(path);

    // Also revalidate the products index page if a product page is revalidated
    if (path.startsWith('/products/') && !path.includes('/category/')) {
      await res.revalidate('/products');
    }

    // Also revalidate the category page if a product page is revalidated
    if (path.startsWith('/products/') && !path.includes('/category/')) {
      try {
        // Extract product slug
        const productSlug = path.replace('/products/', '');
        
        // Import the getProductBySlug function
        const { getProductBySlug } = await import('../../lib/db');
        
        // Get the product from the database
        const { data: product } = await getProductBySlug(productSlug);
        
        // If the product has a category, revalidate the category page
        if (product && product.categories) {
          await res.revalidate(`/products/category/${product.categories.slug}`);
          console.log(`Revalidated category page: /products/category/${product.categories.slug}`);
        }
      } catch (categoryError) {
        console.error('Error revalidating category page:', categoryError);
        // Continue with the response even if category revalidation fails
      }
    }
    
    // Revalidate blog-related pages
    if (path.startsWith('/blog/')) {
      // Revalidate the main blog page
      await res.revalidate('/blog');
      
      // If it's a blog post, revalidate its category page
      if (!path.includes('/category/')) {
        try {
          // Extract blog post slug
          const blogSlug = path.replace('/blog/', '');
          
          // Import the getBlogPostBySlug function
          const { getBlogPostBySlug } = await import('../../lib/db');
          
          // Get the blog post from the database
          const { data: post } = await getBlogPostBySlug(blogSlug);
          
          // If the post has a category, revalidate the category page
          if (post && post.category) {
            await res.revalidate(`/blog/category/${post.category.slug}`);
            console.log(`Revalidated blog category page: /blog/category/${post.category.slug}`);
          }
        } catch (blogCategoryError) {
          console.error('Error revalidating blog category page:', blogCategoryError);
          // Continue with the response even if category revalidation fails
        }
      }
    }

    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue to show the last successfully
    // generated page
    return res.status(500).send('Error revalidating');
  }
}
