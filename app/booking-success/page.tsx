'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#16a34a'; // green

interface BookingPayload {
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
}

interface ApiResponse {
  paid: boolean;
  booking: BookingPayload;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session id.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/booking-from-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load booking details');
        }

        const data: ApiResponse = await res.json();
        setBookingData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  // Auto-redirect countdown
  useEffect(() => {
    if (!bookingData && !error) return;

    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => setCountdown(c => c - 1), 6000);
    return () => clearTimeout(timer);
  }, [bookingData, error, countdown, router]);

  const handleDownloadReceipt = () => {
    if (!bookingData) return;
    const { booking } = bookingData;

    const w = window.open('', '_blank');
    if (!w) return;

    const currency = (booking.currency || 'AUD').toUpperCase();

    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Booking Receipt</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; }
            .section { margin-bottom: 12px; }
            .label { font-weight: 600; }
            .value { margin-left: 4px; }
            hr { margin: 16px 0; border: none; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <h1>SPL Transportation – Booking Receipt</h1>
          <p>${new Date().toLocaleString()}</p>
          <hr />
          <h2>Customer</h2>
          <div class="section">
            <div><span class="label">Name:</span><span class="value">${booking.fullName}</span></div>
            <div><span class="label">Email:</span><span class="value">${booking.email}</span></div>
            <div><span class="label">Mobile:</span><span class="value">${booking.contactNumber}</span></div>
          </div>

          <h2>Trip Details</h2>
          <div class="section">
            <div><span class="label">From:</span><span class="value">${booking.pickupLocation}</span></div>
            ${booking.pickupAddress ? `<div><span class="label">Pickup address:</span><span class="value">${booking.pickupAddress}</span></div>` : ''}
            <div><span class="label">To:</span><span class="value">${booking.dropoffLocation}</span></div>
            ${booking.dropoffAddress ? `<div><span class="label">Dropoff address:</span><span class="value">${booking.dropoffAddress}</span></div>` : ''}
            <div><span class="label">Date & time:</span><span class="value">${booking.pickupDate} at ${booking.pickupTime}</span></div>
            <div><span class="label">Passengers:</span><span class="value">${booking.passengers}</span></div>
            <div><span class="label">Bags:</span><span class="value">${booking.luggage}</span></div>
            <div><span class="label">Flight:</span><span class="value">${booking.flightNumber || 'N/A'}</span></div>
            <div><span class="label">Child Seat:</span><span class="value">${booking.childSeat ? 'Yes' : 'No'}</span></div>
          </div>

          <h2>Payment</h2>
          <div class="section">
            <div><span class="label">Total:</span><span class="value">${currency} ${booking.totalPrice.toFixed(2)}</span></div>
          </div>

          <hr />
          <p>Thank you for booking with SPL Transportation.</p>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-sm">Loading your booking details…</p>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h1>
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
      </div>
    );
  }

  const { booking, paid } = bookingData;
  const currency = (booking.currency || 'AUD').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${ACCENT_COLOR}15` }}
          >
            <CheckCircle className="w-6 h-6" color={ACCENT_COLOR} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
              Booking confirmed
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              A confirmation email has been sent to <span className="font-medium">{booking.email}</span>.
            </p>
          </div>
        </div>

        {!paid && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Payment status could not be fully verified. Please contact us if you have any concerns.
          </div>
        )}

        {/* Summary */}
        <div className="grid md:grid-cols-2 gap-5 mt-4 text-sm">
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Trip</h2>
              <p className="mt-1 font-semibold" style={{ color: PRIMARY_COLOR }}>
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
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Date & time</h2>
              <p className="mt-1 text-gray-800">
                {booking.pickupDate} at {booking.pickupTime}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Passengers</h2>
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
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Customer</h2>
              <p className="mt-1 text-gray-800">{booking.fullName}</p>
              <p className="text-xs text-gray-500">{booking.email}</p>
              <p className="text-xs text-gray-500">{booking.contactNumber}</p>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Total paid</h2>
              <p className="mt-1 text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                {currency} {booking.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Download / Print receipt
          </button>

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
