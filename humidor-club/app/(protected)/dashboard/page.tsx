import { Cigarette, Package, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to Humidor Club
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">HUMIDOR</span>
          </div>
          <div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Cigars</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cigarette className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">RATINGS</span>
          </div>
          <div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Tasting Notes</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">MARKETPLACE</span>
          </div>
          <div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">REPUTATION</span>
          </div>
          <div>
            <p className="text-3xl font-bold">0.0</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/cigars/add"
            className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-muted/50 transition-colors min-h-[120px]"
          >
            <Cigarette className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Add Cigar</span>
          </Link>
          
          <Link 
            href="/humidor"
            className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-muted/50 transition-colors min-h-[120px]"
          >
            <Package className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">My Humidor</span>
          </Link>
          
          <Link 
            href="/marketplace"
            className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-muted/50 transition-colors min-h-[120px]"
          >
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Marketplace</span>
          </Link>
          
          <button className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-muted/50 transition-colors min-h-[120px]">
            <Users className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Community</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>No activity yet. Start by adding cigars to your humidor!</p>
        </div>
      </div>
    </div>
  );
}

