import { defaultLanguage } from '../middleware';
import { redirect } from 'next/navigation';

// Root page that redirects to the default language using Next.js redirect
// This is a server-side redirect that works with the middleware
export default function RootPage() {
  // Use Next.js redirect function for server-side redirection
  // Admin routes are handled by middleware and won't reach this page
  redirect(`/${defaultLanguage}`);
}
