// lib/booking.ts
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { sendCustomerEmail, sendAdminEmail } from './email';

export type BookingPayload = {
  id?: string;
  createdAt?: string;

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

  // NEW: booking type + hourly hire fields
  bookingType?: 'standard' | 'hourly';
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  hourlyVehicleType?: string | null;
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

      // NEW: hourly hire fields
      bookingType: booking.bookingType ?? 'standard',
      hourlyPickupLocation: booking.hourlyPickupLocation ?? null,
      hourlyHours:
        typeof booking.hourlyHours === 'number'
          ? booking.hourlyHours
          : booking.hourlyHours ?? null,
      hourlyVehicleType: booking.hourlyVehicleType ?? null,
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
    // Map DB record to BookingPayload-like shape including id & createdAt & totalPrice
    const bookingForEmail: BookingPayload = {
      id: (existing as any).id,
      createdAt: (existing as any).createdAt
        ? new Date((existing as any).createdAt).toISOString()
        : undefined,
      pickupLocation: (existing as any).pickupLocation,
      pickupAddress: (existing as any).pickupAddress ?? undefined,
      dropoffLocation: (existing as any).dropoffLocation,
      dropoffAddress: (existing as any).dropoffAddress ?? undefined,
      pickupDate: (existing as any).pickupDate,
      pickupTime: (existing as any).pickupTime,
      passengers: (existing as any).passengers,
      luggage: (existing as any).luggage,
      flightNumber: (existing as any).flightNumber ?? undefined,
      childSeat: (existing as any).childSeat,
      fullName: (existing as any).fullName,
      email: (existing as any).email,
      contactNumber: (existing as any).contactNumber,
      totalPrice: ((existing as any).totalPriceCents ?? 0) / 100,
      currency: (existing as any).currency ?? booking.currency,
      bookingType: (existing as any).bookingType ?? booking.bookingType,
      hourlyPickupLocation: (existing as any).hourlyPickupLocation ?? undefined,
      hourlyHours:
        typeof (existing as any).hourlyHours === 'number'
          ? (existing as any).hourlyHours
          : (existing as any).hourlyHours ?? undefined,
      hourlyVehicleType: (existing as any).hourlyVehicleType ?? undefined,
    };

    await sendCustomerEmail(bookingForEmail, session);
    await sendAdminEmail(bookingForEmail, session);

    await bookingClient.update({
      where: { stripeSessionId },
      data: { emailSent: true },
    });
  }
}
