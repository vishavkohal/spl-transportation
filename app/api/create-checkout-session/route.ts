import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { AFTER_HOURS_SURCHARGE, isAfterHours } from '@/app/lib/afterHours';
import { getRoutes } from '@/app/lib/routesStore';
import { createPendingBooking, BookingPayload } from '@/app/lib/booking';
import { bookingDetailsSchema } from '@/app/lib/validations';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover',
});

/* -------------------------------------------------
   CONFIG
-------------------------------------------------- */

const PAYMENT_FEE_RATE = 0.025; // 2.5% processing fee (GST inclusive)
export { AFTER_HOURS_SURCHARGE, isAfterHours };

/* -------------------------------------------------
   HOURLY PRICING (SERVER AUTHORITY)
-------------------------------------------------- */

export const HOURLY_RATES: Record<
  string,
  { hourly: number; fullDay: number }
> = {
  Sedan: { hourly: 120, fullDay: 820 },
  SUV: { hourly: 150, fullDay: 1050 },
  Van: { hourly: 150, fullDay: 1050 },
};

export function calculateHourlyBaseAmount(booking: any): number {
  const { hourlyVehicleType, hourlyHours } = booking;

  if (!hourlyVehicleType || !HOURLY_RATES[hourlyVehicleType]) {
    throw new Error('Invalid hourly vehicle type');
  }

  const hours = Number(hourlyHours);
  if (!hours || hours <= 0) {
    throw new Error('Invalid hourly hours');
  }

  const rate = HOURLY_RATES[hourlyVehicleType];

  // Full-day charter (8+ hours)
  if (hours >= 8) {
    return rate.fullDay;
  }

  // 2-hour minimum
  const billableHours = Math.max(2, hours);
  return billableHours * rate.hourly;
}

