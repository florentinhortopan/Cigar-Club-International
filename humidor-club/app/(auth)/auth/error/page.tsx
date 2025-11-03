import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error || 'default';

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Server Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in.',
    },
    Verification: {
      title: 'Verification Failed',
      description: 'The sign-in link is no longer valid. It may have expired or already been used.',
    },
    default: {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.',
    },
  };

  const { title, description } = errorMessages[error] || errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        {/* Error Icon */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">{description}</p>
          </div>
        </div>

        {/* Error Details */}
        <div className="bg-card border rounded-xl p-8 space-y-6">
          {error === 'Verification' && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">Common reasons:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>The link has expired (links are valid for 24 hours)</li>
                <li>The link has already been used</li>
                <li>You clicked an old link instead of the most recent one</li>
              </ul>
            </div>
          )}

          <div className="pt-6 border-t space-y-3">
            <Link
              href="/sign-in"
              className="block text-center bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center"
            >
              Try signing in again
            </Link>
            <Link
              href="/"
              className="block text-center border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors min-h-[48px] flex items-center justify-center"
            >
              Back to home
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

