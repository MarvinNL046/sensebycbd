import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AuthForm } from '../components/ui/AuthForm';
import { useAuth } from '../lib/auth-context';
import { SEO } from '../lib/seo/SEO';

export default function LoginPage() {
  const router = useRouter();
  const { redirect } = router.query;
  const { user, loading } = useAuth();
  
  // Handle successful login
  const handleLoginSuccess = useCallback(() => {
    router.push(typeof redirect === 'string' ? redirect : '/');
  }, [redirect, router]);
  
  // Redirect to the specified page or homepage if already logged in
  useEffect(() => {
    if (!loading && user) {
      handleLoginSuccess();
    }
  }, [user, loading, handleLoginSuccess]);
  
  return (
    <div className="container-custom py-10">
      <SEO 
        title="Login | SenseBy CBD"
        description="Sign in to your SenseBy CBD account"
        keywords="account, sign in, login, register"
        canonicalPath="/login"
      />
      <h1 className="text-center text-primary mb-8">Login</h1>
      <AuthForm onSuccess={handleLoginSuccess} />
    </div>
  );
}
