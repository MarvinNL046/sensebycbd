import { GetServerSidePropsContext } from 'next';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { getServerUser, createServerSupabaseClient } from './supabase-server';
import logger from './utils/logger';

// List of admin email addresses that should always have access
// This is a temporary solution until the server-side authentication is fixed
const ADMIN_EMAILS = [
  'marvinsmit1988@gmail.com',
  // Add other admin emails here
];

// TEMPORARY DEBUG MODE - Set to true to enable debug mode
// This will bypass all authentication checks and allow access to the admin panel
const DEBUG_MODE = true;

/**
 * Server-side admin authentication check
 * 
 * This function checks if the current user is an admin and redirects to the homepage if not.
 * It should be used in getServerSideProps of admin pages.
 * 
 * @param context The GetServerSideProps context
 * @returns An object with props or redirect
 */
export async function checkAdminAuth(context: GetServerSidePropsContext) {
  try {
    // If debug mode is enabled, allow access to the admin panel
    if (DEBUG_MODE) {
      logger.log('DEBUG MODE ENABLED - Bypassing authentication checks');
      return {
        props: {
          user: {
            id: 'debug-user-id',
            email: 'marvinsmit1988@gmail.com',
            user_metadata: {
              full_name: 'Debug Admin User',
            },
          },
          isAdminByEmail: true,
          debugMode: true,
        },
      };
    }
    
    // Try to get the user from the server-side session
    const { user } = await getServerUser(context);
    
    // If no user is found in server-side session, redirect to login
    if (!user) {
      logger.log('No user found in server-side session, redirecting to login');
      return {
        redirect: {
          destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
        },
      };
    }
    
    // Log the user for debugging
    logger.log('User found in server-side session:', { email: user.email, id: user.id });
    
    // Check if user's email is in the admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      logger.log('User is in admin email list, allowing access');
      return {
        props: {
          user,
          isAdminByEmail: true,
        },
      };
    }
    
    // Create a server-side Supabase client
    const serverSupabase = createServerSupabaseClient(context);
    
    // Check if user is admin
    const { data: userData, error } = await serverSupabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    logger.log('Server-side admin check:', { userData, error, userId: user.id });
    
    // If there's an error checking admin status, try with the regular client
    if (error) {
      logger.error('Error checking admin status with server client, trying regular client:', error);
      
      // Try with the regular Supabase client
      const { data: regularUserData, error: regularError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      logger.log('Regular client admin check:', { regularUserData, regularError, userId: user.id });
      
      // If there's still an error or user is not admin, redirect to homepage
      if (regularError || !regularUserData?.is_admin) {
        logger.log('User is not an admin or error occurred, redirecting to homepage');
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
      
      // User is an admin according to regular client
      return {
        props: {
          user,
          isAdmin: true,
        },
      };
    }
    
    // If user is not admin according to server client, redirect to homepage
    if (!userData?.is_admin) {
      logger.log('User is not an admin, redirecting to homepage');
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    
    // User is an admin, return the user object as props
    return {
      props: {
        user,
        isAdmin: true,
      },
    };
  } catch (error) {
    logger.error('Unexpected error in checkAdminAuth:', error);
    
    // For unexpected errors in production, redirect to homepage for safety
    // In debug mode, allow access with a warning
    if (DEBUG_MODE) {
      logger.log('DEBUG MODE ENABLED - Allowing access despite error');
      return {
        props: {
          user: {
            id: 'debug-user-id',
            email: 'marvinsmit1988@gmail.com',
            user_metadata: {
              full_name: 'Debug Admin User',
            },
          },
          isAdminByEmail: true,
          debugMode: true,
          error: String(error),
        },
      };
    }
    
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}

/**
 * Higher-order function to wrap getServerSideProps with admin authentication
 * 
 * @param getServerSidePropsFunc The original getServerSideProps function (optional)
 * @returns A new getServerSideProps function with admin authentication
 */
export function withAdminAuth(getServerSidePropsFunc?: Function) {
  return async (context: GetServerSidePropsContext) => {
    // Check admin authentication
    const authResult = await checkAdminAuth(context);
    
    // If there's a redirect, return it
    if ('redirect' in authResult) {
      return authResult;
    }
    
    // If there's a custom getServerSideProps function, call it
    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(context);
      
      // If the custom function returns a redirect, return it
      if ('redirect' in result) {
        return result;
      }
      
      // Merge the props from both functions
      return {
        props: {
          ...authResult.props,
          ...result.props,
        },
      };
    }
    
    // Otherwise, just return the auth result
    return authResult;
  };
}
