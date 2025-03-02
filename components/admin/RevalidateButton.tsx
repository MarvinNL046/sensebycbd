'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '../ui/use-toast';

interface RevalidateButtonProps {
  path?: string;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function RevalidateButton({
  path = '/',
  label = 'Revalidate',
  variant = 'outline',
  size = 'sm',
}: RevalidateButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleRevalidate = async () => {
    setLoading(true);
    
    try {
      // Get the revalidation secret from the environment
      // In a real implementation, this would be securely stored and accessed
      // For now, we'll just use a placeholder
      const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'your-secret-token';
      
      // Call the revalidate API endpoint
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
        throw new Error(`Failed to revalidate: ${error}`);
      }
      
      const result = await response.json();
      
      // Show success toast
      toast({
        title: 'Revalidation successful',
        description: `Path "${path}" has been revalidated.`,
        variant: 'default',
      });
      
      console.log('Revalidation result:', result);
    } catch (error: any) {
      console.error('Error revalidating:', error);
      
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
    <Button
      variant={variant}
      size={size}
      onClick={handleRevalidate}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Revalidating...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
