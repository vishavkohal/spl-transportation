// lib/bookingLead.ts
import { prisma } from '@/lib/prisma';

/* ----------------------------------------
   Types
----------------------------------------- */

export type BookingLeadPayload = {
  id?: string;

  bookingType: 'standard' | 'hourly';

  // Standard transfer
  pickupLocation?: string;
  pickupAddress?: string | null;
  dropoffLocation?: string;
  dropoffAddress?: string | null;

  pickupDate?: string;
  pickupTime?: string;

  passengers?: number;
  luggage?: number;
  flightNumber?: string | null;
  childSeat?: boolean;

  // Hourly hire
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  hourlyVehicleType?: string | null;

  // Contact (REQUIRED to save)
  fullName?: string;
  email?: string;
  contactNumber?: string;

  quotedPrice?: number;
  currency?: string;

  source?: string; // "homepage", "mobile", etc
};

// Prisma shim (same pattern as booking)
const leadClient = (prisma as any).bookingLead;

/* ----------------------------------------
   Save / Update Lead (Idempotent)
----------------------------------------- */
export async function upsertBookingLead(
  payload: BookingLeadPayload
) {
  const {
    id,
    email,
    contactNumber,
    quotedPrice,
    currency,
    ...rest
  } = payload;

  // 🚫 HARD STOP: no contact info → do nothing
  if (!email && !contactNumber) {
    return null;
  }

  // Update existing lead
  if (id) {
    return leadClient.update({
      where: { id },
      data: {
        ...rest,
        email: email ?? undefined,
        contactNumber: contactNumber ?? undefined,
        quotedPriceCents:
          typeof quotedPrice === 'number'
            ? Math.round(quotedPrice * 100)
            : undefined,
        currency: currency ?? undefined,
      },
    });
  }

  // Create new lead
  return leadClient.create({
    data: {
      ...rest,
      email: email ?? null,
      contactNumber: contactNumber ?? null,
      quotedPriceCents:
        typeof quotedPrice === 'number'
          ? Math.round(quotedPrice * 100)
          : null,
      currency: currency ?? 'AUD',
      status: 'draft',
    },
  });
}

/* ----------------------------------------
   Mark Lead as Converted (after payment)
----------------------------------------- */
export async function markLeadConvertedByEmail(email: string) {
  if (!email) return;

  await leadClient.updateMany({
    where: {
      email,
      status: 'draft',
    },
    data: {
      status: 'converted',
    },
  });
}

/* ----------------------------------------
   Optional: Fetch abandoned leads
----------------------------------------- */
export async function getAbandonedLeads(hoursAgo = 24) {
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  return leadClient.findMany({
    where: {
      status: 'draft',
      createdAt: {
        lte: since,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
