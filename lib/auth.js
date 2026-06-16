// lib/auth.js
// Shared auth helpers used by API routes. Composes the existing Clerk +
// role-access primitives that are already used inline in other routes
// (see app/api/seller/uploads/[uploadId]/route.js for the same pattern).
import { auth } from '@clerk/nextjs/server';
import { getRoleFromClaims, hasRequiredRole } from './roleAccess.js';

/**
 * Require an authenticated user.
 * Throws if no user is signed in.
 * @returns {Promise<{ userId: string, sessionClaims: object }>}
 */
export async function requireAuth() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: authentication required');
  }
  return { userId, sessionClaims };
}

/**
 * Require an authenticated admin user.
 * Throws if no user is signed in or the user's role is not 'admin'.
 * @returns {Promise<{ userId: string, sessionClaims: object }>}
 */
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: authentication required');
  }
  const role = getRoleFromClaims(sessionClaims);
  if (!hasRequiredRole(role, ['admin'])) {
    throw new Error('Forbidden: admin role required');
  }
  return { userId, sessionClaims };
}
