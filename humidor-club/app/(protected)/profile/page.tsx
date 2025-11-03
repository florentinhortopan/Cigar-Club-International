import { User, Settings, Award, History } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button className="flex items-center gap-2 border font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors min-h-[48px]">
          <Settings className="h-5 w-5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex justify-center sm:justify-start">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">Member</h2>
            <p className="text-muted-foreground mt-1">member@example.com</p>
            
            <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold">November 2025</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reputation</p>
                <p className="font-semibold">New Member</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deals</p>
                <p className="font-semibold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <p className="text-2xl font-bold">0</p>
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

      {/* Recent Activity */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  );
}

