// app/api/booking-from-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  BookingPayload,
  saveBooking,
  getBookingBySession,
  sendEmailsOnce,
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

    const paid =
      session.payment_status === 'paid' ||
      session.status === 'complete' ||
      !!session.payment_intent;

    // 1) Try to load an existing booking that webhook may have already created
    const existing = await getBookingBySession(session.id);

    if (existing) {
      const bookingForClient: BookingPayload = {
        id: (existing as any).id,
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

      return NextResponse.json({
        ok: true,
        paid,
        booking: bookingForClient,
      });
    }

    // 2) Fallback: no booking yet (e.g. webhook hasn’t fired / you’re on localhost)
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

    const booking: BookingPayload = {
      ...rawBooking,
      totalPrice: amountTotal || rawBooking.totalPrice,
      currency,
    };

    const saved = await saveBooking(session.id, booking);

    if (paid) {
      await sendEmailsOnce(session.id, booking, session);
    } else {
      console.log(
        'Session not paid yet — skipping emails for session',
        sessionId
      );
    }

    // Map saved DB record back to payload
    let bookingForClient = booking;
    if (saved) {
      bookingForClient = {
        id: (saved as any).id,
        createdAt: (saved as any).createdAt
          ? new Date((saved as any).createdAt).toISOString()
          : undefined,
        pickupLocation: (saved as any).pickupLocation,
        pickupAddress: (saved as any).pickupAddress ?? undefined,
        dropoffLocation: (saved as any).dropoffLocation,
        dropoffAddress: (saved as any).dropoffAddress ?? undefined,
        pickupDate: (saved as any).pickupDate,
        pickupTime: (saved as any).pickupTime,
        passengers: (saved as any).passengers,
        luggage: (saved as any).luggage,
        flightNumber: (saved as any).flightNumber ?? undefined,
        childSeat: (saved as any).childSeat,
        fullName: (saved as any).fullName,
        email: (saved as any).email,
        contactNumber: (saved as any).contactNumber,
        totalPrice: ((saved as any).totalPriceCents ?? 0) / 100,
        currency: (saved as any).currency ?? booking.currency,
        bookingType: (saved as any).bookingType ?? booking.bookingType,
        hourlyPickupLocation:
          (saved as any).hourlyPickupLocation ?? undefined,
        hourlyHours:
          typeof (saved as any).hourlyHours === 'number'
            ? (saved as any).hourlyHours
            : (saved as any).hourlyHours ?? undefined,
        hourlyVehicleType: (saved as any).hourlyVehicleType ?? undefined,
      } as BookingPayload;
    }

    return NextResponse.json({
      ok: true,
      paid,
      booking: bookingForClient,
    });
  } catch (err) {
    console.error('booking-from-session error:', err);
    return NextResponse.json(
      { error: 'Failed to load booking details' },
      { status: 500 }
    );
  }
}
