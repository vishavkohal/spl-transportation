import { prisma } from '@/lib/prisma';

/* ----------------------------------------
   Types
----------------------------------------- */

export type UtmPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

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

  // Non-attribution source (UI / device)
  source?: string; // "homepage", "mobile", etc

  // ✅ Attribution (optional, only if URL had UTMs)
  utm?: UtmPayload;
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
    utm,
    ...rest
  } = payload;

  // 🚫 HARD STOP: no contact info → do nothing
  if (!email && !contactNumber) {
    return null;
  }

  /* ----------------------------------------
     UPDATE EXISTING LEAD
     ❌ DO NOT overwrite attribution
  ----------------------------------------- */
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

  /* ----------------------------------------
     CREATE NEW LEAD
     ✅ Capture UTMs only once (first-click)
  ----------------------------------------- */
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

      // ✅ Attribution (may be null if no UTMs)
      utmSource: utm?.utm_source ?? null,
      utmMedium: utm?.utm_medium ?? null,
      utmCampaign: utm?.utm_campaign ?? null,
      utmTerm: utm?.utm_term ?? null,
      utmContent: utm?.utm_content ?? null,
      utmCapturedAt: utm ? new Date() : null,
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
