// lib/email.ts
import Stripe from 'stripe';
import { Resend } from 'resend';
import pRetry from 'p-retry';
import { calculatePriceBreakdown, formatCurrency } from './priceMath';

// Re-export type used elsewhere if needed
export type BookingEmailData = {
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

  totalPrice: number; // in AUD

  bookingType?: 'standard' | 'hourly' | 'daytrip';
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  hourlyVehicleType?: string | null;

  // New Day Trip fields
  dayTripPickup?: string | null;
  dayTripDestination?: string | null;
  dayTripVehicleType?: string | null;
};

// Resend client
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Retry configuration (env overrides possible)
// RETRY_ATTEMPTS = total attempts (including the first try)
const RETRY_ATTEMPTS = Number(process.env.RESEND_RETRY_ATTEMPTS ?? 3);
const RETRY_BASE_DELAY_MS = Number(process.env.RESEND_RETRY_BASE_DELAY_MS ?? 500);

// company & email config (fallbacks)
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || 'no-reply@spltransportation.com';
const ADMIN_EMAIL = process.env.BOOKING_ADMIN_EMAIL || 'spltransportation.australia@gmail.com';
const COMPANY_NAME = process.env.COMPANY_NAME || 'SPL Transportation';
const COMPANY_ABN = process.env.COMPANY_ABN || '64 957 177 372';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'spltransportation.australia@gmail.com';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+61470032460';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Cairns, QLD, Australia';

/**
 * sendWithRetries
 * - Uses p-retry to perform retries with exponential backoff + jitter.
 * - Aborts (no retry) for client errors (HTTP 4xx).
 * - Expects payload.html to be present (HTML-only emails).
 */
