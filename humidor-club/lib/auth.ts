import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current user session on the server
 * Use this in Server Components and API routes
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user or throw an error if not authenticated
 * Use this when you need to ensure the user is logged in
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

