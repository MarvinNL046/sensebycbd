/**
 * Admin Helper Script
 * 
 * This script can be run in the browser console to check and update the admin status of the current user.
 * 
 * Usage:
 * 1. Open your browser console (F12 or right-click > Inspect > Console)
 * 2. Copy and paste this entire script into the console
 * 3. Run the functions as needed:
 *    - checkAdminStatus() - Check if the current user is an admin
 *    - makeAdmin() - Make the current user an admin
 */

// Check if the current user is an admin
async function checkAdminStatus() {
  try {
    // Get the current session
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session. Please log in first.');
      return;
    }
    
    const userId = session.user.id;
    console.log('Current user ID:', userId);
    
    // Check if user exists in the users table
    const { data: userData, error: userError } = await window.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return;
    }
    
    if (!userData) {
      console.error('User not found in the users table.');
      return;
    }
    
    console.log('User data:', userData);
    console.log('Admin status:', userData.is_admin ? 'Yes' : 'No');
    
    return userData;
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
}

// Make the current user an admin
async function makeAdmin() {
  try {
    // Get the current session
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session. Please log in first.');
      return;
    }
    
    const userId = session.user.id;
    console.log('Current user ID:', userId);
    
    // Update the user's admin status
    const { data, error } = await window.supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating admin status:', error);
      return;
    }
    
    console.log('Admin status updated successfully!');
    console.log('Please refresh the page or sign out and sign back in to apply the changes.');
    
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

// Check if Supabase is available
if (typeof window.supabase === 'undefined') {
  console.error('Supabase client not found. Make sure you are on a page that initializes Supabase.');
} else {
  console.log('Admin Helper Script loaded successfully!');
  console.log('Available functions:');
  console.log('- checkAdminStatus() - Check if the current user is an admin');
  console.log('- makeAdmin() - Make the current user an admin');
}
