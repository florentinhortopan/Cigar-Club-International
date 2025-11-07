import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  createPairing,
  getPairingsByCigar,
  type PairingKind,
} from '@/lib/prisma-queries';

const ALLOWED_PAIRING_KINDS: PairingKind[] = ['CIGAR', 'FOOD', 'DRINK', 'EVENT', 'STYLE'];

function normalizeKind(kind: string | undefined | null): PairingKind | null {
  if (!kind) return null;
  const upper = kind.toUpperCase() as PairingKind;
  return ALLOWED_PAIRING_KINDS.includes(upper) ? upper : null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const pairings = await getPairingsByCigar(id);

    return NextResponse.json({
      success: true,
      pairings,
    });
  } catch (error) {
    console.error('Error in GET /api/cigars/[id]/pairings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pairings' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { id: cigarId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const kind = normalizeKind(body.kind);
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined;

    if (!kind) {
      return NextResponse.json(
        { success: false, error: 'Invalid pairing kind provided.' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required.' },
        { status: 400 }
      );
    }

    const pairing = await createPairing({
      cigarId,
      userId: session.user.id,
      kind,
      description,
      imageUrl,
    });

    return NextResponse.json({
      success: true,
      pairing,
    });
  } catch (error) {
    console.error('Error in POST /api/cigars/[id]/pairings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create pairing' },
      { status: 500 }
    );
  }
}

