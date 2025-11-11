# Humidor Club

A private, age-gated web application for cigar enthusiasts featuring knowledge base, collectibles tracking, valuation index, and internal marketplace.

## Features

- 🔐 **Private & Age-Gated**: Invite-only, 21+ community
- 📚 **Knowledge Base**: Comprehensive cigar database (Brand → Line → Cigar → Release)
- 🎯 **Tasting Notes**: Structured note-taking with ratings and pairings
- 📦 **Humidor Tracking**: Manage your personal collection
- 💰 **Valuation Index**: Market-based pricing with historical trends
- 🛒 **Marketplace**: WTS/WTB/WTT listings with negotiation system
- 💬 **Messaging**: Per-listing private communication
- ⭐ **Reputation System**: Post-deal feedback and ratings
- 🛡️ **Moderation**: Content review and user management tools

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3+
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS + Shadcn UI
- **Storage**: Supabase Storage / Cloudflare R2
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database (Supabase, Neon, or local)
- Email service (Resend or SMTP)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd humidor-club
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `RESEND_API_KEY`: Your Resend API key
- Other optional services (Supabase, Redis, Sentry)

4. Initialize database:
```bash
pnpm prisma migrate dev
```

5. (Optional) Seed database with sample data:
```bash
pnpm prisma db seed
```

6. Run development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
humidor-club/
├── app/                  # Next.js app directory
│   ├── (public)/        # Public pages (landing, terms, etc.)
│   ├── (auth)/          # Auth pages (sign-in)
│   ├── (protected)/     # Protected pages (dashboard, marketplace, etc.)
│   └── api/             # API routes
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── common/         # Shared components
│   └── features/       # Feature-specific components
├── lib/                # Utility functions
│   ├── prisma.ts       # Prisma client
│   ├── errors.ts       # Error handling
│   ├── validation.ts   # Zod schemas
│   └── utils.ts        # General utilities
├── prisma/             # Database schema and migrations
├── tests/              # Test files
└── docs/               # Documentation
```

## Documentation

- [Enhanced PRD](../docs/PRD_ENHANCED.md) - Complete product requirements
- [API Specification](../docs/API_SPECIFICATION.md) - API endpoints and schemas
- [Component Guidelines](../docs/COMPONENT_GUIDELINES.md) - Component architecture
- [Testing Guide](../docs/TESTING_GUIDE.md) - Testing strategy and examples
- [Architecture Guide](../docs/ARCHITECTURE_UPDATED.md) - System architecture
- [Development Guide](../docs/history/DEVELOPMENT_GUIDE.md) - Development workflow
- [Deployment Guide](../docs/history/DEPLOYMENT_GUIDE.md) - Deployment instructions

Historical and debug files are archived in [`docs/history/`](../docs/history/).

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm prisma studio` - Open Prisma Studio
- `pnpm prisma migrate dev` - Create and apply migrations

## Development Workflow

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make changes and test**:
```bash
pnpm test
pnpm lint
```

3. **Commit with conventional commits**:
```bash
git commit -m "feat: add listing filters"
```

4. **Push and create PR**:
```bash
git push origin feature/your-feature-name
```

## Database Migrations

Create a new migration:
```bash
pnpm prisma migrate dev --name description_of_change
```

Apply migrations in production:
```bash
pnpm prisma migrate deploy
```

## Environment Variables

See [.env.example](.env.example) for all required and optional environment variables.

**Required**:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

**Recommended**:
- `RESEND_API_KEY` or `EMAIL_SERVER`
- `SUPABASE_URL` and keys (for storage)

**Optional**:
- `UPSTASH_REDIS_REST_URL` (caching, rate limiting)
- `SENTRY_DSN` (error tracking)
- `CRON_SECRET` (webhook authentication)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

1. Build the application:
```bash
pnpm build
```

2. Set up database:
```bash
pnpm prisma migrate deploy
```

3. Start the server:
```bash
pnpm start
```

## Security

- Age-gated (21+)
- Invite-only access
- Session-based authentication
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection protection (Prisma)
- XSS prevention (React + DOMPurify)
- CSRF protection (Next.js)

## Contributing

1. Read the [Component Guidelines](../docs/COMPONENT_GUIDELINES.md)
2. Follow the TypeScript and ESLint rules
3. Write tests for new features
4. Update documentation as needed
5. Create a pull request

## License

See [LICENSE](../LICENSE) for details.

## Support

For questions or support:
- Create an issue on GitHub
- Email: support@humidor.club

---

**Built with ❤️ for cigar enthusiasts**
