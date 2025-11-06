import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { addToHumidor } from '@/lib/humidor-queries';

/**
 * Toggle cigar in/out of user's humidor
 * POST /api/humidor/toggle?cigar_id=xxx
 * If cigar is in humidor, removes it. If not, adds it.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cigarId = searchParams.get('cigar_id');

    if (!cigarId) {
      return NextResponse.json(
        { success: false, error: 'Missing cigar_id' },
        { status: 400 }
      );
    }

    // Check if cigar is already in humidor
    const existingItem = await prisma.humidorItem.findFirst({
      where: {
        user_id: session.user.id,
        cigar_id: cigarId,
      },
    });

    if (existingItem) {
      // Remove from humidor
      await prisma.humidorItem.delete({
        where: { id: existingItem.id },
      });

      return NextResponse.json({
        success: true,
        action: 'removed',
        inHumidor: false,
      });
    } else {
      // Add to humidor
      const item = await addToHumidor({
        userId: session.user.id,
        cigarId: cigarId,
        quantity: 1,
      });

      return NextResponse.json({
        success: true,
        action: 'added',
        inHumidor: true,
        item,
      });
    }
  } catch (error) {
    console.error('Error in POST /api/humidor/toggle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle humidor status' },
      { status: 500 }
    );
  }
}

