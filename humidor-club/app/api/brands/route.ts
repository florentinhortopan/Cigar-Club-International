import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import slugify from 'slugify';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const searchParam = request.nextUrl.searchParams.get('search');

    const brands = await prisma.brand.findMany({
      where: searchParam
        ? {
            name: {
              contains: searchParam,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

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
    const country: string | undefined = body?.country;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    const existingByName = await prisma.brand.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existingByName) {
      return NextResponse.json(
        { success: false, error: 'A brand with this name already exists.' },
        { status: 409 }
      );
    }

    const baseSlug = slugify(trimmedName, { lower: true, strict: true });
    let slug = baseSlug || slugify(`${trimmedName}-${Date.now()}`, { lower: true, strict: true });
    let counter = 1;

    while (
      await prisma.brand.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const brand = await prisma.brand.create({
      data: {
        name: trimmedName,
        slug,
        country: country?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error('Error in POST /api/brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}

