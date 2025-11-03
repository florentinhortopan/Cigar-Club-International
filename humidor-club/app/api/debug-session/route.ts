import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const nextAuthCookies = allCookies.filter(c => 
    c.name.includes('next-auth') || c.name.includes('authjs')
  );

  return NextResponse.json({
    authenticated: !!session,
    user: session?.user || null,
    hasSession: !!session,
    cookies: {
      all: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      nextAuth: nextAuthCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    },
    sessionData: session ? {
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
      },
      expires: session.expires,
    } : null,
  });
}

