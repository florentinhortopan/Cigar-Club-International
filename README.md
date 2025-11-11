# Cigar Club International

A private, age-gated web application for cigar enthusiasts to collect, rate, trade, and discover premium cigars within an exclusive community.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)

## 🌟 Features

### Core Features

- **🔐 Private & Age-Gated Community**
  - Invite-only access
  - 21+ age verification
  - Session-based authentication with NextAuth.js

- **📚 Comprehensive Cigar Database**
  - Hierarchical structure: Brand → Line → Cigar
  - Detailed cigar specifications (ring gauge, length, wrapper, binder, filler)
  - Image galleries for each cigar
  - MSRP and typical street pricing
  - Strength and body ratings

- **📦 Personal Humidor Management**
  - Track your personal cigar collection
  - Log smoking activity and dates
  - Set purchase prices and dates
  - Mark cigars as available for sale or trade
  - Public/private visibility toggle for community sharing
  - View collection statistics (total cigars, value, unique items)

- **🛒 Marketplace**
  - Create listings: Want to Sell (WTS), Want to Buy (WTB), Want to Trade (WTT)
  - Browse active listings with filters (type, status, region, price range)
  - Filter by specific cigars
  - View listing details with images and seller information
  - Edit and manage your own listings
  - Link listings directly from humidor items

- **🍷 Pairings**
  - Add pairings for cigars (food, drink, event, style)
  - View pairing counts on cigar pages
  - Link to cigar detail pages from pairings

- **👥 Community Features**
  - Browse members across all chapters
  - View public humidors (if user has enabled visibility)
  - See cigar counts for users with public humidors
  - Search members by name or email
  - Contact members via email

- **📊 Dashboard**
  - Personal statistics (humidor count, value, active listings)
  - Club-wide statistics
  - Recent activity feed (pairings, new users, new cigars, marketplace listings)
  - Quick action links

