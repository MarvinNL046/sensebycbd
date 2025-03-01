// Script to test the admin dashboard
const { createClient } = require('@supabase/supabase-js');

// Get credentials from command line arguments
const supabaseUrl = process.argv[2];
const anonKey = process.argv[3];
const email = process.argv[4];
const password = process.argv[5];

if (!supabaseUrl || !anonKey || !email || !password) {
  console.error('Error: Missing credentials');
  console.error('Usage: node scripts/test-admin-dashboard.js SUPABASE_URL ANON_KEY EMAIL PASSWORD');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase...');

// Create regular client
const supabase = createClient(supabaseUrl, anonKey);

async function testAdminDashboard() {
  console.log('\n=== TESTING ADMIN DASHBOARD ===\n');
  
  try {
    // Sign in as the admin user
    console.log(`Signing in as ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('Error signing in:', authError.message);
      return false;
    }
    
    console.log('Successfully signed in');
    
    // Check if the user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error('Error checking admin status:', userError.message);
      return false;
    }
    
    if (!userData?.is_admin) {
      console.error('User is not an admin');
      return false;
    }
    
    console.log('User is an admin');
    
    // Try to fetch all users
    console.log('Fetching all users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error fetching users:', usersError.message);
      return false;
    }
    
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('No users found');
      return false;
    }
    
    console.log('User details:');
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.full_name || 'Not provided'}`);
      console.log(`  Admin: ${user.is_admin ? 'Yes' : 'No'}`);
      console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error testing admin dashboard:', error.message);
    return false;
  }
}

async function main() {
  const success = await testAdminDashboard();
  
  if (success) {
    console.log('\n=== SUCCESS ===');
    console.log('Admin dashboard test passed');
  } else {
    console.log('\n=== FAILED ===');
    console.log('Admin dashboard test failed');
  }
  
  // Sign out
  await supabase.auth.signOut();
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
