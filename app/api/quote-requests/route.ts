import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminQuoteNotification } from '@/app/lib/email';
import { quoteRequestSchema } from '@/app/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = quoteRequestSchema.safeParse({
      ...body,
      passengers: Number(body.passengers) || 1,
      checkInBags: Number(body.checkInBags) || 0,
      carryOnBags: Number(body.carryOnBags) || 0,
    });

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid quote request payload' },
        { status: 400 }
      );
    }

    const {
      travelDate,
      travelTime,
      passengers,
      pickupAddress,
      dropoffAddress,
      checkInBags,
      carryOnBags,
      childSeats,
      flightArrivalType,
      flightArrivalNumber,
      flightArrivalTime,
      flightDepartureType,
      flightDepartureNumber,
      flightDepartureTime,
      fullName,
      email,
      phone,
      message,
    } = parseResult.data;

    const { termsAccepted } = body;
    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions to submit a quote request.' },
        { status: 400 }
      );
    }

    // Save to Database
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        travelDate: String(travelDate),
        travelTime: String(travelTime),
        passengers: Number(passengers) || 1,
        pickupAddress: String(pickupAddress),
        dropoffAddress: String(dropoffAddress),
        checkInBags: Number(checkInBags) || 0,
        carryOnBags: Number(carryOnBags) || 0,
        childSeats: String(childSeats || 'No'),
        flightArrivalType: flightArrivalType ? String(flightArrivalType) : null,
        flightArrivalNumber: flightArrivalNumber ? String(flightArrivalNumber) : null,
        flightArrivalTime: flightArrivalTime ? String(flightArrivalTime) : null,
        flightDepartureType: flightDepartureType ? String(flightDepartureType) : null,
        flightDepartureNumber: flightDepartureNumber ? String(flightDepartureNumber) : null,
        flightDepartureTime: flightDepartureTime ? String(flightDepartureTime) : null,
        fullName: String(fullName),
        email: String(email),
        phone: String(phone),
        message: message ? String(message) : null,
        termsAccepted: Boolean(termsAccepted),
        status: 'PENDING',
      },
    });

    // Fire & forget or await email notification to admin
    sendAdminQuoteNotification(quoteRequest).catch((err) => {
      console.error('Error sending quote admin email notification:', err);
    });

    return NextResponse.json({
      success: true,
      id: quoteRequest.id,
      message: 'Quote request submitted successfully.',
    });
  } catch (error) {
    console.error('Error in POST /api/quote-requests:', error);
    return NextResponse.json(
      { error: 'Failed to process quote request' },
      { status: 500 }
    );
  }
}
