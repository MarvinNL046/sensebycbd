import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { NotificationBar } from '../ui/NotificationBar';
import { useSiteConfig } from '../../lib/use-site-config';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps all pages
 */
export const Layout = ({ children }: LayoutProps) => {
  const { config, loading } = useSiteConfig();
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {!loading && config.notificationBars?.top && (
        <NotificationBar 
          message={config.notificationBars.top.message}
          bgColor={config.notificationBars.top.bgColor}
          textColor={config.notificationBars.top.textColor}
          position="top"
        />
      )}
      <main className="flex-grow">{children}</main>
      {!loading && config.notificationBars?.bottom && (
        <NotificationBar 
          message={config.notificationBars.bottom.message}
          bgColor={config.notificationBars.bottom.bgColor}
          textColor={config.notificationBars.bottom.textColor}
          position="bottom"
        />
      )}
      <Footer />
    </div>
  );
};
