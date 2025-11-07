'use client';

import { Cigarette, Package, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalCigarsInClub: number;
  totalClubValue: number;
  humidorCigars: number;
  humidorValue: number;
  tastingNotes: number;
  activeListings: number;
  reputation: number;
}

interface Branch {
  id: string;
  name: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCigarsInClub: 0,
    totalClubValue: 0,
    humidorCigars: 0,
    humidorValue: 0,
    tastingNotes: 0,
    activeListings: 0,
    reputation: 0,
  });
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUserBranch();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBranch = async () => {
    try {
      // Fetch user profile to get branch_id
      const profileResponse = await fetch('/api/profile');
      const profileData = await profileResponse.json();
      
      if (profileData.success && profileData.user) {
        // Fetch all branches and find the user's branch
        const branchesResponse = await fetch('/api/branches');
        const branchesData = await branchesResponse.json();
        
        if (branchesData.success) {
          // Find branch by matching user's branch_id (we'll need to get this from profile)
          // For now, let's fetch branches and check if user has a branch
          const userBranchId = profileData.user.branch_id;
          if (userBranchId) {
            const userBranch = branchesData.branches.find((b: Branch) => b.id === userBranchId);
            if (userBranch) {
              setBranch(userBranch);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user branch:', error);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to Cigar Club International{branch && ` - ${branch.name}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 - Humidor */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">HUMIDOR</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{loading ? '...' : stats.humidorCigars}</p>
            <p className="text-sm text-muted-foreground">Cigars</p>
            {!loading && stats.humidorValue > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Value: {formatCurrency(stats.humidorValue)}
              </p>
            )}
          </div>
        </div>

        {/* Stat Card 2 - Club Cigars */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cigarette className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">CLUB</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{loading ? '...' : stats.totalCigarsInClub}</p>
            <p className="text-sm text-muted-foreground">Total Cigars</p>
            {!loading && stats.totalClubValue > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Value: {formatCurrency(stats.totalClubValue)}
              </p>
            )}
          </div>
        </div>

        {/* Stat Card 3 - Marketplace */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">MARKETPLACE</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{loading ? '...' : stats.activeListings}</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </div>
        </div>

        {/* Stat Card 4 - Reputation */}
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">REPUTATION</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{loading ? '...' : stats.reputation.toFixed(1)}</p>
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

