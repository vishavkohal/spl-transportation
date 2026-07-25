import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminBookingUpdateNotification } from '@/app/lib/email';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const email = searchParams.get('email');

    if (!bookingId || !email) {
      return NextResponse.json({ error: 'Booking ID and Email are required' }, { status: 400 });
    }

    const cleanId = bookingId.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Support lookup by Prisma ID, invoiceId, or stripeSessionId
    const booking = await prisma.booking.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: cleanId },
              { invoiceId: cleanId },
              { stripeSessionId: cleanId },
            ],
          },
          {
            email: {
              equals: cleanEmail,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'No booking found matching those details' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Error in manage booking GET:', error);
    return NextResponse.json({ error: 'Failed to look up booking' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      bookingId,
      email,
      pickupDate,
      pickupTime,
      flightNumber,
      returnDate,
      returnTime,
      returnFlightNumber,
      fullName,
      contactNumber,
      notes,
    } = body;

    if (!bookingId || !email) {
      return NextResponse.json({ error: 'Booking ID and Email are required' }, { status: 400 });
    }

    const existing = await prisma.booking.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: bookingId },
              { invoiceId: bookingId },
              { stripeSessionId: bookingId },
            ],
          },
          {
            email: {
              equals: email.trim().toLowerCase(),
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const changes: { field: string; oldVal: string; newVal: string }[] = [];

    if (pickupDate && pickupDate !== existing.pickupDate) {
      changes.push({ field: 'Pickup Date', oldVal: existing.pickupDate, newVal: pickupDate });
    }
    if (pickupTime && pickupTime !== existing.pickupTime) {
      changes.push({ field: 'Pickup Time', oldVal: existing.pickupTime, newVal: pickupTime });
    }
    if (flightNumber !== undefined && flightNumber !== (existing.flightNumber || '')) {
      changes.push({ field: 'Flight Number', oldVal: existing.flightNumber || 'None', newVal: flightNumber || 'None' });
    }
    if (returnDate !== undefined && returnDate !== (existing.returnDate || '')) {
      changes.push({ field: 'Return Date', oldVal: existing.returnDate || 'None', newVal: returnDate || 'None' });
    }
    if (returnTime !== undefined && returnTime !== (existing.returnTime || '')) {
      changes.push({ field: 'Return Time', oldVal: existing.returnTime || 'None', newVal: returnTime || 'None' });
    }
    if (returnFlightNumber !== undefined && returnFlightNumber !== (existing.returnFlightNumber || '')) {
      changes.push({ field: 'Return Flight Number', oldVal: existing.returnFlightNumber || 'None', newVal: returnFlightNumber || 'None' });
    }
    if (fullName && fullName !== existing.fullName) {
      changes.push({ field: 'Full Name', oldVal: existing.fullName, newVal: fullName });
    }
    if (contactNumber && contactNumber !== existing.contactNumber) {
      changes.push({ field: 'Phone Number', oldVal: existing.contactNumber, newVal: contactNumber });
    }

    if (changes.length === 0) {
      return NextResponse.json({ message: 'No changes were made', booking: existing });
    }

    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        ...(pickupDate && { pickupDate }),
        ...(pickupTime && { pickupTime }),
        ...(flightNumber !== undefined && { flightNumber }),
        ...(returnDate !== undefined && { returnDate }),
        ...(returnTime !== undefined && { returnTime }),
        ...(returnFlightNumber !== undefined && { returnFlightNumber }),
        ...(fullName && { fullName }),
        ...(contactNumber && { contactNumber }),
      },
    });

    // Send alert email to Admin
    await sendAdminBookingUpdateNotification({
      bookingId: existing.id,
      customerName: updated.fullName,
      customerEmail: updated.email,
      customerPhone: updated.contactNumber,
      changes,
      updatedAt: new Date().toLocaleString(),
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error('Error in manage booking PATCH:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
