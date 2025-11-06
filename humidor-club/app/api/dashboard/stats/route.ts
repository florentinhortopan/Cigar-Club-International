import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getHumidorStats } from '@/lib/humidor-queries';

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

    // Get total cigars in the club
    const totalCigarsInClub = await prisma.cigar.count();

    // Get user's humidor stats
    const humidorStats = await getHumidorStats(userId);

    // For now, these features are not implemented yet
    // They will return 0 until the tables are added to the schema
    const tastingNotesCount = 0;
    const activeListingsCount = 0;
    const reputationRating = 0.0;

    return NextResponse.json({
      success: true,
      stats: {
        // Total cigars in the club (all users)
        totalCigarsInClub,
        // User's personal humidor stats
        humidorCigars: humidorStats.totalCigars,
        humidorValue: humidorStats.totalValue,
        // Other stats (not implemented yet)
        tastingNotes: tastingNotesCount,
        activeListings: activeListingsCount,
        reputation: reputationRating,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

