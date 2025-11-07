import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users/[id]/humidor
 * Get a user's public humidor items (for viewing other users' collections)
 */
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's humidor items (only items with quantity > 0)
    const items = await prisma.humidorItem.findMany({
      where: {
        user_id: id,
        quantity: { gt: 0 }, // Only show items with remaining cigars
      },
      include: {
        cigar: {
          include: {
            line: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate stats
    const totalCigars = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => {
      const price = item.purchase_price_cents || 0;
      return sum + (price * item.quantity);
    }, 0);

    return NextResponse.json({
      success: true,
      items,
      stats: {
        totalCigars,
        totalValue,
        uniqueCigars: items.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/users/[id]/humidor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch humidor' },
      { status: 500 }
    );
  }
}

