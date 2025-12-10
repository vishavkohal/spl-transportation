'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Download } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#16a34a';
const REDIRECT_SECONDS = 60;

// Logo — prefer NEXT_PUBLIC_ env var (exposed to client), fallback to public/logo.png
const COMPANY_LOGO = process.env.NEXT_PUBLIC_COMPANY_LOGO || '/logo.png';

interface BookingPayload {
  id?: string;
  createdAt?: string;

  pickupLocation: string;
  pickupAddress?: string;
  dropoffLocation: string;
  dropoffAddress?: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  flightNumber?: string;
  childSeat: boolean;
  fullName: string;
  email: string;
  contactNumber: string;
  totalPrice: number;
  currency?: string;

  bookingType?: 'standard' | 'hourly';
  hourlyPickupLocation?: string;
  hourlyHours?: number;
  hourlyVehicleType?: string;
}

interface ApiResponse {
  paid: boolean; // true = confirmed (DB booking exists), false = not confirmed yet
  booking: BookingPayload;
}

export default function BookingSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // Fetch booking details from session id
  useEffect(() => {
    if (!sessionId) {
      setError('Missing session id.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch('/api/booking-from-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => null);

        if (!isMounted) return;

        if (!res.ok || !data) {
          throw new Error(
            (data && (data as any).error) || 'Failed to load booking details'
          );
        }

        setBookingData(data as ApiResponse);
        setError(null);
      } catch (err: any) {
        if (!isMounted || err?.name === 'AbortError') return;
        setError(err?.message || 'Something went wrong.');
        setBookingData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sessionId]);

  // Auto-redirect countdown (60 seconds) after data or error
  useEffect(() => {
    if (!bookingData && !error) return;

    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [bookingData, error, countdown, router]);

  const handleDownloadReceipt = () => {
    if (!bookingData) return;
    const { booking } = bookingData;

    const COMPANY_NAME =
      process.env.NEXT_PUBLIC_COMPANY_NAME || 'SPL Transportation';
    const COMPANY_ABN =
      process.env.NEXT_PUBLIC_COMPANY_ABN || '64 957 177 372';
    const COMPANY_EMAIL =
      process.env.NEXT_PUBLIC_COMPANY_EMAIL ||
      'spltransportation.australia@gmail.com';
    const COMPANY_PHONE =
      process.env.NEXT_PUBLIC_COMPANY_PHONE || '+61 470 032 460';
    const COMPANY_ADDRESS =
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Cairns, QLD, Australia';
    const LOGO = COMPANY_LOGO;

    let invoiceNumber = `SPL-INV-${Math.floor(Math.random() * 900000 + 100000)}`;
    let invoiceDate = new Date().toLocaleDateString();
    let bookingRef = invoiceNumber;

    if (booking.id && booking.createdAt) {
      try {
        const created = new Date(booking.createdAt);

// Build YYYYMMDD
const y = created.getFullYear();
const m = String(created.getMonth() + 1).padStart(2, "0");
const d = String(created.getDate()).padStart(2, "0");
const datePart = `${y}${m}${d}`;

// Build HHMMSSmmm
const hh = String(created.getHours()).padStart(2, "0");
const mm = String(created.getMinutes()).padStart(2, "0");
const ss = String(created.getSeconds()).padStart(2, "0");
const ms = String(created.getMilliseconds()).padStart(3, "0");
const timePart = `${hh}${mm}${ss}${ms}`;

invoiceNumber = `INV-${datePart}-${timePart}`;
invoiceDate = created.toLocaleDateString();
bookingRef = booking.id;

      } catch (e) {
        // fallback
      }
    }

    const currency = (booking.currency || 'AUD').toUpperCase();
    const isHourly = booking.bookingType === 'hourly';

    const total = Number(booking.totalPrice ?? 0);
    const gst = +(total * (10 / 110)).toFixed(2);
    const subtotal = +(total - gst).toFixed(2);

    const hourlyPickup =
      booking.hourlyPickupLocation || booking.pickupLocation || '';
    const hourlyHours =
      typeof booking.hourlyHours === 'number'
        ? booking.hourlyHours
        : booking.hourlyHours
        ? Number(booking.hourlyHours)
        : '';
    const hourlyVehicle = booking.hourlyVehicleType || '';

    // Simple mobile detection
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${invoiceNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial; color:#111827; padding:24px; }
    .wrap { max-width:800px; margin:0 auto; }
    header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:12px; }
    .brand { font-weight:800; font-size:20px; display:flex; align-items:center; gap:12px; }
    .brand img { width:72px; height:72px; object-fit:contain; border-radius:8px; background:transparent; }
    .company { text-align:right; font-size:13px; color:#374151; }
    h1 { font-size:20px; margin:0 0 8px 0; }
    h2 { font-size:14px; margin:14px 0 8px 0; color:#111827; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    td, th { padding:8px; border:1px solid #E5E7EB; font-size:13px; vertical-align:top; }
    th { background:#F3F4F6; text-align:left; font-weight:700; }
    .right { text-align:right; }
    .muted { color:#6B7280; font-size:12px; }
    .totals { margin-top:12px; width:100%; display:flex; justify-content:flex-end; }
    .totals table { width:320px; border-collapse:collapse; }
    footer { margin-top:18px; font-size:12px; color:#6B7280; }
    @media (max-width: 640px) {
      body { padding: 12px; }
      header { flex-direction:column; align-items:flex-start; }
      .company { text-align:left; }
      .totals table { width:100%; }
    }
    @media print {
      body { padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <img src="${LOGO}" alt="${COMPANY_NAME} logo" onerror="this.style.display='none'"/>
        <div>
          <div style="font-weight:800; font-size:20px;">${COMPANY_NAME}</div>
          <div class="muted">Reliable transfers • Chauffeurs • Hourly hire</div>
        </div>
      </div>
      <div class="company">
        <div><strong>ABN:</strong> ${COMPANY_ABN}</div>
        <div><strong>Email:</strong> ${COMPANY_EMAIL}</div>
        <div><strong>Phone:</strong> ${COMPANY_PHONE}</div>
        <div><strong>Address:</strong> ${COMPANY_ADDRESS}</div>
      </div>
    </header>

    <section>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
        <div>
          <h1>TAX INVOICE</h1>
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
    </section>

    <h2>Trip Details</h2>
    <table>
      <tbody>
        ${
          isHourly
            ? `
        <tr><td style="font-weight:600">Service</td><td>Chauffeur &amp; Hourly Hire</td></tr>
        <tr><td style="font-weight:600">Pickup</td><td>${hourlyPickup}</td></tr>
        <tr><td style="font-weight:600">Hours</td><td>${hourlyHours || 'N/A'}</td></tr>
        <tr><td style="font-weight:600">Vehicle</td><td>${hourlyVehicle || 'N/A'}</td></tr>
        <tr><td style="font-weight:600">Date &amp; Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
        <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
        <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
        <tr><td style="font-weight:600">Child Seat</td><td>${booking.childSeat ? 'Yes' : 'No'}</td></tr>
        `
            : `
        <tr><td style="font-weight:600">From</td><td>${booking.pickupLocation}${
                booking.pickupAddress ? ' – ' + booking.pickupAddress : ''
              }</td></tr>
        <tr><td style="font-weight:600">To</td><td>${booking.dropoffLocation}${
                booking.dropoffAddress ? ' – ' + booking.dropoffAddress : ''
              }</td></tr>
        <tr><td style="font-weight:600">Date &amp; Time</td><td>${booking.pickupDate} at ${booking.pickupTime}</td></tr>
        <tr><td style="font-weight:600">Passengers</td><td>${booking.passengers}</td></tr>
        <tr><td style="font-weight:600">Luggage</td><td>${booking.luggage}</td></tr>
        <tr><td style="font-weight:600">Flight</td><td>${booking.flightNumber || 'N/A'}</td></tr>
        <tr><td style="font-weight:600">Child Seat</td><td>${booking.childSeat ? 'Yes' : 'No'}</td></tr>
        `
        }
      </tbody>
    </table>

    <h2 style="margin-top:14px;">Charges</h2>
    <table>
      <thead>
        <tr><th>Description</th><th class="right">Amount (${currency})</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${
            isHourly
              ? 'Chauffeur &amp; Hourly Hire'
              : `Private Transfer – ${booking.pickupLocation} to ${booking.dropoffLocation}`
          }</td>
          <td class="right">${total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tbody>
          <tr><td>Subtotal</td><td class="right">${subtotal.toFixed(2)}</td></tr>
          <tr><td>GST (10%)</td><td class="right">${gst.toFixed(2)}</td></tr>
          <tr><td style="font-weight:700">Total (Incl. GST)</td><td class="right" style="font-weight:700">${total.toFixed(2)}</td></tr>
        </tbody>
      </table>
    </div>

    <h2 style="margin-top:14px;">Payment</h2>
    <table>
      <tbody>
        <tr><td style="font-weight:600">Amount</td><td>A$${total.toFixed(2)}</td></tr>
      </tbody>
    </table>

    <footer>
      <div style="margin-top:12px; font-weight:700">Pickup instructions</div>
      <div class="muted">
        Your driver will meet you at ${booking.pickupLocation}${
      booking.pickupAddress ? ' – ' + booking.pickupAddress : ''
    }. Driver details will be sent 24 hours before pickup.
      </div>

      <div style="margin-top:10px; font-weight:700">Cancellation policy</div>
      <div class="muted">
        • Free cancellation up to 24 hours before pickup.<br/>
        • 50% charge if cancelled within 24 hours.<br/>
        • No refund if driver is already on the way.
      </div>

      <div style="margin-top:12px;" class="muted">
        Thank you for choosing ${COMPANY_NAME}.
      </div>

      ${
        isMobile
          ? `<div style="margin-top:12px;" class="muted">
              To save or print this invoice on your phone, use your browser's Share or Print option.
             </div>`
          : ''
      }
    </footer>
  </div>
</body>
</html>`;

    // Try to open a new window; if blocked, fallback to same window
    const win = window.open('', '_blank');
    const targetWindow = win && !win.closed ? win : window;
    const doc = targetWindow.document;

    doc.open();
    doc.write(html);
    doc.close();

    // Auto-print only on desktop
    if (!isMobile && win && !win.closed) {
      // Give the browser a moment to render before printing
      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch {
          // ignore
        }
      }, 300);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50"
              style={{ border: `2px solid ${ACCENT_COLOR}22` }}
            >
              <img
                src={COMPANY_LOGO}
                alt="company logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold" style={{ color: PRIMARY_COLOR }}>
                Almost done — completing your booking
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                We’re finalising your payment and checking your booking details.
                This usually takes a few seconds.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="4" />
                <path
                  d="M22 12a10 10 0 00-10-10"
                  stroke={ACCENT_COLOR}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

              <div>
                <div className="text-sm font-semibold">Finalising payment</div>
                <div className="text-xs text-gray-500">
                  Hang tight — we’ll show your booking status in just a moment.
                </div>
              </div>
            </div>

            <div className="ml-auto text-xs text-gray-400">
              If this takes longer than 30s, please check your email or contact support.
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-2/5 animate-pulse" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700"
            >
              Back to home
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-xs text-gray-400">
              We’ll automatically redirect in {countdown}s…
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / no booking
  if (error || !bookingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 text-sm mb-6 text-center max-w-md">
          {error || 'We could not load your booking information.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow"
        >
          Back to home
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="mt-4 text-[11px] text-gray-400">
          Redirecting to homepage in {countdown}s…
        </p>
      </div>
    );
  }

  // Normal confirmed / pending booking UI
  const { booking, paid } = bookingData;
  const currency = (booking.currency || 'AUD').toUpperCase();
  const isHourly = booking.bookingType === 'hourly';

  const hourlyPickup =
    booking.hourlyPickupLocation || booking.pickupLocation || '';
  const hourlyHours =
    typeof booking.hourlyHours === 'number'
      ? booking.hourlyHours
      : booking.hourlyHours
      ? Number(booking.hourlyHours)
      : '';
  const hourlyVehicle = booking.hourlyVehicleType || '';

  const heading = paid ? 'Booking confirmed' : 'Booking being processed';
  const subText = paid
    ? `A confirmation email has been sent to ${booking.email}.`
    : 'Your booking details were received but are not yet confirmed. If payment has completed, you’ll receive a confirmation email shortly. If you do not receive an email within a few minutes, please contact us with your booking details.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50"
            style={{ border: `2px solid ${ACCENT_COLOR}22` }}
          >
            <img
              src={COMPANY_LOGO}
              alt="company logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <div>
            <h1
              className="text-xl md:text-2xl font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              {heading}
            </h1>
            <p className="text-xs md:text-sm text-gray-500">{subText}</p>
          </div>
        </div>

        {!paid && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Your booking is not yet confirmed. This usually means we’re still
            waiting for final confirmation from your bank or payment provider.
            If you see a charge on your account but do not receive a
            confirmation email, please contact us and we’ll verify it for you.
          </div>
        )}

        {/* Summary */}
        <div className="grid md:grid-cols-2 gap-5 mt-4 text-sm">
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Trip
              </h2>

              {isHourly ? (
                <>
                  <p
                    className="mt-1 font-semibold"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    Chauffeur &amp; Hourly Hire
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {hourlyVehicle || 'Vehicle'} • {hourlyHours || ''} hour
                    {Number(hourlyHours || 0) > 1 ? 's' : ''}
                  </p>
                  {hourlyPickup && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pickup: {hourlyPickup}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p
                    className="mt-1 font-semibold"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    {booking.pickupLocation} → {booking.dropoffLocation}
                  </p>
                  {booking.pickupAddress && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pickup: {booking.pickupAddress}
                    </p>
                  )}
                  {booking.dropoffAddress && (
                    <p className="text-xs text-gray-500">
                      Dropoff: {booking.dropoffAddress}
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Date &amp; time
              </h2>
              <p className="mt-1 text-gray-800">
                {booking.pickupDate} at {booking.pickupTime}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Passengers
              </h2>
              <p className="mt-1 text-gray-800">
                {booking.passengers} Pax, {booking.luggage} Bags
              </p>
              <p className="text-xs text-gray-500">
                Flight: {booking.flightNumber || 'N/A'} • Child seat:{' '}
                {booking.childSeat ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Customer
              </h2>
              <p className="mt-1 text-gray-800">{booking.fullName}</p>
              <p className="text-xs text-gray-500">{booking.email}</p>
              <p className="text-xs text-gray-500">{booking.contactNumber}</p>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Total {paid ? 'paid' : 'amount'}
              </h2>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ color: PRIMARY_COLOR }}
              >
                {currency} {booking.totalPrice.toFixed(2)}
              </p>
              {!paid && (
                <p className="text-[11px] text-gray-400 mt-1">
                  This is the total for your requested trip. It will be marked
                  as paid only after we fully confirm your payment and booking.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          {paid && (
            <button
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Download / Print receipt
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Back to home
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-[11px] text-gray-400 text-right">
          Redirecting to homepage in {countdown}s…
        </p>
      </div>
    </div>
  );
}
