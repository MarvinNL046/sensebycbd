import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';

export default function DebugAdmin() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch user data from the database
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      
      setUserLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setUserData(data);
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: `Error fetching user data: ${error.message}` });
      } finally {
        setUserLoading(false);
      }
    }
    
    if (!loading) {
      fetchUserData();
    }
  }, [user, loading]);

  // Make the current user an admin
  const makeAdmin = async () => {
    if (!user) return;
    
    setUpdateLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Refetch user data
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setUserData(data);
      setMessage({ type: 'success', text: 'You are now an admin! Try accessing the admin pages now.' });
    } catch (error: any) {
      console.error('Error making user admin:', error);
      setMessage({ type: 'error', text: `Error making user admin: ${error.message}` });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Debug Admin Access</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Debug Admin Access</h1>
        <Card className="p-6">
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
            <p className="text-yellow-700">You need to be logged in to use this page.</p>
            <Link href="/login" className="text-primary hover:underline mt-2 inline-block">
              Go to login page
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Debug Admin Access</h1>
      
      {message && (
        <div className="mb-6">
          {message.type === 'success' ? (
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-md flex items-start">
              <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <p className="text-green-700">{message.text}</p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <p className="text-red-700">{message.text}</p>
            </div>
          )}
        </div>
      )}
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">User ID:</p>
            <p className="font-mono">{user.id}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Email:</p>
            <p>{user.email}</p>
          </div>
          
          {userData && (
            <>
              <div>
                <p className="text-sm text-gray-500">Full Name:</p>
                <p>{userData.full_name || 'Not set'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Admin Status:</p>
                <p className={userData.is_admin ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {userData.is_admin ? 'Yes' : 'No'}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Make Yourself an Admin</h2>
        
        <p className="mb-4">
          If you&apos;re not an admin, you can use the button below to make yourself an admin. This will update your user record in the database.
        </p>
        
        <Button 
          onClick={makeAdmin} 
          disabled={updateLoading || (userData && userData.is_admin)}
        >
          {updateLoading ? 'Processing...' : userData && userData.is_admin ? 'You are already an admin' : 'Make me an admin'}
        </Button>
      </Card>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Admin Pages</h2>
        
        <ul className="space-y-2">
          <li>
            <Link href="/admin" className="text-primary hover:underline">Admin Dashboard</Link>
          </li>
          <li>
            <Link href="/admin/products" className="text-primary hover:underline">Products Management</Link>
          </li>
          <li>
            <Link href="/admin/categories" className="text-primary hover:underline">Categories Management</Link>
          </li>
          <li>
            <Link href="/admin/orders" className="text-primary hover:underline">Orders Management</Link>
          </li>
          <li>
            <Link href="/admin/users" className="text-primary hover:underline">Users Management</Link>
          </li>
          <li>
            <Link href="/admin/translations" className="text-primary hover:underline">Translations Management</Link>
          </li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">Troubleshooting Tips</h3>
        
        <ul className="list-disc pl-5 space-y-2">
          <li>
            If you&apos;ve made yourself an admin but still can&apos;t access admin pages, try signing out and signing back in.
          </li>
          <li>
            Check the browser console for any errors that might indicate what&apos;s going wrong.
          </li>
          <li>
            Make sure your user ID matches the one you updated in the database.
          </li>
          <li>
            If you&apos;re still having issues, try clearing your browser cache and cookies.
          </li>
        </ul>
      </div>
    </div>
  );
}
