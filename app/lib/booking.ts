// lib/booking.ts
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { sendCustomerEmail, sendAdminEmail } from './email';

export type BookingPayload = {
  pickupLocation: string;
  pickupAddress?: string | null;
  dropoffLocation: string;
  dropoffAddress?: string | null;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  flightNumber?: string | null;
  childSeat: boolean;

  fullName: string;
  email: string;
  contactNumber: string;

  totalPrice: number;
  currency?: string;
};

// --- Prisma booking model shim ---------------------------------
// TS currently thinks prisma.booking doesn't exist, but the runtime
// client DOES know about the Booking model (because it's in schema.prisma
// and you've migrated). We cast here once to avoid errors everywhere.
const bookingClient = (prisma as any).booking;

// ------------------------------
// Save booking (idempotent)
// ------------------------------
export async function saveBooking(
  stripeSessionId: string,
  booking: BookingPayload
) {
  const existing = await bookingClient.findUnique({
    where: { stripeSessionId },
  });

  if (existing) return existing;

  return bookingClient.create({
    data: {
      stripeSessionId,
      pickupLocation: booking.pickupLocation,
      pickupAddress: booking.pickupAddress ?? null,
      dropoffLocation: booking.dropoffLocation,
      dropoffAddress: booking.dropoffAddress ?? null,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      passengers: booking.passengers,
      luggage: booking.luggage,
      flightNumber: booking.flightNumber ?? null,
      childSeat: booking.childSeat,
      fullName: booking.fullName,
      email: booking.email,
      contactNumber: booking.contactNumber,
      totalPriceCents: Math.round(booking.totalPrice * 100),
      currency: booking.currency ?? 'AUD',
      emailSent: false,
    },
  });
}

// ------------------------------
// Fetch booking by Stripe Session ID
// ------------------------------
export async function getBookingBySession(stripeSessionId: string) {
  return bookingClient.findUnique({
    where: { stripeSessionId },
  });
}

// ------------------------------
// Send Emails Once
// ------------------------------
export async function sendEmailsOnce(
  stripeSessionId: string,
  booking: BookingPayload,
  session: Stripe.Checkout.Session
) {
  const existing = await getBookingBySession(stripeSessionId);

  if (!existing) return;

  if (!existing.emailSent) {
    await sendCustomerEmail(booking, session);
    await sendAdminEmail(booking, session);

    await bookingClient.update({
      where: { stripeSessionId },
      data: { emailSent: true },
    });
  }
}
