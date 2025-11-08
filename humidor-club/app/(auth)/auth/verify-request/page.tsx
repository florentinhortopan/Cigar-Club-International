'use client';

import { Mail, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const branchName = searchParams.get('branchName');
  const branchSlug = searchParams.get('branchSlug');
  const branchId = searchParams.get('branchId');
  const callbackUrl = searchParams.get('callbackUrl');
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch magic link
    const fetchMagicLink = async () => {
      try {
        const url = email ? `/api/magic-link?email=${encodeURIComponent(email)}` : '/api/magic-link';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.magicLink) {
          setMagicLink(data.magicLink);
        }
      } catch (error) {
        console.error('Error fetching magic link:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMagicLink();
  }, [email]);

  useEffect(() => {
    // Countdown timer
    if (magicLink && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (magicLink && countdown === 0) {
      // Redirect to magic link
      window.location.href = magicLink;
    }
  }, [magicLink, countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="p-4 rounded-full bg-primary/10">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-green-500">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Check your email</h1>
            <p className="text-muted-foreground mt-2">
              We've sent you a magic link to sign in
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-card border rounded-xl p-8 space-y-6">
          {branchName && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              Magic link on its way! Once you sign in, we’ll connect you with the <span className="font-semibold">{branchName}</span> branch community.
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Look for an email from Cigar Club International
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Click the magic link</p>
                <p className="text-sm text-muted-foreground">
                  The link is valid for 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">You're in!</p>
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Magic Link Display (for testing) */}
          {magicLink && (
            <div className="pt-6 border-t space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <ExternalLink className="h-5 w-5" />
                  <span>Testing: Magic Link Available</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Auto-redirecting in <span className="font-bold text-foreground">{countdown}</span> seconds...
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Or click the link below to sign in immediately
                    </span>
                  </div>
                  <a
                    href={magicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all text-sm text-primary hover:underline font-mono bg-background p-3 rounded border"
                  >
                    {magicLink}
                  </a>
                  <a
                    href={magicLink}
                    className="block text-center bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Sign In Now
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              {loading ? 'Loading magic link...' : !magicLink ? 'Didn\'t receive the email?' : 'Need another link?'}
            </p>
            <div className="flex flex-col gap-2">
              {(() => {
                const retryParams = new URLSearchParams();
                if (callbackUrl) retryParams.set('callbackUrl', callbackUrl);
                if (branchId) retryParams.set('branchId', branchId);
                if (branchSlug) retryParams.set('branchSlug', branchSlug);
                if (branchName) retryParams.set('branchName', branchName);
                const retryHref = retryParams.toString() ? `/sign-in?${retryParams.toString()}` : '/sign-in';
                return (
              <Link
                href={retryHref}
                className="text-center bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center"
              >
                Try again
              </Link>
                );
              })()}
              <Link
                href="/"
                className="text-center border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors min-h-[48px] flex items-center justify-center"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>💡 Check your spam folder if you don't see the email</p>
          <p>💡 Make sure you entered the correct email address</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}

