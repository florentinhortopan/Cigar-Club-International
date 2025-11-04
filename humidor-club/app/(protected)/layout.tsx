import { Home, Package, Search, TrendingUp, User } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ProtectedLayoutClient } from './layout-client';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/cigars', label: 'Cigars', icon: Search },
  { href: '/humidor', label: 'Humidor', icon: Package },
  { href: '/marketplace', label: 'Market', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
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

  // Pass navigation items to client component
  return <ProtectedLayoutClient navItems={navItems}>{children}</ProtectedLayoutClient>;
}
