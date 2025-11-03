/**
 * Custom error classes for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Please sign in to continue') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input', details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 'RATE_LIMITED', 429);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super(message, 'INTERNAL_ERROR', 500);
    this.name = 'InternalServerError';
  }
}

/**
 * Error code constants
 */
export const ErrorCodes = {
  // Auth (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Authorization (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  AGE_GATE_REQUIRED: 'AGE_GATE_REQUIRED',
  RULES_ACCEPTANCE_REQUIRED: 'RULES_ACCEPTANCE_REQUIRED',
  
  // Validation (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resources (404)
  NOT_FOUND: 'NOT_FOUND',
  LISTING_NOT_FOUND: 'LISTING_NOT_FOUND',
  CIGAR_NOT_FOUND: 'CIGAR_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Business Logic (422)
  LISTING_FROZEN: 'LISTING_FROZEN',
  OFFER_EXPIRED: 'OFFER_EXPIRED',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
  
  // Rate Limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/**
 * Check if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }
  
  // Unknown errors
  console.error('Unhandled error:', error);
  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    },
  };
}

