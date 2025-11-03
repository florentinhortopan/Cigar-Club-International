'use client';

import Link from 'next/link';
import { Plus, Cigarette, Image as ImageIcon, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchCigars();
  }, []);

  const fetchCigars = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cigars');
      const data = await response.json();
      
      if (data.success) {
        console.log('📦 Received cigars from API:', data.cigars.length);
        if (data.cigars.length > 0) {
          console.log('🔍 First cigar data:', {
            id: data.cigars[0].id,
            vitola: data.cigars[0].vitola,
            hasLine: !!data.cigars[0].line,
            lineName: data.cigars[0].line?.name,
            brandName: data.cigars[0].line?.brand?.name,
            fullLine: data.cigars[0].line,
          });
        }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cigars</h1>
          <p className="text-muted-foreground mt-2">
            Browse and search the cigar database
          </p>
        </div>
        <Link
          href="/cigars/add"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Cigar</span>
        </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cigars.map((cigar) => {
            const imageUrls = parseImageUrls(cigar.image_urls);
            return (
              <div
                key={cigar.id}
                className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
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
                    <Link
                      href={`/cigars/${cigar.id}/edit`}
                      className="p-2 -m-2 hover:bg-muted rounded-lg transition-colors"
                      title="Edit cigar"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>

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
    </div>
  );
}
