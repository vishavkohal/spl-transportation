// lib/booking.ts
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { sendCustomerEmail, sendAdminEmail } from './email';
import { generateInvoicePdf } from './pdf';

export type BookingPayload = {
  id?: string;
  invoiceId?: string | null;
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
  bookingType?: 'standard' | 'hourly' | 'daytrip';
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  hourlyVehicleType?: string | null;

  // NEW: Day Trip fields
  dayTripPickup?: string | null;
  dayTripDestination?: string | null;
  dayTripVehicleType?: string | null;

  // Status
  status?: 'PENDING' | 'PAID' | 'CANCELLED';
};

// --- Prisma booking model shim ---------------------------------
// TS currently thinks prisma.booking doesn't exist, but the runtime
// client DOES know about the Booking model (because it's in schema.prisma
// and you've migrated). We cast here once to avoid errors everywhere.
const bookingClient = (prisma as any).booking;

// Helper to generate Invoice ID
function generateInvoiceId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `INV-${datePart}-${randomPart}`;
}

// ------------------------------
// Create PENDING booking (called at checkout start)
// ------------------------------
export async function createPendingBooking(
  stripeSessionId: string,
  booking: BookingPayload
) {
  // Check if already exists (e.g. retry)
  const existing = await bookingClient.findUnique({
    where: { stripeSessionId },
  });

  if (existing) return existing;

  return bookingClient.create({
    data: {
      stripeSessionId,
      invoiceId: generateInvoiceId(),
      status: 'PENDING', // EXPLICT PENDING
      pickupLocation: booking.pickupLocation || booking.dayTripPickup || booking.hourlyPickupLocation || 'Day Trip Pickup',
      pickupAddress: booking.pickupAddress ?? null,
      dropoffLocation: booking.dropoffLocation || booking.dayTripDestination || 'As Directed',
      dropoffAddress: booking.dropoffAddress ?? null,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      passengers: booking.passengers ?? 0,
      luggage: booking.luggage ?? 0,
      flightNumber: booking.flightNumber ?? null,
      childSeat: booking.childSeat ?? false,
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

      // NEW: Day Trip fields
      dayTripPickup: booking.dayTripPickup ?? null,
      dayTripDestination: booking.dayTripDestination ?? null,
      dayTripVehicleType: booking.dayTripVehicleType ?? null,
    },
  });
}

// ------------------------------
// Upsert booking (Confirm Payment)
// ------------------------------
export async function upsertBooking(
  stripeSessionId: string,
  booking: BookingPayload
) {
  const existing = await bookingClient.findUnique({
    where: { stripeSessionId },
  });

  const data = {
    stripeSessionId,
    // invoiceId handles below (upsert logic)
    status: 'PAID', // MARK AS PAID
    pickupLocation: booking.pickupLocation || booking.dayTripPickup || booking.hourlyPickupLocation || 'Day Trip Pickup',
    pickupAddress: booking.pickupAddress ?? null,
    dropoffLocation: booking.dropoffLocation || booking.dayTripDestination || 'As Directed',
    dropoffAddress: booking.dropoffAddress ?? null,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    passengers: booking.passengers ?? 0,
    luggage: booking.luggage ?? 0,
    flightNumber: booking.flightNumber ?? null,
    childSeat: booking.childSeat ?? false,
    fullName: booking.fullName,
    email: booking.email,
    contactNumber: booking.contactNumber,
    totalPriceCents: Math.round(booking.totalPrice * 100),
    currency: booking.currency ?? 'AUD',
    // emailSent intentionally NOT updated here, logic in sendEmailsOnce

    // NEW: hourly hire fields
    bookingType: booking.bookingType ?? 'standard',
    hourlyPickupLocation: booking.hourlyPickupLocation ?? null,
    hourlyHours:
      typeof booking.hourlyHours === 'number'
        ? booking.hourlyHours
        : booking.hourlyHours ?? null,
    hourlyVehicleType: booking.hourlyVehicleType ?? null,

    // NEW: Day Trip fields
    dayTripPickup: booking.dayTripPickup ?? null,
    dayTripDestination: booking.dayTripDestination ?? null,
    dayTripVehicleType: booking.dayTripVehicleType ?? null,
  };

  if (existing) {
    // If pending, update to PAID
    return bookingClient.update({
      where: { stripeSessionId },
      // Don't overwrite invoiceId if it exists
      data: { ...data, emailSent: existing.emailSent }, // preserve emailSent
    });
  }

  // If webhook hit first (race condition), create as PAID
  return bookingClient.create({
    data: {
      ...data,
      invoiceId: generateInvoiceId(),
      emailSent: false
    },
  });
}

// Deprecated alias for backward compatibility until refactor is complete
export const saveBooking = upsertBooking;

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
      invoiceId: (existing as any).invoiceId,
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
      dayTripPickup: (existing as any).dayTripPickup ?? undefined,
      dayTripDestination: (existing as any).dayTripDestination ?? undefined,
      dayTripVehicleType: (existing as any).dayTripVehicleType ?? undefined,
    };

    // Generate PDF Invoice
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateInvoicePdf(bookingForEmail);
    } catch (e) {
      console.error('Failed to generate PDF invoice:', e);
    }

    const attachments = pdfBuffer
      ? [
        {
          filename: `Invoice-${(bookingForEmail.id || 'booking').slice(-8)}.pdf`,
          content: pdfBuffer,
        },
      ]
      : undefined;

    await sendCustomerEmail(bookingForEmail, session, attachments);
    await sendAdminEmail(bookingForEmail, session, attachments);

    await bookingClient.update({
      where: { stripeSessionId },
      data: { emailSent: true },
    });
  }
}
