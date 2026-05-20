import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/app/lib/auth';

export async function GET() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('cms_auth');

    if (!authCookie || !verifyAuthToken(authCookie.value)) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
}
