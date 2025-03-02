// Test script to check if the Supabase connection is working properly for CRUD operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create a Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test function to check if we can read from the database
async function testRead() {
  console.log('Testing read operation...');
  
  try {
    // Try to read from the products table
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error reading products:', error);
      return false;
    }
    
    console.log('Successfully read products:', products);
    return true;
  } catch (error) {
    console.error('Unexpected error reading products:', error);
    return false;
  }
}

// Test function to check if we can create a record
async function testCreate() {
  console.log('Testing create operation...');
  
  try {
    // Create a test product
    const testProduct = {
      name: 'Test Product',
      slug: 'test-product-' + Date.now(),
      description: 'This is a test product',
      price: 9.99,
      stock: 10,
      image_url: 'https://example.com/test.jpg',
      specifications: {},
      is_featured: false,
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select();
    
    if (error) {
      console.error('Error creating product:', error);
      return false;
    }
    
    console.log('Successfully created product:', data);
    return data[0].id;
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    return false;
  }
}

// Test function to check if we can update a record
async function testUpdate(id) {
  console.log('Testing update operation...');
  
  try {
    // Update the test product
    const { data, error } = await supabase
      .from('products')
      .update({ description: 'Updated test description' })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating product:', error);
      return false;
    }
    
    console.log('Successfully updated product:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    return false;
  }
}

// Test function to check if we can delete a record
async function testDelete(id) {
  console.log('Testing delete operation...');
  
  try {
    // Delete the test product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    console.log('Successfully deleted product');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return false;
  }
}

// Test function to check if we can read from the categories table
async function testCategories() {
  console.log('Testing categories read operation...');
  
  try {
    // Try to read from the categories table
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error reading categories:', error);
      return false;
    }
    
    console.log('Successfully read categories:', categories);
    return true;
  } catch (error) {
    console.error('Unexpected error reading categories:', error);
    return false;
  }
}

// Test function to check if we can read from the orders table
async function testOrders() {
  console.log('Testing orders read operation...');
  
  try {
    // Try to read from the orders table
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error reading orders:', error);
      return false;
    }
    
    console.log('Successfully read orders:', orders);
    return true;
  } catch (error) {
    console.error('Unexpected error reading orders:', error);
    return false;
  }
}

// Main function to run all tests
async function runTests() {
  console.log('Starting CRUD tests...');
  
  // Test read operations
  const readSuccess = await testRead();
  const categoriesSuccess = await testCategories();
  const ordersSuccess = await testOrders();
  
  // Test write operations
  if (readSuccess) {
    const productId = await testCreate();
    
    if (productId) {
      const updateSuccess = await testUpdate(productId);
      
      if (updateSuccess) {
        await testDelete(productId);
      }
    }
  }
  
  console.log('Tests completed');
}

// Run the tests
runTests();
