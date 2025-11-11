import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'WTS' | 'WTB' | 'WTT' | null;
    const status = searchParams.get('status') as 'ACTIVE' | 'DRAFT' | 'SOLD' | null;
    const region = searchParams.get('region');
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null;
    const userId = searchParams.get('userId');
    const cigarId = searchParams.get('cigar_id');
    const limit = parseInt(searchParams.get('limit') || '24');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    } else {
      // Default to ACTIVE listings if no status specified
      where.status = 'ACTIVE';
    }
    
    if (region) {
      where.region = region;
    }
    
    if (minPrice !== null || maxPrice !== null) {
      where.price_cents = {};
      if (minPrice !== null) {
        where.price_cents.gte = minPrice;
      }
      if (maxPrice !== null) {
        where.price_cents.lte = maxPrice;
      }
    }
    
    if (userId) {
      where.user_id = userId;
    }
    
    if (cigarId) {
      where.cigar_id = cigarId;
    }

    // Fetch listings with related data
    const [listingsData, total] = await Promise.all([
      prisma.listing.findMany({
        where,
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
        orderBy: {
          published_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.listing.count({ where }),
    ]);

    // Parse image_urls for each listing
    const listings = listingsData.map(listing => {
      let imageUrls: string[] = [];
      if (listing.image_urls) {
        try {
          imageUrls = JSON.parse(listing.image_urls);
        } catch {
          // If parsing fails, leave as empty array
        }
      }
      return {
        ...listing,
        image_urls: imageUrls,
      };
    });

    return NextResponse.json({
      success: true,
      listings,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      title,
      description,
      cigar_id,
      humidor_item_id,
      qty,
      condition,
      price_cents,
      currency = 'USD',
      region,
      city,
      meet_up_only = true,
      will_ship = false,
      image_urls,
      status = 'DRAFT',
    } = body;

    // Validation
    if (!type || !title || !description || !qty) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, title, description, qty' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['WTS', 'WTB', 'WTT'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be WTS, WTB, or WTT' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['DRAFT', 'ACTIVE'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be DRAFT or ACTIVE' },
        { status: 400 }
      );
    }

    // Price validation for WTS
    if (type === 'WTS' && (!price_cents || price_cents <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Price is required for WTS listings' },
        { status: 400 }
      );
    }

    // If listing from humidor item, validate availability
    if (humidor_item_id) {
      const humidorItem = await prisma.humidorItem.findUnique({
        where: { id: humidor_item_id },
      });

      if (!humidorItem) {
        return NextResponse.json(
          { success: false, error: 'Humidor item not found' },
          { status: 404 }
        );
      }

      if (humidorItem.user_id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: This humidor item does not belong to you' },
          { status: 403 }
        );
      }

      // Calculate available quantity (total - smoked)
      const availableQuantity = humidorItem.quantity - humidorItem.smoked_count;

      // Validate quantity doesn't exceed available quantity
      if (qty > availableQuantity) {
        return NextResponse.json(
          { success: false, error: `Quantity exceeds available quantity (${availableQuantity})` },
          { status: 400 }
        );
      }

      // If marketplace quantities are set, validate against them (optional check)
      if (type === 'WTS' && humidorItem.available_for_sale > 0) {
        if (qty > humidorItem.available_for_sale) {
          return NextResponse.json(
            { success: false, error: `Quantity exceeds available for sale (${humidorItem.available_for_sale}). Please update your marketplace availability first.` },
            { status: 400 }
          );
        }
      } else if (type === 'WTT' && humidorItem.available_for_trade > 0) {
        if (qty > humidorItem.available_for_trade) {
          return NextResponse.json(
            { success: false, error: `Quantity exceeds available for trade (${humidorItem.available_for_trade}). Please update your marketplace availability first.` },
            { status: 400 }
          );
        }
      }

      // Use cigar_id from humidor item if not provided
      if (!cigar_id) {
        body.cigar_id = humidorItem.cigar_id;
      }
    }

    // Create listing
    const listingData: any = {
      user_id: session.user.id,
      type,
      title,
      description,
      qty,
      condition: condition || null,
      price_cents: price_cents || null,
      currency,
      region: region || null,
      city: city || null,
      meet_up_only,
      will_ship,
      status,
      image_urls: image_urls ? JSON.stringify(image_urls) : null,
      cigar_id: cigar_id || null,
      humidor_item_id: humidor_item_id || null,
    };

    // Set published_at if status is ACTIVE
    if (status === 'ACTIVE') {
      listingData.published_at = new Date();
    }

    const listing = await prisma.listing.create({
      data: listingData,
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

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

