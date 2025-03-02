import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
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
  ChevronRight,
  FileText,
  RefreshCw
} from 'lucide-react';
import MobileMenu from './components/MobileMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from '../../components/ui/theme-provider';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { Toaster } from '../../components/ui/toaster';
import { checkAdminAuth } from '../../utils/supabase/server';
import { createClient } from '../../utils/supabase/client';
import '../../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

// Navigation items in Dutch
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
  { href: '/admin/products', label: 'Producten', icon: <Package className="w-5 h-5" /> },
  { href: '/admin/categories', label: 'Categorieën', icon: <FolderTree className="w-5 h-5" /> },
  { href: '/admin/translations', label: 'Vertalingen', icon: <Globe className="w-5 h-5" /> },
  { href: '/admin/orders', label: 'Bestellingen', icon: <ShoppingCart className="w-5 h-5" /> },
  { href: '/admin/users', label: 'Gebruikers', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/blog', label: 'Blog', icon: <FileText className="w-5 h-5" /> },
  { href: '/admin/cache', label: 'Cache', icon: <RefreshCw className="w-5 h-5" /> },
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
    <html lang="nl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <title>SenseBy Admin</title>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          <div className="flex h-screen bg-background text-foreground">
            {/* Debug mode banner for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-1 text-center text-xs z-50">
                Server-side admin check passed: {user?.email}
                {isAdminByEmail && ' (Admin by email)'}
              </div>
            )}
            
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card shadow-md">
              <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
                  <Link href="/admin" className="text-xl font-bold text-primary">
                    SenseBy Admin
                  </Link>
                  <ThemeToggle />
                </div>
                
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div className="flex-shrink-0 flex border-t border-border p-4">
                <form action={async () => {
                  'use server';
                  const supabase = createClient();
                  await supabase.auth.signOut();
                }}>
                  <button
                    type="submit"
                    className="flex-shrink-0 group block w-full"
                  >
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground group-hover:text-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground flex items-center">
                          <LogOut className="w-3 h-3 mr-1" />
                          Uitloggen
                        </p>
                      </div>
                    </div>
                  </button>
                </form>
              </div>
            </div>
            
            {/* Mobile menu */}
            <MobileMenu />
            
            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
              <main className="flex-1">
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-foreground">Admin Beheer</h1>
                    <div className="md:hidden">
                      <ThemeToggle />
                    </div>
                  </div>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
