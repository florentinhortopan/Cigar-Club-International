# Testing Guide

Comprehensive testing strategy and patterns for the Humidor Club application.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Setup](#setup)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing](#e2e-testing)
7. [Testing Patterns](#testing-patterns)
8. [Mocking](#mocking)
9. [CI/CD](#cicd)
10. [Coverage](#coverage)

---

## Testing Philosophy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \
    / Integ. \ Integration Tests (30%)
   /__________\
  /            \
 /  Unit Tests  \ Unit Tests (60%)
/________________\
```

### Principles

1. **Write tests that give confidence**: Test behavior, not implementation
2. **Fast feedback loop**: Unit tests should run in milliseconds
3. **Test user behavior**: Test what users do, not internal logic
4. **Avoid test brittleness**: Don't couple tests to implementation details
5. **Maintainable tests**: Tests should be as clean as production code

### What to Test

✅ **DO Test**:
- User interactions (clicks, form submissions)
- API contracts (request/response formats)
- Business logic (calculations, validations)
- Error states
- Edge cases
- Accessibility

❌ **DON'T Test**:
- Third-party libraries
- Implementation details (internal state)
- Styles (unless critical to UX)
- Constants

---

## Test Types

### Unit Tests (60%)

Test individual functions and components in isolation.

**Tools**: Vitest

**What to test**:
- Utility functions
- Validation logic
- Data transformations
- Component rendering
- Component props

**Example**: Testing `calculateIndexScore` function

---

### Integration Tests (30%)

Test how parts of the system work together.

**Tools**: Vitest + Prisma test DB

**What to test**:
- API routes
- Database queries
- Auth flows
- Server actions

**Example**: Testing `POST /api/listings` creates listing and audit log

---

### End-to-End Tests (10%)

Test complete user journeys through the application.

**Tools**: Playwright

**What to test**:
- Critical user flows
- Multi-step processes
- Cross-page interactions

**Example**: Sign in → Create listing → Receive offer → Accept → Leave feedback

---

## Setup

### Installation

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test jsdom
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Unit Testing

### Testing Utility Functions

```typescript
// tests/unit/lib/valuation.test.ts
import { describe, it, expect } from 'vitest';
import { calculateIndexScore } from '@/lib/valuation';

describe('calculateIndexScore', () => {
  it('calculates weighted average correctly', () => {
    const comps = [
      { date: new Date('2024-01-15'), priceCents: 10000, qty: 1 },
      { date: new Date('2024-01-01'), priceCents: 8000, qty: 1 },
      { date: new Date('2023-12-01'), priceCents: 6000, qty: 1 },
    ];
    
    const now = new Date('2024-01-30');
    const score = calculateIndexScore(comps, now);
    
    // 15 days ago = 60% weight = 6000
    // 29 days ago = 30% weight = 2400
    // 60 days ago = 10% weight = 600
    // Total = 9000
    expect(score).toBe(9000);
  });
  
  it('returns null with insufficient comps', () => {
    expect(calculateIndexScore([])).toBeNull();
    expect(calculateIndexScore([
      { date: new Date(), priceCents: 5000, qty: 1 },
    ])).toBeNull();
  });
  
  it('ignores comps older than 90 days', () => {
    const comps = [
      { date: new Date('2024-01-15'), priceCents: 10000, qty: 1 },
      { date: new Date('2023-10-01'), priceCents: 1000, qty: 1 }, // 91 days ago
    ];
    
    const now = new Date('2024-01-30');
    expect(calculateIndexScore(comps, now)).toBeNull(); // Only 1 valid comp
  });
});
```

### Testing Validation

```typescript
// tests/unit/lib/validation.test.ts
import { describe, it, expect } from 'vitest';
import { listingSchema } from '@/lib/validation';

describe('listingSchema', () => {
  it('validates correct listing data', () => {
    const validListing = {
      type: 'WTS',
      title: 'Padron 1926',
      description: 'Great cigar',
      qty: 1,
      priceCents: 5000,
    };
    
    const result = listingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });
  
  it('rejects invalid type', () => {
    const invalidListing = {
      type: 'INVALID',
      title: 'Test',
      description: 'Test',
      qty: 1,
    };
    
    const result = listingSchema.safeParse(invalidListing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['type']);
    }
  });
  
  it('requires positive price for WTS', () => {
    const listing = {
      type: 'WTS',
      title: 'Test',
      description: 'Test',
      qty: 1,
      priceCents: -100,
    };
    
    const result = listingSchema.safeParse(listing);
    expect(result.success).toBe(false);
  });
});
```

### Testing React Components

```typescript
// tests/unit/components/listing-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingCard } from '@/components/features/marketplace/listing-card';

describe('ListingCard', () => {
  const mockListing = {
    id: 'clx123',
    title: 'Padron 1926 #9',
    description: 'Box of 24',
    type: 'WTS',
    priceCents: 48000,
    qty: 24,
    status: 'ACTIVE',
    user: {
      id: 'user1',
      displayName: 'John Doe',
      reputation: 5,
    },
    photos: [
      { url: '/photo.jpg', alt: 'Cigar photo' },
    ],
    createdAt: new Date('2024-01-15'),
  };

  it('renders listing information', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('Padron 1926 #9')).toBeInTheDocument();
    expect(screen.getByText('Box of 24')).toBeInTheDocument();
    expect(screen.getByText('$480.00')).toBeInTheDocument();
    expect(screen.getByText('WTS')).toBeInTheDocument();
  });
  
  it('displays seller information', () => {
    render(<ListingCard listing={mockListing} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument(); // Reputation
  });
  
  it('renders photo when available', () => {
    render(<ListingCard listing={mockListing} />);
    
    const img = screen.getByAltText('Cigar photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });
  
  it('calls onView when clicked', async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    
    render(<ListingCard listing={mockListing} onView={onView} />);
    
    await user.click(screen.getByRole('article'));
    expect(onView).toHaveBeenCalledWith('clx123');
  });
  
  it('shows placeholder when no photos', () => {
    const listingWithoutPhotos = { ...mockListing, photos: [] };
    render(<ListingCard listing={listingWithoutPhotos} />);
    
    expect(screen.getByText(/no photos/i)).toBeInTheDocument();
  });
});
```

### Testing Forms

```typescript
// tests/unit/components/offer-form.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OfferForm } from '@/components/features/marketplace/offer-form';

describe('OfferForm', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  it('submits offer with amount', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'offer1' } }),
    });

    render(<OfferForm listingId="clx123" />);

    await user.type(screen.getByLabelText(/amount/i), '400');
    await user.type(screen.getByLabelText(/message/i), 'Would you take $400?');
    await user.click(screen.getByRole('button', { name: /send offer/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/listings/clx123/offers',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountCents: 40000,
            message: 'Would you take $400?',
          }),
        })
      );
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<OfferForm listingId="clx123" />);

    await user.click(screen.getByRole('button', { name: /send offer/i }));

    expect(await screen.findByText(/amount is required/i)).toBeInTheDocument();
  });

  it('disables submit while loading', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<OfferForm listingId="clx123" />);

    await user.type(screen.getByLabelText(/amount/i), '400');
    const submitButton = screen.getByRole('button', { name: /send offer/i });
    
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: 'LISTING_FROZEN', message: 'Listing is frozen' },
      }),
    });

    render(<OfferForm listingId="clx123" />);

    await user.type(screen.getByLabelText(/amount/i), '400');
    await user.click(screen.getByRole('button', { name: /send offer/i }));

    expect(await screen.findByText(/listing is frozen/i)).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### Testing API Routes

