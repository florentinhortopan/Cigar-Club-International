import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { storeMagicLink } from '@/lib/magic-link-store';

// Set trustHost for Vercel (required for NextAuth v4+ on serverless)
if (process.env.VERCEL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'https://cigar-club-international.vercel.app';
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  debug: true, // Always debug for now
  logger: {
    error(code, ...message) {
      console.error('❌ NextAuth Error:', code, message);
    },
    warn(code, ...message) {
      console.warn('⚠️ NextAuth Warning:', code, message);
    },
    debug(code, ...message) {
      console.log('🔍 NextAuth Debug:', code, message);
    },
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM || 'noreply@humidor.club',
      // Don't override sendVerificationRequest - let NextAuth handle it with the adapter
      ...(process.env.NODE_ENV === 'development' && {
        sendVerificationRequest: async ({ identifier: email, url, provider, token }) => {
          // Store magic link for testing
          storeMagicLink(email, url);
          
          // Log the magic link in development
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔐 MAGIC LINK (Development Mode)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`📧 Email: ${email}`);
          console.log(`🔗 Link: ${url}`);
          console.log(`🎟️  Token: ${token}`);
          console.log(`⏰ Expires: 24 hours from now`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log('💡 COPY THIS LINK AND PASTE IN YOUR BROWSER!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          // Don't send actual email in dev - adapter already created the token
          // NextAuth will handle the callback when the link is clicked
        },
      }),
              ...(process.env.NODE_ENV === 'production' && {
                sendVerificationRequest: async ({ identifier: email, url, token }) => {
                  // Store magic link for testing
                  storeMagicLink(email, url);
                  
                  // Always log the magic link in production (visible in Vercel logs)
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('🔐 MAGIC LINK (Production Mode)');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log(`📧 Email: ${email}`);
                  console.log(`🔗 Link: ${url}`);
                  console.log(`🎟️  Token: ${token}`);
                  console.log(`⏰ Expires: 24 hours from now`);
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('💡 Check Vercel Function Logs to see this link!');
                  console.log('💡 Or set RESEND_API_KEY to send actual emails');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                  
                  // If Resend is configured, send actual email
                  if (resend) {
                    try {
                      await resend.emails.send({
              from: process.env.EMAIL_FROM || 'noreply@humidor.club',
              to: email,
              subject: 'Sign in to Humidor Club',
              html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🥃 Humidor Club</h1>
                  </div>
                  
                  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="margin-top: 0; color: #111827;">Sign in to your account</h2>
                    
                    <p style="color: #6b7280; font-size: 16px;">
                      Click the button below to securely sign in to Humidor Club:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${url}" style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                        Sign In
                      </a>
                    </div>
                    
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      If you didn't request this email, you can safely ignore it.
                      This link will expire in 24 hours.
                    </p>
                    
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                      Or copy and paste this URL into your browser:<br>
                      <span style="color: #6b7280; word-break: break-all;">${url}</span>
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    <p>© 2025 Humidor Club. All rights reserved.</p>
                  </div>
                </body>
              </html>
            `,
            });
                    } catch (error) {
                      console.error('Error sending email via Resend:', error);
                      // Don't throw - let the magic link still work via console log
                      console.log('⚠️ Email not sent, but magic link is available in logs above');
                    }
                  } else {
                    console.log('⚠️ RESEND_API_KEY not configured - email not sent');
                    console.log('📋 The magic link above can be used to sign in');
                  }
                },
              }),
    }),
  ],
  pages: {
    signIn: '/sign-in',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔐 SignIn callback:', { 
        user: user ? { id: user.id, email: user.email } : null, 
        account, 
        email 
      });
      // Always allow sign in for email provider
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 Redirect callback:', { url, baseUrl });
      
      // Handle callbackUrl from middleware (but ignore if it's sign-in)
      try {
        const parsedUrl = new URL(url, baseUrl);
        const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
        if (callbackUrl) {
          const decodedCallbackUrl = decodeURIComponent(callbackUrl);
          console.log('🔀 Found callbackUrl:', decodedCallbackUrl);
          
          // Ignore callbackUrl if it's pointing to sign-in or auth pages
          if (decodedCallbackUrl.includes('/sign-in') || decodedCallbackUrl.includes('/auth/')) {
            console.log('🔀 Ignoring sign-in callbackUrl, redirecting to dashboard');
            return `${baseUrl}/dashboard`;
          }
          
          // Use callbackUrl if it's a valid destination
          return decodedCallbackUrl.startsWith('/') ? `${baseUrl}${decodedCallbackUrl}` : decodedCallbackUrl;
        }
      } catch (e) {
        console.log('🔀 Error parsing URL:', e);
      }
      
      // If this is the email callback URL, always go to dashboard
      if (url.includes('/api/auth/callback/email')) {
        console.log('🔀 Email callback detected, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      // Never redirect to sign-in or auth pages after successful authentication
      if (url.includes('/sign-in') || url.includes('/auth/')) {
        console.log('🔀 Blocking redirect to sign-in/auth, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      // After sign in, always redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        console.log('🔀 Redirecting to dashboard (default)');
        return `${baseUrl}/dashboard`;
      }
      
      // If it's a relative URL, check if it's a valid destination
      if (url.startsWith("/")) {
        // Don't allow redirecting to sign-in or auth pages
        if (url.includes('/sign-in') || url.includes('/auth/')) {
          console.log('🔀 Blocking relative redirect to sign-in/auth, redirecting to dashboard');
          return `${baseUrl}/dashboard`;
        }
        console.log('🔀 Redirecting to relative URL:', url);
        return `${baseUrl}${url}`;
      }
      
      // If it's an absolute URL on the same origin, check if it's valid
      if (url.startsWith(baseUrl)) {
        // Don't allow redirecting to sign-in or auth pages
        if (url.includes('/sign-in') || url.includes('/auth/')) {
          console.log('🔀 Blocking absolute redirect to sign-in/auth, redirecting to dashboard');
          return `${baseUrl}/dashboard`;
        }
        console.log('🔀 Redirecting to same-origin URL:', url);
        return url;
      }
      
      // Otherwise, redirect to dashboard
      console.log('🔀 Redirecting to dashboard (fallback)');
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token, user }) {
      console.log('📝 Session callback:', { 
        session: session ? { user: session.user?.email } : null, 
        token: token ? { sub: token.sub, id: token.id, email: token.email } : null, 
        user: user ? { id: user.id } : null 
      });
      if (session?.user) {
        if (token?.sub) {
          session.user.id = token.sub as string;
        }
        if (token?.id) {
          session.user.id = token.id as string;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
      }
      console.log('📝 Session callback result:', { 
        hasSession: !!session, 
        userId: session?.user?.id, 
        userEmail: session?.user?.email 
      });
      return session;
    },
    async jwt({ token, user, account, profile, trigger }) {
      console.log('🎟️  JWT callback:', { 
        token: token ? { sub: token.sub, id: token.id, email: token.email } : null, 
        user: user ? { id: user.id, email: user.email } : null, 
        account: account ? { type: account.type } : null,
        trigger
      });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.sub = user.id; // Ensure sub is set
      }
      console.log('🎟️  JWT callback result:', { 
        hasToken: !!token, 
        tokenId: token?.id, 
        tokenSub: token?.sub, 
        tokenEmail: token?.email 
      });
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain - let it default to the current domain
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

