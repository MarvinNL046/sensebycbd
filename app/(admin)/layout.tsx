import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
import { checkAdminAuth } from '../../utils/supabase/server';
import { createClient } from '../../utils/supabase/client';

// Navigation items
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
  { href: '/admin/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
  { href: '/admin/categories', label: 'Categories', icon: <FolderTree className="w-5 h-5" /> },
  { href: '/admin/translations', label: 'Translations', icon: <Globe className="w-5 h-5" /> },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side admin check
  const { isAdmin, user, isAdminByEmail } = await checkAdminAuth();
  
  // If not admin, redirect to homepage
  if (!isAdmin) {
    redirect('/');
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Debug mode banner for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-1 text-center text-xs z-50">
          Server-side admin check passed: {user?.email}
          {isAdminByEmail && ' (Admin by email)'}
        </div>
      )}
      
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/admin" className="text-xl font-bold text-primary">
              SenseBy Admin
            </Link>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <form action={async () => {
            'use client';
            const supabase = createClient();
            await supabase.auth.signOut();
          }}>
            <button
              type="submit"
              className="flex-shrink-0 group block w-full"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.email}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center">
                    <LogOut className="w-3 h-3 mr-1" />
                    Sign out
                  </p>
                </div>
              </div>
            </button>
          </form>
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
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
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
