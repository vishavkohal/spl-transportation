// lib/email.ts
import Stripe from 'stripe';

type BookingEmailData = {
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

  totalPrice: number; // in AUD (same as you send to Stripe)
};

// If you want to use Resend for real emails:
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL =
  process.env.BOOKING_FROM_EMAIL || 'no-reply@spl-transportation.com';
const ADMIN_EMAIL =
  process.env.BOOKING_ADMIN_EMAIL || 'admin@spl-transportation.com';

// Helper to format the email body (shared between customer/admin)
function buildBookingSummaryHtml(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null
): string {
  const childSeatText = booking.childSeat ? 'Yes' : 'No';

  const paymentId =
    (session?.payment_intent as string | null) ||
    (session?.id as string | null) ||
    '';

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827;">
      <h2 style="color:#18234B; margin-bottom: 8px;">Spl Transportation – Booking Confirmation</h2>
      <p style="margin: 0 0 16px 0;">Thank you for booking with us.</p>

      <h3 style="color:#111827; margin-bottom: 4px;">Trip Details</h3>
      <table cellspacing="0" cellpadding="4" style="font-size:14px; margin-bottom: 16px;">
        <tr>
          <td style="font-weight:600;">From:</td>
          <td>${booking.pickupLocation}${
            booking.pickupAddress ? ' – ' + booking.pickupAddress : ''
          }</td>
        </tr>
        <tr>
          <td style="font-weight:600;">To:</td>
          <td>${booking.dropoffLocation}${
            booking.dropoffAddress ? ' – ' + booking.dropoffAddress : ''
          }</td>
        </tr>
        <tr>
          <td style="font-weight:600;">Date & Time:</td>
          <td>${booking.pickupDate} at ${booking.pickupTime}</td>
        </tr>
        <tr>
          <td style="font-weight:600;">Passengers:</td>
          <td>${booking.passengers}</td>
        </tr>
        <tr>
          <td style="font-weight:600;">Luggage:</td>
          <td>${booking.luggage}</td>
        </tr>
        ${
          booking.flightNumber
            ? `<tr>
                 <td style="font-weight:600;">Flight #:</td>
                 <td>${booking.flightNumber}</td>
               </tr>`
            : ''
        }
        <tr>
          <td style="font-weight:600;">Child Seat:</td>
          <td>${childSeatText}</td>
        </tr>
      </table>

      <h3 style="color:#111827; margin-bottom: 4px;">Contact Details</h3>
      <table cellspacing="0" cellpadding="4" style="font-size:14px; margin-bottom: 16px;">
        <tr>
          <td style="font-weight:600;">Name:</td>
          <td>${booking.fullName}</td>
        </tr>
        <tr>
          <td style="font-weight:600;">Email:</td>
          <td>${booking.email}</td>
        </tr>
        <tr>
          <td style="font-weight:600;">Phone:</td>
          <td>${booking.contactNumber}</td>
        </tr>
      </table>

      <h3 style="color:#111827; margin-bottom: 4px;">Payment</h3>
      <table cellspacing="0" cellpadding="4" style="font-size:14px; margin-bottom: 16px;">
        <tr>
          <td style="font-weight:600;">Amount:</td>
          <td>A$${booking.totalPrice.toFixed(2)}</td>
        </tr>
        ${
          paymentId
            ? `<tr>
                 <td style="font-weight:600;">Payment / Session ID:</td>
                 <td>${paymentId}</td>
               </tr>`
            : ''
        }
      </table>

      <p style="font-size:13px; color:#4B5563;">
        If you have any questions or need to make changes, please contact us.
      </p>
    </div>
  `;
}

// CUSTOMER EMAIL
export async function sendCustomerEmail(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null
): Promise<void> {
  // If email provider not configured, just log and exit gracefully
  if (!resend) {
    console.log('sendCustomerEmail – RESEND_API_KEY not set, logging instead.');
    console.log('To:', booking.email);
    console.log(
      buildBookingSummaryHtml(booking, session)
        .replace(/<[^>]+>/g, ' ')
        .slice(0, 500)
    );
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.email,
    subject: 'Your Spl Transportation Booking Confirmation',
    html: buildBookingSummaryHtml(booking, session),
  });
}

// ADMIN EMAIL
export async function sendAdminEmail(
  booking: BookingEmailData,
  session?: Stripe.Checkout.Session | null
): Promise<void> {
  if (!resend) {
    console.log('sendAdminEmail – RESEND_API_KEY not set, logging instead.');
    console.log('To (admin):', ADMIN_EMAIL);
    console.log(
      buildBookingSummaryHtml(booking, session)
        .replace(/<[^>]+>/g, ' ')
        .slice(0, 500)
    );
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Booking – ${booking.pickupLocation} → ${booking.dropoffLocation}`,
    html: buildBookingSummaryHtml(booking, session),
  });
}
