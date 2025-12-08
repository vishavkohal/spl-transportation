// app/api/routes/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getRoutes, addRoute, updateRoute, deleteRoute } from '../../lib/routesStore';

export async function GET() {
  const routes = await getRoutes();
  return NextResponse.json(routes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await addRoute(body);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const updated = await updateRoute(id, body);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteRoute(id);
  return NextResponse.json({ success: ok });
}
