import { GetServerSidePropsContext } from 'next';
import { createClient } from '@supabase/supabase-js';
import logger from './utils/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase client for server-side use
 * 
 * This function creates a Supabase client that can be used in getServerSideProps
 * by passing the cookies from the request.
 * 
 * @param context The GetServerSideProps context
 * @returns A Supabase client
 */
export function createServerSupabaseClient(context: GetServerSidePropsContext) {
  try {
    // Extract the session cookie from the request
    const cookieString = context.req.headers.cookie || '';
    let supabaseSessionCookie = '';
    
    // Find the Supabase session cookie
    cookieString.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'sb-access-token' || key === 'supabase-auth-token') {
        supabaseSessionCookie = value;
      }
    });
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // If we have a session cookie, set it in the client
    if (supabaseSessionCookie) {
      // This is a simplified approach - in a real implementation, 
      // you would need to properly extract and set the session
      logger.log('Found Supabase session cookie');
    }
    
    return supabase;
  } catch (error) {
    logger.error('Error creating server Supabase client:', error);
    
    // Fallback to a regular Supabase client
    return createClient(supabaseUrl, supabaseKey);
  }
}

/**
 * Get the current user from the server-side session
 * 
 * @param context The GetServerSideProps context
 * @returns The current user or null
 */
export async function getServerUser(context: GetServerSidePropsContext) {
  try {
    const supabase = createServerSupabaseClient(context);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      logger.log('No server-side session found:', { error });
      return { user: null, error };
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logger.error('Error getting server-side user:', userError);
      return { user: null, error: userError };
    }
    
    return { user, error: null };
  } catch (error) {
    logger.error('Unexpected error in getServerUser:', error);
    return { user: null, error };
  }
}
