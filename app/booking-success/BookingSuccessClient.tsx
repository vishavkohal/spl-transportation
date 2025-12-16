'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Download, X } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#16a34a';
const REDIRECT_SECONDS = 60;

// Logo — prefer NEXT_PUBLIC_ env var (exposed to client), fallback to public/logo.png
const COMPANY_LOGO = process.env.NEXT_PUBLIC_COMPANY_LOGO || '/logo.png';

// ---------- Polling & retry configuration (tweak these as needed) ----------
// Total time to keep polling (ms)
const MAX_POLL_MS = Number(process.env.NEXT_PUBLIC_MAX_POLL_MS ?? 60_000);
// Initial backoff delay (ms)
const POLL_BASE_MS = Number(process.env.NEXT_PUBLIC_POLL_BASE_MS ?? 1000);
// Exponential factor per attempt
const POLL_FACTOR = Number(process.env.NEXT_PUBLIC_POLL_FACTOR ?? 1.8);
// Max single delay cap (ms)
const POLL_MAX_MS = Number(process.env.NEXT_PUBLIC_POLL_MAX_MS ?? 5000);

// Initial fetch retry settings
const FETCH_RETRY_ATTEMPTS = Number(process.env.NEXT_PUBLIC_FETCH_RETRY_ATTEMPTS ?? 3);
const FETCH_RETRY_BASE_MS = Number(process.env.NEXT_PUBLIC_FETCH_RETRY_BASE_MS ?? 500);
// -------------------------------------------------------------------------

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

/**
 * Tight, user-facing wording used in the UI for clarity.
 * - We never claim final confirmation unless server DB reports it.
 * - We do reassure when payment was received but server work remains.
 */
const UX_TEXT = {
  processingTitle: 'Almost done — completing your booking',
  processingBodyPaidSignal:
    "Payment received. We're finalising your booking on our side — this usually takes a few seconds.",
  processingBodyPendingPayment:
    'Payment is being processed. We’ll confirm your booking once payment completes.',
  confirmedTitle: 'Booking confirmed',
  confirmedBody: (email: string) => `We’ve emailed your confirmation to ${email}.`,
  notConfirmedTimeout:
    'Your booking is not yet confirmed. Please check your email or contact support with your session id.',
};

