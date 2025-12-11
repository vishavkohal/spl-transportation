// lib/email.ts
import Stripe from 'stripe';
import { Resend } from 'resend';
import pRetry from 'p-retry';

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

  bookingType?: 'standard' | 'hourly';
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  hourlyVehicleType?: string | null;
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
        // @ts-ignore - pRetry.AbortError exists at runtime
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

  const hourlyPickup = booking.hourlyPickupLocation || booking.pickupLocation || '';
  const hourlyHours = typeof booking.hourlyHours === 'number' ? booking.hourlyHours : booking.hourlyHours ? Number(booking.hourlyHours) : undefined;
  const hourlyVehicle = booking.hourlyVehicleType || '';

  const paymentId = (session?.payment_intent as string | null) || (session?.id as string | null) || '';

  const total = Number(booking.totalPrice ?? 0);
  const gst = +(total * (10 / 110)).toFixed(2);
  const subtotal = +(total - gst).toFixed(2);

  const style = `
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial; color:#111827; }
    .wrap { max-width:700px; margin:0 auto; padding:18px; }
    .brand { font-weight:800; font-size:22px; }
    .brand .blue { color:#18234B } .brand .red { color:#E11D48 }
    h2 { color:#111827; margin: 12px 0 6px; font-size:16px; }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    td, th { padding:8px; border:1px solid #E5E7EB; vertical-align:top; }
    th { background:#F3F4F6; text-align:left; }
    .muted { color:#6B7280; font-size:13px; }
    .small { font-size:13px; color:#374151; }
    .totals td { border: none; padding:6px; }
    .right { text-align:right; }
  `;

  const tripRows = isHourly
    ? `
      <tr><td style="font-weight:600">Service</td><td>Chauffeur & Hourly Hire</td></tr>
      <tr><td style="font-weight:600">Pickup</td><td>${hourlyPickup}</td></tr>
      <tr><td style="font-weight:600">Hours</td><td>${hourlyHours ?? 'N/A'}</td></tr>
      <tr><td style="font-weight:600">Vehicle</td><td>${hourlyVehicle || 'N/A'}</td></tr>
      <tr><td style="font-weight:600">Date & Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
      <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
      <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
      ${booking.flightNumber ? `<tr><td style="font-weight:600">Flight #</td><td>${booking.flightNumber}</td></tr>` : ''}
      <tr><td style="font-weight:600">Child Seat</td><td>${childSeatText}</td></tr>
    `
    : `
      <tr><td style="font-weight:600">From</td><td>${booking.pickupLocation}${booking.pickupAddress ? ' – ' + booking.pickupAddress : ''}</td></tr>
      <tr><td style="font-weight:600">To</td><td>${booking.dropoffLocation}${booking.dropoffAddress ? ' – ' + booking.dropoffAddress : ''}</td></tr>
      <tr><td style="font-weight:600">Date & Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
      <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
      <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
      ${booking.flightNumber ? `<tr><td style="font-weight:600">Flight #</td><td>${booking.flightNumber}</td></tr>` : ''}
      <tr><td style="font-weight:600">Child Seat</td><td>${childSeatText}</td></tr>
    `;

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
  <span style="color:#A61924;">SPL</span>
  <span style="color:#18234B;">Transportation</span>
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
        <h2 style="color:#18234B; margin-bottom:6px;">${COMPANY_NAME} – Booking Confirmation</h2>
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
  session?: Stripe.Checkout.Session | null
): Promise<void> {
  // If booking has id & createdAt, compute a deterministic invoice number
  let opts: { invoiceNumber?: string; invoiceDate?: string; bookingRef?: string } | undefined = undefined;
  if (booking.id && booking.createdAt) {
    try {
      const created = new Date(booking.createdAt);
      const datePart = created.toISOString().split('T')[0].replace(/-/g, '');
      opts = {
        invoiceNumber: `${booking.id}-${datePart}`,
        invoiceDate: created.toLocaleDateString(),
        bookingRef: booking.id,
      };
    } catch (e) {
      // ignore and fall back to random invoice number in builder
    }
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
  session?: Stripe.Checkout.Session | null
): Promise<void> {
  const isHourly = booking.bookingType === 'hourly';
  const subject = isHourly
    ? `New Hourly Hire Booking – ${booking.hourlyPickupLocation || booking.pickupLocation}`
    : `New Booking – ${booking.pickupLocation} → ${booking.dropoffLocation}`;

  // Compute invoice opts if possible
  let opts: { invoiceNumber?: string; invoiceDate?: string; bookingRef?: string } | undefined = undefined;
  if (booking.id && booking.createdAt) {
    try {
      const created = new Date(booking.createdAt);

      // Get YYYYMMDD
      const y = created.getFullYear();
      const m = String(created.getMonth() + 1).padStart(2, "0");
      const d = String(created.getDate()).padStart(2, "0");
      const datePart = `${y}${m}${d}`;

      // Get HHMMSSmmm
      const hh = String(created.getHours()).padStart(2, "0");
      const mm = String(created.getMinutes()).padStart(2, "0");
      const ss = String(created.getSeconds()).padStart(2, "0");
      const ms = String(created.getMilliseconds()).padStart(3, "0");
      const timePart = `${hh}${mm}${ss}${ms}`;

      opts = {
        invoiceNumber: `INV-${datePart}-${timePart}`,
        invoiceDate: created.toLocaleDateString(),
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
    });
  } catch (err) {
    console.error('Failed to send admin email after retries:', err);
    throw err;
  }
}
