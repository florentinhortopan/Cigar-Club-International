import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getHumidorItems, addToHumidor, getHumidorStats } from '@/lib/humidor-queries';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const items = await getHumidorItems(session.user.id);
    const stats = await getHumidorStats(session.user.id);

    // Fetch cigar details for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const cigar = await prisma.cigar.findUnique({
          where: { id: item.cigar_id },
          include: {
            line: {
              include: {
                brand: true,
              },
            },
          },
        });

        return {
          ...item,
          cigar,
        };
      })
    );

    return NextResponse.json({
      success: true,
      items: itemsWithDetails,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/humidor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch humidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.cigar_id) {
      return NextResponse.json(
        { success: false, error: 'Missing cigar_id' },
        { status: 400 }
      );
    }

    const item = await addToHumidor({
      userId: session.user.id,
      cigarId: body.cigar_id,
      quantity: body.quantity || 1,
      purchasePriceCents: body.purchase_price_cents,
      purchaseDate: body.purchase_date ? new Date(body.purchase_date) : undefined,
      location: body.location,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Error in POST /api/humidor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to humidor' },
      { status: 500 }
    );
  }
}

