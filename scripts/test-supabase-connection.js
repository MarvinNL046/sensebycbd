// Test script to verify Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Attempting to connect to Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test a simple query to fetch some data
    console.log('Fetching sample data from products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    if (productsError) {
      throw productsError;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Successfully fetched data:');
    console.table(products);
    
    // Get available tables
    console.log('\nFetching available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.log('Note: Could not fetch table list. This is normal if the anon key does not have access to system tables.');
    } else {
      console.log('Available tables in public schema:');
      console.table(tables);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error(error);
  }
}

testConnection();
