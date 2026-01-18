// app/api/booking-from-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  BookingPayload,
  saveBooking,          // still imported for future if needed, but not used here now
  getBookingBySession,
  sendEmailsOnce,       // same as above
} from '../../lib/booking';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // STRICT: only paid if Stripe says so
    const stripePaid = session.payment_status === 'paid';

    // 1) Try to load booking from DB (expected to be created by webhook)
    const existing = await getBookingBySession(session.id);

    if (existing) {
      const bookingForClient: BookingPayload = {
        id: (existing as any).id,
        invoiceId: (existing as any).invoiceId,
        createdAt: (existing as any).createdAt
          ? new Date((existing as any).createdAt).toISOString()
          : undefined,
        pickupLocation: (existing as any).pickupLocation,
        pickupAddress: (existing as any).pickupAddress ?? undefined,
        dropoffLocation: (existing as any).dropoffLocation,
        dropoffAddress: (existing as any).dropoffAddress ?? undefined,
        pickupDate: (existing as any).pickupDate,
        pickupTime: (existing as any).pickupTime,
        passengers: (existing as any).passengers,
        luggage: (existing as any).luggage,
        flightNumber: (existing as any).flightNumber ?? undefined,
        childSeat: (existing as any).childSeat,
        fullName: (existing as any).fullName,
        email: (existing as any).email,
        contactNumber: (existing as any).contactNumber,
        totalPrice: ((existing as any).totalPriceCents ?? 0) / 100,
        currency: (existing as any).currency ?? 'AUD',
        bookingType: (existing as any).bookingType ?? undefined,
        hourlyPickupLocation:
          (existing as any).hourlyPickupLocation ?? undefined,
        hourlyHours:
          typeof (existing as any).hourlyHours === 'number'
            ? (existing as any).hourlyHours
            : (existing as any).hourlyHours ?? undefined,
        hourlyVehicleType: (existing as any).hourlyVehicleType ?? undefined,
      };

      // Here, booking exists in DB → we consider it confirmed.
      // `paid` reflects Stripe payment status (should normally be true).
      return NextResponse.json({
        ok: true,
        paid: stripePaid,
        booking: bookingForClient,
      });
    }

    // 2) Fallback: no booking found in DB (webhook hasn't saved it yet)
    // We use metadata only to show trip details, but DO NOT save or email here.
    if (!session.metadata?.booking) {
      return NextResponse.json(
        { error: 'Missing booking metadata' },
        { status: 500 }
      );
    }

    const rawBooking = JSON.parse(
      session.metadata.booking
    ) as BookingPayload;

    const currency = (session.currency ?? 'aud').toUpperCase();
    const amountTotal = (session.amount_total ?? 0) / 100;

    const bookingFromMetadata: BookingPayload = {
      ...rawBooking,
      totalPrice: amountTotal || rawBooking.totalPrice,
      currency,
    };

    console.log(
      '[booking-from-session] No existing DB booking for session. Returning metadata booking as PENDING.',
      {
        sessionId,
        stripePaymentStatus: session.payment_status,
        stripePaid,
      }
    );

    // Important: we force paid = false here so UI shows "Payment pending / not confirmed"
    // even if Stripe already marked it as paid, because webhook has not created DB record yet.
    return NextResponse.json({
      ok: true,
      paid: false, // booking NOT confirmed yet (no DB record)
      booking: bookingFromMetadata,
    });
  } catch (err) {
    console.error('booking-from-session error:', err);
    return NextResponse.json(
      { error: 'Failed to load booking details' },
      { status: 500 }
    );
  }
}
