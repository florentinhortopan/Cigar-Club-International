/**
 * Humidor Queries
 * Functions for managing user's personal cigar collection
 */

import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface HumidorItem {
  id: string;
  user_id: string;
  cigar_id: string;
  quantity: number;
  purchase_price_cents?: number | null;
  purchase_date?: Date | null;
  location?: string | null;
  condition?: string | null;
  notes?: string | null;
  acquired_from?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface HumidorItemWithCigar extends HumidorItem {
  cigar?: {
    id: string;
    vitola: string;
    ring_gauge?: number | null;
    length_inches?: number | null;
    wrapper?: string | null;
    binder?: string | null;
    filler?: string | null;
    strength?: string | null;
    body?: string | null;
    msrp_cents?: number | null;
    line?: {
      id: string;
      name: string;
      brand?: {
        id: string;
        name: string;
      };
    };
  };
}

export async function getHumidorItems(userId: string): Promise<HumidorItemWithCigar[]> {
  try {
    return await prisma.humidorItem.findMany({
      where: { user_id: userId },
      include: {
        // Note: Prisma doesn't support direct relations here, so we'll fetch separately
      },
      orderBy: { created_at: 'desc' },
    }) as any;
  } catch (error) {
    console.error('Error fetching humidor items:', error);
    throw new Error('Failed to fetch humidor items');
  }
}

export async function addToHumidor(data: {
  userId: string;
  cigarId: string;
  quantity?: number;
  purchasePriceCents?: number;
  purchaseDate?: Date;
  location?: string;
  notes?: string;
}): Promise<HumidorItem> {
  try {
    return await prisma.humidorItem.create({
      data: {
        user_id: data.userId,
        cigar_id: data.cigarId,
        quantity: data.quantity || 1,
        purchase_price_cents: data.purchasePriceCents,
        purchase_date: data.purchaseDate,
        location: data.location,
        notes: data.notes,
      },
    });
  } catch (error) {
    console.error('Error adding to humidor:', error);
    throw new Error('Failed to add cigar to humidor');
  }
}

export async function updateHumidorItem(
  itemId: string,
  userId: string,
  updates: Partial<HumidorItem>
): Promise<HumidorItem> {
  try {
    // Verify ownership
    const item = await prisma.humidorItem.findFirst({
      where: { id: itemId, user_id: userId },
    });

    if (!item) {
      throw new Error('Humidor item not found or access denied');
    }

    return await prisma.humidorItem.update({
      where: { id: itemId },
      data: updates,
    });
  } catch (error) {
    console.error('Error updating humidor item:', error);
    throw new Error('Failed to update humidor item');
  }
}

export async function removeFromHumidor(itemId: string, userId: string): Promise<void> {
  try {
    await prisma.humidorItem.deleteMany({
      where: { id: itemId, user_id: userId },
    });
  } catch (error) {
    console.error('Error removing from humidor:', error);
    throw new Error('Failed to remove cigar from humidor');
  }
}

export async function getHumidorStats(userId: string) {
  try {
    const items = await prisma.humidorItem.findMany({
      where: { user_id: userId },
    });

    const totalCigars = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => {
      const price = item.purchase_price_cents || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Get unique cigar IDs to count brands
    const cigarIds = [...new Set(items.map(item => item.cigar_id))];
    const uniqueCigars = cigarIds.length;

    return {
      totalCigars,
      uniqueCigars,
      totalValue,
      totalItems: items.length,
    };
  } catch (error) {
    console.error('Error fetching humidor stats:', error);
    return {
      totalCigars: 0,
      uniqueCigars: 0,
      totalValue: 0,
      totalItems: 0,
    };
  }
}

