'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { signOut } from '../../../lib/auth';
import { getUserProfile, updateUserProfile, getUserOrders, getLoyaltyPoints } from '../../../lib/db';
import { useTranslation } from '../../../app/lib/useTranslation';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { FormInput, FormTextarea } from '../../../components/ui/FormInput';

// Icons components
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LoadingIcon = ({ size = 20, className = "" }) => (
  <svg className={`animate-spin ${className}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  loyalty_points: number;
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_info: any;
  payment_info: any;
  loyalty_points_earned: number;
  order_items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      image_url: string;
      price: number;
      sale_price: number | null;
    };
    quantity: number;
    price: number;
  }>;
};

interface AccountClientProps {
  translations: {
    account: {
      title: string;
      profile: string;
      orders: string;
      loyaltyPoints: string;
      signOut: string;
      profileInfo: string;
      updateSuccess: string;
      fullName: string;
      address: string;
      phone: string;
      updateProfile: string;
      orderHistory: string;
      noOrders: string;
      orderNumber: string;
      orderDate: string;
      orderStatus: string;
      orderTotal: string;
      viewOrder: string;
      pointsInfo: string;
      pointsBalance: string;
      pointsEarned: string;
      pointsUsed: string;
      howToEarn: string;
      earnRule1: string;
      earnRule2: string;
      earnRule3: string;
      howToUse: string;
      useRule1: string;
      useRule2: string;
      useRule3: string;
    };
  };
}

export default function AccountClient({ translations }: AccountClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { locale } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'points'>('profile');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Fetch user profile from database - wrapped in useCallback to prevent infinite renders
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      const { data, error } = await getUserProfile(user.id);
      if (error) throw error;
      setProfile(data as UserProfile);
      
      // Get loyalty points
      const { data: points } = await getLoyaltyPoints(user.id);
      setLoyaltyPoints(points);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]); // Only depends on user

  // Fetch user orders - wrapped in useCallback to prevent infinite renders
  const fetchUserOrders = useCallback(async () => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      const { data, error } = await getUserOrders(user.id);
      if (error) throw error;
      setOrders(data as Order[]);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]); // Only depends on user

  // Load user profile when user is authenticated or when the page is focused
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserOrders();
    }
  }, [user, fetchUserProfile, fetchUserOrders]);
  
  // Update form fields when profile is loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAddress(profile.address || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Form validation
  const [errors, setErrors] = useState<{
    fullName?: string;
    address?: string;
    phone?: string;
  }>({});
  
  // Validate form fields
  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      address?: string;
      phone?: string;
    } = {};
    
    if (fullName.trim().length < 2) {
      newErrors.fullName = 'Naam moet minimaal 2 karakters bevatten';
    }
    
    // Phone validation (optional field)
    if (phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone)) {
      newErrors.phone = 'Voer een geldig telefoonnummer in';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setUpdateSuccess(false);
    setUpdateError(null);
    setLoadingProfile(true);
    
    try {
      console.log('Updating profile for user:', user.id);
      const { error } = await updateUserProfile(user.id, {
        full_name: fullName,
        address,
        phone,
      });
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      setUpdateSuccess(true);
      fetchUserProfile(); // Refresh profile data
    } catch (err: any) {
      console.error('Profile update error details:', err);
      let errorMessage = 'Profiel bijwerken mislukt';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.code) {
        errorMessage += ` (Error code: ${err.code})`;
      }
      
      setUpdateError(errorMessage);
    } finally {
      setLoadingProfile(false);
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
        <h1 className="text-center text-primary mb-8">Account</h1>
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <p className="text-center mb-6">Please log in to access your account</p>
          <Link href={`/${locale}/login`} className="block w-full">
            <Button className="w-full">Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If authenticated, show account page
  return (
    <div className="container-custom py-10">
      <h1 className="text-center text-primary mb-8">{translations.account.title}</h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-heading font-bold mb-2">
              {profile?.full_name || user.email}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          
          {/* Loyalty Points Summary */}
          <div className="mb-6 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-heading font-bold mb-2">{translations.account.loyaltyPoints}</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-primary">{loyaltyPoints}</span>
              <span className="ml-2 text-sm text-gray-600">points</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mb-6 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'profile' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {translations.account.profile}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'orders' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {translations.account.orders}
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'points' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {translations.account.loyaltyPoints}
            </button>
          </nav>
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full"
          >
            {translations.account.signOut}
          </Button>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.account.profileInfo}
              </h2>
              
              {updateSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                  <CheckIcon />
                  <span className="ml-2">{translations.account.updateSuccess}</span>
                </div>
              )}
              
              {updateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                  <AlertIcon />
                  <span className="ml-2">{updateError}</span>
                </div>
              )}
              
              {loadingProfile && !updateSuccess && !updateError ? (
                <div className="flex items-center justify-center p-12">
                  <LoadingIcon size={32} className="text-primary" />
                  <span className="ml-2">Profiel laden...</span>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <FormInput
                    id="fullName"
                    label={translations.account.fullName}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Uw volledige naam"
                    icon={<UserIcon />}
                    error={errors.fullName}
                    required
                    autoComplete="name"
                  />
                  
                  <FormTextarea
                    id="address"
                    label={translations.account.address}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="Uw volledige adres"
                    error={errors.address}
                    autoComplete="street-address"
                  />
                  
                  <FormInput
                    id="phone"
                    label={translations.account.phone}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+31 6 12345678"
                    icon={<PhoneIcon />}
                    error={errors.phone}
                    autoComplete="tel"
                  />
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loadingProfile}
                      className="w-full sm:w-auto"
                    >
                      {loadingProfile ? (
                        <>
                          <LoadingIcon className="mr-2" />
                          Bijwerken...
                        </>
                      ) : (
                        translations.account.updateProfile
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.account.orderHistory}
              </h2>
              
              {loadingOrders ? (
                <div className="flex items-center justify-center p-12">
                  <LoadingIcon size={32} className="text-primary" />
                  <span className="ml-2">Bestellingen laden...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-gray-600 mb-6">
                    {translations.account.noOrders}
                  </p>
                  <Link href={`/${locale}/products`}>
                    <Button>
                      Shop Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                      {/* Order header */}
                      <div className="bg-gray-50 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">{translations.account.orderNumber}</div>
                          <div className="font-medium">#{order.id.slice(0, 8)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">{translations.account.orderDate}</div>
                          <div>{formatDate(order.created_at)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">{translations.account.orderStatus}</div>
                          <Badge variant={getStatusColor(order.status) as any}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">{translations.account.orderTotal}</div>
                          <div className="font-medium">{formatPrice(order.total_amount)}</div>
                        </div>
                      </div>
                      
                      {/* Order items */}
                      <div className="p-4">
                        <div className="space-y-4">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <div className="w-16 h-16 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover rounded"
                                />
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">{item.product.name}</h4>
                                    <div className="text-sm text-gray-500">
                                      {item.quantity} × {formatPrice(item.price)}
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Loyalty points earned */}
                        {order.loyalty_points_earned > 0 && (
                          <div className="mt-4 text-sm text-green-600 flex items-center">
                            <CheckIcon />
                            <span className="ml-1">{order.loyalty_points_earned} loyalty points verdiend met deze bestelling</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Loyalty Points Tab */}
          {activeTab === 'points' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.account.pointsInfo}
              </h2>
              
              <div className="mb-8">
                <div className="bg-primary/10 p-8 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-2">{translations.account.pointsBalance}</div>
                  <div className="text-5xl font-bold text-primary">{loyaltyPoints}</div>
                  <div className="mt-2 text-sm text-gray-600">
                    {loyaltyPoints === 1 ? 'punt' : 'punten'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-heading font-bold mb-4 text-primary flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {translations.account.howToEarn}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start bg-white p-3 rounded-md shadow-sm">
                      <CheckIcon />
                      <span className="ml-2">{translations.account.earnRule1}</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-md shadow-sm">
                      <CheckIcon />
                      <span className="ml-2">{translations.account.earnRule2}</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-md shadow-sm">
                      <CheckIcon />
                      <span className="ml-2">{translations.account.earnRule3}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-heading font-bold mb-4 text-primary flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    {translations.account.howToUse}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start bg-white p-3 rounded-md shadow-sm">
                      <CheckIcon />
                      <span className="ml-2">{translations.account.useRule1}</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-md shadow-sm">
                      <CheckIcon />
                      <span className="ml-2">{translations.account.useRule2}</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-md shadow-sm">
                      <CheckIcon />
                      <span className="ml-2">{translations.account.useRule3}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <Link href={`/${locale}/products`}>
                  <Button size="lg" className="px-8">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
