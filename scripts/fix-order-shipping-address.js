// Script to fix order shipping address field
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get credentials from command line arguments or environment variables
const supabaseUrl = process.argv[2] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Usage: node scripts/fix-order-shipping-address.js [SUPABASE_URL] [SERVICE_ROLE_KEY]');
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

async function fixOrderShippingAddress() {
  console.log('\n=== FIXING ORDER SHIPPING ADDRESS ===\n');
  
  try {
    // Get all orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*');
    
    if (ordersError) {
      throw ordersError;
    }
    
    console.log(`Found ${orders.length} orders`);
    
    // Count orders that need fixing
    const ordersToFix = orders.filter(order => 
      (order.shipping_info && !order.shipping_address) || 
      (order.shipping_info && order.shipping_address === null)
    );
    
    console.log(`Found ${ordersToFix.length} orders that need fixing`);
    
    // Fix each order
    for (const order of ordersToFix) {
      console.log(`Fixing order ${order.id}...`);
      
      try {
        // Convert shipping_info to string if it's not already
        let shippingAddressValue;
        
        if (typeof order.shipping_info === 'string') {
          // Try to parse it as JSON to make sure it's valid
          try {
            const parsed = JSON.parse(order.shipping_info);
            shippingAddressValue = order.shipping_info; // It's already a valid JSON string
          } catch (e) {
            // It's a string but not valid JSON, so stringify it
            shippingAddressValue = JSON.stringify(order.shipping_info);
          }
        } else if (typeof order.shipping_info === 'object') {
          // It's an object, so stringify it
          shippingAddressValue = JSON.stringify(order.shipping_info);
        } else {
          // It's something else, convert to string
          shippingAddressValue = String(order.shipping_info);
        }
        
        // Update the order
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ shipping_address: shippingAddressValue })
          .eq('id', order.id);
        
        if (updateError) {
          console.error(`Error updating order ${order.id}:`, updateError.message);
        } else {
          console.log(`Successfully updated order ${order.id}`);
        }
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error.message);
      }
    }
    
    console.log('\n=== VERIFICATION ===\n');
    
    // Verify that all orders now have shipping_address
    const { data: verifyOrders, error: verifyError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .is('shipping_address', null);
    
    if (verifyError) {
      throw verifyError;
    }
    
    if (verifyOrders.length === 0) {
      console.log('✅ All orders now have shipping_address');
    } else {
      console.log(`❌ Found ${verifyOrders.length} orders still missing shipping_address`);
      console.log('These orders may need manual fixing:');
      verifyOrders.forEach(order => {
        console.log(`- Order ID: ${order.id}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error fixing order shipping address:', error.message);
    return false;
  }
}

async function main() {
  const success = await fixOrderShippingAddress();
  
  if (success) {
    console.log('\n=== SUCCESS ===');
    console.log('Order shipping address field has been fixed');
    console.log('\nYou should now be able to see shipping address information in the admin dashboard');
  } else {
    console.log('\n=== FAILED ===');
    console.log('Failed to fix order shipping address field');
    console.log('Please check the error messages above for more information');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