```typescript
// tests/integration/api/listings.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/listings/route';
import { prisma } from '@/lib/prisma';
import { createTestUser, createTestListing, cleanupTestData } from '@/tests/helpers';

describe('POST /api/listings', () => {
  let testUser: any;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('creates a listing', async () => {
    const request = new Request('http://localhost/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'WTS',
        title: 'Test Listing',
        description: 'Test description',
        qty: 1,
        priceCents: 5000,
        status: 'ACTIVE',
      }),
    });

    // Mock session
    vi.mock('@/lib/auth', () => ({
      getServerSession: () => ({ user: { id: testUser.id } }),
    }));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      type: 'WTS',
      title: 'Test Listing',
      userId: testUser.id,
    });

    // Verify in database
    const listing = await prisma.listing.findUnique({
      where: { id: data.data.id },
    });
    expect(listing).toBeTruthy();
    expect(listing?.title).toBe('Test Listing');
  });

  it('validates required fields', async () => {
    const request = new Request('http://localhost/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'WTS',
        // Missing title, description, qty
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toHaveProperty('title');
  });

  it('creates audit log entry', async () => {
    const request = new Request('http://localhost/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'WTS',
        title: 'Test Listing',
        description: 'Test',
        qty: 1,
        priceCents: 5000,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: 'LISTING_CREATED',
        targetId: data.data.id,
      },
    });

    expect(auditLog).toBeTruthy();
  });
});

describe('GET /api/listings', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  it('returns paginated listings', async () => {
    // Create test listings
    const user = await createTestUser();
    await Promise.all([
      createTestListing({ userId: user.id, title: 'Listing 1' }),
      createTestListing({ userId: user.id, title: 'Listing 2' }),
      createTestListing({ userId: user.id, title: 'Listing 3' }),
    ]);

    const request = new Request('http://localhost/api/listings?limit=2');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.meta).toMatchObject({
      limit: 2,
      hasMore: true,
    });
  });

  it('filters by type', async () => {
    const user = await createTestUser();
    await createTestListing({ userId: user.id, type: 'WTS' });
    await createTestListing({ userId: user.id, type: 'WTB' });

    const request = new Request('http://localhost/api/listings?type=WTS');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].type).toBe('WTS');
  });

  it('filters by price range', async () => {
    const user = await createTestUser();
    await createTestListing({ userId: user.id, priceCents: 5000 });
    await createTestListing({ userId: user.id, priceCents: 15000 });
    await createTestListing({ userId: user.id, priceCents: 25000 });

    const request = new Request('http://localhost/api/listings?minPrice=10000&maxPrice=20000');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].priceCents).toBe(15000);
  });
});
```

