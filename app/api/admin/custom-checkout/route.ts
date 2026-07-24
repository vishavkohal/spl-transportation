import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isAdmin } from '@/app/lib/auth';
import { createPendingBooking, BookingPayload } from '@/app/lib/booking';
import { isAfterHours, AFTER_HOURS_SURCHARGE } from '@/app/lib/afterHours';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover',
});

const PAYMENT_FEE_RATE = 0.025; // 2.5% card processing fee

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      passengers = 1,
      luggage = 1,
      childSeat = false,
      amount,
      fullName,
      email,
      contactNumber,
      includeProcessingFee = true,
      notes = '',
      quoteId,
    } = body;

    // Validate mandatory fields
    if (!pickupLocation || !pickupLocation.trim()) {
      return NextResponse.json({ error: 'Pickup location is required' }, { status: 400 });
    }

    if (!dropoffLocation || !dropoffLocation.trim()) {
      return NextResponse.json({ error: 'Dropoff location is required' }, { status: 400 });
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Customer full name is required' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid customer email address is required' }, { status: 400 });
    }

    if (!contactNumber || !contactNumber.trim()) {
      return NextResponse.json({ error: 'Customer contact phone number is required' }, { status: 400 });
    }

    const baseFare = Number(amount);
    if (Number.isNaN(baseFare) || baseFare <= 0) {
      return NextResponse.json({ error: 'Valid fare amount in AUD is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_BASE_URL is not set' }, { status: 500 });
    }

    // Add-on calculations
    let baseAmount = baseFare;

    if (childSeat) {
      baseAmount += 20;
    }

    const afterHoursSurcharge = isAfterHours(pickupTime) ? AFTER_HOURS_SURCHARGE : 0;
    baseAmount += afterHoursSurcharge;

    const processingFee = includeProcessingFee ? Number((baseAmount * PAYMENT_FEE_RATE).toFixed(2)) : 0;
    const finalAmount = Number((baseAmount + processingFee).toFixed(2));

    const descriptionLines = [
      'SPL Private Transfer (Custom Fare)',
      `Pickup: ${pickupLocation}`,
      `Dropoff: ${dropoffLocation}`,
      `Date & Time: ${pickupDate || 'Flexible'} ${pickupTime ? `at ${pickupTime}` : ''}`.trim(),
      `Passengers: ${passengers}, Bags: ${luggage}${childSeat ? ', Child seat included' : ''}`,
      ...(afterHoursSurcharge > 0 ? [`After-hours surcharge: $${afterHoursSurcharge}`] : []),
      ...(includeProcessingFee ? ['Card Processing fee: 2.5% (GST inclusive)'] : []),
      ...(notes ? [`Driver Note: ${notes}`] : []),
      `Customer Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${contactNumber}`,
    ];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email.trim(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: Math.round(finalAmount * 100),
            product_data: {
              name: `SPL Private Transfer: ${pickupLocation} → ${dropoffLocation}`,
              description: descriptionLines.join('\n'),
            },
          },
        },
      ],
      success_url: `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking-cancelled`,
      metadata: {
        bookingType: 'standard',
        isCustomPaymentLink: 'true',
        quoteId: quoteId || '',
        baseAmount: baseAmount.toString(),
        processingFee: processingFee.toString(),
        finalAmount: finalAmount.toString(),
        afterHoursSurcharge: afterHoursSurcharge.toString(),
        booking: JSON.stringify({
          bookingType: 'standard',
          pickupLocation,
          dropoffLocation,
          pickupDate: pickupDate || new Date().toISOString().split('T')[0],
          pickupTime: pickupTime || '12:00',
          passengers: Number(passengers),
          luggage: Number(luggage),
          childSeat: Boolean(childSeat),
          fullName,
          email,
          contactNumber,
          totalPrice: finalAmount,
          notes,
        }),
      },
    });

    // Create pending booking record in DB
    try {
      const pendingBooking: BookingPayload = {
        bookingType: 'standard',
        pickupLocation,
        dropoffLocation,
        pickupDate: pickupDate || new Date().toISOString().split('T')[0],
        pickupTime: pickupTime || '12:00',
        passengers: Number(passengers),
        luggage: Number(luggage),
        childSeat: Boolean(childSeat),
        fullName,
        email,
        contactNumber,
        totalPrice: finalAmount,
        currency: 'AUD',
      };

      await createPendingBooking(session.id, pendingBooking);
    } catch (dbErr) {
      console.error('Failed to create pending booking for custom checkout session:', dbErr);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      finalAmount,
      currency: 'AUD',
    });
  } catch (err: any) {
    console.error('Custom checkout creation error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate custom checkout session' },
      { status: 500 }
    );
  }
}
