# Project Status - Cigar Club International

**Last Updated**: November 11, 2024  
**Current Branch**: main  
**Latest Commit**: `9a2d120` - fix: update dashboard community card to link to /community

---

## 🎯 Project Overview

A private, age-gated web application for cigar enthusiasts to collect, rate, trade, and discover premium cigars within an exclusive community. Built with Next.js 16, TypeScript, PostgreSQL, and Prisma ORM.

---

## ✅ Recently Completed Features

### 1. Public Humidor Visibility (November 11, 2024)
- **Database**: Added `humidor_public` field to User model
- **Migration**: `20251111032324_add_humidor_public_flag`
- **Features**:
  - Toggle humidor visibility on humidor page
  - Badge display on people page showing cigar counts for public humidors
  - Cross-chapter visibility (works across all chapters)
  - API enforcement of privacy rules (403 for private humidors)
- **Files Modified**:
  - `prisma/schema.prisma` - Added `humidor_public` field
  - `app/api/profile/route.ts` - Added visibility update endpoint
  - `app/api/users/route.ts` - Added humidor count aggregation
  - `app/api/users/[id]/humidor/route.ts` - Added privacy check
  - `app/(protected)/humidor/page.tsx` - Added visibility toggle UI
  - `app/(protected)/people/page.tsx` - Added badge display

### 2. Community Feed with Posts & Comments (November 11, 2024)
- **Database**: Added Post and Comment models
- **Migration**: `20251111034420_add_community_posts_comments`
- **Features**:
  - Post creation with text and multiple images
  - Comment system with text and optional images
  - Share humidor items/cigars in posts
  - Clickable author links to user profiles
  - Real-time engagement metrics (like_count, comment_count)
  - Soft delete for moderation
  - Pagination support
- **New API Routes**:
  - `GET/POST /api/posts` - List and create posts
  - `GET/PATCH/DELETE /api/posts/[id]` - Individual post operations
  - `GET/POST /api/posts/[id]/comments` - Comments for a post
  - `DELETE /api/comments/[id]` - Delete comment
- **New Pages**:
  - `app/(protected)/community/page.tsx` - Community feed page
- **Files Modified**:
  - `app/(protected)/layout-client.tsx` - Added Community navigation link
  - `app/(protected)/dashboard/page.tsx` - Added Community quick action card

### 3. Documentation Organization (November 11, 2024)
- Moved all historical/debug files to `docs/history/`
- Created comprehensive `README.md` with features, installation, and usage
- Created `docs/history/README.md` as index for historical files

---

## 📊 Current Database Schema

### Key Models

**User Model**:
- `humidor_public` (Boolean) - Controls visibility of user's humidor to community
- Relations: posts, comments, humidorItems, listings, pairings

**Post Model**:
- Content, image_urls (JSON array)
- Optional references: `cigar_id`, `humidor_item_id`
- Engagement: `like_count`, `comment_count`
- Soft delete: `is_deleted`, `deleted_at`

**Comment Model**:
- Content, optional `image_url`
- Links to: `post_id`, `user_id`
- Soft delete: `is_deleted`, `deleted_at`

**Listing Model** (Marketplace):
- Types: WTS, WTB, WTT
- Status: DRAFT, ACTIVE, PENDING, SOLD, WITHDRAWN, FROZEN
- Links to cigars and humidor items

**HumidorItem Model**:
- Marketplace fields: `available_for_sale`, `available_for_trade`
- Relations: posts (can be shared in community)

---

## 🗂️ Project Structure

```
humidor-club/
├── app/
│   ├── (protected)/
│   │   ├── cigars/          # Cigar management
│   │   ├── dashboard/       # User dashboard
│   │   ├── humidor/         # Personal humidor
│   │   ├── marketplace/     # Marketplace features
│   │   ├── people/          # Community members
│   │   ├── profile/         # User profile
│   │   └── community/       # Community feed (NEW)
│   └── api/
│       ├── posts/           # Post API (NEW)
│       ├── comments/        # Comment API (NEW)
│       ├── cigars/
│       ├── dashboard/
│       ├── humidor/
│       ├── listings/
│       ├── users/
│       └── upload/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── 20251111032324_add_humidor_public_flag/
│       └── 20251111034420_add_community_posts_comments/
└── components/
```

---

## 🔌 API Endpoints Summary

### Posts
- `GET /api/posts` - List posts with pagination (query: limit, cursor)
- `POST /api/posts` - Create post (body: content, image_urls, cigar_id, humidor_item_id)
- `GET /api/posts/[id]` - Get single post
- `PATCH /api/posts/[id]` - Update post (owner only)
- `DELETE /api/posts/[id]` - Soft delete post (owner only)

### Comments
- `GET /api/posts/[id]/comments` - Get comments for a post
- `POST /api/posts/[id]/comments` - Create comment (body: content, image_url)
- `DELETE /api/comments/[id]` - Soft delete comment (owner only)

### Profile
- `GET /api/profile` - Get current user profile
- `PATCH /api/profile` - Update profile (includes `humidor_public`)

### Users
- `GET /api/users` - List users (includes `humidor_public` and `humidorCount`)
- `GET /api/users/[id]` - Get user profile
- `GET /api/users/[id]/humidor` - Get user's public humidor (privacy enforced)

### Marketplace
- `GET /api/listings` - Browse listings (filters: type, status, region, cigar_id, userId)
- `POST /api/listings` - Create listing
- `GET/PATCH/DELETE /api/listings/[id]` - Individual listing operations

