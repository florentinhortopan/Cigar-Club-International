import { Award, History, User } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getRecentActivityForUser } from '@/lib/prisma-queries';
import BranchSection from './branch-section';
import ProfileEditor from './profile-editor';

export default async function ProfilePage() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get user with branch info and profile data
    let userBranchId: string | null = null;
    let userProfile = null;
    
    let activities: Awaited<ReturnType<typeof getRecentActivityForUser>> = [];

    if (session?.user?.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            branch_id: true,
          },
        });
        userBranchId = user?.branch_id || null;
        if (user) {
          // User model doesn't have createdAt, so we'll use a fallback
          // In the future, we could add createdAt to the User model
          // Convert dates to ISO strings for client component serialization
          userProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
            createdAt: new Date().toISOString(), // Fallback - User model doesn't have createdAt field
          };
        }

        activities = await getRecentActivityForUser(session.user.id, 10);
      } catch (dbError) {
        console.error('Error fetching user from database:', dbError);
        // Continue with null userProfile to show error message
      }
    }

    if (!userProfile) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="bg-card border rounded-xl p-6 text-center">
            <p className="text-muted-foreground">Unable to load profile</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      {/* Profile Editor */}
      <ProfileEditor 
        user={userProfile} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Badges earned</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Activity</h3>
          </div>
          <p className="text-2xl font-bold">{activities.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Recent actions</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Following</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Members</p>
        </div>
      </div>

      {/* Branch Section */}
      <BranchSection userBranchId={userBranchId} />

      {/* Recent Activity */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="rounded-lg border bg-muted/40 p-4">
                <p className="font-medium text-foreground">{activity.summary}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in ProfilePage:', error);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="bg-card border rounded-xl p-6 text-center">
          <p className="text-destructive font-semibold mb-2">Error loading profile</p>
          <p className="text-sm text-muted-foreground">
            An error occurred while loading your profile. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