export function priceForPassengers(
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

function getPassengerRanges(
  pricing: { passengers: string }[]
): string {
  return pricing.map(p => p.passengers).join(', ');
}

/* -------------------------------------------------
   PAYMENT FEE HELPERS
-------------------------------------------------- */

export function calculateProcessingFee(amount: number): number {
  return Number((amount * PAYMENT_FEE_RATE).toFixed(2));
}

export function calculateFinalAmount(amount: number): number {
  const processingFee = calculateProcessingFee(amount);
  return Number((amount + processingFee).toFixed(2));
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

    const parseResult = bookingDetailsSchema.safeParse({
      ...booking,
      passengers: Number(booking.passengers) || 1,
      luggage: Number(booking.luggage) || 0,
      hourlyHours: booking.hourlyHours ? Number(booking.hourlyHours) : undefined,
      dayTripPrice: booking.dayTripPrice ? Number(booking.dayTripPrice) : undefined,
    });

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid booking details' },
        { status: 400 }
      );
    }

    const validatedBooking = parseResult.data;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BASE_URL is not set' },
        { status: 500 }
      );
    }

    const {
      bookingType,
      pickupLocation = '',
      dropoffLocation = '',
      pickupDate,
      pickupTime,
      passengers,
      luggage,
      childSeat,
      fullName,
      email,
      contactNumber,
    } = validatedBooking;

    /* -------------------------------------------------
       🔒 SERVER-SIDE BASE PRICE CALCULATION
    -------------------------------------------------- */

    let baseAmount = 0;

    if (bookingType === 'hourly') {
      baseAmount = calculateHourlyBaseAmount(validatedBooking);
    } else if (bookingType === 'standard') {
      const routes = await getRoutes();

      const route =
        routes.find(
          r => r.from.trim() === pickupLocation.trim() && r.to.trim() === dropoffLocation.trim()
        ) ??
        routes.find(
          r => r.from.trim() === dropoffLocation.trim() && r.to.trim() === pickupLocation.trim()
        );
      if (!route || !route.pricing?.length) {
        return NextResponse.json(
          { error: 'Invalid route selected' },
          { status: 400 }
        );
      }

      try {
        baseAmount = priceForPassengers(route.pricing, passengers);
      } catch {
        return NextResponse.json(
          {
            error: `This route is available only for ${getPassengerRanges(
              route.pricing
            )} passengers.`,
          },
          { status: 400 }
        );
      }
    } else if (bookingType === 'daytrip') {
      // Day trip - validate against API routes
      const { dayTripVehicleType, dayTripPrice, dayTripPickup, dayTripDestination } = validatedBooking;

      if (!dayTripVehicleType || !dayTripPrice) {
        return NextResponse.json(
          { error: 'Day trip vehicle and price are required' },
          { status: 400 }
        );
      }

      if (!dayTripPickup || !dayTripDestination) {
        return NextResponse.json(
          { error: 'Day trip pickup and destination are required' },
          { status: 400 }
        );
      }

      // Validate pricing against actual routes to prevent manipulation
      const routes = await getRoutes();
      const dayTripRoutes = routes.filter(r => r.from === 'Day trip (8 hours)');

      const validPricing = dayTripRoutes.some(r =>
        r.pricing?.some(p =>
          p.vehicleType === dayTripVehicleType && Number(p.price) === Number(dayTripPrice)
        )
      );

      if (!validPricing) {
        return NextResponse.json(
          { error: 'Invalid day trip pricing' },
          { status: 400 }
        );
      }

      baseAmount = Number(dayTripPrice);
    } else {
      return NextResponse.json(
        { error: 'Invalid bookingType' },
        { status: 400 }
      );
    }

    // Round-Trip doubling for standard transfers
    if (bookingType === 'standard' && booking.transferType === 'round-trip') {
      baseAmount = baseAmount * 2;
    }

    // Add-ons
    if (childSeat) {
      baseAmount += 20;
    }

    // After-hours surcharge (pickups between 9 PM and 5 AM)
    let afterHoursSurcharge = isAfterHours(pickupTime) ? AFTER_HOURS_SURCHARGE : 0;
    if (booking.transferType === 'round-trip' && booking.returnTime && isAfterHours(booking.returnTime)) {
      afterHoursSurcharge += AFTER_HOURS_SURCHARGE;
    }
    baseAmount += afterHoursSurcharge;

    // Promo Code Discount Deduction
    let appliedDiscountCents = 0;
    if (booking.appliedDiscount?.discountAmount) {
      const discountVal = Number(booking.appliedDiscount.discountAmount);
      baseAmount = Math.max(0, baseAmount - discountVal);
      appliedDiscountCents = Math.round(discountVal * 100);
    }

    /* -------------------------------------------------
       💳 PROCESSING FEE + FINAL AMOUNT
    -------------------------------------------------- */

    const processingFee = calculateProcessingFee(baseAmount);
    const finalAmount = calculateFinalAmount(baseAmount);

    /* -------------------------------------------------
       STRIPE DESCRIPTION (GST INCLUSIVE)
    -------------------------------------------------- */

    const descriptionLines =
      bookingType === 'hourly'
        ? [
          'Hourly Private Charter (GST inclusive)',
          `Pickup: ${validatedBooking.hourlyPickupLocation}`,
          `Vehicle: ${validatedBooking.hourlyVehicleType}`,
          `Hours: ${validatedBooking.hourlyHours}`,
          ...(afterHoursSurcharge > 0 ? [`After-hours surcharge: $${afterHoursSurcharge}`] : []),
          `Processing fee: 2.5% (GST inclusive)`,
          `Name: ${fullName}`,
          `Email: ${email}`,
          `Mobile: ${contactNumber}`,
        ]
        : bookingType === 'daytrip'
          ? [
            'Day Trip Charter - 8 Hours (GST inclusive)',
            `Pickup: ${validatedBooking.dayTripPickup}`,
            `Destination: ${validatedBooking.dayTripDestination}`,
            `Vehicle: ${validatedBooking.dayTripVehicleType}`,
            `Date & time: ${pickupDate} at ${pickupTime}`,
            ...(afterHoursSurcharge > 0 ? [`After-hours surcharge: $${afterHoursSurcharge}`] : []),
            `Processing fee: 2.5% (GST inclusive)`,
            `Name: ${fullName}`,
            `Email: ${email}`,
            `Mobile: ${contactNumber}`,
          ]
          : [
            `Standard Transfer (${validatedBooking.transferType === 'round-trip' ? 'Round Trip' : 'One Way'}) (GST inclusive)`,
            `Route: ${pickupLocation} → ${dropoffLocation}`,
            `Outbound: ${pickupDate} at ${pickupTime}`,
            ...(validatedBooking.transferType === 'round-trip' && validatedBooking.returnDate ? [`Return: ${validatedBooking.returnDate} at ${validatedBooking.returnTime || 'N/A'}`] : []),
            `Passengers: ${passengers}, Bags: ${luggage}${childSeat ? ', Child seat: Yes' : ''}`,
            ...(afterHoursSurcharge > 0 ? [`After-hours surcharge: $${afterHoursSurcharge}`] : []),
            ...(validatedBooking.appliedDiscount ? [`Promo Discount (${validatedBooking.appliedDiscount.code}): -$${validatedBooking.appliedDiscount.discountAmount}`] : []),
            `Processing fee: 2.5% (GST inclusive)`,
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
                  : bookingType === 'daytrip'
                    ? 'SPL Day Trip Charter'
                    : 'SPL Standard Transfer',
              description: descriptionLines.join('\n'),
            },
          },
        },
      ],
      success_url: `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking-cancelled`,
      metadata: {
        bookingType,
        baseAmount: baseAmount.toString(),
        processingFee: processingFee.toString(),
        finalAmount: finalAmount.toString(),
        afterHoursSurcharge: afterHoursSurcharge.toString(),
        transferType: validatedBooking.transferType || 'one-way',
        promoCode: validatedBooking.promoCode || '',
        booking: JSON.stringify({
          bookingType,
          transferType: validatedBooking.transferType,
          pickupLocation: validatedBooking.pickupLocation,
          dropoffLocation: validatedBooking.dropoffLocation,
          pickupDate: validatedBooking.pickupDate,
          pickupTime: validatedBooking.pickupTime,
          passengers: validatedBooking.passengers,
          luggage: validatedBooking.luggage,
          childSeat: validatedBooking.childSeat,
          flightNumber: validatedBooking.flightNumber,
          returnDate: validatedBooking.returnDate,
          returnTime: validatedBooking.returnTime,
          returnFlightNumber: validatedBooking.returnFlightNumber,
          fullName: validatedBooking.fullName,
          email: validatedBooking.email,
          contactNumber: validatedBooking.contactNumber,
        }).slice(0, 490),
      },
    });

    /* -------------------------------------------------
       💾 CREATE PENDING BOOKING
    -------------------------------------------------- */
    try {
      const pendingBooking: BookingPayload = {
        ...validatedBooking,
        totalPrice: finalAmount,
        currency: 'AUD',
        bookingType,
      };

      await createPendingBooking(session.id, pendingBooking);
    } catch (saveError) {
      console.error('Failed to create pending booking:', saveError);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
