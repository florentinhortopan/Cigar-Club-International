'use client';

import { Suspense, useState, FormEvent } from 'react';
import { Cigarette, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function SignInContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || undefined;
  const branchName = searchParams.get('branchName');
  const branchSlug = searchParams.get('branchSlug');
  const branchId = searchParams.get('branchId');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🔵 Starting sign in with email:', email);

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      });

      console.log('🔵 Sign in result:', result);

      if (result?.error) {
        console.error('❌ Sign in error:', result.error);
        setError('Failed to send magic link. Please try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('✅ Sign in successful, redirecting...');
        // Success - redirect to verify page with email
        const params = new URLSearchParams();
        params.set('email', email);
        if (branchName) params.set('branchName', branchName);
        if (branchSlug) params.set('branchSlug', branchSlug);
        if (branchId) params.set('branchId', branchId);
        if (callbackUrl) params.set('callbackUrl', callbackUrl);
        window.location.href = `/auth/verify-request?${params.toString()}`;
      } else {
        console.log('⚠️ Unexpected result:', result);
        setError('Unexpected response. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Cigarette className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your Cigar Club International account
            </p>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="bg-card border rounded-xl p-8 space-y-6">
          {branchName && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              Joining <span className="font-semibold">{branchName}</span>
              {branchSlug ? (
                <>
                  {' '}
                  — you'll be connected with members and events from this branch once you sign in.
                </>
              ) : (
                '.'
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll send you a secure link to sign in
            </p>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  Request an invite
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">Loading sign-in...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

