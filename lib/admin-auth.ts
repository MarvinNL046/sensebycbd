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
    // Try to get the user from the server-side session
    const { user } = await getServerUser(context);
    
    // If no user is found in server-side session, try client-side session
    if (!user) {
      logger.log('No user found in server-side session, falling back to client-side');
      
      // For server-side rendering, we'll allow the page to render
      // and let the client-side check handle the authentication
      return {
        props: {
          serverSideAuthFailed: true,
        },
      };
    }
    
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
    
    if (error) {
      logger.error('Error checking admin status:', error);
      
      // For server-side rendering, we'll allow the page to render
      // and let the client-side check handle the authentication
      return {
        props: {
          user,
          serverSideAuthFailed: true,
        },
      };
    }
    
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
    
    // For server-side rendering, we'll allow the page to render
    // and let the client-side check handle the authentication
    return {
      props: {
        serverSideAuthFailed: true,
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
