# 🗄️ Starting SurrealDB for Humidor Club

## Quick Start

### 1. Install SurrealDB (if not installed)

```bash
# macOS
brew install surrealdb/tap/surreal

# Linux
curl -sSf https://install.surrealdb.com | sh

# Windows
iwr https://windows.surrealdb.com -useb | iex
```

### 2. Start SurrealDB Server

Open a **new terminal** and run:

```bash
surreal start --user root --pass root --bind 0.0.0.0:8000
```

You should see:
```
 .d8888b.                                             888 8888888b.  888888b.
d88P  Y88b                                            888 888  'Y88b 888  '88b
Y88b.                                                 888 888    888 888  .88P
 'Y888b.   888  888 888d888 888d888  .d88b.   8888b. 888 888    888 8888888K.
    'Y88b. 888  888 888P'   888P'   d8P  Y8b     '88b888 888    888 888  'Y88b
      '888 888  888 888     888     88888888 .d888888888 888    888 888    888
Y88b  d88P Y88b 888 888     888     Y8b.     888  888888 888  .d88P 888   d88P
 'Y8888P'   'Y88888 888     888      'Y8888  'Y888888888 8888888P'  8888888P'


[2025-11-01 13:47:00] INFO  surrealdb::kvs::ds: Starting kvs store in memory
[2025-11-01 13:47:00] INFO  surrealdb::dbs: Database strict mode is disabled
[2025-11-01 13:47:00] INFO  surrealdb::net: Starting web server on 0.0.0.0:8000
[2025-11-01 13:47:00] INFO  surrealdb::net: Started web server on 0.0.0.0:8000
```

**✅ SurrealDB is now running!**

### 3. Load the Schema (Optional - Auth tables auto-create)

The NextAuth adapter will create the necessary auth tables automatically, but if you want to load the full app schema:

```bash
# In another terminal
surreal import --conn http://localhost:8000 \
  --user root --pass root \
  --ns humidor_club --db production \
  database/schema.surql
```

### 4. Verify It's Working

```bash
# Test connection
curl http://localhost:8000/health
```

Should return: `OK`

## What Happens Now?

Once SurrealDB is running, NextAuth will:
1. ✅ Connect to SurrealDB using the adapter
2. ✅ Auto-create tables for users, accounts, sessions, and verification tokens
3. ✅ Store magic link tokens in SurrealDB
4. ✅ Handle authentication flows

## Testing Auth

1. **Start SurrealDB** (in one terminal): `surreal start --user root --pass root`
2. **Start Next.js** (in another terminal): `pnpm dev`
3. **Go to**: http://localhost:3000/sign-in
4. **Enter email** and click "Send Magic Link"
5. **Check console** for the magic link
6. **Click the link** → You're signed in!

## SurrealDB Studio (Optional)

To view your data in a nice UI:

```bash
# Open SurrealDB Studio
open http://localhost:8000
```

Connection details:
- **Endpoint**: `http://localhost:8000`
- **Namespace**: `humidor_club`
- **Database**: `production`
- **Username**: `root`
- **Password**: `root`

## Troubleshooting

### Port 8000 already in use

```bash
# Find what's using port 8000
lsof -ti:8000 | xargs kill -9

# Then start SurrealDB again
surreal start --user root --pass root
```

### Connection refused

Make sure SurrealDB is running:
```bash
# Check if running
ps aux | grep surreal

# Check if port is listening
lsof -i :8000
```

### Auth not working

1. Make sure SurrealDB is running on port 8000
2. Check `.env.local` has correct SURREALDB_URL
3. Restart Next.js dev server

## Production Notes

For production:
- Use strong credentials (not root/root)
- Use persistent storage (not memory)
- Enable authentication
- Use TLS/SSL

```bash
surreal start \
  --user admin \
  --pass "your-secure-password" \
  --bind 0.0.0.0:8000 \
  file://data/humidor.db
```

---

**Everything uses SurrealDB now - no Prisma needed!** 🎉

