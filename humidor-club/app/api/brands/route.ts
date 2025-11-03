import { NextResponse } from 'next/server';
import { getBrands } from '@/lib/prisma-queries';

export async function GET() {
  try {
    const brands = await getBrands();
    
    return NextResponse.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error('Error in GET /api/brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

