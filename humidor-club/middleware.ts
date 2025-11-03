import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // You can add additional middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require authentication
    },
    pages: {
      signIn: '/sign-in',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cigars/:path*',
    '/humidor/:path*',
    '/marketplace/:path*',
    '/profile/:path*',
    '/api/cigars/:path*', // Protect cigar creation API
  ],
};

