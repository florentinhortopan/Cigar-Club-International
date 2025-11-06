'use client';

import { User } from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}

interface ProfileDisplayProps {
  user: UserProfile;
}

export default function ProfileDisplay({ user }: ProfileDisplayProps) {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="flex justify-center sm:justify-start">
          {user.image ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
              <Image
                src={user.image}
                alt={user.name || 'Profile'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{user.name || 'Member'}</h2>
          <p className="text-muted-foreground mt-1">{user.email}</p>
          
          <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-semibold">{memberSince}</p>
            </div>
            {user.emailVerified && (
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Verified
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

