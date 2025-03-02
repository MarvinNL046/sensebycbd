// Script to check the schema of the orders table
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get credentials from command line arguments or environment variables
const supabaseUrl = process.argv[2] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Usage: node scripts/check-orders-schema.js [SUPABASE_URL] [SERVICE_ROLE_KEY]');
  console.error('Or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkOrdersSchema() {
  console.log('\n=== CHECKING ORDERS TABLE SCHEMA ===\n');
  
  try {
    // Get the schema of the orders table
    const { data, error } = await supabaseAdmin.rpc('pg_execute_and_return', {
      p_statement: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'orders'
        ORDER BY ordinal_position
      `
    });
    
    if (error) {
      console.error('Error getting schema:', error.message);
      
      // Try alternative approach
      console.log('Trying alternative approach...');
      
      // Get a sample order to see what fields it has
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .limit(1);
      
      if (orderError) {
        console.error('Error getting sample order:', orderError.message);
        return false;
      }
      
      if (orderData && orderData.length > 0) {
        console.log('Sample order fields:');
        const order = orderData[0];
        Object.keys(order).forEach(key => {
          console.log(`- ${key}: ${typeof order[key]} (${order[key] === null ? 'NULL' : 'NOT NULL'})`);
        });
      } else {
        console.log('No orders found');
      }
      
      return true;
    }
    
    console.log('Orders table schema:');
    if (data && data.length > 0) {
      data.forEach(column => {
        console.log(`- ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('No columns found');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking orders schema:', error.message);
    return false;
  }
}

async function main() {
  const success = await checkOrdersSchema();
  
  if (success) {
    console.log('\n=== SUCCESS ===');
    console.log('Orders table schema checked');
  } else {
    console.log('\n=== FAILED ===');
    console.log('Failed to check orders table schema');
    console.log('Please check the error messages above for more information');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
