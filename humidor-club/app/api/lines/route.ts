import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import slugify from 'slugify';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getLinesByBrand, getAllLines } from '@/lib/prisma-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const search = searchParams.get('search');
    
    let lines;
    if (brandId) {
      lines = await prisma.line.findMany({
        where: {
          brand_id: brandId,
          name: search
            ? {
                contains: search,
                mode: 'insensitive',
              }
            : undefined,
        },
        orderBy: { name: 'asc' },
      });
    } else {
      lines = await prisma.line.findMany({
        where: search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : undefined,
        orderBy: { name: 'asc' },
      });
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
    const name: string | undefined = body?.name;
    const brandId: string | undefined = body?.brandId;

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Brand ID is required to create a product line' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Line name is required' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    const trimmedName = name.trim();

    const existingLine = await prisma.line.findFirst({
      where: {
        brand_id: brandId,
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existingLine) {
      return NextResponse.json(
        { success: false, error: 'A line with this name already exists for the selected brand.' },
        { status: 409 }
      );
    }

    const baseSlug = slugify(trimmedName, { lower: true, strict: true });
    let slug = baseSlug || slugify(`${trimmedName}-${Date.now()}`, { lower: true, strict: true });
    let counter = 1;

    while (
      await prisma.line.findFirst({
        where: {
          brand_id: brandId,
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const line = await prisma.line.create({
      data: {
        name: trimmedName,
        slug,
        brand_id: brandId,
      },
    });

    return NextResponse.json({
      success: true,
      line,
    });
  } catch (error) {
    console.error('Error in POST /api/lines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create line' },
      { status: 500 }
    );
  }
}

