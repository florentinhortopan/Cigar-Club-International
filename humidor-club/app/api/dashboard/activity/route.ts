import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const limit = 20; // Number of activities to return

    // Get user's branch_id to filter activities
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { branch_id: true },
    });

    const userBranchId = user?.branch_id;

    // Fetch activities from multiple sources
    const activities: Array<{
      type: 'pairing' | 'user_joined' | 'cigar_added' | 'humidor_added';
      id: string;
      title: string;
      description: string;
      link?: string;
      user?: {
        id: string;
        name: string | null;
        image: string | null;
      };
      createdAt: Date;
    }> = [];

    // 1. Recent pairings (all pairings, with link to cigar)
    const recentPairings = await prisma.pairing.findMany({
      take: 10, // Limit each type to avoid overwhelming
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        cigar: {
          select: {
            id: true,
            vitola: true,
            line: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const pairing of recentPairings) {
      const brandName = pairing.cigar.line.brand?.name || 'Unknown Brand';
      const lineName = pairing.cigar.line.name || 'Unknown Line';
      const cigarName = `${brandName} ${lineName} - ${pairing.cigar.vitola}`;
      
      activities.push({
        type: 'pairing',
        id: pairing.id,
        title: `New pairing added`,
        description: `${pairing.author.name || 'Someone'} added a ${pairing.kind.toLowerCase()} pairing for ${cigarName}`,
        link: `/cigars/${pairing.cigar_id}`,
        user: pairing.author,
        createdAt: pairing.created_at,
      });
    }

    // 2. New users in my branch (if user has a branch)
    // Show users who have verified emails (recently joined/verified)
    // Only show users verified in the last 30 days to avoid clutter
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (userBranchId) {
      const recentBranchUsers = await prisma.user.findMany({
        where: {
          branch_id: userBranchId,
          id: { not: userId }, // Exclude current user
          emailVerified: { 
            not: null,
            gte: thirtyDaysAgo, // Only recent verifications
          },
        },
        take: 10, // Limit to avoid too many activities
        orderBy: { emailVerified: 'desc' },
        select: {
          id: true,
          name: true,
          image: true,
          emailVerified: true,
        },
      });

      for (const newUser of recentBranchUsers) {
        if (newUser.emailVerified) {
          activities.push({
            type: 'user_joined',
            id: newUser.id,
            title: `New member joined`,
            description: `${newUser.name || 'A new member'} joined your chapter`,
            link: `/people?userId=${newUser.id}`,
            user: {
              id: newUser.id,
              name: newUser.name,
              image: newUser.image,
            },
            createdAt: newUser.emailVerified,
          });
        }
      }
    }

    // 3. Recent cigars added to the club (all cigars)
    const recentCigars = await prisma.cigar.findMany({
      take: 10, // Limit to recent ones
      orderBy: { created_at: 'desc' },
      include: {
        line: {
          select: {
            name: true,
            brand: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    for (const cigar of recentCigars) {
      const brandName = cigar.line.brand?.name || 'Unknown Brand';
      const lineName = cigar.line.name || 'Unknown Line';
      const cigarName = `${brandName} ${lineName} - ${cigar.vitola}`;
      
      activities.push({
        type: 'cigar_added',
        id: cigar.id,
        title: `New cigar added`,
        description: `${cigarName} was added to the club`,
        link: `/cigars/${cigar.id}`,
        createdAt: cigar.created_at,
      });
    }

    // 4. Recent humidor items added by me (last 30 days)
    const myRecentHumidorItems = await prisma.humidorItem.findMany({
      where: { 
        user_id: userId,
        created_at: { gte: thirtyDaysAgo }, // Only recent additions
      },
      take: 10, // Limit to recent ones
      orderBy: { created_at: 'desc' },
      include: {
        cigar: {
          select: {
            id: true,
            vitola: true,
            line: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const item of myRecentHumidorItems) {
      const brandName = item.cigar.line.brand?.name || 'Unknown Brand';
      const lineName = item.cigar.line.name || 'Unknown Line';
      const cigarName = `${brandName} ${lineName} - ${item.cigar.vitola}`;
      
      activities.push({
        type: 'humidor_added',
        id: item.id,
        title: `Added to humidor`,
        description: `You added ${item.quantity} × ${cigarName} to your humidor`,
        link: `/humidor`,
        createdAt: item.created_at,
      });
    }

    // Sort all activities by createdAt (most recent first)
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Return top N activities
    return NextResponse.json({
      success: true,
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

