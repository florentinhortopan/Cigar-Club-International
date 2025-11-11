import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users
 * Search and list users (for community/people page)
 * Query params: search, limit
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Exclude the current user from results
    where.id = { not: session.user.id };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        branch_id: true,
        humidor_public: true,
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            region: true,
            country: true,
          },
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    // Get humidor counts for users with public humidors
    const userIdsWithPublicHumidors = users
      .filter(user => user.humidor_public)
      .map(user => user.id);

    const humidorCounts = new Map<string, number>();
    
    if (userIdsWithPublicHumidors.length > 0) {
      // Get total cigar counts per user (sum of quantities for items with quantity > 0)
      const humidorStats = await prisma.humidorItem.groupBy({
        by: ['user_id'],
        where: {
          user_id: { in: userIdsWithPublicHumidors },
          quantity: { gt: 0 },
        },
        _sum: {
          quantity: true,
        },
      });

      humidorStats.forEach(stat => {
        if (stat.user_id && stat._sum.quantity) {
          humidorCounts.set(stat.user_id, stat._sum.quantity);
        }
      });
    }

    // Add humidor count to each user
    const usersWithHumidorCounts = users.map(user => ({
      ...user,
      humidorCount: user.humidor_public ? (humidorCounts.get(user.id) || 0) : null,
    }));

    return NextResponse.json({
      success: true,
      users: usersWithHumidorCounts,
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

