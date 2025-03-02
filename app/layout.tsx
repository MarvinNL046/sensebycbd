import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SenseBy CBD',
  description: 'Premium CBD products for your wellbeing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the current route is under [lang] or (admin)
  // If it is, the respective layout will provide the HTML structure
  const isSpecialRoute = children && 
    typeof children === 'object' && 
    'props' in children && 
    (children.props?.childProp?.segment?.startsWith('(') || 
     children.props?.childProp?.segment === 'admin');
  
  if (isSpecialRoute) {
    // For special routes, just pass through the children
    return children;
  }
  
  // For other routes, provide the HTML structure
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
