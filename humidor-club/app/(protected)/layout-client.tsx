'use client';

import { Home, Package, Search, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

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

interface ProtectedLayoutClientProps {
  children: ReactNode;
}

export function ProtectedLayoutClient({ children }: ProtectedLayoutClientProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar - Mobile */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="font-semibold">Cigar Club International</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-4">
        <div className="container py-6">{children}</div>
      </main>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-1 min-h-0 border-r bg-background">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <div className="p-2 rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold">Humidor Club</span>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}

