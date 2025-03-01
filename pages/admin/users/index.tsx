import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Search, 
  ArrowUpDown,
  Eye,
  AlertCircle,
  Check,
  X,
  Shield,
  ShieldOff
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  loyalty_points: number;
  is_admin: boolean;
  created_at: string;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'full_name' | 'email'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
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
    }
    
    fetchUsers();
  }, [sortField, sortDirection]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    searchTerm === '' || 
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.includes(searchTerm))
  );

  // Handle sort
  const handleSort = (field: 'created_at' | 'full_name' | 'email') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // View user details
  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  // Toggle admin status
  const toggleAdminStatus = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdateError('');
      setUpdateSuccess('');
      
      const newAdminStatus = !selectedUser.is_admin;
      
      const { error } = await supabase
        .from('users')
        .update({ is_admin: newAdminStatus })
        .eq('id', selectedUser.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, is_admin: newAdminStatus } : u
      ));
      
      setSelectedUser(prev => prev ? { ...prev, is_admin: newAdminStatus } : null);
      setUpdateSuccess(`User is ${newAdminStatus ? 'now an admin' : 'no longer an admin'}`);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update admin status');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout title="Users Management">
      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
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
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center">
                      Name
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Joined
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'No name provided'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_admin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                User Details
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUserDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Error and Success Messages */}
            {updateError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{updateError}</p>
              </div>
            )}
            
            {updateSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{updateSuccess}</p>
              </div>
            )}
            
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name:</p>
                  <p className="text-sm font-medium">{selectedUser.full_name || 'No name provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phone:</p>
                  <p className="text-sm font-medium">{selectedUser.phone || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Joined:</p>
                  <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Role:</p>
                  <p className="text-sm font-medium">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedUser.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.is_admin ? 'Admin' : 'Customer'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Loyalty Points:</p>
                  <p className="text-sm font-medium">{selectedUser.loyalty_points || 0}</p>
                </div>
              </div>
              
              {selectedUser.address && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Address:</p>
                  <p className="text-sm font-medium whitespace-pre-line">{selectedUser.address}</p>
                </div>
              )}
            </div>
            
            {/* Admin Actions */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Actions</h4>
              
              <div className="flex space-x-4">
                <Button 
                  variant={selectedUser.is_admin ? 'destructive' : 'default'}
                  onClick={toggleAdminStatus}
                >
                  {selectedUser.is_admin ? (
                    <>
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Remove Admin Rights
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Make Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Close Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline"
                onClick={() => setShowUserDetails(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
