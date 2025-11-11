'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, DollarSign, Package, MapPin, Eye, RefreshCw, Calendar, User, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';

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
    email: string | null;
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const listingId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listingId) {
      fetchListing();
    } else {
      setError('Invalid listing ID');
      setLoading(false);
    }
  }, [listingId]);

  const fetchListing = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}`);
      const data = await response.json();

      if (data.success) {
        setListing(data.listing);
      } else {
        setError(data.error || 'Failed to load listing');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
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

  const getCigarImages = (listing: Listing) => {
    const images: string[] = [];
    
    // Add listing images
    if (listing.image_urls && Array.isArray(listing.image_urls)) {
      images.push(...listing.image_urls);
    }
    
    // Add cigar images if no listing images
    if (images.length === 0 && listing.cigar?.image_urls) {
      try {
        const cigarUrls = JSON.parse(listing.cigar.image_urls);
        if (Array.isArray(cigarUrls)) {
          images.push(...cigarUrls);
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    return images;
  };

  const getCigarName = (listing: Listing) => {
    if (listing.cigar?.line?.brand?.name && listing.cigar?.line?.name) {
      return `${listing.cigar.line.brand.name} ${listing.cigar.line.name}`;
    }
    return listing.title;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || 'Listing not found'}</p>
          <Link
            href="/marketplace"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const images = getCigarImages(listing);
  const cigarName = getCigarName(listing);
  const isOwner = session?.user?.id === listing.user.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/marketplace"
          className="p-2 -m-2 hover:bg-muted rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Listing Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {images.length > 0 ? (
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${listing.title} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Cigar Details */}
          {listing.cigar && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Cigar Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Brand & Line: </span>
                  <span className="text-muted-foreground">{cigarName}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Vitola: </span>
                  <span className="text-muted-foreground">{listing.cigar.vitola}</span>
                </div>
                {listing.condition && (
                  <div>
                    <span className="text-sm font-medium">Condition: </span>
                    <span className="text-muted-foreground">{listing.condition}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Listing Info Card */}
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(listing.type)}`}>
                {getTypeLabel(listing.type)}
              </span>
              {listing.status === 'ACTIVE' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                  Active
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>
              {listing.cigar && (
                <p className="text-muted-foreground">{cigarName}</p>
              )}
            </div>

            {/* Price */}
            {listing.price_cents && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(listing.price_cents)}
                </span>
                <span className="text-muted-foreground">{listing.currency}</span>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-5 w-5" />
              <span>Quantity: {listing.qty}</span>
            </div>

            {/* Location */}
            {(listing.city || listing.region) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>
                  {listing.city && listing.region
                    ? `${listing.city}, ${listing.region}`
                    : listing.city || listing.region}
                </span>
              </div>
            )}

            {/* Shipping */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Shipping Options</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {listing.meet_up_only && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>Meet up only (local exchange)</span>
                  </div>
                )}
                {listing.will_ship && (
                  <div className="flex items-center gap-2">
                    <span>📦</span>
                    <span>Willing to ship</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{listing.view_count} views</span>
              </div>
              {listing.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {formatDate(listing.published_at)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isOwner && (
              <div className="space-y-2 pt-4 border-t">
                <button className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Seller
                </button>
                {(listing.type === 'WTS' || listing.type === 'WTT') && (
                  <button className="w-full border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors">
                    Make Offer
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <div className="space-y-2 pt-4 border-t">
                <Link
                  href={`/marketplace/${listing.id}/edit`}
                  className="block w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                  Edit Listing
                </Link>
                <button className="w-full border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors">
                  Mark as Sold
                </button>
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold">Seller</h3>
            <div className="flex items-center gap-3">
              {listing.user.image ? (
                <Image
                  src={listing.user.image}
                  alt={listing.user.name || 'User'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{listing.user.name || 'Anonymous'}</p>
                <Link
                  href={`/people/${listing.user.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

