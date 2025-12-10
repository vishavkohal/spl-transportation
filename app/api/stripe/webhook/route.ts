// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  BookingPayload,
  saveBooking,
  sendEmailsOnce,
} from '../../../lib/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  // 1) Read the raw body (needed for Stripe signature verification)
  const body = await req.text();

  // 2) Read signature directly from the request headers
  const sig = req.headers.get('stripe-signature');

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return new NextResponse('Webhook not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;

        const paid = session.payment_status === 'paid';

        if (!session.metadata?.booking) {
          console.warn(
            'Checkout session completed without booking metadata. session.id=',
            session.id
          );
          break;
        }

        const rawBooking = JSON.parse(
          session.metadata.booking
        ) as BookingPayload;

        const currency = (session.currency ?? 'aud').toUpperCase();
        const amountTotal = (session.amount_total ?? 0) / 100;

        const booking: BookingPayload = {
          ...rawBooking,
          totalPrice: amountTotal || rawBooking.totalPrice,
          currency,
        };

        // Idempotent save
        const saved = await saveBooking(session.id, booking);

        if (paid) {
          await sendEmailsOnce(session.id, booking, session);
        } else {
          console.log(
            'Webhook: session not marked as paid yet, skipping emails. session.id=',
            session.id
          );
        }

        console.log(
          '✅ Webhook processed for session',
          session.id,
          'paid=',
          paid
        );
        break;
      }

      default: {
        // Ignore other event types for now
        break;
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    console.error('❌ Error handling webhook event:', event.type, err);
    return new NextResponse('Webhook handler error', { status: 500 });
  }
}
