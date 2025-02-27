import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SEO } from '../../lib/seo/SEO';
import { useAuth } from '../../lib/auth-context';
import { signOut } from '../../lib/auth';
import { getUserProfile, updateUserProfile } from '../../lib/db';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { AuthForm } from '../../components/ui/AuthForm';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  loyalty_points: number;
};

export default function AccountPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch user profile from database
  const fetchUserProfile = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      const { data, error } = await getUserProfile(user.id);
      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load user profile when user is authenticated
  useEffect(() => {
    if (user && !profile) {
      fetchUserProfile();
    }
  }, [user, profile]);

  // Update form fields when profile is loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAddress(profile.address || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      const { error } = await updateUserProfile(user.id, {
        full_name: fullName,
        address,
        phone,
      });
      
      if (error) throw error;
      
      setUpdateSuccess(true);
      fetchUserProfile(); // Refresh profile data
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update profile');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // If loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="container-custom py-10">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  // If not authenticated, show auth form
  if (!user) {
    return (
      <div className="container-custom py-10">
        <SEO 
          title="Account | SenseBy CBD"
          description="Sign in to your SenseBy CBD account"
          keywords="account, sign in, login, register"
          canonicalPath="/account"
        />
        <h1 className="text-center text-primary mb-8">Account</h1>
        <AuthForm />
      </div>
    );
  }

  // If authenticated, show account page
  return (
    <div className="container-custom py-10">
      <SEO 
        title="My Account | SenseBy CBD"
        description="Manage your SenseBy CBD account"
        keywords="account, profile, orders, loyalty points"
        canonicalPath="/account"
      />
      
      <h1 className="text-center text-primary mb-8">My Account</h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-heading font-bold mb-2">
              {profile?.full_name || user.email}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          
          {profile && (
            <div className="mb-6">
              <h3 className="text-lg font-heading font-bold mb-2">Loyalty Points</h3>
              <p className="text-2xl text-primary">{profile.loyalty_points}</p>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className="w-full btn-outline"
          >
            Sign Out
          </button>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Profile form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-heading font-bold mb-4">Profile Information</h2>
            
            {updateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Profile updated successfully!
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {updateError}
              </div>
            )}
            
            {loadingProfile ? (
              <p>Loading profile...</p>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <button type="submit" className="btn-primary">
                  Update Profile
                </button>
              </form>
            )}
          </div>
          
          {/* Order history placeholder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-heading font-bold mb-4">Order History</h2>
            <p className="text-gray-600">
              Your order history will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
