import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
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
    const body = await request.json();
    const { available_for_sale, available_for_trade } = body;

    // Find the humidor item
    const humidorItem = await prisma.humidorItem.findUnique({
      where: { id },
    });

    if (!humidorItem) {
      return NextResponse.json(
        { success: false, error: 'Humidor item not found' },
        { status: 404 }
      );
    }

    // Check if user owns this item
    if (humidorItem.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only update your own humidor items' },
        { status: 403 }
      );
    }

    // Calculate available quantity (total - smoked)
    const availableQuantity = humidorItem.quantity - humidorItem.smoked_count;

    // Validate quantities
    const newAvailableForSale = available_for_sale !== undefined ? parseInt(available_for_sale) : humidorItem.available_for_sale;
    const newAvailableForTrade = available_for_trade !== undefined ? parseInt(available_for_trade) : humidorItem.available_for_trade;

    // Ensure quantities are non-negative
    if (newAvailableForSale < 0 || newAvailableForTrade < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantities cannot be negative' },
        { status: 400 }
      );
    }

    // Validate that sale + trade doesn't exceed available quantity
    if (newAvailableForSale + newAvailableForTrade > availableQuantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Total available (sale + trade) cannot exceed available quantity (${availableQuantity})` 
        },
        { status: 400 }
      );
    }

    // Update the humidor item
    const updatedItem = await prisma.humidorItem.update({
      where: { id },
      data: {
        available_for_sale: newAvailableForSale,
        available_for_trade: newAvailableForTrade,
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
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error('Error updating humidor item marketplace status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update humidor item' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

