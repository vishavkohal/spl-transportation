import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();

  const validPassword = process.env.ADMIN_PASSWORD;
  if (!validPassword) {
    return NextResponse.json(
      { ok: false, error: 'Server admin password not configured' },
      { status: 500 }
    );
  }

  if (password !== validPassword) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Set an HttpOnly cookie so JS can't read it directly
  res.cookies.set('admin_auth', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8 // 8 hours
  });

  return res;
}
