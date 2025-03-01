// Script to fix the user trigger and synchronize users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function checkTrigger() {
  console.log('\n=== CHECKING USER TRIGGER ===');
  
  try {
    // Check if the trigger exists
    const { data: triggers, error: triggerError } = await supabaseAdmin.rpc(
      'pg_get_triggerdef',
      { p_trigger_name: 'on_auth_user_created' }
    );
    
    if (triggerError) {
      console.log('❌ Error checking trigger:', triggerError.message);
      console.log('Will attempt to recreate the trigger...');
    } else if (!triggers || triggers.length === 0) {
      console.log('❌ Trigger not found. Will recreate it...');
    } else {
      console.log('✅ Trigger exists:', triggers);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('❌ Error checking trigger:', error.message);
    console.log('Will attempt to recreate the trigger...');
    return false;
  }
}

async function recreateTrigger() {
  console.log('\n=== RECREATING USER TRIGGER ===');
  
  try {
    // First, drop the existing trigger if it exists
    const dropTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `;
    
    const { error: dropError } = await supabaseAdmin.rpc(
      'pg_execute',
      { p_statement: dropTriggerSQL }
    );
    
    if (dropError) {
      console.log('⚠️ Error dropping trigger (may not exist):', dropError.message);
    } else {
      console.log('✅ Successfully dropped existing trigger (if any)');
    }
    
    // Recreate the function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user() 
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.users (id, email, full_name, is_admin)
        VALUES (
          new.id, 
          new.email, 
          new.raw_user_meta_data->>'full_name',
          COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: functionError } = await supabaseAdmin.rpc(
      'pg_execute',
      { p_statement: createFunctionSQL }
    );
    
    if (functionError) {
      console.log('❌ Error creating function:', functionError.message);
      return false;
    }
    
    console.log('✅ Successfully created handle_new_user function');
    
    // Create the trigger
    const createTriggerSQL = `
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
    
    const { error: triggerError } = await supabaseAdmin.rpc(
      'pg_execute',
      { p_statement: createTriggerSQL }
    );
    
    if (triggerError) {
      console.log('❌ Error creating trigger:', triggerError.message);
      return false;
    }
    
    console.log('✅ Successfully created on_auth_user_created trigger');
    return true;
  } catch (error) {
    console.log('❌ Error recreating trigger:', error.message);
    return false;
  }
}

async function syncUsers() {
  console.log('\n=== SYNCHRONIZING USERS ===');
  
  try {
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, raw_user_meta_data');
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
      
      // Try alternative approach using RPC
      console.log('Trying alternative approach...');
      const { data: rpcUsers, error: rpcError } = await supabaseAdmin.rpc(
        'pg_execute_and_return',
        { 
          p_statement: `
            SELECT id, email, raw_user_meta_data 
            FROM auth.users
          `
        }
      );
      
      if (rpcError) {
        console.log('❌ Alternative approach failed:', rpcError.message);
        return false;
      }
      
      console.log(`✅ Found ${rpcUsers.length} users in auth.users`);
      
      // Get existing users from public.users
      const { data: publicUsers, error: publicError } = await supabaseAdmin
        .from('users')
        .select('id');
      
      if (publicError) {
        console.log('❌ Error fetching public users:', publicError.message);
        return false;
      }
      
      console.log(`✅ Found ${publicUsers.length} users in public.users`);
      
      // Find users that need to be synchronized
      const existingIds = new Set(publicUsers.map(user => user.id));
      const usersToSync = rpcUsers.filter(user => !existingIds.has(user.id));
      
      console.log(`ℹ️ Found ${usersToSync.length} users that need to be synchronized`);
      
      if (usersToSync.length === 0) {
        console.log('✅ No users need to be synchronized');
        return true;
      }
      
      // Insert missing users
      for (const user of usersToSync) {
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.raw_user_meta_data?.full_name || null,
            is_admin: user.raw_user_meta_data?.is_admin || false
          });
        
        if (insertError) {
          console.log(`❌ Error inserting user ${user.email}:`, insertError.message);
        } else {
          console.log(`✅ Successfully inserted user ${user.email}`);
        }
      }
      
      return true;
    }
    
    console.log(`✅ Found ${authUsers.length} users in auth.users`);
    
    // Get existing users from public.users
    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('id');
    
    if (publicError) {
      console.log('❌ Error fetching public users:', publicError.message);
      return false;
    }
    
    console.log(`✅ Found ${publicUsers.length} users in public.users`);
    
    // Find users that need to be synchronized
    const existingIds = new Set(publicUsers.map(user => user.id));
    const usersToSync = authUsers.filter(user => !existingIds.has(user.id));
    
    console.log(`ℹ️ Found ${usersToSync.length} users that need to be synchronized`);
    
    if (usersToSync.length === 0) {
      console.log('✅ No users need to be synchronized');
      return true;
    }
    
    // Insert missing users
    for (const user of usersToSync) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.raw_user_meta_data?.full_name || null,
          is_admin: user.raw_user_meta_data?.is_admin || false
        });
      
      if (insertError) {
        console.log(`❌ Error inserting user ${user.email}:`, insertError.message);
      } else {
        console.log(`✅ Successfully inserted user ${user.email}`);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error synchronizing users:', error.message);
    return false;
  }
}

async function fixUserTrigger() {
  console.log('\n=== FIXING USER TRIGGER AND SYNCHRONIZING USERS ===\n');
  
  // Step 1: Check if the trigger exists
  const triggerExists = await checkTrigger();
  
  // Step 2: Recreate the trigger if needed
  if (!triggerExists) {
    const triggerCreated = await recreateTrigger();
    if (!triggerCreated) {
      console.log('⚠️ Failed to recreate trigger. Will still attempt to synchronize users.');
    }
  }
  
  // Step 3: Synchronize users
  const usersSynced = await syncUsers();
  
  if (!usersSynced) {
    console.log('⚠️ Failed to synchronize users.');
  }
  
  // Step 4: Try direct SQL approach if previous methods failed
  if (!usersSynced) {
    console.log('\n=== TRYING DIRECT SQL APPROACH ===');
    
    try {
      const syncSQL = `
        INSERT INTO public.users (id, email, full_name, is_admin)
        SELECT id, email, raw_user_meta_data->>'full_name', false
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.users);
      `;
      
      const { error: syncError } = await supabaseAdmin.rpc(
        'pg_execute',
        { p_statement: syncSQL }
      );
      
      if (syncError) {
        console.log('❌ Direct SQL approach failed:', syncError.message);
      } else {
        console.log('✅ Successfully synchronized users using direct SQL');
      }
    } catch (error) {
      console.log('❌ Error with direct SQL approach:', error.message);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  if (triggerExists || await checkTrigger()) {
    console.log('✅ User trigger is now properly set up');
  } else {
    console.log('⚠️ Could not verify user trigger setup');
  }
  
  console.log('✅ User synchronization process completed');
  console.log('\nPlease check your admin dashboard to verify that users are now visible.');
}

fixUserTrigger().catch(error => {
  console.error('❌ Unhandled error:', error.message);
  console.error(error);
});