export default function BookingSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  // 🔴 TRACKING: ensure iframe fires only once
  const [trackingFired, setTrackingFired] = useState(false);
  // Toast / banner state
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const bannerTimerRef = useRef<number | null>(null);

  // lifecycle refs
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingStoppedRef = useRef(false);
  const prevPaidRef = useRef<boolean | null>(null);

  // housekeeping for backoff polling
  const pollAttemptRef = useRef(0);
  const pollDeadlineRef = useRef<number>(Date.now() + MAX_POLL_MS);
  const pollTimerRef = useRef<number | null>(null);

  // redirect countdown timer ref (auto-redirect only starts when booking confirmed)
  const redirectTimerRef = useRef<number | null>(null);
  // 🔴 TRACKING: fire when booking confirmed
  useEffect(() => {
    if (bookingData?.paid && !trackingFired) {
      setTrackingFired(true);
    }
  }, [bookingData?.paid, trackingFired]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      pollingStoppedRef.current = true;
    };
  }, []);

  // Helper: show confirmation banner (auto-hide)
  const showConfirmedBanner = (message: string) => {
    setBannerMessage(message);
    setShowBanner(true);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = window.setTimeout(() => {
      setShowBanner(false);
      bannerTimerRef.current = null;
    }, 6000);
  };

  /**
   * Client-side fetch with a few retries (used for initial load).
   * For initial fetch we retry on network/5xx; don't retry 4xx.
   */
  async function fetchWithRetry(
    url: string,
    init?: RequestInit,
    attempts = FETCH_RETRY_ATTEMPTS,
    baseDelay = FETCH_RETRY_BASE_MS
  ): Promise<Response> {
    let attempt = 0;
    let lastErr: any = null;

    while (attempt < attempts) {
      attempt++;
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const res = await fetch(url, { ...(init || {}), signal: controller.signal });

        if (!res.ok) {
          // Do not retry for client errors (4xx)
          if (res.status >= 400 && res.status < 500) {
            const text = await res.text().catch(() => res.statusText);
            throw new Error(`HTTP ${res.status}: ${text}`);
          }
          // treat 5xx as transient
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        return res;
      } catch (err: any) {
        lastErr = err;
        if (attempt >= attempts) break;
        // exponential backoff + jitter
        const exp = Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * baseDelay);
        const delay = Math.min(POLL_MAX_MS, Math.floor(baseDelay * exp + jitter));
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastErr ?? new Error('Failed to fetch');
  }

  /**
   * Exponential backoff poller (no fixed interval)
   * - initialDelay: POLL_BASE_MS
   * - factor: POLL_FACTOR
   * - caps each delay at POLL_MAX_MS
   * Polling stops when:
   * - booking.paid === true (server confirmed), OR
   * - poll deadline reached (MAX_POLL_MS)
   */
  const startExponentialPolling = (lastKnown: ApiResponse | null, initialSignalPaid: boolean | null) => {
    pollAttemptRef.current = 0;
    pollDeadlineRef.current = Date.now() + MAX_POLL_MS;
    pollingStoppedRef.current = false;
    prevPaidRef.current = initialSignalPaid ?? false;

    const scheduleNextPoll = (delayMs: number) => {
      if (!mountedRef.current) return;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = window.setTimeout(() => {
        pollOnce();
      }, delayMs);
    };

    const pollOnce = async () => {
      if (!mountedRef.current || pollingStoppedRef.current) return;
      // stop if deadline passed
      if (Date.now() > pollDeadlineRef.current) {
        pollingStoppedRef.current = true;
        // show timeout fallback UI
        if (!lastKnown) {
          setError(UX_TEXT.notConfirmedTimeout);
          setBookingData(null);
        } else {
          setBookingData(lastKnown);
          setError(null);
        }
        setLoading(false);
        return;
      }

      pollAttemptRef.current += 1;

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const res = await fetch('/api/booking-from-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = (await res.json()) as ApiResponse;

          // Transition: not paid -> paid
          if (data?.paid) {
            // update UI, show banner only if previously not paid
            if (!prevPaidRef.current) {
              showConfirmedBanner('Booking confirmed — confirmation email sent.');
            }
            prevPaidRef.current = true;
            pollingStoppedRef.current = true;
            setBookingData(data);
            setError(null);
            setLoading(false);
            // start redirect countdown because booking succeeded
            startRedirectCountdown();
            // cleanup any pending poll timers
            if (pollTimerRef.current) {
              clearTimeout(pollTimerRef.current);
              pollTimerRef.current = null;
            }
            return;
          } else {
            // keep lastKnown for timeout fallback
            lastKnown = data;
            prevPaidRef.current = false;
            // continue polling
          }
        } else {
          // treat non-OK as transient — keep lastKnown and continue
        }
      } catch (err) {
        // ignore transient errors and continue polling until deadline
      }

      // compute next delay via exponential backoff with jitter
      const attempt = pollAttemptRef.current;
      const rawDelay = POLL_BASE_MS * Math.pow(POLL_FACTOR, attempt - 1);
      const jitter = Math.floor(Math.random() * POLL_BASE_MS);
      const nextDelay = Math.min(POLL_MAX_MS, Math.floor(rawDelay + jitter));

      // ensure we don't overshoot the deadline — lower the delay if needed
      const msLeft = Math.max(0, pollDeadlineRef.current - Date.now());
      const finalDelay = Math.min(nextDelay, msLeft);

      if (finalDelay <= 0) {
        // immediate re-check if time almost up
        pollOnce();
      } else {
        scheduleNextPoll(finalDelay);
      }
    };

    // start immediately (first poll right away)
    pollOnce();
  };

  // Start redirect countdown only when booking confirmed (paid = true)
  const startRedirectCountdown = () => {
    // clear any existing redirect timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setCountdown(REDIRECT_SECONDS);

    // tick every second
    redirectTimerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // final tick: navigate and clear timer
          if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
          }
          router.push('/');
          return 0;
        }
        return c - 1;
      });
    }, 1000) as unknown as number;
  };

  // Primary loader + logic: initial fetch then polling with exponential backoff if needed
  useEffect(() => {
    if (!sessionId) {
      setError('Missing session id.');
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // initial attempt: small number of retries to handle transient issues
        const res = await fetchWithRetry(
          '/api/booking-from-session',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          },
          FETCH_RETRY_ATTEMPTS,
          FETCH_RETRY_BASE_MS
        );

        if (!isActive) return;
        const data = (await res.json()) as ApiResponse;

        // If server reports booking exists and is paid -> show confirmed immediately
        if (data?.paid) {
          prevPaidRef.current = true;
          setBookingData(data);
          setError(null);
          setLoading(false);
          // show banner since booking is confirmed (but avoid double-show if coming from client refresh)
          showConfirmedBanner('Booking confirmed — confirmation email sent.');
          // start redirect countdown because booking succeeded
          startRedirectCountdown();
        } else {
          // server not yet recorded booking (or payment pending)
          prevPaidRef.current = !!data?.paid;
          setBookingData(data); // show details while processing
          setError(null);
          setLoading(true);
          // start exponential polling: pass initial signal of payment status from server (if any)
          startExponentialPolling(data, !!data?.paid);
        }
      } catch (err: any) {
        // initial fetch failed — still show processing UI and start polling for MAX_POLL_MS
        if (!isActive) return;
        setBookingData(null);
        setError(null);
        setLoading(true);
        prevPaidRef.current = false;
        startExponentialPolling(null, false);
      }
    })();

    return () => {
      isActive = false;
      abortControllerRef.current?.abort();
      pollingStoppedRef.current = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Receipt downloader (unchanged)
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
        const m = String(created.getMonth() + 1).padStart(2, '0');
        const d = String(created.getDate()).padStart(2, '0');
        const datePart = `${y}${m}${d}`;

        // Build HHMMSSmmm
        const hh = String(created.getHours()).padStart(2, '0');
        const mm = String(created.getMinutes()).padStart(2, '0');
        const ss = String(created.getSeconds()).padStart(2, '0');
        const ms = String(created.getMilliseconds()).padStart(3, '0');
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

  // Render UI
  // Processing (loading) screen
  if (loading) {
    const initialProcessingText = bookingData?.paid
      ? UX_TEXT.processingBodyPaidSignal
      : UX_TEXT.processingBodyPendingPayment;

    return (
      <>
        {/* Toast / banner */}
        <div aria-live="polite" className="fixed top-6 right-6 z-50 pointer-events-none">
          {showBanner && (
            <div
              role="status"
              className="pointer-events-auto max-w-xs rounded-lg shadow-lg border border-gray-100 bg-white overflow-hidden"
              style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
                <div className="flex-1 text-sm text-gray-800">{bannerMessage}</div>
                <button
                  aria-label="Dismiss"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowBanner(false);
                    if (bannerTimerRef.current) {
                      clearTimeout(bannerTimerRef.current);
                      bannerTimerRef.current = null;
                    }
                  }}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>

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
                  {UX_TEXT.processingTitle}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{initialProcessingText}</p>
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
                    {bookingData?.paid
                      ? 'Payment recorded by Stripe — waiting for our system to finalise your booking.'
                      : 'Waiting for payment confirmation and final processing.'}
                  </div>
                </div>
              </div>

              <div className="ml-auto text-xs text-gray-400">
                We will keep checking for confirmation for up to {Math.round(MAX_POLL_MS / 1000)}s.
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
                You will be kept on this page until your booking is confirmed.
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error / no booking (after poll timeout or fatal error)
  if (error || !bookingData) {
    return (
      <>
        {/* Banner */}
        <div aria-live="polite" className="fixed top-6 right-6 z-50 pointer-events-none">
          {showBanner && (
            <div
              role="status"
              className="pointer-events-auto max-w-xs rounded-lg shadow-lg border border-gray-100 bg-white overflow-hidden"
              style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
                <div className="flex-1 text-sm text-gray-800">{bannerMessage}</div>
                <button
                  aria-label="Dismiss"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowBanner(false);
                    if (bannerTimerRef.current) {
                      clearTimeout(bannerTimerRef.current);
                      bannerTimerRef.current = null;
                    }
                  }}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h1>
          <p className="text-gray-600 text-sm mb-6 text-center max-w-md">
            {error || UX_TEXT.notConfirmedTimeout}
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow"
          >
            Back to home
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </>
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

  const heading = paid ? UX_TEXT.confirmedTitle : 'Booking being processed';
  const subText = paid ? UX_TEXT.confirmedBody(booking.email) : UX_TEXT.processingBodyPaidSignal;

  return (
    <>
    {trackingFired && (
      <iframe
        src="https://adzsmart.o18.click/p?m=5240&t=f&gb=1"
        width={0}
        height={0}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
    )}
      {/* Toast / banner */}
      <div aria-live="polite" className="fixed top-6 right-6 z-50 pointer-events-none">
        {showBanner && (
          <div
            role="status"
            className="pointer-events-auto max-w-xs rounded-lg shadow-lg border border-gray-100 bg-white overflow-hidden"
            style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center gap-3 p-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
              <div className="flex-1 text-sm text-gray-800">{bannerMessage}</div>
              <button
                aria-label="Dismiss"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setShowBanner(false);
                  if (bannerTimerRef.current) {
                    clearTimeout(bannerTimerRef.current);
                    bannerTimerRef.current = null;
                  }
                }}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

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
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
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
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Trip</h2>

                {isHourly ? (
                  <>
                    <p className="mt-1 font-semibold" style={{ color: PRIMARY_COLOR }}>
                      Chauffeur &amp; Hourly Hire
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {hourlyVehicle || 'Vehicle'} • {hourlyHours || ''} hour
                      {Number(hourlyHours || 0) > 1 ? 's' : ''}
                    </p>
                    {hourlyPickup && <p className="text-xs text-gray-500 mt-1">Pickup: {hourlyPickup}</p>}
                  </>
                ) : (
                  <>
                    <p className="mt-1 font-semibold" style={{ color: PRIMARY_COLOR }}>
                      {booking.pickupLocation} → {booking.dropoffLocation}
                    </p>
                    {booking.pickupAddress && <p className="text-xs text-gray-500 mt-1">Pickup: {booking.pickupAddress}</p>}
                    {booking.dropoffAddress && <p className="text-xs text-gray-500">Dropoff: {booking.dropoffAddress}</p>}
                  </>
                )}
              </div>

              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Date &amp; time</h2>
                <p className="mt-1 text-gray-800">{booking.pickupDate} at {booking.pickupTime}</p>
              </div>

              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Passengers</h2>
                <p className="mt-1 text-gray-800">{booking.passengers} Pax, {booking.luggage} Bags</p>
                <p className="text-xs text-gray-500">Flight: {booking.flightNumber || 'N/A'} • Child seat: {booking.childSeat ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Customer</h2>
                <p className="mt-1 text-gray-800">{booking.fullName}</p>
                <p className="text-xs text-gray-500">{booking.email}</p>
                <p className="text-xs text-gray-500">{booking.contactNumber}</p>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase">Total {paid ? 'paid' : 'amount'}</h2>
                <p className="mt-1 text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                  {currency} {booking.totalPrice.toFixed(2)}
                </p>
                {!paid && <p className="text-[11px] text-gray-400 mt-1">This is the total for your requested trip. It will be marked as paid only after we fully confirm your payment and booking.</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-between">
            {paid && (
              <button onClick={handleDownloadReceipt} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4" /> Download / Print receipt
              </button>
            )}

            <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow" style={{ backgroundColor: PRIMARY_COLOR }}>
              Back to home
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {paid && (
            <p className="mt-3 text-[11px] text-gray-400 text-right">Redirecting to homepage in {countdown}s…</p>
          )}
        </div>
      </div>
    </>
  );
}
