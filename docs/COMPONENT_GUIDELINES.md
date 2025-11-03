# Component Architecture Guidelines

Comprehensive guide for building React components in the Humidor Club application.

---

## Table of Contents

1. [Component Philosophy](#component-philosophy)
2. [Server vs Client Components](#server-vs-client-components)
3. [Component Structure](#component-structure)
4. [Naming Conventions](#naming-conventions)
5. [Props & TypeScript](#props--typescript)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Performance](#performance)
9. [Accessibility](#accessibility)
10. [Testing](#testing)
11. [Examples](#examples)

---

## Component Philosophy

### Core Principles

1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Build complex UIs from simple components
3. **Explicit over Implicit**: Props and behavior should be obvious
4. **Server-first**: Use Server Components by default
5. **Progressive Enhancement**: Work without JavaScript where possible

### Component Hierarchy

```
app/
├── (pages)              # Route components (Server)
components/
├── ui/                  # Shadcn primitives (Client)
├── common/              # Shared utilities (Mixed)
│   ├── layout/         # Layout components (Mixed)
│   ├── auth-guard.tsx  # Auth wrapper (Server)
│   └── error-boundary.tsx (Client)
└── features/           # Feature components (Mixed)
    ├── cigars/
    ├── marketplace/
    └── admin/
```

---

## Server vs Client Components

### Server Components (Default)

Use for:
- ✅ Data fetching from database
- ✅ Accessing backend resources
- ✅ Keeping sensitive information secure
- ✅ Reducing client bundle size
- ✅ SEO-critical content

```tsx
// app/(protected)/cigars/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { CigarDetail } from '@/components/features/cigars/cigar-detail';

export default async function CigarPage({ params }: { params: { id: string } }) {
  const cigar = await prisma.cigar.findUnique({
    where: { id: params.id },
    include: {
      line: { include: { brand: true } },
      photos: true,
      releases: true,
    },
  });

  if (!cigar) {
    notFound();
  }

  return <CigarDetail cigar={cigar} />;
}
```

### Client Components

Use 'use client' when you need:
- ✅ Event listeners (onClick, onChange, etc.)
- ✅ State (useState, useReducer)
- ✅ Effects (useEffect, useLayoutEffect)
- ✅ Browser APIs (localStorage, window, etc.)
- ✅ Custom hooks
- ✅ React Context

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function OfferForm({ listingId }: { listingId: string }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch(`/api/listings/${listingId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: parseFloat(amount) * 100 }),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Offer'}
      </Button>
    </form>
  );
}
```

### Hybrid Pattern

Keep client boundary as small as possible:

```tsx
// ❌ Bad: Entire page is client component
'use client';

export default function CigarPage({ id }: { id: string }) {
  const [cigar, setCigar] = useState(null);
  
  useEffect(() => {
    fetch(`/api/cigars/${id}`).then(r => r.json()).then(setCigar);
  }, [id]);
  
  return <CigarDetail cigar={cigar} />;
}

// ✅ Good: Server fetches, client for interactivity
export default async function CigarPage({ params }: { params: { id: string } }) {
  const cigar = await prisma.cigar.findUnique({ where: { id: params.id } });
  
  return (
    <>
      <CigarInfo cigar={cigar} />  {/* Server component */}
      <TastingNoteForm cigarId={cigar.id} />  {/* Client component */}
    </>
  );
}
```

---

## Component Structure

### File Organization

```
components/features/marketplace/
├── index.ts                      # Barrel export
├── listing-card.tsx              # Presentational component
├── listing-form.tsx              # Form component (client)
├── listing-filters.tsx           # Filter component (client)
├── listing-filters-server.tsx   # Server-rendered filters
├── __tests__/
│   ├── listing-card.test.tsx
│   └── listing-form.test.tsx
└── types.ts                      # Shared types
```

### Component Template

```tsx
// components/features/marketplace/listing-card.tsx
import { type Listing, type User } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

// 1. Type definitions
type ListingWithRelations = Listing & {
  user: Pick<User, 'id' | 'displayName' | 'reputation'>;
  photos: Photo[];
};

interface ListingCardProps {
  listing: ListingWithRelations;
  onView?: (listingId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

// 2. Component
export function ListingCard({
  listing,
  onView,
  variant = 'default',
  className,
}: ListingCardProps) {
  // 3. Early returns
  if (!listing) {
    return null;
  }

  // 4. Computed values
  const primaryPhoto = listing.photos[0];
  const formattedPrice = listing.priceCents
    ? formatCurrency(listing.priceCents)
    : 'Price on request';

  // 5. Event handlers
  function handleClick() {
    onView?.(listing.id);
  }

  // 6. Render
  return (
    <Card className={className} onClick={handleClick}>
      {primaryPhoto && (
        <img
          src={primaryPhoto.url}
          alt={primaryPhoto.alt || listing.title}
          className="aspect-video object-cover"
        />
      )}
      <CardHeader>
        <CardTitle>{listing.title}</CardTitle>
        <CardDescription>{listing.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formattedPrice}</span>
          <Badge variant={listing.type}>{listing.type}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Naming Conventions

### Component Names

- **PascalCase**: `ListingCard`, `OfferPanel`
- **Descriptive**: Name by function, not implementation
- **Specific**: `CigarSearchForm` not `Form`

### File Names

- **kebab-case**: `listing-card.tsx`, `offer-panel.tsx`
- **Match component**: File `listing-card.tsx` exports `ListingCard`
- **Suffixes**:
  - `*-form.tsx` for forms
  - `*-list.tsx` for lists
  - `*-card.tsx` for card components
  - `*-modal.tsx` or `*-dialog.tsx` for modals

### Props

```tsx
interface ListingCardProps {
  // Data props (noun)
  listing: Listing;
  user: User;
  
  // Event handlers (on + Verb)
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  
  // Boolean flags (is/has/should)
  isLoading?: boolean;
  hasPhoto?: boolean;
  shouldShowBadge?: boolean;
  
  // Configuration (variant/size/etc)
  variant?: 'default' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}
```

---

## Props & TypeScript

### Prop Types

```tsx
import { type PropsWithChildren } from 'react';
import { type VariantProps } from 'class-variance-authority';

// Basic props
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// With children
interface CardProps extends PropsWithChildren {
  title: string;
}

// With HTML attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// With variants (CVA)
interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

// Discriminated union
type ListingFormProps =
  | { mode: 'create'; initialData?: never }
  | { mode: 'edit'; initialData: Listing };
```

### Default Props

```tsx
// ❌ Avoid: defaultProps (deprecated)
Button.defaultProps = {
  variant: 'default',
};

// ✅ Use: Default parameters
interface ButtonProps {
  variant?: 'default' | 'outline';
}

export function Button({ variant = 'default' }: ButtonProps) {
  // ...
}
```

### Ref Forwarding

```tsx
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## State Management

### Local State (useState)

```tsx
'use client';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

### Form State (useFormState)

```tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createListing } from '@/app/actions';

export function ListingForm() {
  const [state, formAction] = useFormState(createListing, null);

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.errors?.title && <p>{state.errors.title}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

### Server Data (SWR)

```tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ListingList() {
  const { data, error, mutate } = useSWR('/api/listings', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      {data.data.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### UI State (Zustand)

```tsx
// store/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// components/layout/sidebar.tsx
'use client';

import { useUIStore } from '@/store/ui-store';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarOpen ? 'block' : 'hidden'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

---

## Error Handling

### Error Boundaries

```tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error States in Components

```tsx
export function ListingList() {
  const { data, error, isLoading } = useSWR('/api/listings');

  // Loading state
  if (isLoading) {
    return <ListingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading listings</AlertTitle>
        <AlertDescription>
          {error.message || 'Please try again later'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (data.data.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description="Be the first to create a listing"
        action={<Button href="/marketplace/new">Create Listing</Button>}
      />
    );
  }

  // Success state
  return (
    <div className="grid grid-cols-3 gap-4">
      {data.data.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

---

## Performance

### Memoization

```tsx
'use client';

import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ListingCard = memo(function ListingCard({ listing }: Props) {
  return <Card>...</Card>;
});

// Memoize expensive calculations
export function ListingList({ listings }: Props) {
  const sortedListings = useMemo(() => {
    return listings.sort((a, b) => b.publishedAt - a.publishedAt);
  }, [listings]);

  const handleView = useCallback((id: string) => {
    router.push(`/marketplace/${id}`);
  }, [router]);

  return sortedListings.map((listing) => (
    <ListingCard key={listing.id} listing={listing} onView={handleView} />
  ));
}
```

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const OfferPanel = dynamic(() => import('./offer-panel'), {
  loading: () => <OfferPanelSkeleton />,
  ssr: false, // Client-only if needed
});

export function ListingDetail({ listing }: Props) {
  const [showOffers, setShowOffers] = useState(false);

  return (
    <div>
      <ListingInfo listing={listing} />
      <button onClick={() => setShowOffers(true)}>View Offers</button>
      {showOffers && <OfferPanel listingId={listing.id} />}
    </div>
  );
}
```

### Image Optimization

```tsx
import Image from 'next/image';

export function CigarPhoto({ photo }: { photo: Photo }) {
  return (
    <Image
      src={photo.url}
      alt={photo.alt || 'Cigar photo'}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL={photo.blurDataURL}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading="lazy"
      className="rounded-lg"
    />
  );
}
```

---

## Accessibility

### Semantic HTML

```tsx
// ✅ Good: Semantic elements
export function ListingDetail() {
  return (
    <article>
      <header>
        <h1>Listing Title</h1>
      </header>
      <section>
        <h2>Description</h2>
        <p>...</p>
      </section>
      <footer>
        <button>Make Offer</button>
      </footer>
    </article>
  );
}

// ❌ Bad: Div soup
export function ListingDetail() {
  return (
    <div>
      <div>
        <div>Listing Title</div>
      </div>
      <div>...</div>
    </div>
  );
}
```

### ARIA Labels

```tsx
export function SearchBar() {
  return (
    <form role="search">
      <label htmlFor="search">Search cigars</label>
      <input
        id="search"
        type="search"
        aria-label="Search cigars"
        aria-describedby="search-help"
      />
      <p id="search-help">Search by brand, line, or vitola</p>
    </form>
  );
}
```

### Keyboard Navigation

```tsx
export function Modal({ isOpen, onClose, children }: Props) {
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return isOpen ? (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null;
}
```

### Focus Management

```tsx
import { useRef, useEffect } from 'react';

export function Dialog({ isOpen, onClose, children }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef} onClick={onClose} aria-label="Close dialog">
        <X />
      </button>
      {children}
    </div>
  );
}
```

---

## Testing

### Component Tests

```tsx
// __tests__/listing-card.test.tsx
import { render, screen } from '@testing-library/react';
import { ListingCard } from '../listing-card';

describe('ListingCard', () => {
  const mockListing = {
    id: 'clx123',
    title: 'Test Listing',
    priceCents: 10000,
    type: 'WTS',
    user: { id: 'user1', displayName: 'Test User', reputation: 5 },
    photos: [],
  };

  it('renders listing title', () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });

  it('formats price correctly', () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('calls onView when clicked', () => {
    const onView = vi.fn();
    render(<ListingCard listing={mockListing} onView={onView} />);
    
    screen.getByRole('article').click();
    expect(onView).toHaveBeenCalledWith('clx123');
  });
});
```

### Interaction Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OfferForm } from '../offer-form';

describe('OfferForm', () => {
  it('submits offer', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    render(<OfferForm listingId="clx123" />);

    await user.type(screen.getByLabelText('Amount'), '400');
    await user.click(screen.getByRole('button', { name: /send offer/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/listings/clx123/offers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ amountCents: 40000 }),
        })
      );
    });
  });
});
```

---

## Examples

### Complete Feature Component

```tsx
// components/features/marketplace/listing-detail.tsx
'use client';

import { useState } from 'react';
import { type Listing, type User, type Photo } from '@prisma/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OfferPanel } from './offer-panel';
import { MessageThread } from './message-thread';

type ListingWithRelations = Listing & {
  user: Pick<User, 'id' | 'displayName' | 'reputation'>;
  photos: Photo[];
};

interface ListingDetailProps {
  listing: ListingWithRelations;
  currentUserId?: string;
}

export function ListingDetail({ listing, currentUserId }: ListingDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'offers' | 'messages'>('details');
  const isOwner = currentUserId === listing.userId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Photos */}
      <div className="lg:col-span-2">
        {listing.photos.length > 0 ? (
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={listing.photos[0].url}
              alt={listing.photos[0].alt || listing.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No photos</p>
          </div>
        )}
      </div>

      {/* Info */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Badge>{listing.type}</Badge>
            <h1 className="text-3xl font-bold mt-2">{listing.title}</h1>
            <p className="text-2xl font-semibold text-primary mt-2">
              {formatCurrency(listing.priceCents)}
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Seller</h3>
            <div className="flex items-center gap-2">
              <span>{listing.user.displayName}</span>
              <Badge variant="secondary">★ {listing.user.reputation}</Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Details</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Quantity</dt>
                <dd>{listing.qty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Condition</dt>
                <dd>{listing.condition}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location</dt>
                <dd>{listing.region}</dd>
              </div>
            </dl>
          </div>

          {!isOwner && listing.status === 'ACTIVE' && (
            <Button className="w-full" size="lg">
              Make Offer
            </Button>
          )}
        </div>
      </Card>

      {/* Description & Tabs */}
      <div className="lg:col-span-3">
        <Card className="p-6">
          <div className="border-b mb-4">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('details')}
                className={activeTab === 'details' ? 'border-b-2 border-primary' : ''}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={activeTab === 'offers' ? 'border-b-2 border-primary' : ''}
              >
                Offers
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={activeTab === 'messages' ? 'border-b-2 border-primary' : ''}
              >
                Messages
              </button>
            </nav>
          </div>

          {activeTab === 'details' && (
            <div className="prose">
              <p>{listing.description}</p>
            </div>
          )}

          {activeTab === 'offers' && (
            <OfferPanel listingId={listing.id} isOwner={isOwner} />
          )}

          {activeTab === 'messages' && (
            <MessageThread listingId={listing.id} />
          )}
        </Card>
      </div>
    </div>
  );
}
```

---

**For questions or contributions, see:** `/docs/CONTRIBUTING.md`

