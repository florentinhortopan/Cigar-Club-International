'use client';

import { Cigarette, Package, TrendingUp, Users, Wine, UserPlus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

interface Activity {
  type: 'pairing' | 'user_joined' | 'cigar_added' | 'humidor_added' | 'listing_created';
  id: string;
  title: string;
  description: string;
  link?: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string;
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUserBranch();
    fetchActivities();
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

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch('/api/dashboard/activity');
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
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
        <Link href="/humidor" className="bg-card border rounded-xl p-6 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer block">
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
        </Link>

        {/* Stat Card 2 - Club Cigars */}
        <Link href="/cigars" className="bg-card border rounded-xl p-6 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer block">
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
        </Link>

        {/* Stat Card 3 - Marketplace */}
        <Link href="/marketplace?myListings=true" className="bg-card border rounded-xl p-6 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer block">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">MARKETPLACE</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{loading ? '...' : stats.activeListings}</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
            {!loading && stats.activeListings > 0 && (
              <p className="text-xs text-primary mt-1 hover:underline">Manage my listings →</p>
            )}
          </div>
        </Link>

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
        {loadingActivities ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No activity yet. Start by adding cigars to your humidor!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} formatTimeAgo={formatTimeAgo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity, formatTimeAgo }: { activity: Activity; formatTimeAgo: (date: Date) => string }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'pairing':
        return <Wine className="h-4 w-4" />;
      case 'user_joined':
        return <UserPlus className="h-4 w-4" />;
      case 'cigar_added':
        return <Cigarette className="h-4 w-4" />;
      case 'humidor_added':
        return <Package className="h-4 w-4" />;
      case 'listing_created':
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getColorClass = () => {
    switch (activity.type) {
      case 'pairing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'user_joined':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'cigar_added':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'humidor_added':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'listing_created':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const content = (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-lg ${getColorClass()}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimeAgo(new Date(activity.createdAt))}
          </span>
        </div>
        {activity.user && (
          <div className="flex items-center gap-2 mt-2">
            {activity.user.image ? (
              <Image
                src={activity.user.image}
                alt={activity.user.name || 'User'}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {activity.user.name || 'Unknown user'}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (activity.link) {
    return (
      <Link href={activity.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

