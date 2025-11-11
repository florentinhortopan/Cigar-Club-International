import { NextResponse } from 'next/server';
import { getCigars, createCigar, type CreateCigarInput } from '@/lib/prisma-queries';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    
    // Get user session to check humidor status
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get cigars with optional search
    const { prisma } = await import('@/lib/prisma');
    let cigars;
    
    if (search) {
      // Search by brand name, line name, or vitola
      cigars = await prisma.cigar.findMany({
        include: {
          line: {
            include: {
              brand: true,
            },
          },
        },
        where: {
          OR: [
            { vitola: { contains: search, mode: 'insensitive' } },
            { line: { name: { contains: search, mode: 'insensitive' } } },
            { line: { brand: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      });
    } else {
      cigars = await getCigars(limit);
    }
    
    // If user is logged in, check which cigars are in their humidor
    let humidorCigarIds: string[] = [];
    if (userId) {
      const humidorItems = await prisma.humidorItem.findMany({
        where: { user_id: userId },
        select: { cigar_id: true },
      });
      humidorCigarIds = humidorItems.map(item => item.cigar_id);
    }
    
    // Get pairing counts for all cigars in one query (only if we have cigars)
    const cigarIds = cigars.map(c => c.id);
    const pairingCountMap = new Map<string, number>();
    const listingCountMap = new Map<string, number>();
    
    if (cigarIds.length > 0) {
      // Get pairing counts
      const pairingCounts = await prisma.pairing.groupBy({
        by: ['cigar_id'],
        where: {
          cigar_id: { in: cigarIds },
        },
        _count: {
          id: true,
        },
      });
      
      // Create a map of cigar_id to pairing count
      pairingCounts.forEach(p => {
        pairingCountMap.set(p.cigar_id, p._count.id);
      });

      // Get listing counts (only ACTIVE listings with a cigar_id)
      if (cigarIds.length > 0) {
        try {
          // Get all active listings with cigar_id in our list
          // Note: Prisma's `in` operator automatically excludes null values
          const activeListings = await prisma.listing.findMany({
            where: {
              cigar_id: { in: cigarIds },
              status: 'ACTIVE',
            },
            select: {
              cigar_id: true,
            },
          });
          
          // Debug: Log counts for troubleshooting
          if (activeListings.length > 0) {
            console.log(`[Cigars API] Found ${activeListings.length} active listings for ${cigarIds.length} cigars`);
          }
          
          // Count listings per cigar_id (filter out any nulls just in case)
          activeListings.forEach(listing => {
            if (listing.cigar_id) {
              listingCountMap.set(listing.cigar_id, (listingCountMap.get(listing.cigar_id) || 0) + 1);
            }
          });
        } catch (error) {
          console.error('Error fetching listing counts:', error);
          // Continue without listing counts if there's an error
        }
      }
    }
    
    // Add isInMyHumidor flag, pairing count, and listing count to each cigar
    const cigarsWithStatus = cigars.map(cigar => ({
      ...cigar,
      isInMyHumidor: humidorCigarIds.includes(cigar.id),
      pairingCount: pairingCountMap.get(cigar.id) || 0,
      listingCount: listingCountMap.get(cigar.id) || 0,
    }));
    
    return NextResponse.json({
      success: true,
      cigars: cigarsWithStatus,
    });
  } catch (error) {
    console.error('Error in GET /api/cigars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cigars' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('📥 Received request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.line || !body.vitola) {
      console.error('❌ Missing required fields:', { hasLine: !!body.line, hasVitola: !!body.vitola });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: line and vitola' },
        { status: 400 }
      );
    }
    
    // Create the cigar
    const cigarInput: CreateCigarInput = {
      line: body.line,
      vitola: body.vitola,
      ring_gauge: body.ring_gauge,
      length_inches: body.length_inches,
      wrapper: body.wrapper,
      binder: body.binder,
      filler: body.filler,
      filler_tobaccos: body.filler_tobaccos,
      image_urls: body.image_urls,
      strength: body.strength,
      body: body.body,
      msrp_cents: body.msrp_cents,
      typical_street_cents: body.typical_street_cents,
      country: body.country,
      factory: body.factory,
    };
    
    console.log('📦 Creating cigar with input:', JSON.stringify(cigarInput, null, 2));
    
    // Verify line exists
    try {
      const { prisma } = await import('@/lib/prisma');
      const lineExists = await prisma.line.findUnique({
        where: { id: cigarInput.line },
      });
      if (!lineExists) {
        console.error('❌ Line not found:', cigarInput.line);
        return NextResponse.json(
          { success: false, error: `Line with ID ${cigarInput.line} not found` },
          { status: 400 }
        );
      }
      console.log('✅ Line exists:', lineExists.name);
    } catch (checkError) {
      console.error('❌ Error checking line:', checkError);
    }
    
    const cigar = await createCigar(cigarInput);
    console.log('✅ Cigar created:', cigar.id);
    
    // Optionally add to user's humidor if requested
    if (cigar.id && body.add_to_humidor !== false) {
      try {
        const { addToHumidor } = await import('@/lib/humidor-queries');
        const quantity = body.humidor_quantity && body.humidor_quantity > 0 
          ? body.humidor_quantity 
          : 1;
        console.log('🔄 Adding cigar to humidor for user:', session.user.id, 'cigar:', cigar.id, 'quantity:', quantity);
        const humidorItem = await addToHumidor({
          userId: session.user.id,
          cigarId: cigar.id,
          quantity: quantity,
        });
        console.log('✅ Added to humidor:', humidorItem);
      } catch (humidError: any) {
        console.error('⚠️ Failed to add to humidor (cigar still created):', humidError);
        console.error('⚠️ Error details:', humidError.message, humidError.stack);
        // Don't fail the whole request if humidor add fails
      }
    }
    
    return NextResponse.json({
      success: true,
      cigar,
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/cigars:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create cigar',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

