// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pRetry from 'p-retry';
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

// Retry configuration for webhook-side operations (DB / email sending)
// WEBHOOK_RETRY_ATTEMPTS = total attempts (including first)
const WEBHOOK_RETRY_ATTEMPTS = Number(process.env.WEBHOOK_RETRY_ATTEMPTS ?? 3);
const WEBHOOK_RETRY_BASE_DELAY_MS = Number(process.env.WEBHOOK_RETRY_BASE_DELAY_MS ?? 500);

/**
 * Generic retry wrapper using p-retry.
 * - operation: a function returning a Promise<T>
 * - options: optional config overrides
 *
 * Retries on any thrown error. If you want to skip retries for certain error
 * types (validation errors / non-retriable), detect them inside the operation
 * and throw pRetry.AbortError(err).
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  opts?: { attempts?: number; baseDelayMs?: number; operationName?: string }
): Promise<T> {
  const attempts = opts?.attempts ?? WEBHOOK_RETRY_ATTEMPTS;
  const base = opts?.baseDelayMs ?? WEBHOOK_RETRY_BASE_DELAY_MS;
  const name = opts?.operationName ?? 'operation';

  try {
    const result = await pRetry(operation, {
      retries: Math.max(0, attempts - 1),
      factor: 2,
      minTimeout: base,
      randomize: true,
      onFailedAttempt: (err) => {
        console.warn(
          `[webhook][retry] ${name} attempt ${err.attemptNumber} failed. ${err.retriesLeft} retries left.`,
          err
        );
      },
    });
    return result;
  } catch (err) {
    console.error(`[webhook][retry] ${name} failed after ${attempts} attempts.`, err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  // 1) raw body for Stripe signature verification
  const body = await req.text();

  // 2) signature from headers
  const sig = req.headers.get('stripe-signature');

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return new NextResponse('Webhook not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err?.message ?? err);
    return new NextResponse(`Webhook Error: ${err?.message ?? 'invalid signature'}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;

        // STRICT check: only treat as paid when payment_status === 'paid'
        const paid = session.payment_status === 'paid';

        if (!paid) {
          console.log(
            'Webhook received completed/async event but payment_status is not paid. session.id=',
            session.id,
            'status=',
            session.payment_status
          );
          break;
        }

        if (!session.metadata?.booking) {
          console.warn(
            'Checkout session completed without booking metadata. session.id=',
            session.id
          );
          break;
        }

        const rawBooking = JSON.parse(session.metadata.booking) as BookingPayload;

        const currency = (session.currency ?? 'aud').toUpperCase();
        const amountTotal = (session.amount_total ?? 0) / 100;

        const booking: BookingPayload = {
          ...rawBooking,
          totalPrice: amountTotal || rawBooking.totalPrice,
          currency,
        };

        // Idempotent save: keyed by session.id
        // Wrap DB save in retryOperation. If saveBooking itself is idempotent and already
        // handles duplicates, this will only retry on transient DB errors.
        await retryOperation(
          () => saveBooking(session.id, booking),
          { operationName: 'saveBooking' }
        );

        // Emails only once (sendEmailsOnce should check DB flag)
        // Wrap email/send flow in retryOperation as well so transient email failures
        // (network / Resend transient errors) will be retried here.
        await retryOperation(
          () => sendEmailsOnce(session.id, booking, session),
          { operationName: 'sendEmailsOnce' }
        );

        // console.log('✅ Webhook processed for session', session.id, 'paid=', paid);
        break;
      }

      default: {
        // other events ignored
        break;
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    // If we get here, either saveBooking or sendEmailsOnce ultimately failed after retries
    console.error('❌ Error handling webhook event:', event?.type ?? 'unknown', err);
    // Return 500 so Stripe will retry delivery according to its webhook retry schedule
    return new NextResponse('Webhook handler error', { status: 500 });
  }
}
