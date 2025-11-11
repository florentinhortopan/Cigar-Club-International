import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
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

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    // Parse image_urls if it exists
    let imageUrls: string[] = [];
    if (listing.image_urls) {
      try {
        imageUrls = JSON.parse(listing.image_urls);
      } catch {
        // If parsing fails, leave as empty array
      }
    }

    return NextResponse.json({
      success: true,
      listing: {
        ...listing,
        image_urls: imageUrls,
      },
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

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

    // Check if listing exists and user owns it
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only update your own listings' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.qty !== undefined) updateData.qty = body.qty;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.price_cents !== undefined) updateData.price_cents = body.price_cents;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.meet_up_only !== undefined) updateData.meet_up_only = body.meet_up_only;
    if (body.will_ship !== undefined) updateData.will_ship = body.will_ship;
    if (body.image_urls !== undefined) {
      updateData.image_urls = Array.isArray(body.image_urls)
        ? JSON.stringify(body.image_urls)
        : body.image_urls;
    }

    // Handle status changes
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // Set published_at when status changes to ACTIVE
      if (body.status === 'ACTIVE' && existingListing.status !== 'ACTIVE') {
        updateData.published_at = new Date();
      }
      
      // Set sold_at when status changes to SOLD
      if (body.status === 'SOLD' && existingListing.status !== 'SOLD') {
        updateData.sold_at = new Date();
      }
    }

    // Validate quantity if updating from humidor item
    if (body.qty !== undefined && existingListing.humidor_item_id) {
      const humidorItem = await prisma.humidorItem.findUnique({
        where: { id: existingListing.humidor_item_id },
      });

      if (humidorItem) {
        const availableQuantity = existingListing.type === 'WTS'
          ? humidorItem.available_for_sale
          : humidorItem.available_for_trade;

        if (body.qty > availableQuantity) {
          return NextResponse.json(
            { success: false, error: `Quantity exceeds available quantity (${availableQuantity})` },
            { status: 400 }
          );
        }
      }
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
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

    // Parse image_urls
    let imageUrls: string[] = [];
    if (updatedListing.image_urls) {
      try {
        imageUrls = JSON.parse(updatedListing.image_urls);
      } catch {
        // If parsing fails, leave as empty array
      }
    }

    return NextResponse.json({
      success: true,
      listing: {
        ...updatedListing,
        image_urls: imageUrls,
      },
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if listing exists and user owns it
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only delete your own listings' },
        { status: 403 }
      );
    }

    // Delete listing (or update status to WITHDRAWN)
    await prisma.listing.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing withdrawn successfully',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

