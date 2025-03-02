import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../ui/CartDrawer';
import { NotificationBar } from '../ui/NotificationBar';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps all pages
 */
export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NotificationBar 
        message="Deze website is nog in ontwikkeling. Sommige functies werken mogelijk nog niet correct."
        bgColor="bg-amber-100"
        textColor="text-amber-800"
        position="top"
      />
      <main className="flex-grow">{children}</main>
      <NotificationBar 
        message="SenseBy CBD - Website in ontwikkeling"
        bgColor="bg-primary-100"
        textColor="text-primary-800"
        position="bottom"
      />
      <Footer />
      <CartDrawer />
    </div>
  );
};
