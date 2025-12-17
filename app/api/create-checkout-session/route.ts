import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRoutes } from '@/app/lib/routesStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking } = body;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking data is required' },
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

    // -----------------------------------
    // 🔒 SERVER-SIDE PRICE CALCULATION
    // -----------------------------------
    const routes = await getRoutes();

    const route =
      routes.find(
        r =>
          r.from === pickupLocation && r.to === dropoffLocation
      ) ??
      routes.find(
        r =>
          r.from === dropoffLocation && r.to === pickupLocation
      );

    if (!route || !route.pricing?.length) {
      return NextResponse.json(
        { error: 'Invalid route selected' },
        { status: 400 }
      );
    }

    let basePrice = 0;
    if (passengers <= 4) basePrice = route.pricing[0].price;
    else if (passengers <= 6) basePrice = route.pricing[1]?.price ?? route.pricing[0].price;
    else basePrice = route.pricing[2]?.price ?? route.pricing[route.pricing.length - 1].price;

    const finalAmount =
      basePrice + (childSeat ? 20 : 0);

    // -----------------------------------
    // Stripe description
    // -----------------------------------
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
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: Math.round(finalAmount * 100),
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
        route: `${pickupLocation} → ${dropoffLocation}`,
        passengers: String(passengers),
        childSeat: childSeat ? 'yes' : 'no',
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
