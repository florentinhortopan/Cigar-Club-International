'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, Mail, Package, MapPin, Users, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  humidor_public?: boolean;
  humidorCount?: number | null;
  branch?: {
    id: string;
    name: string;
    city?: string | null;
    region?: string | null;
    country?: string | null;
  } | null;
}

interface HumidorItem {
  id: string;
  quantity: number;
  cigar?: {
    id: string;
    vitola: string;
    line?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  };
}

interface UserHumidor {
  items: HumidorItem[];
  stats: {
    totalCigars: number;
    totalValue: number;
    uniqueCigars: number;
  };
}

export default function PeoplePage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userHumidor, setUserHumidor] = useState<UserHumidor | null>(null);
  const [loadingHumidor, setLoadingHumidor] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedUser && selectedUser.humidor_public) {
      fetchUserHumidor(selectedUser.id);
    } else if (selectedUser && !selectedUser.humidor_public) {
      // Clear humidor data if user's humidor is private
      setUserHumidor(null);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHumidor = async (userId: string) => {
    setLoadingHumidor(true);
    try {
      const response = await fetch(`/api/users/${userId}/humidor`);
      const data = await response.json();
      
      if (data.success) {
        setUserHumidor(data);
      }
    } catch (error) {
      console.error('Error fetching user humidor:', error);
      setUserHumidor(null);
    } finally {
      setLoadingHumidor(false);
    }
  };

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      if (data.success && data.user) {
        setSelectedUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) {
      if (selectedUser) {
        setSelectedUser(null);
        setUserHumidor(null);
      }
      return;
    }

    if (selectedUser?.id === userIdParam) {
      return;
    }

    const existingUser = users.find((user) => user.id === userIdParam);
    if (existingUser) {
      setSelectedUser(existingUser);
      return;
    }

    void fetchUserProfile(userIdParam);
  }, [searchParams, users, selectedUser, fetchUserProfile]);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const updateQueryString = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams);
      updater(params);
      const queryString = params.toString();
      router.replace(queryString ? `/people?${queryString}` : '/people', { scroll: false });
    },
    [router, searchParams]
  );

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    updateQueryString((params) => {
      params.set('userId', user.id);
    });
  };

  const handleCloseUser = () => {
    setSelectedUser(null);
    setUserHumidor(null);
    updateQueryString((params) => {
      params.delete('userId');
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">People</h1>
        <p className="text-muted-foreground mt-2">
          Discover members and their collections
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No members found matching your search' : 'No members found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectUser(user)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.image ? (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg truncate">
                      {user.name || 'Member'}
                    </h3>
                    {user.humidor_public && user.humidorCount !== null && user.humidorCount !== undefined && user.humidorCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                        <Package className="h-3 w-3" />
                        {user.humidorCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {user.branch && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{user.branch.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${user.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Contact</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal/Sidebar */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {selectedUser.name || 'Member'}'s Profile
              </h2>
              <button
                onClick={handleCloseUser}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-6">
                {selectedUser.image ? (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">
                    {selectedUser.name || 'Member'}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {selectedUser.branch && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {selectedUser.branch.name}
                          {selectedUser.branch.city && `, ${selectedUser.branch.city}`}
                        </span>
                      </div>
                    )}
                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{selectedUser.email}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Humidor Section */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Humidor</h3>
                </div>

                {!selectedUser.humidor_public ? (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">This humidor is private</p>
                  </div>
                ) : loadingHumidor ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading humidor...</p>
                  </div>
                ) : userHumidor && userHumidor.items.length > 0 ? (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{userHumidor.stats.totalCigars}</p>
                        <p className="text-sm text-muted-foreground">Total Cigars</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{userHumidor.stats.uniqueCigars}</p>
                        <p className="text-sm text-muted-foreground">Unique</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">
                          {formatPrice(userHumidor.stats.totalValue)}
                        </p>
                        <p className="text-sm text-muted-foreground">Value</p>
                      </div>
                    </div>

                    {/* Humidor Items */}
                    <div className="space-y-3">
                      {userHumidor.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-card border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {item.cigar?.line?.brand?.name || 'Unknown'}{' '}
                                {item.cigar?.line?.name || ''}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.cigar?.vitola || 'Unknown Vitola'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{item.quantity}</p>
                              <p className="text-xs text-muted-foreground">cigars</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No cigars in humidor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

