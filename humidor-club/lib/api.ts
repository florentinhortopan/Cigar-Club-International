import { NextResponse } from 'next/server';
import { formatErrorResponse, isAppError } from './errors';

/**
 * Standard API response types
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Create a successful API response
 */
export function success<T>(data: T, meta?: ApiSuccess<T>['meta'], status: number = 200): Response {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, meta },
    { status }
  );
}

/**
 * Create an error API response
 */
export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, any>
): Response {
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message, details } },
    { status }
  );
}

/**
 * Handle errors in API routes
 */
export function handleApiError(err: unknown): Response {
  if (isAppError(err)) {
    return error(err.code, err.message, err.statusCode, err.details);
  }
  
  console.error('Unhandled API error:', err);
  return error('INTERNAL_ERROR', 'An unexpected error occurred', 500);
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  limit?: number;
  cursor?: string;
  offset?: number;
}

export function parsePaginationParams(searchParams: URLSearchParams): {
  limit: number;
  cursor?: string;
  offset: number;
} {
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '24', 10),
    100 // Max limit
  );
  
  const cursor = searchParams.get('cursor') || undefined;
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  return { limit, cursor, offset };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  items: any[],
  limit: number,
  total?: number
): ApiSuccess<any>['meta'] {
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : undefined;
  
  return {
    limit,
    hasMore,
    nextCursor,
    total,
  };
}

/**
 * Validate request body with Zod schema
 */
import { z } from 'zod';

export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const details = err.issues.reduce((acc, error) => {
        const path = error.path.join('.');
        acc[path] = [error.message];
        return acc;
      }, {} as Record<string, string[]>);
      
      throw new (await import('./errors')).ValidationError('Invalid input', details);
    }
    throw err;
  }
}

/**
 * Extract query parameters with type safety
 */
export function getQueryParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue?: string
): string | undefined {
  return searchParams.get(key) || defaultValue;
}

export function getQueryParamAsInt(
  searchParams: URLSearchParams,
  key: string,
  defaultValue?: number
): number | undefined {
  const value = searchParams.get(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function getQueryParamAsBoolean(
  searchParams: URLSearchParams,
  key: string,
  defaultValue?: boolean
): boolean {
  const value = searchParams.get(key);
  if (!value) return defaultValue ?? false;
  return value === 'true' || value === '1';
}

/**
 * CORS headers for API routes (if needed)
 */
export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Rate limit response
 */
export function rateLimitHeaders(limit: number, remaining: number, reset: number) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}

