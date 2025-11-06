import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/branches/[slug]
 * Get a specific branch by slug
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const branch = await prisma.branch.findUnique({
      where: { slug },
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
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Update member_count with actual count
    const branchWithCount = {
      ...branch,
      member_count: branch._count.members,
    };

    return NextResponse.json({
      success: true,
      branch: branchWithCount,
    });
  } catch (error) {
    console.error('Error in GET /api/branches/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branch' },
      { status: 500 }
    );
  }
}

