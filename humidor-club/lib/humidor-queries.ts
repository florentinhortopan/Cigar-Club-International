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
  smoked_count: number;
  last_smoked_date?: Date | null;
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

export async function markCigarAsSmoked(
  itemId: string,
  userId: string,
  count: number = 1,
  smokedDate?: Date
): Promise<HumidorItem> {
  try {
    // Verify ownership
    const item = await prisma.humidorItem.findFirst({
      where: { id: itemId, user_id: userId },
    });

    if (!item) {
      throw new Error('Humidor item not found or access denied');
    }

    if (item.quantity < count) {
      throw new Error(`Cannot smoke ${count} cigars. Only ${item.quantity} available.`);
    }

    const newQuantity = item.quantity - count;
    const newSmokedCount = item.smoked_count + count;
    const smokeDate = smokedDate || new Date();

    // Update the item
    const updated = await prisma.humidorItem.update({
      where: { id: itemId },
      data: {
        quantity: newQuantity,
        smoked_count: newSmokedCount,
        last_smoked_date: smokeDate,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error marking cigar as smoked:', error);
    throw new Error('Failed to mark cigar as smoked');
  }
}

export async function getHumidorStats(userId: string) {
  try {
    const items = await prisma.humidorItem.findMany({
      where: { user_id: userId },
    });

    // Only count remaining cigars (not smoked)
    const totalCigars = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalSmoked = items.reduce((sum, item) => sum + item.smoked_count, 0);
    
    // Get unique cigar IDs to fetch pricing data
    const cigarIds = [...new Set(items.map(item => item.cigar_id))];
    
    // Fetch all cigars in one query for pricing fallback
    const cigars = await prisma.cigar.findMany({
      where: { id: { in: cigarIds } },
      select: {
        id: true,
        typical_street_cents: true,
        msrp_cents: true,
      },
    });
    
    // Create a map for quick lookup
    const cigarPriceMap = new Map(
      cigars.map(c => [
        c.id,
        c.typical_street_cents || c.msrp_cents || 0
      ])
    );
    
    // Calculate total value using purchase price, or fallback to cigar's typical street price or MSRP
    // Only count remaining cigars (not smoked)
    const totalValue = items.reduce((sum, item) => {
      const pricePerCigar = item.purchase_price_cents || cigarPriceMap.get(item.cigar_id) || 0;
      return sum + (pricePerCigar * item.quantity);
    }, 0);

    const uniqueCigars = cigarIds.length;

    return {
      totalCigars,
      totalSmoked,
      uniqueCigars,
      totalValue,
      totalItems: items.length,
    };
  } catch (error) {
    console.error('Error fetching humidor stats:', error);
    return {
      totalCigars: 0,
      totalSmoked: 0,
      uniqueCigars: 0,
      totalValue: 0,
      totalItems: 0,
    };
  }
}

