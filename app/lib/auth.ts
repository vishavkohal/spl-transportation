import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Shared admin authentication helpers.
 *
 * Instead of setting a cookie to a guessable static value like "1",
 * we sign a payload with a server-side secret. The cookie value becomes
 * `payload.signature` — only the server can produce a valid signature,
 * so manually crafting the cookie is not possible without the secret.
 */

function getSecret(): string {
  // Prefer a dedicated AUTH_SECRET, fall back to ADMIN_PASSWORD so
  // the app works without adding a new env var immediately.
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('AUTH_SECRET or ADMIN_PASSWORD env var must be set');
  }
  return secret;
}

/** Create an HMAC-SHA256 signature for a payload string. */
function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/** Build a signed cookie value: `payload.signature` */
export function createAuthToken(role: 'admin' | 'cms'): string {
  // Payload includes role so admin and cms tokens aren't interchangeable
  // if you ever need to differentiate permissions.
  const payload = `${role}:authorized`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

/** Verify a signed cookie value. Returns true if the signature is valid. */
export function verifyAuthToken(token: string): boolean {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;

  const payload = token.substring(0, lastDot);
  const sig = token.substring(lastDot + 1);

  // Must be a recognized payload format
  if (!payload.endsWith(':authorized')) return false;

  const expectedSig = sign(payload);

  // Constant-time comparison to prevent timing attacks
  if (sig.length !== expectedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Check if the incoming request has a valid admin or CMS auth cookie.
 * Use this in API route handlers.
 */
export function isAdmin(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';

  // Extract cookie values — check both admin_auth and cms_auth
  for (const name of ['admin_auth', 'cms_auth']) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    if (match && verifyAuthToken(decodeURIComponent(match[1]))) {
      return true;
    }
  }

  return false;
}
