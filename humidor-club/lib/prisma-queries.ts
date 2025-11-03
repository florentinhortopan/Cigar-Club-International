/**
 * Prisma Query Functions
 * Helper functions for database operations using Prisma
 */

import { prisma } from './prisma';

// =============================================================================
// BRANDS
// =============================================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country?: string | null;
  founded?: number | null;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getBrands(): Promise<Brand[]> {
  try {
    return await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw new Error('Failed to fetch brands');
  }
}

export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    return await prisma.brand.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

// =============================================================================
// LINES
// =============================================================================

export interface Line {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  description?: string | null;
  release_year?: number | null;
  discontinued: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function getLinesByBrand(brandId: string): Promise<Line[]> {
  try {
    return await prisma.line.findMany({
      where: { brand_id: brandId },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw new Error('Failed to fetch lines');
  }
}

export async function getAllLines(): Promise<Line[]> {
  try {
    return await prisma.line.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw new Error('Failed to fetch lines');
  }
}

// =============================================================================
// CIGARS
// =============================================================================

export interface Cigar {
  id: string;
  line_id: string;
  vitola: string;
  ring_gauge?: number | null;
  length_mm?: number | null;
  length_inches?: number | null;
  wrapper?: string | null;
  binder?: string | null;
  filler?: string | null;
  filler_tobaccos?: string | null; // JSON string in database
  image_urls?: string | null; // JSON string in database
  strength?: string | null;
  body?: string | null;
  msrp_cents?: number | null;
  typical_street_cents?: number | null;
  country?: string | null;
  factory?: string | null;
  avg_rating?: number | null;
  total_ratings: number;
  created_at?: Date;
  updated_at?: Date;
  // Relations (when included)
  line?: {
    id: string;
    name: string;
    slug: string;
    brand_id: string;
    description?: string | null;
    release_year?: number | null;
    discontinued: boolean;
    brand?: {
      id: string;
      name: string;
      slug: string;
      country?: string | null;
      founded?: number | null;
      description?: string | null;
      website?: string | null;
      logo_url?: string | null;
    };
  } | null;
}

export async function getCigars(limit: number = 50): Promise<Cigar[]> {
  try {
    const result = await prisma.cigar.findMany({
      include: {
        line: {
          include: {
            brand: true,
          },
        },
      },
      take: limit,
      orderBy: { created_at: 'desc' },
    });
    
    // Log first result to verify structure
    if (result.length > 0) {
      console.log('🔍 First cigar from DB:', {
        id: result[0].id,
        vitola: result[0].vitola,
        line_id: result[0].line_id,
        hasLine: !!result[0].line,
        lineName: result[0].line?.name,
        brandName: result[0].line?.brand?.name,
      });
    }
    
    return result as Cigar[];
  } catch (error) {
    console.error('Error fetching cigars:', error);
    throw new Error('Failed to fetch cigars');
  }
}

export async function getCigarById(id: string): Promise<Cigar | null> {
  try {
    return await prisma.cigar.findUnique({
      where: { id },
    }) as Cigar | null;
  } catch (error) {
    console.error('Error fetching cigar:', error);
    return null;
  }
}

export async function searchCigars(searchTerm: string): Promise<Cigar[]> {
  try {
    return await prisma.cigar.findMany({
      where: {
        vitola: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      take: 20,
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error searching cigars:', error);
    throw new Error('Failed to search cigars');
  }
}

export interface CreateCigarInput {
  line: string;
  vitola: string;
  ring_gauge?: number;
  length_inches?: number;
  wrapper?: string;
  binder?: string;
  filler?: string;
  filler_tobaccos?: string[];
  image_urls?: string[];
  strength?: string;
  body?: string;
  msrp_cents?: number;
  typical_street_cents?: number;
  country?: string;
  factory?: string;
}

export async function createCigar(data: CreateCigarInput): Promise<Cigar> {
  try {
    console.log('📦 createCigar called with:', {
      line: data.line,
      vitola: data.vitola,
      hasImages: !!data.image_urls,
      imageCount: data.image_urls?.length || 0,
    });
    
    // Calculate length_mm from inches if provided
    const length_mm = data.length_inches ? Math.round(data.length_inches * 25.4) : undefined;
    
    // Convert filler_tobaccos array to JSON string for SQLite
    const filler_tobaccos_str = data.filler_tobaccos && data.filler_tobaccos.length > 0
      ? JSON.stringify(data.filler_tobaccos)
      : null;
    
    // Convert image_urls array to JSON string for SQLite
    const image_urls_str = data.image_urls && data.image_urls.length > 0
      ? JSON.stringify(data.image_urls)
      : null;
    
    console.log('📦 Prepared data for Prisma:', {
      line_id: data.line,
      vitola: data.vitola,
      ring_gauge: data.ring_gauge,
      length_inches: data.length_inches,
      length_mm,
      image_urls: image_urls_str,
    });
    
    const result = await prisma.cigar.create({
      data: {
        line_id: data.line,
        vitola: data.vitola,
        ring_gauge: data.ring_gauge,
        length_inches: data.length_inches,
        length_mm,
        wrapper: data.wrapper,
        binder: data.binder,
        filler: data.filler,
        filler_tobaccos: filler_tobaccos_str,
        image_urls: image_urls_str,
        strength: data.strength as any,
        body: data.body as any,
        msrp_cents: data.msrp_cents,
        typical_street_cents: data.typical_street_cents,
        country: data.country,
        factory: data.factory,
        total_ratings: 0,
      },
    });
    
    console.log('✅ Cigar created successfully:', result.id);
    return result;
  } catch (error: any) {
    console.error('❌ Error creating cigar:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error meta:', error.meta);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to create cigar: ${error.message || 'Unknown error'}`);
  }
}

export async function updateCigar(id: string, data: Partial<CreateCigarInput>): Promise<Cigar> {
  try {
    const updateData: any = {};
    
    if (data.line !== undefined) updateData.line_id = data.line;
    if (data.vitola !== undefined) updateData.vitola = data.vitola;
    if (data.ring_gauge !== undefined) updateData.ring_gauge = data.ring_gauge;
    if (data.length_inches !== undefined) {
      updateData.length_inches = data.length_inches;
      updateData.length_mm = data.length_inches ? Math.round(data.length_inches * 25.4) : null;
    }
    if (data.wrapper !== undefined) updateData.wrapper = data.wrapper;
    if (data.binder !== undefined) updateData.binder = data.binder;
    if (data.filler !== undefined) updateData.filler = data.filler;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.factory !== undefined) updateData.factory = data.factory;
    if (data.msrp_cents !== undefined) updateData.msrp_cents = data.msrp_cents;
    if (data.typical_street_cents !== undefined) updateData.typical_street_cents = data.typical_street_cents;
    if (data.strength !== undefined) updateData.strength = data.strength as any;
    if (data.body !== undefined) updateData.body = data.body as any;
    
    // Handle arrays
    if (data.filler_tobaccos !== undefined) {
      updateData.filler_tobaccos = data.filler_tobaccos && data.filler_tobaccos.length > 0
        ? JSON.stringify(data.filler_tobaccos)
        : null;
    }
    
    if (data.image_urls !== undefined) {
      updateData.image_urls = data.image_urls && data.image_urls.length > 0
        ? JSON.stringify(data.image_urls)
        : null;
    }
    
    return await prisma.cigar.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating cigar:', error);
    throw new Error('Failed to update cigar');
  }
}

// =============================================================================
// RELEASES
// =============================================================================

export interface Release {
  id?: string;
  cigar_id: string;
  year: number;
  batch?: string | null;
  limited: boolean;
  available: boolean;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export async function createRelease(data: {
  cigar: string;
  year: number;
  batch?: string;
  limited?: boolean;
  available?: boolean;
  notes?: string;
}): Promise<Release> {
  try {
    return await prisma.release.create({
      data: {
        cigar_id: data.cigar,
        year: data.year,
        batch: data.batch || 'Regular Production',
        limited: data.limited || false,
        available: data.available !== false,
        notes: data.notes,
      },
    });
  } catch (error) {
    console.error('Error creating release:', error);
    throw new Error('Failed to create release');
  }
}

