import { GetServerSidePropsContext } from 'next';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import logger from './utils/logger';

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
    // Get the current user from the server-side session
    const { user } = await getCurrentUser();
    
    // If no user is logged in, redirect to login
    if (!user) {
      logger.log('No user logged in, redirecting to login');
      return {
        redirect: {
          destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
        },
      };
    }
    
    // Check if user is admin
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    logger.log('Server-side admin check:', { userData, error, userId: user.id });
    
    if (error) {
      logger.error('Error checking admin status:', error);
      return {
        redirect: {
          destination: '/',
          permanent: false,
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
      },
    };
  } catch (error) {
    logger.error('Unexpected error in checkAdminAuth:', error);
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
