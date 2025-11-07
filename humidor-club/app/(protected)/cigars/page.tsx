'use client';

import Link from 'next/link';
import {
  Plus,
  Cigarette,
  Image as ImageIcon,
  Edit,
  Search,
  Check,
  Package,
  LayoutGrid,
  Rows,
  List,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';

interface Cigar {
  id: string;
  vitola: string;
  ring_gauge?: number | null;
  length_inches?: number | null;
  wrapper?: string | null;
  binder?: string | null;
  filler?: string | null;
  strength?: string | null;
  body?: string | null;
  msrp_cents?: number | null;
  image_urls?: string | null; // JSON string from DB
  isInMyHumidor?: boolean; // Added flag
  line?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    };
  };
}

export default function CigarsPage() {
  const [cigars, setCigars] = useState<Cigar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingCigars, setTogglingCigars] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');

  useEffect(() => {
    fetchCigars();
  }, [searchQuery]);

  const fetchCigars = async () => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `/api/cigars?search=${encodeURIComponent(searchQuery)}`
        : '/api/cigars';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCigars(data.cigars || []);
      } else {
        console.error('Failed to fetch cigars:', data.error);
      }
    } catch (error) {
      console.error('Error fetching cigars:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHumidor = async (cigarId: string) => {
    const cigar = cigars.find(c => c.id === cigarId);
    if (!cigar) return;

    setTogglingCigars(prev => new Set(prev).add(cigarId));

    try {
      const response = await fetch(`/api/humidor/toggle?cigar_id=${encodeURIComponent(cigarId)}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Update the cigar's humidor status
        setCigars(prevCigars =>
          prevCigars.map(c =>
            c.id === cigarId ? { ...c, isInMyHumidor: data.inHumidor } : c
          )
        );
      } else {
        console.error('Failed to toggle humidor:', data.error);
        alert('Failed to update humidor. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling humidor:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setTogglingCigars(prev => {
        const next = new Set(prev);
        next.delete(cigarId);
        return next;
      });
    }
  };

  const formatPrice = (cents?: number | null) => {
    if (!cents) return null;
    return `$${(cents / 100).toFixed(2)}`;
  };

  const parseImageUrls = (imageUrlsStr?: string | null): string[] => {
    if (!imageUrlsStr) return [];
    try {
      return JSON.parse(imageUrlsStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Cigars</h1>
          <p className="text-muted-foreground">
            Browse and search the cigar database
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:items-center">
          <div className="flex rounded-lg border bg-background p-1">
            {([
              { id: 'grid', label: 'Grid', icon: LayoutGrid },
              { id: 'list', label: 'List', icon: Rows },
              { id: 'compact', label: 'Compact', icon: List },
            ] as const).map((option) => {
              const Icon = option.icon;
              const isActive = viewMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
          <Link
            href="/cigars/add"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Cigar</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by brand, line, or vitola..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading cigars...</p>
        </div>
      ) : cigars.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl">
          <p className="text-muted-foreground mb-4">
            Start by adding your first cigar!
          </p>
          <Link
            href="/cigars/add"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Your First Cigar
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cigars.map((cigar) => {
                const imageUrls = parseImageUrls(cigar.image_urls);
                return (
                  <div
                    key={cigar.id}
                    className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {imageUrls.length > 0 ? (
                      <div className="aspect-video w-full relative bg-muted">
                        <Image
                          src={imageUrls[0]}
                          alt={`${cigar.vitola} - ${cigar.line?.brand?.name} ${cigar.line?.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Cigarette className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg">
                              {cigar.line?.brand?.name || 'Unknown Brand'}{' '}
                              {cigar.line?.name || 'Unknown Line'}
                            </h3>
                          </div>
                          <p className="text-primary font-medium">{cigar.vitola}</p>
                        </div>
                        <CigarActions
                          cigar={cigar}
                          togglingCigars={togglingCigars}
                          toggleHumidor={toggleHumidor}
                        />
                      </div>

                      {cigar.isInMyHumidor && (
                        <HumidorBadge />
                      )}

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {cigar.ring_gauge && cigar.length_inches && (
                          <p>
                            {cigar.ring_gauge} × {cigar.length_inches}"
                          </p>
                        )}
                        {cigar.wrapper && (
                          <p>
                            <span className="font-medium">Wrapper:</span> {cigar.wrapper}
                          </p>
                        )}
                        {cigar.strength && (
                          <p>
                            <span className="font-medium">Strength:</span> {cigar.strength}
                          </p>
                        )}
                        {cigar.body && (
                          <p>
                            <span className="font-medium">Body:</span> {cigar.body}
                          </p>
                        )}
                        {formatPrice(cigar.msrp_cents) && (
                          <p className="text-foreground font-semibold">
                            {formatPrice(cigar.msrp_cents)}
                          </p>
                        )}
                        {imageUrls.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            +{imageUrls.length - 1} more image{imageUrls.length - 1 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {cigars.map((cigar) => {
                const imageUrls = parseImageUrls(cigar.image_urls);
                return (
                  <div
                    key={cigar.id}
                    className="bg-card border rounded-lg p-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-6"
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted md:h-32 md:w-48">
                      {imageUrls.length > 0 ? (
                        <Image
                          src={imageUrls[0]}
                          alt={`${cigar.vitola} - ${cigar.line?.brand?.name} ${cigar.line?.name}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Cigarette className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold">
                              {cigar.line?.brand?.name || 'Unknown Brand'}{' '}
                              {cigar.line?.name || 'Unknown Line'}
                            </h3>
                          </div>
                          <p className="text-primary font-medium">{cigar.vitola}</p>
                        </div>
                        <CigarActions
                          cigar={cigar}
                          togglingCigars={togglingCigars}
                          toggleHumidor={toggleHumidor}
                        />
                      </div>

                      {cigar.isInMyHumidor && <HumidorBadge />}

                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3 text-muted-foreground">
                        <Detail label="Dimensions">
                          {cigar.ring_gauge && cigar.length_inches
                            ? `${cigar.ring_gauge} × ${cigar.length_inches}"`
                            : '—'}
                        </Detail>
                        <Detail label="Wrapper">{cigar.wrapper || '—'}</Detail>
                        <Detail label="Binder">{cigar.binder || '—'}</Detail>
                        <Detail label="Filler">{cigar.filler || '—'}</Detail>
                        <Detail label="Strength">{cigar.strength || '—'}</Detail>
                        <Detail label="Body">{cigar.body || '—'}</Detail>
                        <Detail label="MSRP">
                          {formatPrice(cigar.msrp_cents) || '—'}
                        </Detail>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-2">
              {cigars.map((cigar) => {
                const imageUrls = parseImageUrls(cigar.image_urls);
                const brandName = cigar.line?.brand?.name || 'Unknown Brand';
                const lineName = cigar.line?.name || 'Unknown Line';
                return (
                  <div
                    key={cigar.id}
                    className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {imageUrls.length > 0 ? (
                        <Image
                          src={imageUrls[0]}
                          alt={`${cigar.vitola} - ${brandName} ${lineName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1 sm:space-y-0">
                        <p className="font-medium text-foreground">
                          {brandName} {lineName}
                        </p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {cigar.vitola} •{' '}
                          {cigar.ring_gauge && cigar.length_inches
                            ? `${cigar.ring_gauge} × ${cigar.length_inches}"`
                            : 'Dimensions N/A'}
                          {formatPrice(cigar.msrp_cents)
                            ? ` • ${formatPrice(cigar.msrp_cents)}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {cigar.isInMyHumidor && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            <Check className="h-3 w-3" />
                            In humidor
                          </span>
                        )}
                        <CigarActions
                          cigar={cigar}
                          togglingCigars={togglingCigars}
                          toggleHumidor={toggleHumidor}
                          variant="compact"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface CigarActionsProps {
  cigar: Cigar;
  togglingCigars: Set<string>;
  toggleHumidor: (id: string) => Promise<void>;
  variant?: 'default' | 'compact';
}

function CigarActions({ cigar, togglingCigars, toggleHumidor, variant = 'default' }: CigarActionsProps) {
  const buttonClasses =
    variant === 'compact'
      ? 'p-2 rounded-md transition-colors'
      : 'p-2 -m-2 rounded-lg transition-colors';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => toggleHumidor(cigar.id)}
        disabled={togglingCigars.has(cigar.id)}
        className={`${buttonClasses} ${
          cigar.isInMyHumidor
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title={cigar.isInMyHumidor ? 'Remove from my humidor' : 'Add to my humidor'}
      >
        {cigar.isInMyHumidor ? (
          <Check className="h-4 w-4" />
        ) : (
          <Package className="h-4 w-4" />
        )}
      </button>
      <Link
        href={`/cigars/${cigar.id}/edit`}
        className={buttonClasses}
        title="Edit cigar"
      >
        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </Link>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}

function HumidorBadge() {
  return (
    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
      <Check className="h-3 w-3" />
      <span>In my humidor</span>
    </div>
  );
}
