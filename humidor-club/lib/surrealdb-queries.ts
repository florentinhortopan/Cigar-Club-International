/**
 * SurrealDB Query Functions
 * Helper functions for common database operations
 */

import { db } from './surrealdb-simple';

// =============================================================================
// BRANDS
// =============================================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country?: string;
  founded?: number;
  description?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const brands = await db.query<Brand>('SELECT * FROM brand ORDER BY name');
    return brands;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw new Error('Failed to fetch brands');
  }
}

export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const result = await db.query<Brand>(`SELECT * FROM ${id}`);
    return result[0] || null;
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
  brand: string | Brand;
  description?: string;
  release_year?: number;
  discontinued: boolean;
  created_at: string;
  updated_at: string;
}

export async function getLinesByBrand(brandId: string): Promise<Line[]> {
  try {
    const lines = await db.query<Line>(
      'SELECT * FROM line WHERE brand = $brand ORDER BY name',
      { brand: brandId }
    );
    return lines;
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw new Error('Failed to fetch lines');
  }
}

export async function getAllLines(): Promise<Line[]> {
  try {
    const lines = await db.query<Line>('SELECT * FROM line ORDER BY name');
    return lines;
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw new Error('Failed to fetch lines');
  }
}

// =============================================================================
// CIGARS
// =============================================================================

export interface Cigar {
  id?: string;
  line: string;
  vitola: string;
  ring_gauge?: number;
  length_mm?: number;
  length_inches?: number;
  wrapper?: string;
  binder?: string;
  filler?: string;
  filler_tobaccos?: string[];
  strength?: 'Mild' | 'Medium-Mild' | 'Medium' | 'Medium-Full' | 'Full';
  body?: 'Light' | 'Medium-Light' | 'Medium' | 'Medium-Full' | 'Full';
  msrp_cents?: number;
  typical_street_cents?: number;
  country?: string;
  factory?: string;
  avg_rating?: number;
  total_ratings: number;
  created_at?: string;
  updated_at?: string;
}

export async function getCigars(limit: number = 50): Promise<Cigar[]> {
  try {
    const cigars = await db.query<Cigar>(
      `SELECT * FROM cigar ORDER BY created_at DESC LIMIT ${limit}`
    );
    return cigars;
  } catch (error) {
    console.error('Error fetching cigars:', error);
    throw new Error('Failed to fetch cigars');
  }
}

export async function getCigarById(id: string): Promise<Cigar | null> {
  try {
    const result = await db.query<Cigar>(`SELECT * FROM ${id}`);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching cigar:', error);
    return null;
  }
}

export async function searchCigars(searchTerm: string): Promise<Cigar[]> {
  try {
    // Basic search by vitola for now
    const cigars = await db.query<Cigar>(
      `SELECT * FROM cigar WHERE string::lowercase(vitola) CONTAINS string::lowercase($search) ORDER BY created_at DESC LIMIT 20`,
      { search: searchTerm }
    );
    return cigars;
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
  strength?: string;
  body?: string;
  msrp_cents?: number;
  typical_street_cents?: number;
  country?: string;
  factory?: string;
}

export async function createCigar(data: CreateCigarInput): Promise<Cigar> {
  try {
    // Calculate length_mm from inches if provided
    const length_mm = data.length_inches ? Math.round(data.length_inches * 25.4) : undefined;
    
    const result = await db.create<Cigar>('cigar', {
      line: data.line,
      vitola: data.vitola,
      ring_gauge: data.ring_gauge,
      length_inches: data.length_inches,
      length_mm,
      wrapper: data.wrapper,
      binder: data.binder,
      filler: data.filler,
      filler_tobaccos: data.filler_tobaccos || [],
      strength: data.strength as Cigar['strength'],
      body: data.body as Cigar['body'],
      msrp_cents: data.msrp_cents,
      typical_street_cents: data.typical_street_cents,
      country: data.country,
      factory: data.factory,
      total_ratings: 0,
    });
    
    return result;
  } catch (error) {
    console.error('Error creating cigar:', error);
    throw new Error('Failed to create cigar');
  }
}

// =============================================================================
// RELEASES
// =============================================================================

export interface Release {
  id?: string;
  cigar: string;
  year: number;
  batch?: string;
  limited: boolean;
  available: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
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
    const result = await db.create<Release>('release', {
      cigar: data.cigar,
      year: data.year,
      batch: data.batch || 'Regular Production',
      limited: data.limited || false,
      available: data.available !== false,
      notes: data.notes,
    });
    
    return result;
  } catch (error) {
    console.error('Error creating release:', error);
    throw new Error('Failed to create release');
  }
}

// =============================================================================
// COMBINED QUERIES
// =============================================================================

export interface CigarWithDetails extends Cigar {
  line_details?: Line;
  brand_details?: Brand;
}

export async function getCigarsWithDetails(limit: number = 20): Promise<CigarWithDetails[]> {
  try {
    const cigars = await db.query<CigarWithDetails>(
      `SELECT *, 
        line.* AS line_details,
        line.brand.* AS brand_details
      FROM cigar 
      ORDER BY created_at DESC 
      LIMIT ${limit}`
    );
    return cigars;
  } catch (error) {
    console.error('Error fetching cigars with details:', error);
    throw new Error('Failed to fetch cigars with details');
  }
}