### Testing with Database

```typescript
// tests/helpers/db.ts
import { prisma } from '@/lib/prisma';

export async function createTestUser(overrides = {}) {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      displayName: 'Test User',
      rulesAcceptedAt: new Date(),
      ageConfirmedAt: new Date(),
      ...overrides,
    },
  });
}

export async function createTestListing(overrides = {}) {
  const user = overrides.userId
    ? { connect: { id: overrides.userId } }
    : { create: await createTestUser() };

  return await prisma.listing.create({
    data: {
      type: 'WTS',
      title: 'Test Listing',
      description: 'Test description',
      qty: 1,
      priceCents: 10000,
      status: 'ACTIVE',
      user,
      ...overrides,
    },
  });
}

export async function cleanupTestData() {
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'test-',
      },
    },
  });
}
```

---

## E2E Testing

### Complete User Flow

```typescript
// tests/e2e/marketplace-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test('buyer makes offer and seller accepts', async ({ page, context }) => {
    // ============================================
    // Setup: Create listing as seller
    // ============================================
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'seller@example.com');
    await page.click('button[type="submit"]');
    
    // Wait for magic link (in real test, use API to generate session)
    await page.goto('/dashboard');
    
    // Create listing
    await page.click('a[href="/marketplace/new"]');
    await page.fill('[name="title"]', 'Padron 1926 #9 - Box of 24');
    await page.fill('[name="description"]', 'Excellent condition, stored at 70% RH');
    await page.selectOption('[name="type"]', 'WTS');
    await page.fill('[name="qty"]', '24');
    await page.fill('[name="priceCents"]', '48000');
    await page.click('button:has-text("Publish")');
    
    await expect(page).toHaveURL(/\/marketplace\/clx/);
    const listingUrl = page.url();
    
    // ============================================
    // Buyer: Make offer
    // ============================================
    const buyerPage = await context.newPage();
    await buyerPage.goto('/sign-in');
    await buyerPage.fill('[name="email"]', 'buyer@example.com');
    await buyerPage.click('button[type="submit"]');
    await buyerPage.goto('/dashboard');
    
    // View listing
    await buyerPage.goto(listingUrl);
    await expect(buyerPage.locator('h1')).toContainText('Padron 1926');
    
    // Make offer
    await buyerPage.click('button:has-text("Make Offer")');
    await buyerPage.fill('[name="amountCents"]', '40000');
    await buyerPage.fill('[name="message"]', 'Would you take $400?');
    await buyerPage.click('button:has-text("Send Offer")');
    
    await expect(buyerPage.locator('.toast')).toContainText('Offer sent');
    
    // ============================================
    // Seller: View and counter offer
    // ============================================
    await page.goto('/inbox');
    await expect(page.locator('.notification-badge')).toContainText('1');
    
    await page.click('.offer-notification:first-child');
    await expect(page.locator('.offer-amount')).toContainText('$400.00');
    await expect(page.locator('.offer-message')).toContainText('Would you take $400?');
    
    // Counter offer
    await page.click('button:has-text("Counter")');
    await page.fill('[name="amountCents"]', '43000');
    await page.fill('[name="message"]', 'I can do $430');
    await page.click('button:has-text("Send Counter")');
    
    await expect(page.locator('.toast')).toContainText('Counter offer sent');
    
    // ============================================
    // Buyer: Accept counter offer
    // ============================================
    await buyerPage.goto('/inbox');
    await buyerPage.click('.offer-notification:first-child');
    await expect(buyerPage.locator('.offer-amount')).toContainText('$430.00');
    
    await buyerPage.click('button:has-text("Accept Offer")');
    await buyerPage.click('button:has-text("Confirm")'); // Confirmation dialog
    
    await expect(buyerPage.locator('.toast')).toContainText('Offer accepted');
    
    // ============================================
    // Both: Leave feedback
    // ============================================
    // Buyer leaves feedback for seller
    await expect(buyerPage.locator('.feedback-prompt')).toBeVisible();
    await buyerPage.click('[data-rating="5"]');
    await buyerPage.fill('[name="comment"]', 'Great seller, smooth transaction!');
    await buyerPage.check('[name="communication"]'); // Good communication
    await buyerPage.check('[name="accuracy"]'); // Item as described
    await buyerPage.click('button:has-text("Submit Feedback")');
    
    await expect(buyerPage.locator('.toast')).toContainText('Feedback submitted');
    
    // Seller leaves feedback for buyer
    await page.goto('/inbox');
    await expect(page.locator('.feedback-prompt')).toBeVisible();
    await page.click('[data-rating="5"]');
    await page.fill('[name="comment"]', 'Fast payment, great buyer!');
    await page.click('button:has-text("Submit Feedback")');
    
    // ============================================
    // Verify: Reputation updated
    // ============================================
    await buyerPage.goto('/profile');
    await expect(buyerPage.locator('.reputation-score')).toContainText('5.0');
    
    await page.goto('/profile');
    await expect(page.locator('.reputation-score')).toContainText('5.0');
    
    // Listing should be marked as sold
    await page.goto(listingUrl);
    await expect(page.locator('.listing-status')).toContainText('Sold');
  });
});
```

