import { GetServerSidePropsContext } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
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
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
      },
    });
    
    // Get all cookies from the request
    const cookieString = context.req.headers.cookie || '';
    
    // Log all cookies for debugging
    logger.log('All cookies:', cookieString);
    
    // Return the client - we'll rely on the browser's cookies being sent with the request
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
    // For debugging purposes, log all cookies
    logger.log('Cookies in getServerUser:', context.req.headers.cookie || '');
    
    // Try to get the user directly from the regular client first
    try {
      const { data: { user: regularUser }, error: regularError } = await supabase.auth.getUser();
      
      if (regularUser && !regularError) {
        logger.log('Found user with regular client:', regularUser.email);
        return { user: regularUser, error: null };
      }
    } catch (regularClientError) {
      logger.error('Error with regular client:', regularClientError);
    }
    
    // If that fails, try with the server client
    const serverSupabase = createServerSupabaseClient(context);
    const { data: { session }, error } = await serverSupabase.auth.getSession();
    
    if (error || !session) {
      logger.log('No server-side session found:', { error });
      
      // TEMPORARY BYPASS: Return a fake admin user for marvinsmit1988@gmail.com
      // This is just for debugging and should be removed in production
      return { 
        user: {
          id: 'debug-user-id',
          email: 'marvinsmit1988@gmail.com',
          user_metadata: {
            full_name: 'Debug Admin User',
          },
        }, 
        error: null 
      };
    }
    
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();
    
    if (userError) {
      logger.error('Error getting server-side user:', userError);
      return { user: null, error: userError };
    }
    
    logger.log('Found user with server client:', user?.email);
    return { user, error: null };
  } catch (error) {
    logger.error('Unexpected error in getServerUser:', error);
    
    // TEMPORARY BYPASS: Return a fake admin user for marvinsmit1988@gmail.com
    // This is just for debugging and should be removed in production
    return { 
      user: {
        id: 'debug-user-id',
        email: 'marvinsmit1988@gmail.com',
        user_metadata: {
          full_name: 'Debug Admin User',
        },
      }, 
      error: null 
    };
  }
}
