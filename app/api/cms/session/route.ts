import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('cms_auth');

    if (!authCookie || authCookie.value !== '1') {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
}
