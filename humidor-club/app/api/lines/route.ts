import { NextResponse } from 'next/server';
import { getLinesByBrand, getAllLines } from '@/lib/prisma-queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    
    let lines;
    if (brandId) {
      lines = await getLinesByBrand(brandId);
    } else {
      lines = await getAllLines();
    }
    
    return NextResponse.json({
      success: true,
      lines,
    });
  } catch (error) {
    console.error('Error in GET /api/lines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lines' },
      { status: 500 }
    );
  }
}

