import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRoutes } from '@/app/lib/routesStore';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

/* -------------------------------------------------
   HOURLY PRICING (SERVER AUTHORITY)
-------------------------------------------------- */

const HOURLY_RATES: Record<
  string,
  { hourly: number; fullDay: number }
> = {
  Sedan: { hourly: 120, fullDay: 820 },
  SUV: { hourly: 150, fullDay: 1050 },
  Van: { hourly: 150, fullDay: 1050 },
};

function calculateHourlyAmount(booking: any): number {
  const { hourlyVehicleType, hourlyHours } = booking;

  if (
    !hourlyVehicleType ||
    !HOURLY_RATES[hourlyVehicleType]
  ) {
    throw new Error('Invalid hourly vehicle type');
  }

  const hours = Number(hourlyHours);
  if (!hours || hours <= 0) {
    throw new Error('Invalid hourly hours');
  }

  const rate = HOURLY_RATES[hourlyVehicleType];

  // Full day charter (8+ hours)
  if (hours >= 8) {
    return rate.fullDay;
  }

  // 2-hour minimum billing
  const billableHours = Math.max(2, hours);
  return billableHours * rate.hourly;
}

function priceForPassengers(
  pricing: { passengers: string; price: number }[],
  pax: number
): number {
  if (!Array.isArray(pricing) || pricing.length === 0) {
    throw new Error('No pricing tiers configured');
  }

  const tier = pricing.find(p => {
    const [min, max] = p.passengers
      .split('-')
      .map(n => Number(n.trim()));

    return pax >= min && pax <= max;
  });

  if (!tier) {
    throw new Error(`No price available for ${pax} passengers`);
  }

  return tier.price;
}

/* -------------------------------------------------
   POST
-------------------------------------------------- */

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
      bookingType, // 'standard' | 'hourly'
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

    if (!bookingType) {
      return NextResponse.json(
        { error: 'bookingType is required' },
        { status: 400 }
      );
    }

    /* -------------------------------------------------
       🔒 SERVER-SIDE PRICE CALCULATION
    -------------------------------------------------- */

    let finalAmount = 0;

    if (bookingType === 'hourly') {
      finalAmount = calculateHourlyAmount(booking);
    } else if (bookingType === 'standard') {
      const routes = await getRoutes();

      const route =
        routes.find(
          r => r.from === pickupLocation && r.to === dropoffLocation
        ) ??
        routes.find(
          r => r.from === dropoffLocation && r.to === pickupLocation
        );

      if (!route || !route.pricing?.length) {
        return NextResponse.json(
          { error: 'Invalid route selected' },
          { status: 400 }
        );
      }

      finalAmount = priceForPassengers(route.pricing, passengers);
    } else {
      return NextResponse.json(
        { error: 'Invalid bookingType' },
        { status: 400 }
      );
    }

    // Add-ons
    finalAmount += childSeat ? 20 : 0;

    /* -------------------------------------------------
       STRIPE DESCRIPTION
    -------------------------------------------------- */

    const descriptionLines =
      bookingType === 'hourly'
        ? [
            `Hourly Private Charter`,
            `Pickup: ${booking.hourlyPickupLocation}`,
            `Vehicle: ${booking.hourlyVehicleType}`,
            `Hours: ${booking.hourlyHours}`,
            `Name: ${fullName}`,
            `Email: ${email}`,
            `Mobile: ${contactNumber}`,
          ]
        : [
            `Route: ${pickupLocation} → ${dropoffLocation}`,
            `Date & time: ${pickupDate} at ${pickupTime}`,
            `Passengers: ${passengers}, Bags: ${luggage}${
              childSeat ? ', Child seat: Yes' : ''
            }`,
            `Name: ${fullName}`,
            `Email: ${email}`,
            `Mobile: ${contactNumber}`,
          ];

    /* -------------------------------------------------
       STRIPE CHECKOUT SESSION
    -------------------------------------------------- */

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
              name:
                bookingType === 'hourly'
                  ? 'SPL Hourly Charter'
                  : 'SPL Standard Transfer',
              description: descriptionLines.join('\n'),
            },
          },
        },
      ],
      success_url: `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking-cancelled`,
      metadata: {
        booking: JSON.stringify(booking),
        bookingType,
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
