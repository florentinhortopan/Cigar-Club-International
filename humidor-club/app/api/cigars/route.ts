import { NextResponse } from 'next/server';
import { getCigars, createCigar, type CreateCigarInput } from '@/lib/prisma-queries';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const cigars = await getCigars(limit);
    
    // Log the first cigar to debug relations
    if (cigars.length > 0) {
      console.log('📦 Sample cigar data:', JSON.stringify({
        id: cigars[0].id,
        vitola: cigars[0].vitola,
        line: cigars[0].line,
        hasLine: !!cigars[0].line,
        hasBrand: !!(cigars[0] as any).line?.brand,
      }, null, 2));
    }
    
    return NextResponse.json({
      success: true,
      cigars,
    });
  } catch (error) {
    console.error('Error in GET /api/cigars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cigars' },
      { status: 500 }
    );
  }
}

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
    
    // Automatically add to user's humidor
    try {
      const { addToHumidor } = await import('@/lib/humidor-queries');
      console.log('🔄 Adding cigar to humidor for user:', session.user.id, 'cigar:', cigar.id);
      const humidorItem = await addToHumidor({
        userId: session.user.id,
        cigarId: cigar.id,
        quantity: 1,
      });
      console.log('✅ Added to humidor:', humidorItem);
    } catch (humidError: any) {
      console.error('⚠️ Failed to add to humidor (cigar still created):', humidError);
      console.error('⚠️ Error details:', humidError.message, humidError.stack);
      // Don't fail the whole request if humidor add fails
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

