import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { markCigarAsSmoked } from '@/lib/humidor-queries';

/**
 * Mark cigars as smoked
 * POST /api/humidor/smoke
 * Body: { item_id: string, count?: number, smoked_date?: string (ISO date) }
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

    const body = await request.json();

    if (!body.item_id) {
      return NextResponse.json(
        { success: false, error: 'Missing item_id' },
        { status: 400 }
      );
    }

    const count = body.count || 1;
    const smokedDate = body.smoked_date ? new Date(body.smoked_date) : undefined;

    const updatedItem = await markCigarAsSmoked(
      body.item_id,
      session.user.id,
      count,
      smokedDate
    );

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: updatedItem.quantity === 0 
        ? 'All cigars from this item have been smoked' 
        : `${count} cigar(s) marked as smoked`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/humidor/smoke:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark cigar as smoked' },
      { status: 500 }
    );
  }
}

