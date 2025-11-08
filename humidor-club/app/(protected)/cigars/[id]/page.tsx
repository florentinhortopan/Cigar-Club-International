export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getPairingsByCigar } from '@/lib/prisma-queries';
import PairingsPanel from './pairings-panel';

type CigarPageProps = {
  params: {
    id: string;
  };
};

export default async function CigarDetailPage({ params }: CigarPageProps) {
  const rawId = params?.id;
  const cigarId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!cigarId || typeof cigarId !== 'string') {
    notFound();
  }

  const session = await getServerSession(authOptions);

  const cigar = await prisma.cigar.findUnique({
    where: { id: cigarId },
    include: {
      line: {
        include: {
          brand: true,
        },
      },
    },
  });

  if (!cigar) {
    notFound();
  }

  const pairings = await getPairingsByCigar(cigarId);

  const heroImage = (() => {
    if (!cigar.image_urls) {
      return null;
    }
    try {
      const urls = JSON.parse(cigar.image_urls) as string[];
      return Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
    } catch {
      return null;
    }
  })();

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
            cigarId={cigarId}
            currentUserId={session?.user?.id}
            initialPairings={pairings.map((pairing) => ({
              id: pairing.id,
              cigar_id: pairing.cigar_id,
              user_id: pairing.user_id,
              kind: pairing.kind,
              description: pairing.description,
              image_url: pairing.image_url ?? null,
              created_at: pairing.created_at.toISOString(),
              author: pairing.author
                ? {
                    id: pairing.author.id,
                    name: pairing.author.name,
                    image: pairing.author.image,
                    branch: pairing.author.branch
                      ? {
                          id: pairing.author.branch.id,
                          name: pairing.author.branch.name,
                          city: pairing.author.branch.city,
                          region: pairing.author.branch.region,
                          country: pairing.author.branch.country,
                        }
                      : null,
                  }
                : undefined,
            }))}
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/cigars/${cigarId}/edit`}
                className="flex w-full items-center justify-center rounded-lg border px-4 py-2 font-semibold hover:bg-muted"
              >
                Edit this cigar
              </Link>
              <Link
                href={`/cigars`}
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

