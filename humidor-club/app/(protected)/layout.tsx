import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ProtectedLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  try {
    // Check authentication server-side
    const session = await getSession();
    
    console.log('🔒 Protected layout check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
    });
    
    if (!session?.user) {
      // Redirect to sign-in if not authenticated
      console.log('🔒 No session, redirecting to sign-in');
      redirect('/sign-in');
    }

    // Render client component (navItems are defined in the client component)
    return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
  } catch (error) {
    console.error('❌ Protected layout error:', error);
    // If there's an error, redirect to sign-in as fallback
    redirect('/sign-in');
  }
}
