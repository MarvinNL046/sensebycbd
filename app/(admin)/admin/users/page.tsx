import { Suspense } from 'react';
import UsersClient from './users-client';
import { createClient } from '../../../../utils/supabase/server';

// Loading component
function UsersLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Gebruikersbeheer - Admin Dashboard',
};

export default async function UsersAdminPage() {
  // Fetch users from the server
  const supabase = await createClient();
  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name, is_admin, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Gebruikersbeheer</h1>
      <Suspense fallback={<UsersLoading />}>
        <UsersClient initialUsers={users || []} />
      </Suspense>
    </div>
  );
}
