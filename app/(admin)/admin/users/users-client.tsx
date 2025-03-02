'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Shield,
  ShieldOff,
  Trash2,
  AlertCircle,
  UserCog
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [sortField, setSortField] = useState<'email' | 'full_name' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Refresh users
  const refreshUsers = useCallback(async () => {
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, is_admin, created_at')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection]);

  // Effect to refresh users when sort changes
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Filter users based on search term and admin filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAdminFilter = 
      adminFilter === 'all' || 
      (adminFilter === 'admin' && user.is_admin) || 
      (adminFilter === 'user' && !user.is_admin);
    
    return matchesSearch && matchesAdminFilter;
  });

  // Handle sort
  const handleSort = (field: 'email' | 'full_name' | 'created_at') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle toggle admin status
  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    setActionLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update user in state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus } 
          : user
      ));
    } catch (error: any) {
      console.error('Error updating user admin status:', error);
      alert(`Fout bij het bijwerken van admin status: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    setActionLoading(true);
    
    try {
      const supabase = createClient();
      
      // First delete from auth.users (this will cascade to public.users due to the foreign key)
      const { error: authError } = await supabase.auth.admin.deleteUser(
        deleteUserId
      );
      
      if (authError) {
        throw authError;
      }
      
      // Remove user from state
      setUsers(users.filter(user => user.id !== deleteUserId));
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setDeleteError(error.message || 'Fout bij het verwijderen van gebruiker');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Zoek gebruikers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Admin Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value as 'all' | 'admin' | 'user')}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="all">Alle Gebruikers</option>
              <option value="admin">Alleen Admins</option>
              <option value="user">Alleen Gebruikers</option>
            </select>
          </div>
        </div>
        
        {/* Refresh Button */}
        <Button 
          onClick={refreshUsers}
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Laden...' : 'Vernieuwen'}
        </Button>
      </div>
      
      {/* Users Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center">
                      Naam
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Aangemaakt op
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.full_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_admin ? 'Admin' : 'Gebruiker'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                            disabled={actionLoading}
                            title={user.is_admin ? "Verwijder admin rechten" : "Maak admin"}
                          >
                            {user.is_admin ? (
                              <ShieldOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Shield className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setDeleteUserId(user.id);
                              setShowDeleteConfirm(true);
                            }}
                            disabled={actionLoading}
                            title="Verwijder gebruiker"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Geen gebruikers gevonden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Bevestig Verwijderen</h3>
            <p className="mb-4">Weet je zeker dat je deze gebruiker wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{deleteError}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteUserId(null);
                  setDeleteError('');
                }}
                disabled={actionLoading}
              >
                Annuleren
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? 'Bezig...' : 'Verwijderen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
