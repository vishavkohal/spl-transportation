import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/app/lib/auth';
import { sendQuotePaymentLinkEmail } from '@/app/lib/email';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { quoteId, paymentUrl } = body as { quoteId?: string; paymentUrl?: string };

    if (!quoteId || !paymentUrl) {
      return NextResponse.json(
        { error: 'quoteId and paymentUrl are required' },
        { status: 400 }
      );
    }

    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote request not found' },
        { status: 404 }
      );
    }

    if (!quote.email) {
      return NextResponse.json(
        { error: 'Customer email address is missing on quote request' },
        { status: 400 }
      );
    }

    const baseAmount = quote.amount ?? 0;
    const processingFee = quote.processingFee ?? Number((baseAmount * 0.025).toFixed(2));
    const totalAmount = quote.totalAmount ?? Number((baseAmount + processingFee).toFixed(2));

    // Send email via Resend
    await sendQuotePaymentLinkEmail({
      quoteId: quote.id,
      fullName: quote.fullName,
      email: quote.email,
      pickupAddress: quote.pickupAddress,
      dropoffAddress: quote.dropoffAddress,
      travelDate: quote.travelDate,
      travelTime: quote.travelTime,
      passengers: quote.passengers,
      amount: baseAmount,
      processingFee,
      totalAmount,
      paymentUrl,
    });

    // Update status to QUOTED if still PENDING
    if (quote.status === 'PENDING') {
      await prisma.quoteRequest.update({
        where: { id: quoteId },
        data: { status: 'QUOTED' },
      });
    }

    return NextResponse.json({
      success: true,
      emailSentTo: quote.email,
    });
  } catch (err: any) {
    console.error('Error sending quote payment link email:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to send quote payment link email' },
      { status: 500 }
    );
  }
}
