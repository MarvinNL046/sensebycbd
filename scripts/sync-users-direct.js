// Script to synchronize users from auth to public.users table with direct credentials
const { createClient } = require('@supabase/supabase-js');

// Get credentials from command line arguments
const supabaseUrl = process.argv[2];
const serviceRoleKey = process.argv[3];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Usage: node scripts/sync-users-direct.js SUPABASE_URL SERVICE_ROLE_KEY [ADMIN_EMAIL]');
  console.error('Example: node scripts/sync-users-direct.js https://tkihdbdnowkpazahzfyp.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
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

// Get email from command line arguments to make admin (optional)
const adminEmail = process.argv[4];

async function syncUsers() {
  console.log('\n=== SYNCHRONIZING USERS ===\n');
  
  try {
    // First, get all users from the auth system
    console.log('Fetching users from auth system...');
    
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError.message);
      return false;
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log('No users found in auth system');
      return false;
    }
    
    console.log(`Found ${authUsers.users.length} users in auth system`);
    
    // Get existing users from public.users
    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (publicError) {
      console.error('Error fetching public users:', publicError.message);
      return false;
    }
    
    console.log(`Found ${publicUsers ? publicUsers.length : 0} users in public.users table`);
    
    if (publicUsers && publicUsers.length > 0) {
      console.log('Public users:');
      publicUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.id})`);
      });
    }
    
    // Find users that need to be synchronized
    const existingIds = new Set((publicUsers || []).map(user => user.id));
    const usersToSync = authUsers.users.filter(user => !existingIds.has(user.id));
    
    console.log(`Found ${usersToSync.length} users that need to be synchronized`);
    
    if (usersToSync.length === 0) {
      console.log('No users need to be synchronized');
      
      // If an admin email was provided, make that user an admin
      if (adminEmail) {
        return await makeUserAdmin(adminEmail);
      }
      
      return true;
    }
    
    // Insert missing users
    for (const user of usersToSync) {
      console.log(`Synchronizing user: ${user.email}`);
      
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          is_admin: user.user_metadata?.is_admin || false,
          created_at: user.created_at
        });
      
      if (insertError) {
        console.error(`Error inserting user ${user.email}:`, insertError.message);
      } else {
        console.log(`✅ Successfully inserted user ${user.email}`);
      }
    }
    
    console.log('\n✅ User synchronization completed');
    
    // If an admin email was provided, make that user an admin
    if (adminEmail) {
      return await makeUserAdmin(adminEmail);
    }
    
    return true;
  } catch (error) {
    console.error('Error synchronizing users:', error.message);
    return false;
  }
}

async function makeUserAdmin(email) {
  console.log(`\n=== MAKING USER ${email} AN ADMIN ===\n`);
  
  try {
    // Find the user by email
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_admin')
      .eq('email', email);
    
    if (userError) {
      console.error('Error finding user:', userError.message);
      return false;
    }
    
    if (!users || users.length === 0) {
      console.error(`User with email ${email} not found`);
      return false;
    }
    
    const user = users[0];
    
    if (user.is_admin) {
      console.log(`User ${email} is already an admin`);
      return true;
    }
    
    // Update the user to make them an admin
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_admin: true })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error making user an admin:', updateError.message);
      return false;
    }
    
    console.log(`✅ Successfully made ${email} an admin`);
    return true;
  } catch (error) {
    console.error('Error making user an admin:', error.message);
    return false;
  }
}

async function main() {
  const success = await syncUsers();
  
  if (success) {
    console.log('\n=== SUCCESS ===');
    console.log('Users have been synchronized from auth to public.users table');
    
    if (adminEmail) {
      console.log(`User ${adminEmail} has been made an admin`);
    }
    
    console.log('\nYou should now be able to see all users in your admin dashboard at:');
    console.log('https://www.sensebycbd.com/admin/users');
  } else {
    console.log('\n=== FAILED ===');
    console.log('Failed to synchronize users');
    console.log('Please check the error messages above for more information');
  }
  
  // Now let's check if users are in the public.users table
  console.log('\n=== CHECKING USERS IN PUBLIC.USERS TABLE ===\n');
  
  try {
    // Get users from public.users
    const { data: users, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      console.log('Error details:', JSON.stringify(error));
      return;
    }
    
    console.log(`✅ Found ${users ? users.length : 0} users in the public.users table (count: ${count})`);
    
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
  } catch (error) {
    console.log('❌ Error checking users:', error.message);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
