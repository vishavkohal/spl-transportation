import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  BookingPayload,
  saveBooking,
  getBookingBySession,
  sendEmailsOnce
} from '../../lib/booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const paid =
      session.payment_status === 'paid' ||
      session.status === 'complete' ||
      !!session.payment_intent;

    if (!session.metadata?.booking) {
      return NextResponse.json({ error: 'Missing booking metadata' }, { status: 500 });
    }

    // Parse booking
    const rawBooking = JSON.parse(session.metadata.booking) as BookingPayload;
    const currency = (session.currency ?? 'aud').toUpperCase();
    const amountTotal = (session.amount_total ?? 0) / 100;

    const booking: BookingPayload = {
      ...rawBooking,
      totalPrice: amountTotal || rawBooking.totalPrice,
      currency,
    };

    // Save (idempotent)
    await saveBooking(session.id, booking);

    // Send emails only once
    if (paid) {
      await sendEmailsOnce(session.id, booking, session);
    }

    return NextResponse.json({
      paid,
      booking,
    });
  } catch (err) {
    console.error('booking-from-session error:', err);
    return NextResponse.json(
      { error: 'Failed to load booking details' },
      { status: 500 }
    );
  }
}
