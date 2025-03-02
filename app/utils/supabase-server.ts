import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '../../lib/utils/logger';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This will throw in middleware, but we can safely ignore it
            logger.error('Error setting cookie in server component:', error);
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This will throw in middleware, but we can safely ignore it
            logger.error('Error removing cookie in server component:', error);
          }
        },
      },
    }
  );
};

export async function getServerUser() {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    logger.log('No server-side session found:', { sessionError });
    return { user: null, error: sessionError };
  }
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    logger.error('Error getting server-side user:', userError);
    return { user: null, error: userError };
  }
  
  logger.log('Found user with server client:', user?.email);
  return { user, error: null };
}

export async function checkAdminAuth() {
  try {
    // Try to get the user from the server-side session
    const { user, error } = await getServerUser();
    
    // If no user is found in server-side session, return false
    if (!user || error) {
      logger.log('No user found in server-side session');
      return { isAdmin: false, user: null };
    }
    
    // Log the user for debugging
    logger.log('User found in server-side session:', { email: user.email, id: user.id });
    
    // Check if user's email is in the admin list
    const ADMIN_EMAILS = ['marvinsmit1988@gmail.com'];
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      logger.log('User is in admin email list, allowing access');
      return { isAdmin: true, user, isAdminByEmail: true };
    }
    
    // Check if user is admin in the database
    const supabase = createClient();
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    logger.log('Server-side admin check:', { userData, dbError, userId: user.id });
    
    // If there's an error or user is not admin, return false
    if (dbError || !userData?.is_admin) {
      logger.log('User is not an admin or error occurred');
      return { isAdmin: false, user };
    }
    
    // User is an admin, return true
    return { isAdmin: true, user };
  } catch (error) {
    logger.error('Unexpected error in checkAdminAuth:', error);
    return { isAdmin: false, user: null, error };
  }
}
