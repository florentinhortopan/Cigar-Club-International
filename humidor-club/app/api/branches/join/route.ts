import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/branches/join
 * Join a branch (set user's branch_id)
 * Body: { branch_id: string }
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

    if (!body.branch_id) {
      return NextResponse.json(
        { success: false, error: 'Missing branch_id' },
        { status: 400 }
      );
    }

    // Verify branch exists and is active
    const branch = await prisma.branch.findUnique({
      where: { id: body.branch_id },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      );
    }

    if (!branch.is_active) {
      return NextResponse.json(
        { success: false, error: 'Branch is not active' },
        { status: 400 }
      );
    }

    // Update user's branch
    await prisma.user.update({
      where: { id: session.user.id },
      data: { branch_id: body.branch_id },
    });

    // Update branch member count
    const memberCount = await prisma.user.count({
      where: { branch_id: body.branch_id },
    });

    await prisma.branch.update({
      where: { id: body.branch_id },
      data: { member_count: memberCount },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined branch',
      branch,
    });
  } catch (error: any) {
    console.error('Error in POST /api/branches/join:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to join branch' },
      { status: 500 }
    );
  }
}

