import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 🔐 SIMPLE ADMIN CHECK
// Update this to match whatever you're using in /api/admin/session.
// For example, if your login route sets a cookie like:
//   setHeader('Set-Cookie', 'admin_session=1; Path=/; HttpOnly; Secure; SameSite=Lax')
// then this will work as-is.
function isAdmin(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';
  return cookieHeader.includes('admin_auth=1');
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Send as-is; dates will be converted to ISO strings in JSON
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