async function sendWithRetries(payload: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  if (!resend) {
    throw new Error('Resend client not configured (RESEND_API_KEY missing).');
  }

  const operation = async () => {
    try {
      return await resend.emails.send(payload as any);
    } catch (err: any) {
      // Attempt to detect HTTP status on common error shapes from SDK / fetch
      const status = err?.status || err?.statusCode || err?.response?.status;

      // If it's a 4xx client error, abort retries (bad request / validation)
      if (typeof status === 'number' && status >= 400 && status < 500) {
        // Use p-retry's AbortError so retrying stops immediately
        // @ts-expect-error - pRetry.AbortError exists at runtime
        throw new pRetry.AbortError(err);
      }

      // Otherwise rethrow to allow p-retry to retry
      throw err;
    }
  };

  try {
    const result = await pRetry(operation, {
      // p-retry 'retries' is number of retries AFTER first attempt
      retries: Math.max(0, RETRY_ATTEMPTS - 1),
      factor: 2,
      minTimeout: RETRY_BASE_DELAY_MS,
      randomize: true,
      onFailedAttempt: (error) => {
        // error.attemptNumber, error.retriesLeft available
        console.warn(
          `resend.emails.send attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
          error
        );
      },
    });

    return result;
  } catch (err) {
    console.error(`resend.emails.send failed after ${RETRY_ATTEMPTS} attempts:`, err);
    throw err;
  }
}

/**
 * Build print-ready receipt HTML
 * opts can include invoiceNumber / invoiceDate / bookingRef to keep consistent numbers
 */
export function buildBookingReceiptHtml(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null,
  opts?: { invoiceNumber?: string; invoiceDate?: string; bookingRef?: string }
): string {
  const invoiceNumber = opts?.invoiceNumber ?? `SPL-INV-${Math.floor(Math.random() * 900000 + 100000)}`;
  const invoiceDate = opts?.invoiceDate ?? new Date().toLocaleDateString();
  const bookingRef = opts?.bookingRef ?? `SPL-${Math.floor(Math.random() * 900000 + 100000)}`;

  const childSeatText = booking.childSeat ? 'Yes' : 'No';
  const isHourly = booking.bookingType === 'hourly';
  const isDayTrip = booking.bookingType === 'daytrip';

  const hourlyPickup = booking.hourlyPickupLocation || booking.pickupLocation || '';
  const hourlyHours = typeof booking.hourlyHours === 'number' ? booking.hourlyHours : booking.hourlyHours ? Number(booking.hourlyHours) : undefined;
  const hourlyVehicle = booking.hourlyVehicleType || '';

  const dayTripPickup = booking.dayTripPickup || '';
  const dayTripDest = booking.dayTripDestination || '';
  const dayTripVehicle = booking.dayTripVehicleType || '';

  const paymentId = (session?.payment_intent as string | null) || (session?.id as string | null) || '';

  /* ------------------------------------------------------------------
     💰 AMOUNT CALCULATIONS (CENTRALIZED)
  ------------------------------------------------------------------ */
  const { totalPaid, serviceTotal, processingFee, gst, subtotalExGst } = calculatePriceBreakdown(booking.totalPrice);
  const total = totalPaid; // Alias for template usage
  const subtotal = subtotalExGst; // Alias for template usage
  const style = `
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial; color:#111827; }
    .wrap { max-width:700px; margin:0 auto; padding:18px; }
    .brand { font-weight:800; font-size:22px; }
    .brand .blue { color:#102A43 } .brand .red { color:#E11D48 }
    h2 { color:#111827; margin: 12px 0 6px; font-size:16px; }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    td, th { padding:8px; border:1px solid #E5E7EB; vertical-align:top; }
    th { background:#F3F4F6; text-align:left; }
    .muted { color:#6B7280; font-size:13px; }
    .small { font-size:13px; color:#374151; }
    .totals td { border: none; padding:6px; }
    .right { text-align:right; }
  `;

  let tripRows = '';

  if (isDayTrip) {
    tripRows = `
      <tr><td style="font-weight:600">Service</td><td>Day Trip Charter (8 Hours)</td></tr>
      <tr><td style="font-weight:600">Pickup Location</td><td>${dayTripPickup}</td></tr>
      <tr><td style="font-weight:600">Destination/Area</td><td>${dayTripDest}</td></tr>
      <tr><td style="font-weight:600">Vehicle</td><td>${dayTripVehicle || 'Standard'}</td></tr>
      <tr><td style="font-weight:600">Date & Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
      <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
      <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
      ${booking.flightNumber ? `<tr><td style="font-weight:600">Flight #</td><td>${booking.flightNumber}</td></tr>` : ''}
      <tr><td style="font-weight:600">Child Seat</td><td>${childSeatText}</td></tr>
    `;
  } else if (isHourly) {
    tripRows = `
      <tr><td style="font-weight:600">Service</td><td>Chauffeur & Hourly Hire</td></tr>
      <tr><td style="font-weight:600">Pickup</td><td>${hourlyPickup}</td></tr>
      <tr><td style="font-weight:600">Hours</td><td>${hourlyHours ?? 'N/A'}</td></tr>
      <tr><td style="font-weight:600">Vehicle</td><td>${hourlyVehicle || 'N/A'}</td></tr>
      <tr><td style="font-weight:600">Date & Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
      <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
      <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
      ${booking.flightNumber ? `<tr><td style="font-weight:600">Flight #</td><td>${booking.flightNumber}</td></tr>` : ''}
      <tr><td style="font-weight:600">Child Seat</td><td>${childSeatText}</td></tr>
    `;
  } else {
    // Standard
    tripRows = `
      <tr><td style="font-weight:600">From</td><td>${booking.pickupLocation}${booking.pickupAddress ? ' – ' + booking.pickupAddress : ''}</td></tr>
      <tr><td style="font-weight:600">To</td><td>${booking.dropoffLocation}${booking.dropoffAddress ? ' – ' + booking.dropoffAddress : ''}</td></tr>
      <tr><td style="font-weight:600">Date & Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
      <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
      <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
      ${booking.flightNumber ? `<tr><td style="font-weight:600">Flight #</td><td>${booking.flightNumber}</td></tr>` : ''}
      <tr><td style="font-weight:600">Child Seat</td><td>${childSeatText}</td></tr>
    `;
  }

  const html = `
   <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Receipt ${invoiceNumber}</title>
      <style>${style}</style>
    </head>
    <body>
      <div class="wrap">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="width:200px; height:auto;">
<span style="font-family:Segoe UI, Arial, sans-serif; font-weight:700; font-size:22px">
  <span style="color:#0F766E;">SPL</span>
  <span style="color:#102A43;">Transportation</span>
</span>
</div>
          </div>
          <div style="text-align:right; font-size:13px;">
            <div><strong>ABN:</strong> ${COMPANY_ABN}</div>
            <div><strong>Email:</strong> ${COMPANY_EMAIL}</div>
            <div><strong>Phone:</strong> ${COMPANY_PHONE}</div>
            <div><strong>Address:</strong> ${COMPANY_ADDRESS}</div>
          </div>
        </div>

        <div style="margin-top:12px; display:flex; justify-content:space-between;">
          <div>
            <div style="font-weight:700; font-size:18px;">TAX INVOICE</div>
            <div class="muted">Invoice Number: <strong>${invoiceNumber}</strong></div>
            <div class="muted">Invoice Date: <strong>${invoiceDate}</strong></div>
            <div class="muted">Booking Reference: <strong>${bookingRef}</strong></div>
          </div>

          <div style="text-align:right;">
            <div style="font-weight:700">Bill To</div>
            <div>${booking.fullName}</div>
            <div class="muted">${booking.email}</div>
            <div class="muted">${booking.contactNumber}</div>
          </div>
        </div>

        <h2>Trip Details</h2>
        <table cellspacing="0" cellpadding="0">
          <tbody>
            ${tripRows}
          </tbody>
        </table>

        <h2 style="margin-top:14px;">Charges</h2>
        <table cellspacing="0" cellpadding="0">
          <thead>
            <tr><th>Description</th><th class="right">Amount (AUD)</th></tr>
          </thead>
          <tbody>
            <tr><td>${isHourly ? 'Chauffeur & Hourly Hire' : `Private Transfer – ${booking.pickupLocation} to ${booking.dropoffLocation}`}</td><td class="right">${total.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <table class="totals" cellspacing="0" cellpadding="0" style="margin-top:8px;">
          <tbody>
            <tr><td style="width:60%"></td><td style="width:40%">
              <table cellspacing="0" cellpadding="0" style="width:100%;">
                <tr><td>Subtotal</td><td class="right">${subtotal.toFixed(2)}</td></tr>
                <tr><td>GST (10%)</td><td class="right">${gst.toFixed(2)}</td></tr>
                <tr><td>Processing Fee (2.5%)</td><td class="right">${processingFee.toFixed(2)}</td></tr>
                <tr><td style="font-weight:700">Total (Incl. GST)</td><td class="right" style="font-weight:700">${total.toFixed(2)}</td></tr>
              </table>
            </td></tr>
          </tbody>
        </table>

        <h2 style="margin-top:14px;">Payment</h2>
        <table cellspacing="0" cellpadding="0">
          <tbody>
            <tr><td style="font-weight:600">Amount</td><td>A$${total.toFixed(2)}</td></tr>
            ${paymentId ? `<tr><td style="font-weight:600">Payment / Session ID</td><td>${paymentId}</td></tr>` : ''}
          </tbody>
        </table>

        <div style="margin-top:12px;">
          <div style="font-weight:700">Pickup instructions</div>
          <div class="muted">Your driver will meet you at ${booking.pickupLocation}${booking.pickupAddress ? ' – ' + booking.pickupAddress : ''}. Driver details will be sent 24 hours before pickup.</div>

          <div style="margin-top:10px; font-weight:700">Cancellation policy</div>
          <div class="muted">
            • Free cancellation up to 24 hours before pickup.<br/>
            • 50% charge if cancelled within 24 hours.<br/>
            • No refund if driver is already on the way.
          </div>
        </div>

        <div style="margin-top:14px; font-size:13px; color:#6B7280;">
          Thank you for choosing ${COMPANY_NAME}.
        </div>
      </div>
    </body>
  </html>
  `;

  return html;
}

/**
 * Wrap the receipt in a short intro and return the email HTML
 *
 * Accepts optional opts which are forwarded to the receipt builder
 * so invoice numbers/dates can match DB values when provided.
 */
export function buildBookingSummaryHtml(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null,
  opts?: { invoiceNumber?: string; invoiceDate?: string; bookingRef?: string }
) {
  const receiptHtml = buildBookingReceiptHtml(booking, session, opts);

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#111827;">
      <div style="max-width:700px; margin:0 auto; padding:18px;">
        <h2 style="color:#102A43; margin-bottom:6px;">${COMPANY_NAME} – Booking Confirmation</h2>
        <p style="margin:0 0 12px 0;">Thank you for booking with us — your booking is confirmed. Please find your receipt below.</p>
        ${receiptHtml}
        <p style="font-size:13px; color:#4B5563; margin-top:12px;">If you need to change your booking, reply to this email or contact us at ${COMPANY_EMAIL}.</p>
      </div>
    </div>
  `;

  return html;
}

/**
 * Send customer email (HTML-only) using sendWithRetries
 */
export async function sendCustomerEmail(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null,
  attachments?: { filename: string; content: Buffer }[]
): Promise<void> {
  // If booking has id & createdAt, compute a deterministic invoice number
  let opts: { invoiceNumber?: string; invoiceDate?: string; bookingRef?: string } | undefined = undefined;

  if (booking.id) {
    // Prefer stored invoiceId if available, else generate consistent fallback
    const invoiceId = (booking as any).invoiceId || (booking.id && booking.createdAt
      ? `INV-${new Date(booking.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${booking.id.slice(0, 4).toUpperCase()}`
      : `INV-${Math.floor(Math.random() * 100000)}`);

    opts = {
      invoiceNumber: invoiceId,
      invoiceDate: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      bookingRef: booking.id,
    };
  }

  const html = buildBookingSummaryHtml(booking, session, opts);

  if (!resend) {
    console.log('sendCustomerEmail – RESEND_API_KEY not set, logging instead.');
    console.log('To:', booking.email);
    console.log(html.replace(/<[^>]+>/g, ' ').slice(0, 500));
    return;
  }

  try {
    await sendWithRetries({
      from: FROM_EMAIL,
      to: booking.email,
      subject: `Your ${COMPANY_NAME} Booking Confirmation`,
      html,
      attachments,
    });
  } catch (err) {
    console.error('Failed to send customer email after retries:', err);
    throw err;
  }
}

/**
 * Send admin email (HTML-only) using sendWithRetries
 */
export async function sendAdminEmail(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null,
  attachments?: { filename: string; content: Buffer }[]
): Promise<void> {
  const isHourly = booking.bookingType === 'hourly';
  const isDayTrip = booking.bookingType === 'daytrip';

  let subject = `New Booking – ${booking.pickupLocation} → ${booking.dropoffLocation}`;

  if (isDayTrip) {
    subject = `New Day Trip Booking – ${booking.dayTripDestination || 'Day Trip'}`;
  } else if (isHourly) {
    subject = `New Hourly Hire Booking – ${booking.hourlyPickupLocation || booking.pickupLocation}`;
  }

  // Compute invoice opts if possible
  let opts: { invoiceNumber?: string; invoiceDate?: string; bookingRef?: string } | undefined = undefined;
  if (booking.id && booking.createdAt) {
    try {
      // Use existing invoiceId if available
      const invoiceId = (booking as any).invoiceId || (booking.id && booking.createdAt
        ? `INV-${new Date(booking.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${booking.id.slice(0, 4).toUpperCase()}`
        : `INV-${Math.floor(Math.random() * 100000)}`);

      opts = {
        invoiceNumber: invoiceId,
        invoiceDate: new Date(booking.createdAt).toLocaleDateString(),
        bookingRef: booking.id,
      };
    } catch (e) {
      // ignore
    }
  }

  const html = buildBookingSummaryHtml(booking, session, opts);

  if (!resend) {
    console.log('sendAdminEmail – RESEND_API_KEY not set, logging instead.');
    console.log('To (admin):', ADMIN_EMAIL);
    console.log(html.replace(/<[^>]+>/g, ' ').slice(0, 500));
    return;
  }

  try {
    await sendWithRetries({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
      attachments,
    });
  } catch (err) {
    console.error('Failed to send admin email after retries:', err);
    throw err;
  }
}

export type QuoteNotificationData = {
  id?: string;
  travelDate: string;
  travelTime: string;
  passengers: number;
  pickupAddress: string;
  dropoffAddress: string;
  checkInBags?: number;
  carryOnBags?: number;
  childSeats?: string;
  flightArrivalType?: string | null;
  flightArrivalNumber?: string | null;
  flightArrivalTime?: string | null;
  flightDepartureType?: string | null;
  flightDepartureNumber?: string | null;
  flightDepartureTime?: string | null;
  fullName: string;
  email: string;
  phone: string;
  message?: string | null;
};

/**
 * Helper to construct the admin dashboard URL for quote requests
 */
export function getAdminDashboardQuoteUrl(quoteId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || 'https://spltransportation.com.au';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/admin?tab=quotes${quoteId ? `&id=${quoteId}` : ''}`;
}

/**
 * Build HTML content for admin quote notification
 */
export function buildAdminQuoteNotificationHtml(quote: QuoteNotificationData): string {
  const adminDashboardLink = getAdminDashboardQuoteUrl(quote.id);
  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#111827; max-width:650px; margin:0 auto; padding:24px; border:1px solid #E5E7EB; border-radius:16px; background-color:#ffffff;">
      <div style="border-bottom: 2px solid #0F766E; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-family:Segoe UI, Arial, sans-serif; font-weight:700; font-size:22px;">
          <span style="color:#0F766E;">SPL</span>
          <span style="color:#102A43;">Transportation</span>
        </span>
        <h2 style="color:#102A43; margin-top:8px; margin-bottom:4px; font-size:20px;">New Custom Quote Request</h2>
        <p style="font-size:14px; color:#4B5563; margin:0;">A customer has submitted a new custom quote request on the website.</p>
      </div>

      <div style="background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px; margin-bottom:20px;">
        <h3 style="margin-top:0; margin-bottom:12px; font-size:14px; font-weight:700; color:#102A43; text-transform:uppercase; letter-spacing:0.5px;">Trip Details</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tbody>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; width:40%; color:#475569;">Travel Date & Time:</td><td style="padding:8px 0; font-weight:600; color:#0F172A;">${quote.travelDate} at ${quote.travelTime}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Pickup Location:</td><td style="padding:8px 0; color:#0F172A;">${quote.pickupAddress}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Dropoff Destination:</td><td style="padding:8px 0; color:#0F172A;">${quote.dropoffAddress}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Passengers:</td><td style="padding:8px 0; color:#0F172A;">${quote.passengers}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Luggage / Baggage:</td><td style="padding:8px 0; color:#0F172A;">${quote.checkInBags ?? 0} Check-in, ${quote.carryOnBags ?? 0} Carry-on</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Child / Booster Seats:</td><td style="padding:8px 0; color:#0F172A;">${quote.childSeats || 'No'}</td></tr>
            ${quote.flightArrivalNumber ? `<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Flight Arrival:</td><td style="padding:8px 0; color:#0F172A;">${quote.flightArrivalType || 'Arrival'} - Flight #${quote.flightArrivalNumber} (${quote.flightArrivalTime || 'N/A'})</td></tr>` : ''}
            ${quote.flightDepartureNumber ? `<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Flight Departure:</td><td style="padding:8px 0; color:#0F172A;">${quote.flightDepartureType || 'Departure'} - Flight #${quote.flightDepartureNumber} (${quote.flightDepartureTime || 'N/A'})</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <div style="background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px; margin-bottom:24px;">
        <h3 style="margin-top:0; margin-bottom:12px; font-size:14px; font-weight:700; color:#102A43; text-transform:uppercase; letter-spacing:0.5px;">Customer Contact Information</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tbody>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; width:40%; color:#475569;">Customer Name:</td><td style="padding:8px 0; font-weight:600; color:#0F172A;">${quote.fullName}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Email Address:</td><td style="padding:8px 0;"><a href="mailto:${quote.email}" style="color:#0F766E; font-weight:600;">${quote.email}</a></td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Phone Number:</td><td style="padding:8px 0;"><a href="tel:${quote.phone}" style="color:#0F766E; font-weight:600;">${quote.phone}</a></td></tr>
            ${quote.message ? `<tr><td style="padding:8px 0; font-weight:bold; color:#475569;">Customer Notes:</td><td style="padding:8px 0; color:#334155; font-style:italic;">${quote.message}</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <div style="text-align:center; margin:28px 0 20px 0;">
        <a href="${adminDashboardLink}" target="_blank" style="background-color:#0F766E; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:10px; display:inline-block; box-shadow:0 4px 6px -1px rgba(15, 118, 110, 0.2);">
          Open Quote in Admin Dashboard →
        </a>
      </div>

      <div style="margin-top:20px; padding:12px 16px; background-color:#F1F5F9; border-left:4px solid #0F766E; border-radius:4px; font-size:13px; color:#475569;">
        Direct Dashboard Link: <a href="${adminDashboardLink}" style="color:#0F766E; word-break:break-all;">${adminDashboardLink}</a>
      </div>
    </div>
  `;
}

/**
 * Send admin email notification when a new Quote Request is submitted
 */
export async function sendAdminQuoteNotification(quote: QuoteNotificationData): Promise<void> {
  const subject = `New Custom Quote Request from ${quote.fullName} – ${quote.pickupAddress} to ${quote.dropoffAddress}`;
  const html = buildAdminQuoteNotificationHtml(quote);

  if (!resend) {
    console.log('sendAdminQuoteNotification – RESEND_API_KEY not set, logging instead.');
    console.log('To (admin):', ADMIN_EMAIL);
    console.log(html.replace(/<[^>]+>/g, ' ').slice(0, 500));
    return;
  }

  try {
    await sendWithRetries({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send admin quote notification email:', err);
  }
}

export type QuotePaymentLinkEmailData = {
  quoteId: string;
  fullName: string;
  email: string;
  pickupAddress: string;
  dropoffAddress: string;
  travelDate: string;
  travelTime: string;
  passengers: number;
  amount: number;
  processingFee?: number;
  totalAmount: number;
  paymentUrl: string;
};

export function buildQuotePaymentLinkEmailHtml(data: QuotePaymentLinkEmailData): string {
  const baseFareFormatted = data.amount.toFixed(2);
  const feeFormatted = (data.processingFee ?? (data.amount * 0.025)).toFixed(2);
  const totalFormatted = data.totalAmount.toFixed(2);

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#111827; max-width:650px; margin:0 auto; padding:24px; border:1px solid #E5E7EB; border-radius:16px; background-color:#ffffff;">
      <div style="border-bottom: 2px solid #0F766E; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-family:Segoe UI, Arial, sans-serif; font-weight:700; font-size:22px;">
          <span style="color:#0F766E;">SPL</span>
          <span style="color:#102A43;">Transportation</span>
        </span>
        <h2 style="color:#102A43; margin-top:8px; margin-bottom:4px; font-size:20px;">Your Custom Transfer Quote is Ready</h2>
        <p style="font-size:14px; color:#4B5563; margin:0;">Hello ${data.fullName}, here are your custom quote details for your upcoming transfer.</p>
      </div>

      <div style="background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px; margin-bottom:20px;">
        <h3 style="margin-top:0; margin-bottom:12px; font-size:14px; font-weight:700; color:#102A43; text-transform:uppercase; letter-spacing:0.5px;">Trip Details</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tbody>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; width:40%; color:#475569;">Quote Reference:</td><td style="padding:8px 0; font-weight:700; color:#0F766E;">QTE-${data.quoteId.slice(-8).toUpperCase()}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Travel Date &amp; Time:</td><td style="padding:8px 0; font-weight:600; color:#0F172A;">${data.travelDate} at ${data.travelTime}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Pickup Location:</td><td style="padding:8px 0; color:#0F172A;">${data.pickupAddress}</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; font-weight:bold; color:#475569;">Dropoff Destination:</td><td style="padding:8px 0; color:#0F172A;">${data.dropoffAddress}</td></tr>
            <tr><td style="padding:8px 0; font-weight:bold; color:#475569;">Passengers:</td><td style="padding:8px 0; color:#0F172A;">${data.passengers}</td></tr>
          </tbody>
        </table>
      </div>

      <div style="background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px; margin-bottom:24px;">
        <h3 style="margin-top:0; margin-bottom:12px; font-size:14px; font-weight:700; color:#102A43; text-transform:uppercase; letter-spacing:0.5px;">Fare Breakdown</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tbody>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; color:#475569;">Base Fare:</td><td style="padding:8px 0; font-weight:600; color:#0F172A; text-align:right;">$${baseFareFormatted} AUD</td></tr>
            <tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 0; color:#475569;">Card Processing Fee (2.5%):</td><td style="padding:8px 0; font-weight:600; color:#0F172A; text-align:right;">$${feeFormatted} AUD</td></tr>
            <tr><td style="padding:10px 0; font-weight:bold; font-size:16px; color:#102A43;">Total Quoted Amount:</td><td style="padding:10px 0; font-weight:800; font-size:18px; color:#0F766E; text-align:right;">$${totalFormatted} AUD</td></tr>
          </tbody>
        </table>
      </div>

      <div style="text-align:center; margin:28px 0 24px 0;">
        <a href="${data.paymentUrl}" target="_blank" style="background-color:#0F766E; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none; padding:15px 32px; border-radius:12px; display:inline-block; box-shadow:0 4px 10px rgba(15, 118, 110, 0.3);">
          Complete Booking &amp; Pay $${totalFormatted} AUD →
        </a>
      </div>

      <div style="padding:12px 16px; background-color:#F1F5F9; border-left:4px solid #0F766E; border-radius:4px; font-size:12px; color:#475569;">
        Having trouble with the button? Copy and paste this payment link into your browser:<br/>
        <a href="${data.paymentUrl}" style="color:#0F766E; word-break:break-all; font-weight:600;">${data.paymentUrl}</a>
      </div>

      <div style="margin-top:24px; padding-top:16px; border-top:1px solid #E5E7EB; text-align:center; font-size:12px; color:#6B7280;">
        Need assistance or changes? Contact us 24/7 at <a href="tel:${COMPANY_PHONE}" style="color:#0F766E;">${COMPANY_PHONE}</a> or email <a href="mailto:${COMPANY_EMAIL}" style="color:#0F766E;">${COMPANY_EMAIL}</a>.
      </div>
    </div>
  `;
}

export async function sendQuotePaymentLinkEmail(data: QuotePaymentLinkEmailData): Promise<void> {
  const subject = `Your Custom Transfer Quote (${data.pickupAddress} → ${data.dropoffAddress}) – SPL Transportation`;
  const html = buildQuotePaymentLinkEmailHtml(data);

  if (!resend) {
    console.log('sendQuotePaymentLinkEmail – RESEND_API_KEY not set, logging instead.');
    console.log('To:', data.email);
    console.log(html.replace(/<[^>]+>/g, ' ').slice(0, 500));
    return;
  }

  try {
    await sendWithRetries({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send quote payment link email:', err);
    throw err;
  }
}
export type BookingUpdateNotificationData = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  changes: { field: string; oldVal: string; newVal: string }[];
  updatedAt: string;
};

export async function sendAdminBookingUpdateNotification(data: BookingUpdateNotificationData): Promise<void> {
  const subject = `⚠️ Customer Updated Booking #${data.bookingId.slice(0, 8)} – ${data.customerName}`;
  
  const changesHtml = data.changes.map(c => `
    <tr>
      <td style="padding:8px; font-weight:bold; color:#475569;">${c.field}</td>
      <td style="padding:8px; text-decoration:line-through; color:#EF4444;">${c.oldVal || 'Empty'}</td>
      <td style="padding:8px; font-weight:bold; color:#0F766E;">${c.newVal || 'Empty'}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; color:#111827; max-width:600px; margin:0 auto; padding:20px; border:1px solid #E5E7EB; border-radius:12px;">
      <h2 style="color:#102A43; margin-top:0;">Customer Modified Booking #${data.bookingId.slice(0, 8)}</h2>
      <p style="font-size:14px; color:#4B5563;">Customer <strong>${data.customerName}</strong> (${data.customerEmail}, ${data.customerPhone}) updated their booking details via the Manage Booking Portal.</p>
      
      <h3 style="font-size:14px; text-transform:uppercase; color:#102A43; margin-top:16px;">Changed Fields</h3>
      <table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #E2E8F0;">
        <thead>
          <tr style="background-color:#F8FAFC; text-align:left;">
            <th style="padding:8px;">Field</th>
            <th style="padding:8px;">Previous Value</th>
            <th style="padding:8px;">Updated Value</th>
          </tr>
        </thead>
        <tbody>
          ${changesHtml}
        </tbody>
      </table>
      
      <p style="margin-top:20px; font-size:12px; color:#6B7280;">Log in to your SPL Admin Dashboard to review full updated trip details.</p>
    </div>
  `;

  if (!resend) {
    console.log('sendAdminBookingUpdateNotification – RESEND_API_KEY not set, logging instead.');
    console.log('To (admin):', ADMIN_EMAIL);
    return;
  }

  try {
    await sendWithRetries({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send admin booking update email:', err);
  }
}



