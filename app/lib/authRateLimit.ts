import { NextRequest } from 'next/server';

interface RateLimitEntry {
  attempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}

// In-memory store for failed login attempts
const attemptStore = new Map<string, RateLimitEntry>();

// Configuration constants
const MAX_ATTEMPTS = 5; // Lockout after 5 straight failures
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_RESET_WINDOW_MS = 30 * 60 * 1000; // Reset counter after 30 min of inactivity

/** Extract client IP address safely from request headers */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = headers.get('x-[#real-ip]') || headers.get('x-real-ip') || headers.get('cf-connecting-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/** Cleanup old expired entries periodically */
function cleanupStore() {
  const now = Date.now();
  for (const [ip, entry] of attemptStore.entries()) {
    if (now > entry.lockoutUntil && now - entry.lastAttempt > ATTEMPT_RESET_WINDOW_MS) {
      attemptStore.delete(ip);
    }
  }
}

/** Check if IP is currently locked out */
export function checkLoginRateLimit(ip: string): {
  isLockedOut: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  cleanupStore();

  const now = Date.now();
  const entry = attemptStore.get(ip);

  if (!entry) {
    return { isLockedOut: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  // Check if active lockout applies
  if (now < entry.lockoutUntil) {
    const remainingSeconds = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { isLockedOut: true, remainingSeconds, attemptsLeft: 0 };
  }

  // Check if inactivity window has passed
  if (now - entry.lastAttempt > ATTEMPT_RESET_WINDOW_MS) {
    attemptStore.delete(ip);
    return { isLockedOut: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  return {
    isLockedOut: false,
    remainingSeconds: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts),
  };
}

/** Record a failed login attempt for an IP */
export function recordFailedAttempt(ip: string): {
  attempts: number;
  isLockedOut: boolean;
  lockoutSeconds: number;
  attemptsLeft: number;
} {
  const now = Date.now();
  const entry = attemptStore.get(ip) || {
    attempts: 0,
    lockoutUntil: 0,
    lastAttempt: now,
  };

  entry.attempts += 1;
  entry.lastAttempt = now;

  let isLockedOut = false;
  let lockoutSeconds = 0;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockoutUntil = now + LOCKOUT_DURATION_MS;
    isLockedOut = true;
    lockoutSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
  }

  attemptStore.set(ip, entry);

  return {
    attempts: entry.attempts,
    isLockedOut,
    lockoutSeconds,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts),
  };
}

/** Reset attempts on successful password verification */
export function resetLoginAttempts(ip: string) {
  attemptStore.delete(ip);
}
