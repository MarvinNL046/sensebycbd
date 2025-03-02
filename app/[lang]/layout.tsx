import { Inter } from 'next/font/google';
import '../../styles/globals.css';
import { supportedLanguages } from '../../middleware';
import { generateMetadata } from './metadata';

const inter = Inter({ subsets: ['latin'] });

// Export the metadata function
export { generateMetadata };

// Define static params for language routes
export function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
}

// Client components will be imported in the client component wrapper
import ClientLayout from './client-layout';

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <title>SenseBy CBD</title>
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
