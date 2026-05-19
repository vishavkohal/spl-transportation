// app/api/routes/route.ts
export const runtime = 'nodejs';
export const revalidate = 3600; // Cache for 1 hour
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { getRoutes, addRoute, updateRoute, deleteRoute } from '../../lib/routesStore';

/** Bust every cache layer that depends on route data */
function invalidateRoutesCaches() {
  // 1. Invalidate unstable_cache entries tagged 'routes' and 'route-content'
  revalidateTag('routes', { expire: 0 });
  revalidateTag('route-content', { expire: 0 });

  // 2. Regenerate ISR pages that display route data
  revalidatePath('/transfers', 'layout');  // all /transfers/* pages
  revalidatePath('/', 'layout');           // homepage (has booking form with routes)
  revalidatePath('/book', 'page');         // booking page
}

export async function GET() {
  const routes = await getRoutes();
  return NextResponse.json(routes, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await addRoute(body);
  invalidateRoutesCaches();
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const updated = await updateRoute(id, body);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  invalidateRoutesCaches();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteRoute(id);
  invalidateRoutesCaches();
  return NextResponse.json({ success: ok });
}
