import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// The secret token to validate requests
// This should be set in your environment variables
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Check if the secret is provided and matches
    if (!body.secret || body.secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token' 
        },
        { 
          status: 401 
        }
      );
    }
    
    // Check if the payload is provided
    if (!body.payload) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payload is required' 
        },
        { 
          status: 400 
        }
      );
    }
    
    // Extract information from the payload
    const { table, operation, record } = body.payload;
    
    // Paths to revalidate based on the table and operation
    const pathsToRevalidate: string[] = [];
    
    // Add paths based on the table
    switch (table) {
      case 'products':
        // Add product-related paths
        pathsToRevalidate.push('/products');
        pathsToRevalidate.push('/en/products');
        pathsToRevalidate.push('/nl/products');
        pathsToRevalidate.push('/de/products');
        pathsToRevalidate.push('/fr/products');
        
        // Add specific product path if available
        if (record && record.slug) {
          pathsToRevalidate.push(`/products/${record.slug}`);
          pathsToRevalidate.push(`/en/products/${record.slug}`);
          pathsToRevalidate.push(`/nl/products/${record.slug}`);
          pathsToRevalidate.push(`/de/products/${record.slug}`);
          pathsToRevalidate.push(`/fr/products/${record.slug}`);
        }
        
        // Add homepage as products might be featured there
        pathsToRevalidate.push('/');
        pathsToRevalidate.push('/en');
        pathsToRevalidate.push('/nl');
        pathsToRevalidate.push('/de');
        pathsToRevalidate.push('/fr');
        break;
        
      case 'categories':
        // Add category-related paths
        pathsToRevalidate.push('/products');
        pathsToRevalidate.push('/en/products');
        pathsToRevalidate.push('/nl/products');
        pathsToRevalidate.push('/de/products');
        pathsToRevalidate.push('/fr/products');
        
        // Add specific category path if available
        if (record && record.slug) {
          pathsToRevalidate.push(`/products/category/${record.slug}`);
          pathsToRevalidate.push(`/en/products/category/${record.slug}`);
          pathsToRevalidate.push(`/nl/products/category/${record.slug}`);
          pathsToRevalidate.push(`/de/products/category/${record.slug}`);
          pathsToRevalidate.push(`/fr/products/category/${record.slug}`);
        }
        break;
        
      case 'blog_posts':
        // Add blog-related paths
        pathsToRevalidate.push('/blog');
        pathsToRevalidate.push('/en/blog');
        pathsToRevalidate.push('/nl/blog');
        pathsToRevalidate.push('/de/blog');
        pathsToRevalidate.push('/fr/blog');
        
        // Add specific blog post path if available
        if (record && record.slug) {
          pathsToRevalidate.push(`/blog/${record.slug}`);
          pathsToRevalidate.push(`/en/blog/${record.slug}`);
          pathsToRevalidate.push(`/nl/blog/${record.slug}`);
          pathsToRevalidate.push(`/de/blog/${record.slug}`);
          pathsToRevalidate.push(`/fr/blog/${record.slug}`);
        }
        
        // Add homepage as blog posts might be featured there
        pathsToRevalidate.push('/');
        pathsToRevalidate.push('/en');
        pathsToRevalidate.push('/nl');
        pathsToRevalidate.push('/de');
        pathsToRevalidate.push('/fr');
        break;
        
      case 'blog_categories':
        // Add blog category-related paths
        pathsToRevalidate.push('/blog');
        pathsToRevalidate.push('/en/blog');
        pathsToRevalidate.push('/nl/blog');
        pathsToRevalidate.push('/de/blog');
        pathsToRevalidate.push('/fr/blog');
        
        // Add specific blog category path if available
        if (record && record.slug) {
          pathsToRevalidate.push(`/blog/category/${record.slug}`);
          pathsToRevalidate.push(`/en/blog/category/${record.slug}`);
          pathsToRevalidate.push(`/nl/blog/category/${record.slug}`);
          pathsToRevalidate.push(`/de/blog/category/${record.slug}`);
          pathsToRevalidate.push(`/fr/blog/category/${record.slug}`);
        }
        break;
        
      default:
        // For unknown tables, just revalidate the homepage
        pathsToRevalidate.push('/');
        pathsToRevalidate.push('/en');
        pathsToRevalidate.push('/nl');
        pathsToRevalidate.push('/de');
        pathsToRevalidate.push('/fr');
        break;
    }
    
    // Revalidate all paths
    const revalidatedPaths: string[] = [];
    
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
        revalidatedPaths.push(path);
      } catch (error) {
        console.error(`Error revalidating path ${path}:`, error);
      }
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      revalidated: true,
      paths: revalidatedPaths,
      table,
      operation,
      date: new Date().toISOString(),
    });
  } catch (error: any) {
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'An error occurred during revalidation' 
      },
      { 
        status: 500 
      }
    );
  }
}
