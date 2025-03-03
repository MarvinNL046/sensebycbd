'use client';

import { useState, useEffect } from 'react';
import { SiteConfig } from './site-config';
import defaultConfig from './site-config';

/**
 * Hook to access the site configuration on the client side
 */
export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/site-config');
        if (!response.ok) {
          throw new Error('Failed to fetch site configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching site config:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fall back to default config
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading, error };
}
