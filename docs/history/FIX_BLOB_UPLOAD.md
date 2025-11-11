# 🔧 Fix Vercel Blob Upload - Missing Token

## Problem
```
Failed to upload: Vercel Blob: No token found. Either configure the `BLOB_READ_WRITE_TOKEN` environment variable, or pass a `token` option to your calls.
```

## ✅ Solution: Get and Configure BLOB_READ_WRITE_TOKEN

### Step 1: Get Token from Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Storage** → **Blob**
3. If you haven't created a Blob store yet:
   - Click **"Create Blob Store"**
   - Give it a name (e.g., "cigar-club-images")
   - Click **"Create"**
4. Once created, you'll see the **"Read/Write Token"**
5. **Copy the token** (it starts with `vercel_blob_rw_...`)

### Step 2: Add Token to Vercel Environment Variables

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Set:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Paste the token you copied
   - **Environment**: Select all (Production, Preview, Development)
4. Click **"Save"**

### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

### Step 4: Verify

After redeployment, try uploading an image again. It should work!

---

## Code Changes Made

The upload route (`app/api/upload/route.ts`) has been updated to:

1. ✅ Check for `BLOB_READ_WRITE_TOKEN` environment variable
2. ✅ Pass the token explicitly to the `put()` function
3. ✅ Provide a clear error message if token is missing

**Before:**
```typescript
const blob = await put(filename, file, {
  access: 'public',
  contentType: file.type,
});
```

**After:**
```typescript
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required for Vercel Blob storage');
}
const blob = await put(filename, file, {
  access: 'public',
  contentType: file.type,
  token, // Pass the token explicitly
});
```

---

## Alternative: Local Development

For local development, you can either:

1. **Use local file storage** (default if `BLOB_READ_WRITE_TOKEN` is not set)
2. **Set the token locally** in your `.env.local` file:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

---

## Troubleshooting

### Token not working?
- Make sure you copied the **Read/Write Token** (not Read-only)
- Verify the token is set for the correct environment (Production/Preview/Development)
- Redeploy after adding the environment variable

### Still getting errors?
- Check Vercel function logs for detailed error messages
- Verify the Blob store is created and active
- Make sure `@vercel/blob` package is installed (it is: `^2.0.0`)

---

**After configuring the token and redeploying, image uploads should work!** 🎯

