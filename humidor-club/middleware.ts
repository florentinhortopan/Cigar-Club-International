import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware - just pass through, authentication handled in layout
export default function middleware(request: NextRequest) {
  // Allow all requests - authentication is handled in the protected layout
  return NextResponse.next();
}

export const config = {
  // Only protect API routes that need authentication
  matcher: [
    '/api/cigars/:path*', // Protect cigar creation API only
  ],
};

