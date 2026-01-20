import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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
        return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    // Set an HttpOnly cookie unique to CMS
    res.cookies.set('cms_auth', '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8 // 8 hours
    });

    return res;
}
