import { NextResponse } from 'next/server';
import { createAuthToken } from '@/app/lib/auth';
import {
  getClientIp,
  checkLoginRateLimit,
  recordFailedAttempt,
  resetLoginAttempts,
} from '@/app/lib/authRateLimit';

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  const rateCheck = checkLoginRateLimit(clientIp);

  if (rateCheck.isLockedOut) {
    const minutes = Math.ceil(rateCheck.remainingSeconds / 60);
    return NextResponse.json(
      {
        ok: false,
        error: `Too many failed login attempts. Device locked for ${minutes} min. Please try again later.`,
        retryAfterSeconds: rateCheck.remainingSeconds,
      },
      { status: 429 }
    );
  }

  const { password } = await req.json();

  // Use CMS_PASSWORD if set, otherwise fallback to ADMIN_PASSWORD
  const validPassword = process.env.CMS_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!validPassword) {
    return NextResponse.json(
      { ok: false, error: 'Server CMS password not configured' },
      { status: 500 }
    );
  }

  if (password !== validPassword) {
    const failResult = recordFailedAttempt(clientIp);

    if (failResult.isLockedOut) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Too many failed attempts. Device locked out for 15 minutes.',
          retryAfterSeconds: failResult.lockoutSeconds,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: `Invalid password. ${failResult.attemptsLeft} attempt(s) remaining before 15-minute lockout.`,
        attemptsLeft: failResult.attemptsLeft,
      },
      { status: 401 }
    );
  }

  // Reset rate limit counter on clean login success
  resetLoginAttempts(clientIp);

  const res = NextResponse.json({ ok: true });

  // Set an HttpOnly cookie with a signed token
  res.cookies.set('cms_auth', createAuthToken('cms'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return res;
}
