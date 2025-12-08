// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, booking } = body as {
      amount: number;
      booking: any;
    };

    if (!amount || !booking) {
      return NextResponse.json(
        { error: 'Amount and booking are required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BASE_URL is not set' },
        { status: 500 }
      );
    }

    const {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      passengers,
      luggage,
      childSeat,
      fullName,
      email,
      contactNumber,
    } = booking;

    const descriptionLines = [
      `Route: ${pickupLocation} → ${dropoffLocation}`,
      `Date & time: ${pickupDate} at ${pickupTime}`,
      `Passengers: ${passengers}, Bags: ${luggage}${childSeat ? ', Child seat: Yes' : ''}`,
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Mobile: ${contactNumber}`,
    ];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], // wallets (Apple Pay / Google Pay) are auto-handled
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: Math.round(amount * 100), // dollars -> cents
            product_data: {
              name: 'SPL Transportation Booking',
              description: descriptionLines.join('\n'),
            },
          },
        },
      ],
      success_url: `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking-cancelled`,
      metadata: {
        booking: JSON.stringify(booking),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
