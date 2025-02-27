import { supabase } from './supabase';

export type SignUpCredentials = {
  email: string;
  password: string;
  full_name: string;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

/**
 * Sign up a new user
 */
export async function signUp({ email, password, full_name }: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });
  
  return { data, error };
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { user: null, error };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  return { user, error: null };
}
