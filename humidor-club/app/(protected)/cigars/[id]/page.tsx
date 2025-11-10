'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PairingsPanel from './pairings-panel';
import type { PairingKind } from '@/lib/prisma-queries';

type ApiPairing = {
  id: string;
  cigar_id: string;
  user_id: string;
  kind: PairingKind;
  description: string;
  image_url: string | null;
  created_at: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
    branch?: {
      id: string;
      name: string;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
  } | null;
};

type ApiCigar = {
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
  country?: string | null;
  factory?: string | null;
  image_urls?: string | null;
  line?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type ApiResponse =
  | {
      success: true;
      cigar: ApiCigar;
      pairings: ApiPairing[];
      currentUserId: string | null;
    }
  | { success: false; error: string };

export default function CigarDetailPage() {
  const params = useParams();
  const cigarId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Extract<ApiResponse, { success: true }> | null>(null);

  useEffect(() => {
    if (!cigarId) {
      setError('Invalid cigar id');
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/cigars/${cigarId}`, {
          credentials: 'include',
        });
        const json: ApiResponse = await response.json();
        if (response.status === 401) {
          const callback = encodeURIComponent(window.location.pathname);
          window.location.href = `/sign-in?callbackUrl=${callback}`;
          return;
        }
        if (!response.ok || !json.success) {
          throw new Error(json.success ? 'Failed to load cigar' : json.error);
        }
        if (isMounted) {
          setData(json);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load cigar');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [cigarId]);

  const heroImage = useMemo(() => {
    if (!data?.cigar?.image_urls) {
      return null;
    }
    try {
      const urls = JSON.parse(data.cigar.image_urls) as string[];
      return Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
    } catch {
      return null;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading cigar details…</p>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="space-y-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Cigar not available</h1>
        <p className="text-muted-foreground">
          {error || 'We could not find this cigar. It may have been removed or you no longer have access.'}
        </p>
        <Link
          href="/cigars"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to cigars
        </Link>
      </div>
    );
  }

  const cigar = data.cigar;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/cigars" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to all cigars
          </Link>
          <h1 className="mt-2 text-3xl font-bold">
            {cigar.line?.brand?.name || 'Unknown Brand'} {cigar.line?.name || ''}
          </h1>
          <p className="text-lg text-primary">{cigar.vitola}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {heroImage ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
              <Image src={heroImage} alt={`${cigar.vitola} primary photo`} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              No photo available
            </div>
          )}

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Cigar Details</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Brand" value={cigar.line?.brand?.name ?? '—'} />
              <Detail label="Line" value={cigar.line?.name ?? '—'} />
              <Detail label="Vitola" value={cigar.vitola ?? '—'} />
              <Detail
                label="Dimensions"
                value={
                  cigar.ring_gauge && cigar.length_inches
                    ? `${cigar.ring_gauge} × ${cigar.length_inches}"`
                    : '—'
                }
              />
              <Detail label="Wrapper" value={cigar.wrapper ?? '—'} />
              <Detail label="Binder" value={cigar.binder ?? '—'} />
              <Detail label="Filler" value={cigar.filler ?? '—'} />
              <Detail label="Strength" value={cigar.strength ?? '—'} />
              <Detail label="Body" value={cigar.body ?? '—'} />
              <Detail
                label="MSRP"
                value={cigar.msrp_cents ? `$${(cigar.msrp_cents / 100).toFixed(2)}` : '—'}
              />
              <Detail label="Country" value={cigar.country ?? '—'} />
              <Detail label="Factory" value={cigar.factory ?? '—'} />
            </dl>
          </div>

          <PairingsPanel
            cigarId={cigar.id}
            currentUserId={data.currentUserId}
            initialPairings={data.pairings.map((pairing) => ({
              ...pairing,
              author: pairing.author ?? undefined,
            }))}
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/cigars/${cigar.id}/edit`}
                className="flex w-full items-center justify-center rounded-lg border px-4 py-2 font-semibold hover:bg-muted"
              >
                Edit this cigar
              </Link>
              <Link
                href="/cigars"
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Browse more cigars
              </Link>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-3 text-sm text-muted-foreground">
            <p>
              Pairings are shared by community members and help others discover great combinations with this cigar.
            </p>
            <p>Keep it respectful and include a photo when you can—the more context, the better.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium text-foreground">{value}</dd>
    </div>
  );
}

