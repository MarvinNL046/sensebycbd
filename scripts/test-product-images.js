// Test script to check if additional_images are being properly retrieved
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductImages() {
  try {
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, image_url, additional_images');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products.length} products`);
    
    // Check each product for additional_images
    products.forEach(product => {
      console.log(`\nProduct: ${product.name} (${product.slug})`);
      console.log(`Main image: ${product.image_url}`);
      
      if (product.additional_images && product.additional_images.length > 0) {
        console.log(`Additional images: ${product.additional_images.length}`);
        product.additional_images.forEach((img, i) => {
          console.log(`  ${i + 1}. ${img}`);
        });
      } else {
        console.log('No additional images');
      }
    });
    
    // Get a specific product by slug
    const productSlug = 'cbd-relief-cream-250mg'; // Replace with an actual product slug
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, image_url, additional_images')
      .eq('slug', productSlug)
      .single();
    
    if (productError) {
      console.error(`Error fetching product ${productSlug}:`, productError);
      return;
    }
    
    console.log(`\n\nDetailed test for product: ${product.name}`);
    console.log(`Main image: ${product.image_url}`);
    console.log('Additional images:', product.additional_images);
    console.log('Type of additional_images:', typeof product.additional_images);
    if (Array.isArray(product.additional_images)) {
      console.log('Is array: true');
      console.log('Length:', product.additional_images.length);
    } else {
      console.log('Is array: false');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testProductImages();
