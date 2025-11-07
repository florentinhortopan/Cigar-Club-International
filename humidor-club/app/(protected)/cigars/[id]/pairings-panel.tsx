'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Image as ImageIcon, Loader2, PlusCircle } from 'lucide-react';
import type { PairingKind } from '@/lib/prisma-queries';

type SerializablePairing = {
  id: string;
  cigar_id: string;
  user_id: string;
  kind: PairingKind;
  description: string;
  image_url?: string | null;
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
  };
};

type PairingsPanelProps = {
  cigarId: string;
  currentUserId: string | null | undefined;
  initialPairings: SerializablePairing[];
};

const KIND_OPTIONS: { value: PairingKind; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { value: 'DRINK', label: 'Drink' },
  { value: 'FOOD', label: 'Food' },
  { value: 'CIGAR', label: 'Another Cigar' },
  { value: 'EVENT', label: 'Event' },
  { value: 'STYLE', label: 'Style' },
];

export default function PairingsPanel({ cigarId, currentUserId, initialPairings }: PairingsPanelProps) {
  const [pairings, setPairings] = useState(initialPairings);
  const [kind, setKind] = useState<PairingKind>('DRINK');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formattedPairings = useMemo(() => {
    return pairings.map((pairing) => ({
      ...pairing,
      createdAtFormatted: new Date(pairing.created_at).toLocaleString(),
    }));
  }, [pairings]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrl(data.url);
    } catch (error) {
      console.error('Failed to upload pairing image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUserId) {
      alert('Please sign in to share a pairing.');
      return;
    }
    if (!description.trim()) {
      alert('Description is required.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/cigars/${cigarId}/pairings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            description,
            imageUrl,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create pairing');
        }

        const newPairing: SerializablePairing = {
          ...data.pairing,
          created_at: data.pairing.created_at,
        };

        setPairings((prev) => [newPairing, ...prev]);
        setDescription('');
        setImageUrl(null);
      } catch (error) {
        console.error('Failed to create pairing:', error);
        alert('Failed to save pairing. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pairings from Members</h2>
        <span className="text-sm text-muted-foreground">
          {pairings.length} {pairings.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PlusCircle className="h-4 w-4" />
          Share how you pair this cigar with others in the club.
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr,2fr]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pairing Kind</label>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as PairingKind)}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell members why this pairing works so well..."
              className="w-full min-h-[120px] resize-none rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Photo (optional)</label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1 rounded-lg border border-dashed bg-muted/30 p-4">
              {imageUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-md">
                  <Image src={imageUrl} alt="Pairing photo" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <p>Upload a photo that captures this pairing.</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border bg-background px-4 font-medium transition hover:bg-muted">
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span>Choose Photo</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
                    }
                  }}
                  disabled={uploading}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 px-4 text-sm font-medium text-destructive hover:bg-destructive/20"
                  onClick={() => setImageUrl(null)}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Share Pairing
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {formattedPairings.length === 0 ? (
          <div className="rounded-xl border bg-muted/40 p-12 text-center text-muted-foreground">
            No pairings yet. Be the first to share how you enjoy this cigar.
          </div>
        ) : (
          formattedPairings.map((pairing) => (
            <div key={pairing.id} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {pairing.kind.replace('_', ' ')}
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{pairing.description}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{pairing.createdAtFormatted}</p>
                  {pairing.author && (
                    <p className="mt-1">
                      by{' '}
                      <Link
                        href={`/people?userId=${pairing.author.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {pairing.author.name || 'Member'}
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {pairing.author?.branch && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {pairing.author.branch.name}
                  {pairing.author.branch.city ? ` • ${pairing.author.branch.city}` : ''}
                  {pairing.author.branch.country ? ` • ${pairing.author.branch.country}` : ''}
                </p>
              )}

              {pairing.image_url && (
                <div className="relative mt-4 h-60 w-full overflow-hidden rounded-lg border">
                  <Image
                    src={pairing.image_url}
                    alt={`Pairing photo for ${pairing.kind}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

