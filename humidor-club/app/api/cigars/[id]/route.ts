import { NextRequest, NextResponse } from 'next/server';
import { getCigarById, updateCigar, type CreateCigarInput } from '@/lib/prisma-queries';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cigar = await getCigarById(id);
    
    if (!cigar) {
      return NextResponse.json(
        { success: false, error: 'Cigar not found' },
        { status: 404 }
      );
    }
    
    // Include line and brand relations
    const { prisma } = await import('@/lib/prisma');
    const cigarWithRelations = await prisma.cigar.findUnique({
      where: { id },
      include: {
        line: {
          include: {
            brand: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      cigar: cigarWithRelations,
    });
  } catch (error) {
    console.error('Error in GET /api/cigars/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cigar' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Build update input
    const updateInput: Partial<CreateCigarInput> = {};
    if (body.line !== undefined) updateInput.line = body.line;
    if (body.vitola !== undefined) updateInput.vitola = body.vitola;
    if (body.ring_gauge !== undefined) updateInput.ring_gauge = body.ring_gauge;
    if (body.length_inches !== undefined) updateInput.length_inches = body.length_inches;
    if (body.wrapper !== undefined) updateInput.wrapper = body.wrapper;
    if (body.binder !== undefined) updateInput.binder = body.binder;
    if (body.filler !== undefined) updateInput.filler = body.filler;
    if (body.filler_tobaccos !== undefined) updateInput.filler_tobaccos = body.filler_tobaccos;
    if (body.image_urls !== undefined) updateInput.image_urls = body.image_urls;
    if (body.strength !== undefined) updateInput.strength = body.strength;
    if (body.body !== undefined) updateInput.body = body.body;
    if (body.msrp_cents !== undefined) updateInput.msrp_cents = body.msrp_cents;
    if (body.typical_street_cents !== undefined) updateInput.typical_street_cents = body.typical_street_cents;
    if (body.country !== undefined) updateInput.country = body.country;
    if (body.factory !== undefined) updateInput.factory = body.factory;
    
    console.log('📝 Updating cigar:', id, 'with:', updateInput);
    const updatedCigar = await updateCigar(id, updateInput);
    console.log('✅ Cigar updated:', updatedCigar);
    
    return NextResponse.json({
      success: true,
      cigar: updatedCigar,
    });
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/cigars/[id]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update cigar',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

