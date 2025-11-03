import { z } from 'zod';

/**
 * Validation schemas for the application
 */

// User schemas
export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export const ageGateSchema = z.object({
  ageConfirmed: z.literal(true),
});

export const rulesAcceptanceSchema = z.object({
  rulesAccepted: z.literal(true),
});

// Cigar schemas
export const createCigarSchema = z.object({
  lineId: z.string().cuid(),
  vitola: z.string().min(1, 'Vitola is required'),
  factory: z.string().optional(),
  country: z.string().optional(),
  ringGauge: z.number().int().min(20).max(100).optional(),
  lengthMM: z.number().int().min(50).max(300).optional(),
  wrapper: z.string().optional(),
  binder: z.string().optional(),
  filler: z.string().optional(),
  msrpCents: z.number().int().min(0).optional(),
  typicalStreetCents: z.number().int().min(0).optional(),
  strength: z.enum(['Mild', 'Medium', 'Full']).optional(),
  body: z.enum(['Light', 'Medium', 'Full']).optional(),
});

export const updateCigarSchema = createCigarSchema.partial();

// Brand & Line schemas
export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  country: z.string().optional(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional(),
});

export const createLineSchema = z.object({
  name: z.string().min(1, 'Line name is required'),
  brandId: z.string().cuid(),
  description: z.string().optional(),
  releaseYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

// Tasting Note schemas
export const createTastingNoteSchema = z.object({
  cigarId: z.string().cuid(),
  rating: z.number().min(1).max(5).optional(),
  aroma: z.string().optional(),
  draw: z.enum(['Tight', 'Perfect', 'Loose']).optional(),
  burn: z.enum(['Uneven', 'Good', 'Perfect']).optional(),
  strength: z.enum(['Mild', 'Medium', 'Full']).optional(),
  body: z.enum(['Light', 'Medium', 'Full']).optional(),
  flavor: z.string().optional(),
  notes: z.string().optional(),
});

// Pairing schemas
export const createPairingSchema = z.object({
  cigarId: z.string().cuid(),
  beverage: z.string().min(1, 'Beverage is required'),
  score: z.number().int().min(1).max(5),
  note: z.string().optional(),
});

// Release & Comp schemas
export const createReleaseSchema = z.object({
  cigarId: z.string().cuid(),
  boxCode: z.string().optional(),
  boxDate: z.string().datetime().optional(),
  year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  limitedRun: z.boolean().optional(),
  productionQty: z.number().int().min(0).optional(),
  marketStatus: z.string().optional(),
});

export const createCompSchema = z.object({
  releaseId: z.string().cuid(),
  source: z.string().min(1, 'Source is required'),
  date: z.string().datetime(),
  qty: z.number().int().min(1),
  condition: z.string().optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
  region: z.string().optional(),
  url: z.string().url().optional(),
});

// Humidor schemas
export const createHumidorItemSchema = z.object({
  cigarId: z.string().cuid(),
  releaseId: z.string().cuid().optional(),
  qty: z.number().int().min(1),
  isCollectible: z.boolean().optional(),
  condition: z.string().optional(),
  provenance: z.string().optional(),
  storage: z.string().optional(),
  acquiredAt: z.string().datetime().optional(),
  acquiredCents: z.number().int().min(0).optional(),
});

export const updateHumidorItemSchema = createHumidorItemSchema.partial().extend({
  id: z.string().cuid(),
});

// Listing schemas
export const listingTypeEnum = z.enum(['WTS', 'WTB', 'WTT']);

export const createListingSchema = z.object({
  type: listingTypeEnum,
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  cigarId: z.string().cuid().optional(),
  releaseId: z.string().cuid().optional(),
  qty: z.number().int().min(1),
  condition: z.string().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  region: z.string().optional(),
  city: z.string().optional(),
  meetUpOnly: z.boolean().default(true),
  willShip: z.boolean().default(false),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
}).refine(
  (data) => data.type !== 'WTS' || (data.priceCents !== undefined && data.priceCents > 0),
  {
    message: 'Price is required for WTS listings',
    path: ['priceCents'],
  }
);

export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().cuid(),
});

export const listingFiltersSchema = z.object({
  type: listingTypeEnum.optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'WITHDRAWN']).optional(),
  region: z.string().optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  condition: z.string().optional(),
  userId: z.string().cuid().optional(),
});

// Offer schemas
export const createOfferSchema = z.object({
  listingId: z.string().cuid(),
  amountCents: z.number().int().min(0).optional(),
  message: z.string().max(1000).optional(),
});

export const counterOfferSchema = z.object({
  offerId: z.string().cuid(),
  amountCents: z.number().int().min(0).optional(),
  message: z.string().max(1000).optional(),
});

// Message schemas
export const createMessageSchema = z.object({
  listingId: z.string().cuid(),
  body: z.string().min(1).max(5000),
});

// Feedback schemas
export const createFeedbackSchema = z.object({
  forUserId: z.string().cuid(),
  listingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  communication: z.boolean().optional(),
  packaging: z.boolean().optional(),
  accuracy: z.boolean().optional(),
});

// Report schemas
export const createReportSchema = z.object({
  type: z.enum(['LISTING', 'USER', 'MESSAGE']),
  listingId: z.string().cuid().optional(),
  reason: z.string().min(10, 'Please provide a detailed reason'),
  details: z.string().optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().optional(),
});

// Admin schemas
export const createInviteCodeSchema = z.object({
  maxUses: z.number().int().min(1).default(1),
  expiresAt: z.string().datetime().optional(),
});

export const freezeListingSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason for freezing this listing'),
});

export const banUserSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason for banning this user'),
  duration: z.number().int().min(1).optional(), // Days, null for permanent
});

// Search schemas
export const searchQuerySchema = z.object({
  q: z.string().min(1),
  type: z.enum(['cigars', 'listings', 'all']).default('all'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Upload schemas
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_LISTING = 8;

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }
  
  return { valid: true };
}

