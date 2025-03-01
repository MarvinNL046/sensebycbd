import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { 
  LayoutGrid, 
  Package, 
  FolderTree, 
  Globe, 
  ShoppingCart, 
  Users, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;
      
      if (!user) {
        router.push('/login?redirect=' + router.asPath);
        return;
      }
      
      // Check if user is admin
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      console.log('Admin check:', { userData, error, userId: user.id });
      
      if (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
        return;
      }
      
      if (!userData?.is_admin) {
        console.log('User is not an admin, redirecting to homepage');
        router.push('/');
      } else {
        console.log('User is an admin, allowing access');
      }
    };
    
    checkAuth();
  }, [user, loading, router]);
  
  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  // Navigation items
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { href: '/admin/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { href: '/admin/categories', label: 'Categories', icon: <FolderTree className="w-5 h-5" /> },
    { href: '/admin/translations', label: 'Translations', icon: <Globe className="w-5 h-5" /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  ];
  
  // If still loading or not authenticated, show loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/admin" className="text-xl font-bold text-primary">
              SenseBy Admin
            </Link>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href || 
                (item.href !== '/admin' && router.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={handleSignOut}
            className="flex-shrink-0 group block w-full"
          >
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user.email}
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center">
                  <LogOut className="w-3 h-3 mr-1" />
                  Sign out
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white shadow-sm py-2 px-4 flex items-center justify-between">
        <Link href="/admin" className="text-xl font-bold text-primary">
          SenseBy Admin
        </Link>
        
        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          onClick={() => {
            // Toggle mobile menu
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
              mobileMenu.classList.toggle('hidden');
            }
          }}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      <div id="mobile-menu" className="md:hidden hidden bg-white shadow-sm absolute w-full z-10">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href || 
              (item.href !== '/admin' && router.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </div>
              </Link>
            );
          })}
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <div className="flex items-center">
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Sign out</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
