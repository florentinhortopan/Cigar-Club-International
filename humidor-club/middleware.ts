import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Log for debugging
    const token = req.nextauth.token;
    console.log('🛡️ Middleware check:', {
      path: req.nextUrl.pathname,
      hasToken: !!token,
      tokenId: token?.id,
      tokenEmail: token?.email,
      tokenSub: token?.sub,
      cookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    });
    
    // If we have a token, allow access
    if (token) {
      return NextResponse.next();
    }
    
    // Otherwise, continue with default behavior (redirect to sign-in)
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
          tokenSub: token?.sub,
          isAuthorized,
          cookies: req?.cookies?.getAll()?.map((c: any) => ({ name: c.name, hasValue: !!c.value })),
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

