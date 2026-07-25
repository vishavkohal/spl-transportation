import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ promos });
  } catch (error: any) {
    console.error('Error fetching promos:', error);
    return NextResponse.json({ error: 'Failed to fetch promos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, targetType, minSpend, maxUsages, isActive } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue),
        targetType: targetType || 'ALL',
        minSpend: minSpend ? Number(minSpend) : null,
        maxUsages: maxUsages ? Number(maxUsages) : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, promo });
  } catch (error: any) {
    console.error('Error creating promo:', error);
    return NextResponse.json({ error: 'Failed to create promo' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive, discountValue, minSpend, maxUsages } = body;

    if (!id) {
      return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minSpend !== undefined && { minSpend: minSpend ? Number(minSpend) : null }),
        ...(maxUsages !== undefined && { maxUsages: maxUsages ? Number(maxUsages) : null }),
      },
    });

    return NextResponse.json({ success: true, promo: updated });
  } catch (error: any) {
    console.error('Error updating promo:', error);
    return NextResponse.json({ error: 'Failed to update promo' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting promo:', error);
    return NextResponse.json({ error: 'Failed to delete promo' }, { status: 500 });
  }
}
