'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Repeat } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import type { Route } from '@/app/types';

const MAX_PASSENGERS = 8;
const MAX_LUGGAGE_LIMIT = 10; // Absolute fallback limit

/* ---------------- Utils ---------------- */

function parsePassengerRange(range: string): [number, number] {
  const [min, max] = range.split('-').map(Number);
  return [min, max];
}

function priceForPassengers(pricing: Route['pricing'], pax: number) {
  if (!pricing?.length) return 0;
  // Fallback to 1 pax for pricing lookup if input is currently 0 or empty
  const lookupPax = pax || 1; 
  
  const tier = pricing.find(p => {
    const [min, max] = parsePassengerRange(p.passengers);
    return lookupPax >= min && lookupPax <= max;
  });
  return tier?.price ?? pricing[0].price;
}

function minDate() {
  return new Date().toISOString().slice(0, 10);
}

function minTimeForDate(date: string) {
  if (!date) return '00:00';
  const now = new Date();
  const selected = new Date(date);
  if (selected.toDateString() !== now.toDateString()) return '00:00';
  const t = new Date(now.getTime() + 30 * 60000);
  return `${String(t.getHours()).padStart(2, '0')}:${String(
    t.getMinutes()
  ).padStart(2, '0')}`;
}

// RULES:
// 1-5 pax: 3 bags
// 6 pax:   2 bags
// 7-8 pax: 4 bags
function getMaxBagsForCurrentPax(pax: number): number {
  const count = pax || 1; // Treat 0 input as 1 for validation purposes
  
  if (count <= 5) return 3;
  if (count === 6) return 2;
  if (count > 6 && count <= MAX_PASSENGERS) return 4;
  
  return MAX_LUGGAGE_LIMIT;
}

/* ---------------- Payment Fee ---------------- */

const PAYMENT_FEE_RATE = 0.025; // 2.5%

function calculateProcessingFee(amount: number): number {
  return Number((amount * PAYMENT_FEE_RATE).toFixed(2));
}

function calculateFinalAmount(amount: number) {
  return amount + calculateProcessingFee(amount);
}

/* ---------------- Component ---------------- */

