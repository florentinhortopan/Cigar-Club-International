import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/branches
 * List all active branches
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const active = searchParams.get('active') !== 'false';

    const where: any = {};
    if (active) {
      where.is_active = true;
    }
    if (country) {
      where.country = country;
    }
    if (city) {
      where.city = city;
    }

    const branches = await prisma.branch.findMany({
      where,
      include: {
        created_by: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: [
        { member_count: 'desc' },
        { created_at: 'desc' },
      ],
    });

    // Update member_count with actual count
    const branchesWithCount = branches.map(branch => ({
      ...branch,
      member_count: branch._count.members,
    }));

    return NextResponse.json({
      success: true,
      branches: branchesWithCount,
    });
  } catch (error) {
    console.error('Error in GET /api/branches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches
 * Create a new branch (requires authentication)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name and slug' },
        { status: 400 }
      );
    }

    // Validate slug format (URL-friendly)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingBranch = await prisma.branch.findUnique({
      where: { slug: body.slug },
    });

    if (existingBranch) {
      return NextResponse.json(
        { success: false, error: 'A branch with this slug already exists' },
        { status: 400 }
      );
    }

    // Create the branch
    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        slug: body.slug,
        city: body.city,
        region: body.region,
        country: body.country,
        description: body.description,
        homepage_content: body.homepage_content,
        logo_url: body.logo_url,
        banner_url: body.banner_url,
        contact_email: body.contact_email,
        website: body.website,
        created_by_id: session.user.id,
        is_active: true,
      },
      include: {
        created_by: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Automatically join the creator to the branch
    await prisma.user.update({
      where: { id: session.user.id },
      data: { branch_id: branch.id },
    });

    // Update member count
    await prisma.branch.update({
      where: { id: branch.id },
      data: { member_count: 1 },
    });

    return NextResponse.json({
      success: true,
      branch,
      message: 'Branch created successfully. You have been automatically added as a member.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/branches:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create branch' },
      { status: 500 }
    );
  }
}

