'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Package, 
  FolderTree, 
  Globe, 
  ShoppingCart, 
  Users,
  FileText,
  RefreshCw,
  X,
  Menu
} from 'lucide-react';
import { ThemeToggle } from '../../../components/ui/theme-toggle';

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

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      {/* Mobile header */}
      <div className="bg-card shadow-sm py-2 px-4 flex items-center justify-between">
        <Link href="/admin" className="text-xl font-bold text-primary">
          SenseBy Admin
        </Link>
        
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        >
          <span className="sr-only">Open menu</span>
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Link href="/admin" className="text-xl font-bold text-primary">
                SenseBy Admin
              </Link>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <nav className="mt-5 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className="flex items-center px-2 py-3 text-base font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
