// Script to make a user an admin
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

// Create regular client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create admin client if service role key is available
const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Error: Please provide a user email as an argument');
  console.error('Usage: node scripts/make-user-admin.js user@example.com');
  process.exit(1);
}

async function makeUserAdmin(email) {
  console.log(`Attempting to make user ${email} an admin...`);
  
  try {
    // First try with the admin client if available
    if (supabaseAdmin) {
      console.log('Using admin client with service role key...');
      
      // Try to get the user from auth.users
      const { data: authUser, error: authError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (authError) {
        console.log('Could not access auth.users table:', authError.message);
        console.log('Falling back to public.users table...');
      } else if (authUser) {
        console.log(`Found user with ID: ${authUser.id}`);
        
        // Update the user in public.users
        const { data, error } = await supabaseAdmin
          .from('users')
          .update({ is_admin: true })
          .eq('id', authUser.id);
        
        if (error) {
          console.error('Error updating user:', error.message);
        } else {
          console.log(`✅ Successfully made ${email} an admin!`);
          return true;
        }
      }
    }
    
    // Fallback to regular client
    console.log('Using regular client...');
    
    // Try to get the user from public.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError.message);
      return false;
    }
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      return false;
    }
    
    console.log(`Found user with ID: ${user.id}`);
    
    // Update the user
    const { error } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating user:', error.message);
      return false;
    }
    
    console.log(`✅ Successfully made ${email} an admin!`);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  const success = await makeUserAdmin(userEmail);
  
  if (success) {
    console.log('\nThe user is now an admin and should be able to access the admin dashboard.');
    console.log('Please check your admin dashboard at https://www.sensebycbd.com/admin');
  } else {
    console.log('\nFailed to make the user an admin.');
    console.log('Please make sure:');
    console.log('1. You have run the SQL migration in the Supabase dashboard');
    console.log('2. The user exists in your Supabase auth system');
    console.log('3. The user has been synchronized to the public.users table');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
