import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, amount, transferType } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 404 });
    }

    if (promo.maxUsages && promo.usageCount >= promo.maxUsages) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    if (promo.targetType === 'ROUND_TRIP' && transferType !== 'round-trip') {
      return NextResponse.json({ error: 'This promo code is valid for Round-Trip transfers only' }, { status: 400 });
    }

    const currentAmount = Number(amount || 0);

    if (promo.minSpend && currentAmount < promo.minSpend) {
      return NextResponse.json({ error: `Minimum spend of $${promo.minSpend} required for this code` }, { status: 400 });
    }

    let discountAmount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((currentAmount * promo.discountValue) / 100);
    } else {
      discountAmount = Math.min(currentAmount, promo.discountValue);
    }

    return NextResponse.json({
      success: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
      },
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
