'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Error caught by ErrorBoundary:', error);
      setHasError(true);
      setError(error.error);
    };

    // Add event listener for uncaught errors
    window.addEventListener('error', errorHandler);

    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold text-red-700">Er is een fout opgetreden</h2>
        </div>
        <p className="text-red-600 mb-4">
          Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen of neem contact op met de beheerder.
        </p>
        {error && (
          <div className="bg-white p-4 rounded border border-red-200 overflow-auto max-h-40">
            <p className="font-mono text-sm text-red-800">{error.toString()}</p>
          </div>
        )}
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Pagina vernieuwen
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