### Testing Auth Flow

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('new user completes onboarding', async ({ page }) => {
    // Sign in
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toContainText('Check your email');
    
    // Simulate clicking magic link (in real test, use API)
    await page.goto('/dashboard');
    
    // Should redirect to age gate
    await expect(page).toHaveURL('/onboarding/age-gate');
    
    // Confirm age
    await page.check('[name="ageConfirmation"]');
    await page.click('button:has-text("I Confirm")');
    
    // Should redirect to rules acceptance
    await expect(page).toHaveURL('/onboarding/rules');
    
    // Accept rules
    await page.check('[name="rulesAcceptance"]');
    await page.click('button:has-text("I Accept")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('existing user bypasses onboarding', async ({ page }) => {
    // Sign in as user who already completed onboarding
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'existing@example.com');
    await page.click('button[type="submit"]');
    
    await page.goto('/dashboard');
    
    // Should not redirect to onboarding
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Testing Accessibility

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage passes axe accessibility tests', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('marketplace page is keyboard navigable', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Tab through listings
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First listing
    
    const firstListing = page.locator('.listing-card:first-child');
    await expect(firstListing).toBeFocused();
    
    // Press Enter to open
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/\/marketplace\/clx/);
  });

  test('modals trap focus', async ({ page }) => {
    await page.goto('/marketplace/clx123');
    
    // Open make offer modal
    await page.click('button:has-text("Make Offer")');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Tab through modal elements
    await page.keyboard.press('Tab'); // Amount input
    await page.keyboard.press('Tab'); // Message textarea
    await page.keyboard.press('Tab'); // Submit button
    await page.keyboard.press('Tab'); // Close button
    await page.keyboard.press('Tab'); // Should wrap back to amount input
    
    const amountInput = modal.locator('[name="amountCents"]');
    await expect(amountInput).toBeFocused();
    
    // Escape closes modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
```

---

## Testing Patterns

### Test Factories

```typescript
// tests/factories/listing.ts
import { faker } from '@faker-js/faker';

export function buildListing(overrides = {}) {
  return {
    id: faker.string.uuid(),
    type: 'WTS',
    title: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    qty: faker.number.int({ min: 1, max: 100 }),
    priceCents: faker.number.int({ min: 1000, max: 100000 }),
    status: 'ACTIVE',
    createdAt: faker.date.recent(),
    ...overrides,
  };
}

export function buildUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    displayName: faker.person.fullName(),
    reputation: faker.number.int({ min: 0, max: 5 }),
    role: 'MEMBER',
    ...overrides,
  };
}

