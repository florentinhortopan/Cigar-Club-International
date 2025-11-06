// In-memory store for magic links (for testing purposes)
// In production, this should be replaced with a proper database or cache

interface MagicLinkEntry {
  email: string;
  url: string;
  createdAt: Date;
}

const magicLinkStore = new Map<string, MagicLinkEntry>();

// Store a magic link for an email
export function storeMagicLink(email: string, url: string) {
  magicLinkStore.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    url,
    createdAt: new Date(),
  });
  
  // Clean up old entries (older than 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  for (const [key, entry] of magicLinkStore.entries()) {
    if (entry.createdAt < oneDayAgo) {
      magicLinkStore.delete(key);
    }
  }
}

// Get the latest magic link for an email
export function getMagicLink(email: string): string | null {
  const entry = magicLinkStore.get(email.toLowerCase());
  if (!entry) return null;
  
  // Check if link is still valid (24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (entry.createdAt < oneDayAgo) {
    magicLinkStore.delete(email.toLowerCase());
    return null;
  }
  
  return entry.url;
}

// Get all magic links (for debugging)
export function getAllMagicLinks(): MagicLinkEntry[] {
  return Array.from(magicLinkStore.values());
}


