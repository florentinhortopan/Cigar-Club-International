import { Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
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
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Look for an email from Humidor Club
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

          <div className="pt-6 border-t space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email?
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="text-center bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center"
              >
                Try again
              </Link>
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

