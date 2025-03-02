import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../../utils/supabase/client';

// Define the test product type
interface TestProduct {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  specifications: Record<string, any>;
  is_featured: boolean;
}

export async function getServerSideProps(context: any) {
  // Create a Supabase client using the server-side API
  const supabase = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Get the session from the request
  const { req } = context;
  const { user } = await supabase.auth.api.getUserByCookie(req);
  
  // Check if user is admin
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  // Get admin emails from environment variable
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
  
  // Check if user is admin
  const isAdmin = userData?.is_admin || (user.email && adminEmails.includes(user.email));
  
  if (!isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}

export default function TestCRUD() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [testProductId, setTestProductId] = useState<string | null>(null);
  
  // Function to add a log message
  const addLog = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };
  
  // Test function to check if we can read from the database
  const testRead = async () => {
    addLog('Testing read operation...');
    
    try {
      const supabase = createClient();
      
      // Try to read from the products table
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (error) {
        addLog(`Error reading products: ${error.message}`);
        return false;
      }
      
      addLog(`Successfully read products: ${products.length} found`);
      return true;
    } catch (error: any) {
      addLog(`Unexpected error reading products: ${error.message}`);
      return false;
    }
  };
  
  // Test function to check if we can create a record
  const testCreate = async () => {
    addLog('Testing create operation...');
    
    try {
      const supabase = createClient();
      
      // Create a test product
      const testProduct: TestProduct = {
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
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
        addLog(`Error creating product: ${error.message}`);
        return false;
      }
      
      addLog(`Successfully created product with ID: ${data[0].id}`);
      setTestProductId(data[0].id);
      return data[0].id;
    } catch (error: any) {
      addLog(`Unexpected error creating product: ${error.message}`);
      return false;
    }
  };
  
  // Test function to check if we can update a record
  const testUpdate = async (id: string) => {
    addLog('Testing update operation...');
    
    try {
      const supabase = createClient();
      
      // Update the test product
      const { data, error } = await supabase
        .from('products')
        .update({ description: 'Updated test description' })
        .eq('id', id)
        .select();
      
      if (error) {
        addLog(`Error updating product: ${error.message}`);
        return false;
      }
      
      addLog(`Successfully updated product: ${data[0].description}`);
      return true;
    } catch (error: any) {
      addLog(`Unexpected error updating product: ${error.message}`);
      return false;
    }
  };
  
  // Test function to check if we can delete a record
  const testDelete = async (id: string) => {
    addLog('Testing delete operation...');
    
    try {
      const supabase = createClient();
      
      // Delete the test product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        addLog(`Error deleting product: ${error.message}`);
        return false;
      }
      
      addLog('Successfully deleted product');
      setTestProductId(null);
      return true;
    } catch (error: any) {
      addLog(`Unexpected error deleting product: ${error.message}`);
      return false;
    }
  };
  
  // Test function to check if we can read from the categories table
  const testCategories = async () => {
    addLog('Testing categories read operation...');
    
    try {
      const supabase = createClient();
      
      // Try to read from the categories table
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (error) {
        addLog(`Error reading categories: ${error.message}`);
        return false;
      }
      
      addLog(`Successfully read categories: ${categories.length} found`);
      return true;
    } catch (error: any) {
      addLog(`Unexpected error reading categories: ${error.message}`);
      return false;
    }
  };
  
  // Test function to check if we can read from the orders table
  const testOrders = async () => {
    addLog('Testing orders read operation...');
    
    try {
      const supabase = createClient();
      
      // Try to read from the orders table
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (error) {
        addLog(`Error reading orders: ${error.message}`);
        return false;
      }
      
      addLog(`Successfully read orders: ${orders.length} found`);
      return true;
    } catch (error: any) {
      addLog(`Unexpected error reading orders: ${error.message}`);
      return false;
    }
  };
  
  // Main function to run all tests
  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    addLog('Starting CRUD tests...');
    
    // Test read operations
    const readSuccess = await testRead();
    await testCategories();
    await testOrders();
    
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
    
    addLog('Tests completed');
    setLoading(false);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin CRUD Test</h1>
      
      <div className="mb-4">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run CRUD Tests'}
        </button>
      </div>
      
      <div className="border rounded p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Test Results</h2>
        <div className="bg-black text-white p-4 rounded font-mono text-sm h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-400">No tests run yet. Click the button above to start testing.</p>
          ) : (
            testResults.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">[{index + 1}]</span> {log}
              </div>
            ))
          )}
        </div>
      </div>
      
      {testProductId && (
        <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
          <p className="font-semibold">Warning: Test product was created but not deleted.</p>
          <p>Product ID: {testProductId}</p>
          <button
            onClick={() => testDelete(testProductId)}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Test Product
          </button>
        </div>
      )}
    </div>
  );
}
