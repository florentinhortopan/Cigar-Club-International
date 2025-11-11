'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Plus, Filter, DollarSign, Package, RefreshCw, MapPin, Eye } from 'lucide-react';

interface Listing {
  id: string;
  type: 'WTS' | 'WTB' | 'WTT';
  title: string;
  description: string;
  qty: number;
  condition?: string | null;
  price_cents?: number | null;
  currency: string;
  region?: string | null;
  city?: string | null;
  meet_up_only: boolean;
  will_ship: boolean;
  status: string;
  view_count: number;
  published_at?: string | null;
  created_at: string;
  image_urls?: string[];
  cigar?: {
    id: string;
    vitola: string;
    image_urls?: string | null;
    line?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  } | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'WTS' | 'WTB' | 'WTT'>('all');
  const [total, setTotal] = useState(0);
  
  // Get cigar_id and myListings from URL params
  const cigarId = searchParams.get('cigar_id');
  const myListings = searchParams.get('myListings') === 'true';

  useEffect(() => {
    // If myListings is true, wait for session to be available
    if (myListings && !session) {
      return; // Don't fetch until session is loaded
    }
    fetchListings();
  }, [activeTab, cigarId, myListings, session?.user?.id]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const type = activeTab === 'all' ? null : activeTab;
      const params = new URLSearchParams();
      params.append('status', 'ACTIVE');
      
      if (type) {
        params.append('type', type);
      }
      
      if (cigarId) {
        params.append('cigar_id', cigarId);
      }
      
      // Filter by current user's listings if myListings=true
      if (myListings && session?.user?.id) {
        params.append('userId', session.user.id);
      }
      
      const url = `/api/listings?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents?: number | null) => {
    if (!cents) return null;
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'WTS':
        return 'For Sale';
      case 'WTB':
        return 'Wanted';
      case 'WTT':
        return 'Trade';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WTS':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'WTB':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'WTT':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCigarImage = (listing: Listing) => {
    // Prefer listing images over cigar images
    if (listing.image_urls && Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
      return listing.image_urls[0];
    }
    
    // Fallback to cigar images
    if (listing.cigar?.image_urls) {
      try {
        const urls = JSON.parse(listing.cigar.image_urls);
        return Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const getCigarName = (listing: Listing) => {
    if (listing.cigar?.line?.brand?.name && listing.cigar?.line?.name) {
      return `${listing.cigar.line.brand.name} ${listing.cigar.line.name}`;
    }
    return listing.title;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            {myListings
              ? 'My Listings'
              : cigarId 
              ? 'Listings for this cigar'
              : 'Buy, sell, and trade with the community'}
          </p>
          {(cigarId || myListings) && (
            <Link
              href="/marketplace"
              className="text-sm text-primary hover:underline mt-1 inline-block"
            >
              ← Show all listings
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href="/marketplace/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px]"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Create Listing</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All Listings
        </button>
        <button
          onClick={() => setActiveTab('WTS')}
          className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'WTS'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          For Sale
        </button>
        <button
          onClick={() => setActiveTab('WTB')}
          className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'WTB'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Wanted
        </button>
        <button
          onClick={() => setActiveTab('WTT')}
          className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'WTT'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Trades
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Loading listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-full bg-muted inline-block">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No listings yet</h3>
            <p className="text-muted-foreground">
              {myListings
                ? 'You don\'t have any active listings yet. Create your first listing to start selling or trading!'
                : cigarId
                ? `No listings found for this cigar.`
                : activeTab === 'all'
                ? 'Be the first to create a listing! Start buying, selling, or trading cigars with the community.'
                : `No ${getTypeLabel(activeTab).toLowerCase()} listings at the moment.`}
            </p>
            <Link
              href="/marketplace/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] mt-4"
            >
              <Plus className="h-5 w-5" />
              Create First Listing
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => {
            const cigarImage = getCigarImage(listing);
            const cigarName = getCigarName(listing);

            return (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="aspect-video relative bg-muted">
                  {cigarImage ? (
                    <Image
                      src={cigarImage}
                      alt={cigarName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
                      {getTypeLabel(listing.type)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {cigarName}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {listing.price_cents && (
                        <div className="flex items-center gap-1 font-semibold text-primary">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(listing.price_cents)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Qty: {listing.qty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {(listing.city || listing.region) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {listing.city && listing.region
                          ? `${listing.city}, ${listing.region}`
                          : listing.city || listing.region}
                      </span>
                    </div>
                  )}

                  {/* Shipping Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {listing.meet_up_only && (
                      <span>📍 Meet up</span>
                    )}
                    {listing.will_ship && (
                      <span>📦 Ships</span>
                    )}
                    <span className="ml-auto flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.view_count}
                    </span>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {listing.user.image ? (
                      <Image
                        src={listing.user.image}
                        alt={listing.user.name || 'User'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">{listing.user.name?.[0] || '?'}</span>
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {listing.user.name || 'Anonymous'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
