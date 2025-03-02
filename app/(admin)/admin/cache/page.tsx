import { Metadata } from 'next';
import RevalidatePanel from '../../../../components/admin/RevalidatePanel';

export const metadata: Metadata = {
  title: 'Cache Management - SenseByCBD Admin',
  description: 'Manage cache and revalidate pages',
};

export default function CacheManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cache Management</h1>
      </div>
      
      <div className="grid gap-6">
        <RevalidatePanel />
        
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">About Cache Management</h2>
          <div className="prose max-w-none">
            <p>
              This page allows you to manage the cache for your website. The website uses Incremental Static Regeneration (ISR) to cache pages for better performance.
            </p>
            
            <h3 className="text-lg font-medium mt-4">How it works</h3>
            <p>
              When you make changes to products, blog posts, or other content, the changes might not be immediately visible on the website due to caching. You can use the revalidation tools on this page to update the cache and make your changes visible.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Automatic Revalidation</h3>
            <p>
              The website is configured to automatically revalidate pages when content is updated in the database. However, sometimes you might want to manually revalidate pages to ensure the latest content is displayed.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Tips</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the &quot;Common Pages&quot; tab to revalidate frequently updated pages</li>
              <li>Use the &quot;Custom Path&quot; tab to revalidate a specific page</li>
              <li>Use the &quot;All Pages&quot; tab to revalidate all pages (this may take a moment)</li>
              <li>After making changes to products or content, wait a few seconds before revalidating</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
