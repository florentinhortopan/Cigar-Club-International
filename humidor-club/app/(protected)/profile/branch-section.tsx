'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Check, Users, Globe } from 'lucide-react';
import Link from 'next/link';

interface Branch {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  description?: string | null;
  member_count: number;
  created_by?: {
    name?: string | null;
    email?: string | null;
  };
}

interface BranchSectionProps {
  userBranchId?: string | null;
}

export default function BranchSection({ userBranchId }: BranchSectionProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userBranch, setUserBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    city: '',
    region: '',
    country: '',
    description: '',
  });

  useEffect(() => {
    fetchBranches();
    if (userBranchId) {
      fetchUserBranch();
    }
  }, [userBranchId]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const data = await response.json();
      if (data.success) {
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBranch = async () => {
    if (!userBranchId) return;
    try {
      // Fetch all branches and find the one matching userBranchId
      const response = await fetch('/api/branches');
      const data = await response.json();
      if (data.success) {
        const branch = data.branches.find((b: Branch) => b.id === userBranchId);
        if (branch) {
          setUserBranch(branch);
        }
      }
    } catch (error) {
      console.error('Error fetching user branch:', error);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Branch created successfully! You have been automatically added as a member.');
        setShowCreateForm(false);
        setFormData({
          name: '',
          slug: '',
          city: '',
          region: '',
          country: '',
          description: '',
        });
        await fetchBranches();
        await fetchUserBranch();
        // Refresh the page to update user branch
        window.location.reload();
      } else {
        alert(data.error || 'Failed to create branch');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinBranch = async (branchId: string) => {
    setJoining(branchId);

    try {
      const response = await fetch('/api/branches/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: branchId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Successfully joined branch!');
        await fetchUserBranch();
        // Refresh the page to update user branch
        window.location.reload();
      } else {
        alert(data.error || 'Failed to join branch');
      }
    } catch (error) {
      console.error('Error joining branch:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setJoining(null);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  if (loading) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <p className="text-muted-foreground">Loading branches...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Your Branch</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Join a local branch or create your own
          </p>
        </div>
        {!userBranch && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Branch
          </button>
        )}
      </div>

      {/* Current Branch */}
      {userBranch ? (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-lg">{userBranch.name}</h4>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {[userBranch.city, userBranch.region, userBranch.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{userBranch.member_count} {userBranch.member_count === 1 ? 'member' : 'members'}</span>
                </div>
              </div>
              {userBranch.description && (
                <p className="text-sm text-muted-foreground mt-2">{userBranch.description}</p>
              )}
            </div>
            <Link
              href={`/${userBranch.slug}`}
              className="text-primary hover:underline text-sm font-medium"
            >
              View Page
            </Link>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 text-center text-muted-foreground">
          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>You haven't joined a branch yet</p>
        </div>
      )}

      {/* Create Branch Form */}
      {showCreateForm && !userBranch && (
        <div className="border rounded-lg p-6 bg-muted/30 space-y-4">
          <h4 className="font-semibold">Create New Branch</h4>
          <form onSubmit={handleCreateBranch} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Branch Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., New York Chapter"
                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., new-york"
                pattern="[a-z0-9-]+"
                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only lowercase letters, numbers, and hyphens. This will be your branch URL: /{formData.slug || 'your-slug'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., New York"
                  className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Region/State</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., NY"
                  className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., United States"
                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your branch..."
                rows={3}
                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Branch'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Available Branches */}
      {!userBranch && branches.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Available Branches</h4>
          <div className="space-y-3">
            {branches.slice(0, 5).map((branch) => (
              <div
                key={branch.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h5 className="font-medium">{branch.name}</h5>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {[branch.city, branch.region, branch.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{branch.member_count} {branch.member_count === 1 ? 'member' : 'members'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${branch.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleJoinBranch(branch.id)}
                    disabled={joining === branch.id}
                    className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {joining === branch.id ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

