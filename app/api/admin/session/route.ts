import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // cookies() is async in latest Next.js, so await it
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');

  if (!authCookie || authCookie.value !== '1') {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
