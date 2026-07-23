import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/app/lib/auth';
import { sendCustomerEmail, sendAdminEmail } from '@/app/lib/email';
import { generateInvoicePdf } from '@/app/lib/pdf';
import { BookingPayload } from '@/app/lib/booking';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const bookingClient = (prisma as any).booking;
    const booking = await bookingClient.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingPayload: BookingPayload = {
      id: booking.id,
      invoiceId: booking.invoiceId,
      createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : undefined,
      pickupLocation: booking.pickupLocation,
      pickupAddress: booking.pickupAddress ?? undefined,
      dropoffLocation: booking.dropoffLocation,
      dropoffAddress: booking.dropoffAddress ?? undefined,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      passengers: booking.passengers,
      luggage: booking.luggage,
      flightNumber: booking.flightNumber ?? undefined,
      childSeat: booking.childSeat,
      fullName: booking.fullName,
      email: booking.email,
      contactNumber: booking.contactNumber,
      totalPrice: (booking.totalPriceCents ?? 0) / 100,
      currency: booking.currency ?? 'AUD',
      bookingType: booking.bookingType ?? 'standard',
      hourlyPickupLocation: booking.hourlyPickupLocation ?? undefined,
      hourlyHours: typeof booking.hourlyHours === 'number' ? booking.hourlyHours : undefined,
      hourlyVehicleType: booking.hourlyVehicleType ?? undefined,
      dayTripPickup: booking.dayTripPickup ?? undefined,
      dayTripDestination: booking.dayTripDestination ?? undefined,
      dayTripVehicleType: booking.dayTripVehicleType ?? undefined,
    };

    // Generate PDF invoice
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateInvoicePdf(bookingPayload);
    } catch (e) {
      console.error('Failed to generate PDF invoice for resend:', e);
    }

    const attachments = pdfBuffer
      ? [
          {
            filename: `Invoice-${(booking.id || 'booking').slice(-8)}.pdf`,
            content: pdfBuffer,
          },
        ]
      : undefined;

    // Resend customer & admin confirmation emails
    const mockSession: any = {
      id: booking.stripeSessionId,
      payment_status: 'paid',
      amount_total: booking.totalPriceCents,
      currency: (booking.currency || 'aud').toLowerCase(),
    };

    await sendCustomerEmail(bookingPayload, mockSession, attachments);
    await sendAdminEmail(bookingPayload, mockSession, attachments);

    // Update emailSent flag if not set
    if (!booking.emailSent) {
      await bookingClient.update({
        where: { id: bookingId },
        data: { emailSent: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Confirmation email successfully resent to ${booking.email}`,
    });
  } catch (err: any) {
    console.error('Error resending booking confirmation email:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to resend confirmation email' },
      { status: 500 }
    );
  }
}
