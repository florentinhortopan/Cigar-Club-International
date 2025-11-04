import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Log for debugging
    console.log('🛡️ Middleware check:', {
      path: req.nextUrl.pathname,
      hasToken: !!req.nextauth.token,
      tokenId: req.nextauth.token?.id,
      tokenEmail: req.nextauth.token?.email,
    });
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthorized = !!token;
        console.log('🔐 Middleware authorized check:', {
          path: req?.nextUrl?.pathname,
          hasToken: !!token,
          tokenId: token?.id,
          tokenEmail: token?.email,
          isAuthorized,
        });
        return isAuthorized;
      },
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