- **🌍 Multi-Chapter Support**
  - Create and manage branches/chapters
  - Chapter-specific homepages
  - Cross-chapter visibility for public humidors

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **pnpm** (package manager)
- **PostgreSQL** database (Supabase, Neon, or local)
- **Email service** (Resend recommended, or SMTP)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/florentinhortopan/Cigar-Club-International.git
   cd Cigar-Club-International/humidor-club
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `humidor-club` directory:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
   
   # Email (Resend recommended)
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   EMAIL_FROM="noreply@yourdomain.com"
   
   # Optional: Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxxxxxxxxxx"
   ```

4. **Initialize the database**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Seed the database (optional)**
   ```bash
   pnpm prisma db seed
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Cigar-Club-International/
├── humidor-club/              # Main application
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (protected)/      # Protected routes
│   │   │   ├── cigars/       # Cigar management
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── humidor/      # Personal humidor
│   │   │   ├── marketplace/  # Marketplace features
│   │   │   ├── people/       # Community members
│   │   │   └── profile/      # User profile
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── common/           # Shared components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Utility functions
│   ├── prisma/               # Database schema & migrations
│   └── public/               # Static assets
├── docs/                      # Documentation
│   ├── API_SPECIFICATION.md  # API documentation
│   ├── ARCHITECTURE_UPDATED.md
│   ├── PRD_ENHANCED.md       # Product requirements
│   └── history/              # Historical/debug files
└── README.md                  # This file
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.9+](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **File Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or Supabase Storage
- **Email**: [Resend](https://resend.com/) or SMTP
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## 📖 Usage Guide

### For Users

#### Getting Started
1. Sign up with an invite link or email
2. Verify your email address
3. Complete your profile
4. Join or create a chapter

#### Managing Your Humidor
1. Navigate to **My Humidor**
2. Click **Add Cigar** to add cigars to your collection
3. Use the visibility toggle to make your humidor public to the community
4. Mark cigars as smoked to track your consumption
5. Set marketplace availability for sale or trade

#### Creating Marketplace Listings
1. Go to **Marketplace** → **Create Listing**
2. Select a cigar from your humidor or search the database
3. Fill in listing details (type, price, quantity, location, shipping options)
4. Upload images
5. Publish as ACTIVE or save as DRAFT

#### Browsing the Community
1. Visit **People** to see all members
2. Click on a member to view their profile
3. If their humidor is public, you can see their collection
4. Contact members via email

### For Developers

#### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code with Prettier
pnpm type-check       # Type check without building

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run E2E tests with Playwright

# Database
pnpm prisma studio    # Open Prisma Studio (database GUI)
pnpm prisma migrate dev # Create and apply migrations
pnpm prisma migrate deploy # Apply migrations in production
pnpm prisma generate  # Generate Prisma Client
pnpm prisma db seed   # Seed database with sample data
```

#### Database Migrations

Create a new migration:
```bash
pnpm prisma migrate dev --name description_of_change
```

Apply migrations in production:
```bash
pnpm prisma migrate deploy
```

#### Environment Variables

See `.env.example` for all available environment variables.

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (e.g., `http://localhost:3000` or `https://yourdomain.com`)
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with `openssl rand -base64 32`)

**Recommended**:
- `RESEND_API_KEY` - For email sending
- `EMAIL_FROM` - Email address for sending emails
- `BLOB_READ_WRITE_TOKEN` - For file uploads (Vercel Blob)

**Optional**:
- `UPSTASH_REDIS_REST_URL` - For caching and rate limiting
- `SENTRY_DSN` - For error tracking
- `SUPABASE_URL` / `SUPABASE_KEY` - Alternative storage option

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push to main

The `vercel.json` file is configured for optimal deployment.

### Manual Deployment

1. **Build the application**:
   ```bash
   pnpm build
   ```

2. **Set up the database**:
   ```bash
   pnpm prisma migrate deploy
   ```

3. **Start the server**:
   ```bash
   pnpm start
   ```

## 🔒 Security Features

- **Age-gated**: 21+ verification required
- **Invite-only**: Access control through email verification
- **Session-based authentication**: Secure session management
- **Input validation**: Zod schemas for all user inputs
- **SQL injection protection**: Prisma ORM parameterized queries
- **XSS prevention**: React's built-in escaping + DOMPurify
- **CSRF protection**: Next.js built-in protection
- **Rate limiting**: API endpoint protection (when configured)

## 📚 Documentation

- **[API Specification](docs/API_SPECIFICATION.md)** - Complete API documentation
- **[Architecture Guide](docs/ARCHITECTURE_UPDATED.md)** - System architecture
- **[Product Requirements](docs/PRD_ENHANCED.md)** - Detailed feature specifications
- **[Component Guidelines](docs/COMPONENT_GUIDELINES.md)** - Component development standards
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing strategies and examples
- **[Development Guide](docs/history/DEVELOPMENT_GUIDE.md)** - Development workflow
- **[Deployment Guide](docs/history/DEPLOYMENT_GUIDE.md)** - Deployment instructions

Historical and debug files are archived in [`docs/history/`](docs/history/).

## 🤝 Contributing

1. Read the [Component Guidelines](docs/COMPONENT_GUIDELINES.md)
2. Follow TypeScript and ESLint rules
3. Write tests for new features
4. Update documentation as needed
5. Create a pull request

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and test:
   ```bash
   pnpm test
   pnpm lint
   ```

3. Commit with conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```

4. Push and create PR:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Key Features in Detail

### Marketplace System
- **Listing Types**: Want to Sell (WTS), Want to Buy (WTB), Want to Trade (WTT)
- **Status Management**: DRAFT, ACTIVE, PENDING, SOLD, WITHDRAWN, FROZEN
- **Filtering**: By type, status, region, price range, and specific cigars
- **Direct Integration**: Create listings directly from humidor items
- **Badge System**: Shows active listing counts on cigar pages

### Humidor Visibility
- **Privacy Control**: Toggle humidor visibility to community
- **Cross-Chapter**: Public humidors visible across all chapters
- **Badge Display**: Shows cigar count for users with public humidors
- **Secure Access**: API enforces privacy rules

### Activity Feed
- **Real-time Updates**: Recent pairings, new users, new cigars, marketplace listings
- **Links**: Direct links to relevant pages
- **User Context**: Shows who performed each activity

## 🐛 Troubleshooting

Common issues and solutions are documented in [`docs/history/TROUBLESHOOTING_AUTH.md`](docs/history/TROUBLESHOOTING_AUTH.md).

For database connection issues, see:
- [`docs/history/FIX_CONNECTION_STRING_ERROR.md`](docs/history/FIX_CONNECTION_STRING_ERROR.md)
- [`docs/history/DEBUG_CONNECTION_STRING.md`](docs/history/DEBUG_CONNECTION_STRING.md)

## 📄 License

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with ❤️ for cigar enthusiasts worldwide.

---

**Need Help?** Create an issue on GitHub or contact support.
