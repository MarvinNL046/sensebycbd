import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Create a Supabase client with the service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This client should only be used on the server side or in admin-protected routes
export const supabaseAdmin = typeof serviceRoleKey === 'string' && typeof supabaseUrl === 'string' 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;
import { User } from '@supabase/supabase-js';

/**
 * Supabase utility functions for common database operations
 */

/**
 * Authentication utilities
 */

// Get the current logged in user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Check if a user is logged in
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Sign up a new user
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

// Sign in a user
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// Sign out the current user
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Database utilities
 */

// Generic function to fetch data from any table
export async function fetchData<T>(
  table: string,
  columns: string = '*',
  filters: Record<string, any> = {},
  options: {
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  } = {}
): Promise<{ data: T[] | null; error: any }> {
  let query = supabase
    .from(table)
    .select(columns);
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }
  
  // Apply ordering
  if (options.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending !== false 
    });
  }
  
  const { data, error } = await query;
  
  // Ensure we return a properly typed result
  return { 
    data: data as T[] | null,
    error 
  };
}

// Generic function to insert data into any table
export async function insertData<T>(
  table: string,
  data: Record<string, any> | Record<string, any>[]
) {
  return supabase
    .from(table)
    .insert(data)
    .select();
}

// Generic function to update data in any table
export async function updateData(
  table: string,
  data: Record<string, any>,
  filters: Record<string, any>
) {
  let query = supabase
    .from(table)
    .update(data);
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  return query.select();
}

// Generic function to delete data from any table
export async function deleteData(
  table: string,
  filters: Record<string, any>
) {
  let query = supabase
    .from(table)
    .delete();
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  return query;
}

/**
 * Storage utilities
 */

// Upload a file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  return supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
}

// Get a public URL for a file
export function getPublicUrl(
  bucket: string,
  path: string
) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Delete a file from storage
export async function deleteFile(
  bucket: string,
  path: string
) {
  return supabase.storage
    .from(bucket)
    .remove([path]);
}

// Note: Real-time subscription utilities have been removed for now
// They can be added back later when needed with the correct API for Supabase v2

/**
 * Admin utilities (using service role key)
 * These functions should only be used in admin-protected routes
 */

// List all tables in the database
export async function listTables() {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Service role key not available')
    };
  }

  return supabaseAdmin
    .from('pg_tables')
    .select('schemaname, tablename')
    .eq('schemaname', 'public');
}

// Get table schema information
export async function getTableSchema(tableName: string) {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Service role key not available')
    };
  }

  return supabaseAdmin
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);
}

// Get all data from a table (admin access bypasses RLS)
export async function getTableData(tableName: string, limit: number = 100) {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Service role key not available')
    };
  }

  return supabaseAdmin
    .from(tableName)
    .select('*')
    .limit(limit);
}

// Execute a raw SQL query (use with caution)
export async function executeRawQuery(query: string, params?: any[]) {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Service role key not available')
    };
  }

  return supabaseAdmin.rpc('exec_sql', { query, params });
}

/**
 * Database health check
 */

// Check if the database connection is working
export async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
    
    return {
      connected: true,
      error: null,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
    };
  }
}
