// Script to check if users are properly synchronized
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('\n=== CHECKING USERS IN PUBLIC.USERS TABLE ===\n');
  
  try {
    // Get users from public.users
    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log(`✅ Found ${count} users in the public.users table`);
    
    if (users.length === 0) {
      console.log('⚠️ No users found in the public.users table');
      return;
    }
    
    console.log('\nUser details:');
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.full_name || 'Not provided'}`);
      console.log(`  Admin: ${user.is_admin ? 'Yes' : 'No'}`);
      console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total users: ${count}`);
    console.log(`Admin users: ${users.filter(user => user.is_admin).length}`);
    console.log(`Regular users: ${users.filter(user => !user.is_admin).length}`);
    
    console.log('\nIf you see all your users listed above, the synchronization was successful!');
    console.log('You should now be able to see all users in your admin dashboard.');
  } catch (error) {
    console.log('❌ Error checking users:', error.message);
  }
}

checkUsers().catch(error => {
  console.error('❌ Unhandled error:', error.message);
  console.error(error);
});