// Usage in tests
const listing = buildListing({ type: 'WTB', priceCents: 5000 });
```

### Custom Matchers

```typescript
// tests/matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidCurrency(received: number) {
    const pass = Number.isInteger(received) && received >= 0;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be valid currency`
          : `Expected ${received} to be a non-negative integer`,
    };
  },
});

// Usage
expect(listing.priceCents).toBeValidCurrency();
```

### Page Object Pattern (E2E)

```typescript
// tests/e2e/pages/marketplace.page.ts
import { type Page } from '@playwright/test';

export class MarketplacePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/marketplace');
  }

  async searchListings(query: string) {
    await this.page.fill('[name="search"]', query);
    await this.page.click('button:has-text("Search")');
  }

  async filterByType(type: 'WTS' | 'WTB' | 'WTT') {
    await this.page.selectOption('[name="type"]', type);
  }

  async filterByPriceRange(min: number, max: number) {
    await this.page.fill('[name="minPrice"]', String(min));
    await this.page.fill('[name="maxPrice"]', String(max));
    await this.page.click('button:has-text("Apply Filters")');
  }

  async clickListing(index: number) {
    await this.page.click(`.listing-card:nth-child(${index + 1})`);
  }

  async getListingCount() {
    return await this.page.locator('.listing-card').count();
  }
}

// Usage in tests
test('filter listings by type', async ({ page }) => {
  const marketplace = new MarketplacePage(page);
  
  await marketplace.goto();
  await marketplace.filterByType('WTS');
  
  const count = await marketplace.getListingCount();
  expect(count).toBeGreaterThan(0);
});
```

---

## Mocking

### Mocking Prisma

```typescript
// tests/mocks/prisma.ts
import { vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});

// Usage in tests
prismaMock.listing.findMany.mockResolvedValue([
  buildListing({ id: '1', title: 'Test 1' }),
  buildListing({ id: '2', title: 'Test 2' }),
]);
```

### Mocking Auth

```typescript
// tests/mocks/auth.ts
import { vi } from 'vitest';

export function mockSession(session: any) {
  vi.mock('@/lib/auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve(session)),
  }));
}

// Usage in tests
mockSession({
  user: {
    id: 'user1',
    email: 'test@example.com',
    role: 'MEMBER',
  },
});
```

### Mocking External APIs

```typescript
// tests/mocks/resend.ts
import { vi } from 'vitest';

export const mockSendEmail = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: mockSendEmail,
    },
  })),
}));

// Usage in tests
mockSendEmail.mockResolvedValue({ id: 'email1' });

// Verify email was sent
expect(mockSendEmail).toHaveBeenCalledWith({
  to: 'user@example.com',
  subject: expect.stringContaining('Offer'),
  html: expect.any(String),
});
```

---

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:unit --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  integration-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: humidor_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/humidor_test
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/humidor_test
  
  e2e-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: humidor_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm playwright install --with-deps
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/humidor_test
      - run: pnpm build
      - run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/humidor_test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Coverage

### Coverage Goals

- **Overall**: 80%+
- **Critical paths**: 95%+ (auth, payments, transactions)
- **Utils/lib**: 90%+
- **Components**: 70%+

### Coverage Reports

```bash
# Generate coverage
pnpm test:unit --coverage

# View HTML report
open coverage/index.html
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --dir tests/unit",
    "test:integration": "vitest run --dir tests/integration",
    "test:e2e": "playwright test",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Best Practices

### DO ✅

- Write tests before fixing bugs (TDD for bugs)
- Test user behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Clean up after tests (database, mocks)
- Use factories for test data
- Test error states and edge cases
- Run tests in CI/CD

### DON'T ❌

- Test implementation details
- Use `getByTestId` unless necessary
- Write tests that depend on each other
- Mock everything (test real integrations when possible)
- Skip accessibility tests
- Commit broken tests
- Ignore flaky tests

---

**For questions or contributions, see:** `/docs/CONTRIBUTING.md`

