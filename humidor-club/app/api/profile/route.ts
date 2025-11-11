import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        branch_id: true,
        humidor_public: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Add createdAt fallback since User model doesn't have this field
    // Convert dates to ISO strings for client serialization
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        createdAt: new Date().toISOString(), // Fallback - User model doesn't have createdAt field
        branch_id: user.branch_id, // Include branch_id for dashboard
      },
    });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updateData: { name?: string; image?: string; humidor_public?: boolean } = {};

    if (body.name !== undefined) {
      updateData.name = body.name || null;
    }
    if (body.image !== undefined) {
      updateData.image = body.image || null;
    }
    if (body.humidor_public !== undefined) {
      updateData.humidor_public = body.humidor_public;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        humidor_public: true,
      },
    });

    // Add createdAt fallback since User model doesn't have this field
    // Convert dates to ISO strings for client serialization
    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        emailVerified: updatedUser.emailVerified ? updatedUser.emailVerified.toISOString() : null,
        createdAt: new Date().toISOString(), // Fallback - User model doesn't have createdAt field
      },
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

