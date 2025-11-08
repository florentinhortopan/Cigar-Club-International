import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getPairingsByCigar, updateCigar, type CreateCigarInput } from '@/lib/prisma-queries';

export const dynamic = 'force-dynamic';

function serializeCigar(cigar: any) {
  if (!cigar) return null;
  return {
    id: cigar.id,
    vitola: cigar.vitola,
    ring_gauge: cigar.ring_gauge,
    length_inches: cigar.length_inches,
    wrapper: cigar.wrapper,
    binder: cigar.binder,
    filler: cigar.filler,
    strength: cigar.strength,
    body: cigar.body,
    msrp_cents: cigar.msrp_cents,
    country: cigar.country,
    factory: cigar.factory,
    image_urls: cigar.image_urls,
    line: cigar.line
      ? {
          id: cigar.line.id,
          name: cigar.line.name,
          brand: cigar.line.brand
            ? {
                id: cigar.line.brand.id,
                name: cigar.line.brand.name,
              }
            : null,
        }
      : null,
  };
}

function serializePairings(pairings: Awaited<ReturnType<typeof getPairingsByCigar>>) {
  return pairings.map((pairing) => ({
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
      : null,
  }));
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const cigar = await prisma.cigar.findUnique({
      where: { id },
      include: {
        line: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!cigar) {
      return NextResponse.json(
        { success: false, error: 'Cigar not found' },
        { status: 404 }
      );
    }

    const pairings = await getPairingsByCigar(id);

    return NextResponse.json({
      success: true,
      cigar: serializeCigar(cigar),
      pairings: serializePairings(pairings),
      currentUserId: session.user.id ?? null,
    });
  } catch (error) {
    console.error('Error in GET /api/cigars/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load cigar detail' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updateInput: Partial<CreateCigarInput> = {};
    if (body.line !== undefined) updateInput.line = body.line;
    if (body.vitola !== undefined) updateInput.vitola = body.vitola;
    if (body.ring_gauge !== undefined) updateInput.ring_gauge = body.ring_gauge;
    if (body.length_inches !== undefined) updateInput.length_inches = body.length_inches;
    if (body.wrapper !== undefined) updateInput.wrapper = body.wrapper;
    if (body.binder !== undefined) updateInput.binder = body.binder;
    if (body.filler !== undefined) updateInput.filler = body.filler;
    if (body.filler_tobaccos !== undefined) updateInput.filler_tobaccos = body.filler_tobaccos;
    if (body.image_urls !== undefined) updateInput.image_urls = body.image_urls;
    if (body.strength !== undefined) updateInput.strength = body.strength;
    if (body.body !== undefined) updateInput.body = body.body;
    if (body.msrp_cents !== undefined) updateInput.msrp_cents = body.msrp_cents;
    if (body.typical_street_cents !== undefined) updateInput.typical_street_cents = body.typical_street_cents;
    if (body.country !== undefined) updateInput.country = body.country;
    if (body.factory !== undefined) updateInput.factory = body.factory;

    console.log('📝 Updating cigar:', id, 'with:', updateInput);
    const updatedCigar = await updateCigar(id, updateInput);
    console.log('✅ Cigar updated:', updatedCigar);

    return NextResponse.json({
      success: true,
      cigar: updatedCigar,
    });
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/cigars/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update cigar',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

