// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface BookingRequest {
  pickupLocation: string;
  pickupAddress: string;
  dropoffLocation: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  flightNumber: string;
  childSeat: boolean;
  fullName: string;
  email: string;
  contactNumber: string;
  totalPrice: number;
  paymentIntentId?: string; // store Stripe payment reference

  // NEW: support for hourly hire
  bookingType?: 'standard' | 'hourly';
  hourlyPickupLocation?: string;
  hourlyHours?: number;
  hourlyVehicleType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingRequest = await request.json();

    // Validate required fields
    if (!bookingData.email || !bookingData.fullName || !bookingData.contactNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would:
    // 1. Save booking & paymentIntentId to your DB
    // 2. Send confirmation email to customer
    // 3. Send notification email to taxi company

    console.log('New Booking (Stripe):', bookingData);

    await sendCustomerEmail(bookingData);
    await sendCompanyEmail(bookingData);

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed',
      bookingId: generateBookingId(),
      paymentIntentId: bookingData.paymentIntentId,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
}

function generateBookingId(): string {
  return 'BK' + Date.now().toString(36).toUpperCase();
}

async function sendCustomerEmail(booking: BookingRequest) {
  console.log('Sending customer email to:', booking.email);

  const isHourly = booking.bookingType === 'hourly';

  const hourlyPickup =
    booking.hourlyPickupLocation || booking.pickupLocation || 'N/A';
  const hourlyHours =
    typeof booking.hourlyHours === 'number'
      ? booking.hourlyHours
      : booking.hourlyHours
      ? Number(booking.hourlyHours)
      : undefined;
  const hourlyVehicle = booking.hourlyVehicleType || 'N/A';

  const tripDetails = isHourly
    ? `
    Service: Chauffeur & Hourly Hire
    Pickup: ${hourlyPickup}
    Hours: ${hourlyHours ?? 'N/A'}
    Vehicle: ${hourlyVehicle}
    Date & Time: ${booking.pickupDate} at ${booking.pickupTime}
    Passengers: ${booking.passengers}
    Luggage: ${booking.luggage}
    ${booking.flightNumber ? `Flight: ${booking.flightNumber}` : ''}
    Child Seat: ${booking.childSeat ? 'Yes' : 'No'}
  `
    : `
    Pickup: ${booking.pickupLocation}
    Address: ${booking.pickupAddress}

    Dropoff: ${booking.dropoffLocation}
    Address: ${booking.dropoffAddress}

    Date & Time: ${booking.pickupDate} at ${booking.pickupTime}
    Passengers: ${booking.passengers}
    Luggage: ${booking.luggage}
    ${booking.flightNumber ? `Flight: ${booking.flightNumber}` : ''}
    Child Seat: ${booking.childSeat ? 'Yes' : 'No'}
  `;

  const emailContent = `
    Dear ${booking.fullName},

    Thank you for booking with QLD Taxi Services!

    Booking Details:
    ----------------
    ${tripDetails}

    Total Fare: $${booking.totalPrice}
    Stripe Payment: ${booking.paymentIntentId ?? 'N/A'}

    We look forward to serving you!

    Best regards,
    QLD Taxi Services
  `;

  console.log(emailContent);
  return true;
}

async function sendCompanyEmail(booking: BookingRequest) {
  console.log('Sending company notification');

  const isHourly = booking.bookingType === 'hourly';

  const hourlyPickup =
    booking.hourlyPickupLocation || booking.pickupLocation || 'N/A';
  const hourlyHours =
    typeof booking.hourlyHours === 'number'
      ? booking.hourlyHours
      : booking.hourlyHours
      ? Number(booking.hourlyHours)
      : undefined;
  const hourlyVehicle = booking.hourlyVehicleType || 'N/A';

  const tripDetails = isHourly
    ? `
    Service: Chauffeur & Hourly Hire
    Pickup: ${hourlyPickup}
    Hours: ${hourlyHours ?? 'N/A'}
    Vehicle: ${hourlyVehicle}
    Date & Time: ${booking.pickupDate} at ${booking.pickupTime}
    Passengers: ${booking.passengers}
    Luggage: ${booking.luggage}
    ${booking.flightNumber ? `Flight: ${booking.flightNumber}` : ''}
    Child Seat: ${booking.childSeat ? 'Yes' : 'No'}
  `
    : `
    Pickup: ${booking.pickupLocation}
    Address: ${booking.pickupAddress}

    Dropoff: ${booking.dropoffLocation}
    Address: ${booking.dropoffAddress}

    Date & Time: ${booking.pickupDate} at ${booking.pickupTime}
    Passengers: ${booking.passengers}
    Luggage: ${booking.luggage}
    ${booking.flightNumber ? `Flight: ${booking.flightNumber}` : ''}
    Child Seat: ${booking.childSeat ? 'Yes' : 'No'}
  `;

  const emailContent = `
    New Booking Received!

    Customer Details:
    ----------------
    Name: ${booking.fullName}
    Email: ${booking.email}
    Phone: ${booking.contactNumber}

    Trip Details:
    -------------
    ${tripDetails}

    Total Fare: $${booking.totalPrice}
    Stripe Payment: ${booking.paymentIntentId ?? 'N/A'}
  `;

  //console.log(emailContent);
  return true;
}