---

## 🎨 UI Components & Pages

### Main Navigation (layout-client.tsx)
1. Home (Dashboard)
2. **Community** (NEW) - `/community`
3. Cigars - `/cigars`
4. Humidor - `/humidor`
5. Market (Marketplace) - `/marketplace`
6. People - `/people`
7. Profile - `/profile`

### Key Pages

**Community Feed** (`/community`):
- Post feed with pagination
- Post creation form with:
  - Text content
  - Multiple image uploads
  - Humidor item selector
- Expandable comments with:
  - Text and optional image
  - Real-time comment counts
- Clickable author profiles

**Humidor Page** (`/humidor`):
- Visibility toggle (public/private)
- Marketplace availability settings
- Smoking activity tracking
- Direct listing creation

**People Page** (`/people`):
- User search
- Badge display for public humidors (cigar count)
- User profile modals
- Public humidor viewing

**Dashboard** (`/dashboard`):
- Stats cards (Humidor, Club Cigars, Marketplace, Reputation)
- Quick Actions (includes Community link)
- Recent Activity feed

---

## 🔧 Technical Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5.9+
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.18.0
- **Auth**: NextAuth.js 4.24.13
- **Styling**: Tailwind CSS + Shadcn UI
- **Storage**: Vercel Blob Storage
- **Icons**: Lucide React

---

## 📝 Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - Secret key for NextAuth

**Recommended**:
- `RESEND_API_KEY` - Email service
- `BLOB_READ_WRITE_TOKEN` - File uploads (Vercel Blob)

---

## 🚀 Recent Migrations

1. `20251111032324_add_humidor_public_flag` - Added public humidor visibility
2. `20251111034420_add_community_posts_comments` - Added posts and comments

**To apply migrations**:
```bash
cd humidor-club
npx prisma migrate deploy
```

---

## 🔄 Git Status

**Latest Commits**:
- `9a2d120` - fix: update dashboard community card to link to /community
- `831fe00` - feat: add community feed with posts and comments
- `ffc0772` - feat: add public humidor visibility feature and organize documentation

**Branch**: main  
**Status**: Up to date with origin/main

---

## 📋 Next Steps / Future Enhancements

### Potential Features to Consider

1. **Post Engagement**:
   - Like/Unlike functionality (currently only displays count)
   - Post editing (currently only delete)
   - Share/Repost functionality

2. **Community Enhancements**:
   - Post filtering (by user, cigar, date)
   - Search functionality
   - Post categories/tags
   - Rich text formatting for posts

3. **Notifications**:
   - Notify users when someone comments on their post
   - Notify users when someone shares their humidor item
   - Activity notifications

4. **Moderation**:
   - Report posts/comments
   - Admin moderation tools
   - Content flagging system

5. **Social Features**:
   - Follow/unfollow users
   - User mentions in posts (@username)
   - Hashtags
   - Post reactions (beyond just likes)

6. **Performance**:
   - Infinite scroll for posts (instead of pagination)
   - Image optimization
   - Caching strategies
   - Real-time updates (WebSockets/SSE)

7. **Analytics**:
   - Post engagement analytics
   - Popular posts/trending
   - User activity metrics

---

## 🐛 Known Issues / Notes

1. **Post Likes**: Currently only displays count, no actual like functionality implemented
2. **Image Upload**: Uses Vercel Blob in production, local filesystem in development
3. **Comment Counts**: Updated manually on create/delete, could be optimized with database triggers
4. **Date Formatting**: Uses custom `formatTimeAgo` function, could use date-fns library for better formatting

---

## 📚 Documentation

- **Main README**: `/README.md` - Comprehensive project documentation
- **API Spec**: `/docs/API_SPECIFICATION.md`
- **Architecture**: `/docs/ARCHITECTURE_UPDATED.md`
- **PRD**: `/docs/PRD_ENHANCED.md`
- **History**: `/docs/history/` - All historical/debug files

---

## 🔐 Security Considerations

- All API routes require authentication
- Privacy enforcement for private humidors (403 errors)
- Soft deletes for posts/comments (data retention)
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM
- XSS prevention via React escaping

---

## 💾 Database Backup

**Important**: Before making major changes, consider:
- Database backups
- Migration rollback plans
- Data migration scripts if needed

**Prisma Commands**:
```bash
# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Apply migrations in production
npx prisma migrate deploy
```

---

## 🎯 Quick Start (Resume Project)

1. **Navigate to project**:
   ```bash
   cd /Users/florentinhortopan/Documents/CIGAR-CLUB/App/Cigar-Club-International/humidor-club
   ```

2. **Install dependencies** (if needed):
   ```bash
   pnpm install
   ```

3. **Check database connection**:
   ```bash
   npx prisma studio
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

5. **Access application**:
   - App: http://localhost:3000
   - Prisma Studio: http://localhost:5555

---

## 📞 Key Files Reference

**Schema**: `humidor-club/prisma/schema.prisma`  
**Community Page**: `humidor-club/app/(protected)/community/page.tsx`  
**Post API**: `humidor-club/app/api/posts/route.ts`  
**Comment API**: `humidor-club/app/api/posts/[id]/comments/route.ts`  
**Navigation**: `humidor-club/app/(protected)/layout-client.tsx`  
**Dashboard**: `humidor-club/app/(protected)/dashboard/page.tsx`

---

**Project is in a stable state and ready for continuation.**

