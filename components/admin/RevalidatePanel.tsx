'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '../ui/use-toast';
import RevalidateButton from './RevalidateButton';

export default function RevalidatePanel() {
  const [customPath, setCustomPath] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleRevalidateAll = async () => {
    setLoading(true);
    
    try {
      // Get the revalidation secret from the environment
      const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'your-secret-token';
      
      // Paths to revalidate
      const paths = [
        '/',
        '/en',
        '/nl',
        '/de',
        '/fr',
        '/products',
        '/en/products',
        '/nl/products',
        '/de/products',
        '/fr/products',
        '/blog',
        '/en/blog',
        '/nl/blog',
        '/de/blog',
        '/fr/blog',
      ];
      
      // Revalidate all paths
      const results = await Promise.all(
        paths.map(async (path) => {
          try {
            const response = await fetch('/api/revalidate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                secret,
                path,
              }),
            });
            
            if (!response.ok) {
              const error = await response.text();
              return { path, success: false, error };
            }
            
            return { path, success: true };
          } catch (error: any) {
            return { path, success: false, error: error.message };
          }
        })
      );
      
      // Count successes and failures
      const successes = results.filter((result) => result.success).length;
      const failures = results.filter((result) => !result.success).length;
      
      // Show success toast
      toast({
        title: 'Revalidation completed',
        description: `Successfully revalidated ${successes} paths. Failed: ${failures}.`,
        variant: failures > 0 ? 'destructive' : 'default',
      });
      
      console.log('Revalidation results:', results);
    } catch (error: any) {
      console.error('Error revalidating all paths:', error);
      
      // Show error toast
      toast({
        title: 'Revalidation failed',
        description: error.message || 'An error occurred during revalidation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Management</CardTitle>
        <CardDescription>
          Revalidate pages to update content and clear the cache
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="common">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="common">Common Pages</TabsTrigger>
            <TabsTrigger value="custom">Custom Path</TabsTrigger>
            <TabsTrigger value="all">All Pages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="common" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Homepage</h3>
                <RevalidateButton path="/" label="Revalidate Homepage" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Products</h3>
                <RevalidateButton path="/products" label="Revalidate Products" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Blog</h3>
                <RevalidateButton path="/blog" label="Revalidate Blog" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">English Homepage</h3>
                <RevalidateButton path="/en" label="Revalidate EN Home" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Dutch Homepage</h3>
                <RevalidateButton path="/nl" label="Revalidate NL Home" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">German Homepage</h3>
                <RevalidateButton path="/de" label="Revalidate DE Home" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="custom-path">Custom Path</Label>
              <div className="flex space-x-2">
                <Input
                  id="custom-path"
                  placeholder="/products/product-slug"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                />
                <RevalidateButton
                  path={customPath}
                  label="Revalidate"
                  variant="default"
                  size="default"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a specific path to revalidate, e.g., /products/product-slug
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm">
                This will revalidate all main pages across all languages. This may take a moment.
              </p>
              <Button
                onClick={handleRevalidateAll}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revalidating All Pages...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Revalidate All Pages
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Note: Revalidation will update the page content from the database and clear the cache.
      </CardFooter>
    </Card>
  );
}