export default function RouteBookingForm({ route }: { route: Route }) {
  const [direction, setDirection] =
    useState<'forward' | 'reverse'>('forward');

  const pickupLocation =
    direction === 'forward' ? route.from : route.to;
  const dropoffLocation =
    direction === 'forward' ? route.to : route.from;

  const [form, setForm] = useState({
    pickupDate: '',
    pickupTime: '',
    passengers: 1,
    luggage: 0,
    childSeat: false,
    flightNumber: '',
    fullName: '',
    email: '',
    countryCode: '+61',
    phone: ''
  });

  const update = (k: string, v: any) =>
    setForm(p => ({ ...p, [k]: v }));

  /* ---------------- Strict Input Handlers ---------------- */

  const handlePassengerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse immediately to remove leading zeros (e.g. "01" -> 1)
    let val = parseInt(e.target.value, 10);

    // Handle backspace/empty input (treat as 0 temporarily)
    if (isNaN(val)) val = 0;

    // Strict Rule: Don't allow typing higher than MAX
    if (val > MAX_PASSENGERS) return;

    // Calculate new luggage limit based on new passenger count
    const newMaxLuggage = getMaxBagsForCurrentPax(val);

    setForm(prev => ({
      ...prev,
      passengers: val,
      // If current luggage is now too high for new passenger count, clamp it down
      luggage: prev.luggage > newMaxLuggage ? newMaxLuggage : prev.luggage
    }));
  };

  const handleLuggageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;

    // Check limit dynamically based on current passengers
    const maxAllowed = getMaxBagsForCurrentPax(form.passengers);

    // Strict Rule: Don't allow typing higher than allowed limit
    if (val > maxAllowed) return;

    update('luggage', val);
  };

  /* ---------------- Pricing ---------------- */

  const basePrice = useMemo(
    () => priceForPassengers(route.pricing, form.passengers),
    [route.pricing, form.passengers]
  );

  const baseTotal = basePrice + (form.childSeat ? 20 : 0);
  const processingFee = calculateProcessingFee(baseTotal);
  const finalTotal = calculateFinalAmount(baseTotal);

  /* ---------------- State ---------------- */

  const [step, setStep] = useState<1 | 2>(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Validation ---------------- */

  const isStep1Valid =
    form.pickupDate &&
    form.pickupTime &&
    form.passengers >= 1 &&
    form.passengers <= MAX_PASSENGERS; 
    // Luggage is validated by the input handler itself now

  const isStep2Valid =
    form.fullName.trim().length >= 3 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    /^\+\d{1,4}$/.test(form.countryCode) &&
    /^\d{6,15}$/.test(form.phone);

  /* -------- Abandoned lead autosave -------- */

  const saveLead = useDebouncedCallback(async () => {
    if (step !== 2) return;
    if (!form.email && !form.phone) return;

    try {
      const res = await fetch('/api/leads/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          bookingType: 'standard',
          source: 'route-page',

          pickupLocation,
          dropoffLocation,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          passengers: form.passengers,
          luggage: form.luggage,
          flightNumber: form.flightNumber,
          childSeat: form.childSeat,

          fullName: form.fullName,
          email: form.email,
          contactNumber:
            form.countryCode && form.phone
              ? `${form.countryCode}${form.phone}`
              : null,

          quotedPrice: (basePrice),
          currency: 'AUD'
        })
      });

      const data = await res.json();
      if (data?.leadId && !leadId) {
        setLeadId(data.leadId);
      }
    } catch {}
  }, 2500);

  useEffect(() => {
    saveLead();
  }, [form.fullName, form.email, form.phone]);

  /* ---------------- Payment ---------------- */

  async function pay() {
    setError(null);

    if (!isStep2Valid) {
      setError('Please enter valid contact details.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            bookingType: 'standard',
            pickupLocation,
            dropoffLocation,
            ...form,
            contactNumber: `${form.countryCode}${form.phone}`
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Payment failed');
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  /* ---------------- UI ---------------- */

  const inputBase =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#18234B] focus:border-[#18234B] text-black';

  const label =
    'text-xs font-medium text-gray-600';

  return (
    <div className="space-y-4">

      {/* Direction */}
      <button
        type="button"
        onClick={() =>
          setDirection(d => (d === 'forward' ? 'reverse' : 'forward'))
        }
        className="flex items-center gap-2 text-lg text-gray-600 hover:text-gray-900"
      >
        <Repeat className="w-4 h-4" />
        {pickupLocation} → {dropoffLocation}
      </button>

      {/* ---------------- STEP 1 ---------------- */}
      {step === 1 && (
        <div className="space-y-5">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mr-2">

            <div className="space-y-1">
              <label className={label}>Pickup date</label>
              <input
                type="date"
                min={minDate()}
                value={form.pickupDate}
                onChange={e => update('pickupDate', e.target.value)}
                className={inputBase}
              />
            </div>

            <div className="space-y-1">
              <label className={label}>Pickup time</label>
              <input
                type="time"
                min={minTimeForDate(form.pickupDate)}
                value={form.pickupTime}
                onChange={e => update('pickupTime', e.target.value)}
                className={inputBase}
              />
            </div>

            <div className="space-y-1">
              <label className={label}>Passengers</label>
              <input
                type="number"
                min={1}
                max={MAX_PASSENGERS}
                // Use '' if 0 so user sees empty field instead of '0'
                value={form.passengers === 0 ? '' : form.passengers}
                onChange={handlePassengerChange}
                className={inputBase}
                placeholder="1"
              />
            </div>

            <div className="space-y-1">
              <label className={label}>
                Luggage <span className="text-gray-400 text-[10px]">(Max {getMaxBagsForCurrentPax(form.passengers)})</span>
              </label>
              <input
                type="number"
                min={0}
                max={getMaxBagsForCurrentPax(form.passengers)}
                // Use '' if 0 so user sees empty field instead of '0'
                value={form.luggage === 0 ? '' : form.luggage}
                onChange={handleLuggageChange}
                className={inputBase}
                placeholder="0"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.childSeat}
              onChange={e => update('childSeat', e.target.checked)}
            />
            Child seat (+ $20)
          </label>

          <div className="flex justify-between items-center border-t pt-3">
            <div>
              <div className="text-gray-500 text-sm">Estimated fare</div>
              <div className="text-2xl font-bold text-black">${baseTotal}</div>
              <div className="text-xs text-gray-500">
                GST included · Processing fee applied at checkout
              </div>
            </div>
            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="bg-[#18234B] text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Summary */}
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2 text-sm">
            <div className="font-semibold">Payment summary</div>
            <div>{pickupLocation} → {dropoffLocation}</div>

            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between">
                <span>Trip fare</span>
                <span>${baseTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment processing fee (2.5%)</span>
                <span>${processingFee}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>Total payable</span>
                <span>${finalTotal}</span>
              </div>
              <p className="text-xs text-gray-500 pt-1">
                All prices are inclusive of GST. Secure payments processed via Stripe.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">

            <div className="space-y-1">
              <label className={label}>Full name</label>
              <input
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                className={inputBase}
              />
            </div>

            <div className="space-y-1">
              <label className={label}>Email address</label>
              <input
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className={inputBase}
              />
            </div>

            <div className="space-y-1">
              <label className={label}>Phone number</label>
              <div className="flex gap-2">
                <input
                  value={form.countryCode}
                  onChange={e => update('countryCode', e.target.value)}
                  className={inputBase.replace('w-full', 'w-20 text-center')}
                />
                <input
                  value={form.phone}
                  onChange={e =>
                    update('phone', e.target.value.replace(/\D/g, ''))
                  }
                  className={`${inputBase} flex-1`}
                />
              </div>
            </div>

            {error && (
              <div className="flex gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={pay}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold"
              >
                {loading ? 'Redirecting…' : `Pay $${finalTotal} & confirm`}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}