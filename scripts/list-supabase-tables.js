// Script to list all tables in the Supabase database
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

async function listTables() {
  try {
    // Try a simple query to test the connection
    console.log('Testing connection with a simple query...');
    
    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(5);
    
    if (productError) {
      console.log('Error querying products table:', productError.message);
      console.log('Trying to query users table instead...');
      
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(5);
      
      if (userError) {
        console.log('Error querying users table:', userError.message);
        throw new Error('Could not query any tables. Check your database connection and permissions.');
      } else {
        console.log('\n✅ Successfully connected to Supabase!');
        console.log('Sample data from users table:');
        console.table(userData);
      }
    } else {
      console.log('\n✅ Successfully connected to Supabase!');
      console.log('Sample data from products table:');
      console.table(productData);
      
      // Try to get a list of tables by querying information_schema
      try {
        const { data: tableData, error: tableError } = await supabaseAdmin
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (tableError) {
          console.log('Could not query information_schema.tables:', tableError.message);
        } else {
          console.log('\nTables in public schema:');
          console.log('----------------------------------');
          tableData.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
          });
        }
      } catch (schemaError) {
        console.log('Error querying information_schema:', schemaError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

listTables();
