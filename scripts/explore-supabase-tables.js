// Script to explore tables in the Supabase database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// List of common tables to check
const tablesToCheck = [
  'products',
  'categories',
  'users',
  'orders',
  'order_items',
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'reviews',
  'translations'
];

async function exploreTable(tableName) {
  console.log(`\nChecking table: ${tableName}`);
  console.log('----------------------------------');
  
  try {
    // Try to get the count of rows in the table
    const { count, error: countError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(`❌ Table '${tableName}' error: ${countError.message}`);
      return false;
    }
    
    console.log(`✅ Table '${tableName}' exists with ${count} rows`);
    
    // Get a sample of data
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(3);
    
    if (error) {
      console.log(`Error fetching data: ${error.message}`);
      return true;
    }
    
    if (data.length === 0) {
      console.log('No data found in this table.');
      return true;
    }
    
    // Get column names from the first row
    const columns = Object.keys(data[0]);
    console.log(`Columns: ${columns.join(', ')}`);
    
    // Show sample data
    console.log('Sample data:');
    console.table(data);
    
    return true;
  } catch (error) {
    console.log(`❌ Error exploring table '${tableName}': ${error.message}`);
    return false;
  }
}

async function exploreTables() {
  console.log('\n=== EXPLORING SUPABASE DATABASE TABLES ===\n');
  
  const existingTables = [];
  
  for (const table of tablesToCheck) {
    const exists = await exploreTable(table);
    if (exists) {
      existingTables.push(table);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Tables found in the database:');
  existingTables.forEach((table, index) => {
    console.log(`${index + 1}. ${table}`);
  });
  
  if (existingTables.length === 0) {
    console.log('No tables were found. Check your database connection and permissions.');
  }
}

exploreTables().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error);
});
