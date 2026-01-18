'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Repeat, Calendar, Clock, Users, Briefcase, Plane, CheckCircle } from 'lucide-react';
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
  return tier?.price ?? pricing[pricing.length - 1].price;
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
    } catch { }
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
        <div className="space-y-6">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pr-1">

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[#18234B]" />
                Pickup Date
              </label>
              <input
                type="date"
                min={minDate()}
                value={form.pickupDate}
                onChange={e => update('pickupDate', e.target.value)}
                className="w-full min-w-0 rounded-lg border border-gray-200 px-0.5 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] text-gray-900 bg-white"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#18234B]" />
                Time
              </label>
              <input
                type="time"
                min={minTimeForDate(form.pickupDate)}
                value={form.pickupTime}
                onChange={e => update('pickupTime', e.target.value)}
                className="w-full min-w-0 rounded-lg border border-gray-200 px-1 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] text-gray-900 bg-white"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-[#18234B]" />
                Passengers
              </label>
              <input
                type="number"
                min={1}
                max={MAX_PASSENGERS}
                // Use '' if 0 so user sees empty field instead of '0'
                value={form.passengers === 0 ? '' : form.passengers}
                onChange={handlePassengerChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] text-gray-900 bg-white"
                placeholder="1"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-[#18234B]" />
                Luggage
                <span className="text-gray-400 text-[10px] ml-auto font-normal">(Max {getMaxBagsForCurrentPax(form.passengers)})</span>
              </label>
              <input
                type="number"
                min={0}
                max={getMaxBagsForCurrentPax(form.passengers)}
                // Use '' if 0 so user sees empty field instead of '0'
                value={form.luggage === 0 ? '' : form.luggage}
                onChange={handleLuggageChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] text-gray-900 bg-white"
                placeholder="0"
              />
            </div>

            <div className="col-span-2 md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-[#18234B]" />
                Flight Number (Optional)
              </label>
              <input
                type="text"
                value={form.flightNumber}
                onChange={e => update('flightNumber', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] text-gray-900 bg-white"
                placeholder="e.g. JQ953"
              />
            </div>

          </div>

          <label className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div
              className="w-5 h-5 rounded border flex items-center justify-center transition-colors"
              style={{
                backgroundColor: form.childSeat ? '#A61924' : 'white',
                borderColor: form.childSeat ? '#A61924' : 'rgb(209 213 219)'
              }}
            >
              {form.childSeat && (
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <input
              type="checkbox"
              checked={form.childSeat}
              onChange={e => update('childSeat', e.target.checked)}
              className="hidden"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Child Seat Required (+$20)
            </span>
          </label>

          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Fare</div>
              <div className="text-3xl font-extrabold text-[#18234B]">${baseTotal}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                GST included · No hidden fees
              </div>
            </div>
            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="bg-[#18234B] hover:bg-[#1f2d5c] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Contact Details (Left Side) - Updated to match HomePage design */}
          <div className="order-2 md:order-1 space-y-4">
            <h3 className="text-base font-bold text-[#18234B] mb-2">Contact Details</h3>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900 placeholder:text-gray-400"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <div className="flex gap-2">
                <input
                  value={form.countryCode}
                  onChange={e => update('countryCode', e.target.value)}
                  className="w-20 text-center rounded-lg border border-gray-300 px-2 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900 font-medium"
                />
                <input
                  value={form.phone}
                  onChange={e =>
                    update('phone', e.target.value.replace(/\D/g, ''))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900 placeholder:text-gray-400 font-medium"
                  placeholder="400000000"
                />
              </div>
            </div>

            {error && (
              <div className="flex gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={pay}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition shadow-lg shadow-green-500/20 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? 'Redirecting…' : `Pay & Confirm`} <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary Card (Right Side) - Updated Visuals */}
          <div className="order-1 md:order-2">
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 relative">
              <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
              <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>

              <h3 className="text-base font-bold text-[#18234B] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A61924]"></span>
                Trip Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Pickup</div>
                    <div className="font-bold text-[#18234B]">{pickupLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Date</div>
                    <div className="font-semibold text-gray-900">{form.pickupDate}</div>
                    <div className="text-xs text-[#A61924] bg-[#A61924]/10 px-1 rounded inline-block font-mono mt-0.5">{form.pickupTime}</div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Dropoff</div>
                    <div className="font-bold text-[#18234B]">{dropoffLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Details</div>
                    <div className="font-medium text-gray-900">{form.passengers} Pax, {form.luggage} Bags</div>
                    {form.childSeat && <div className="text-xs text-green-600 font-medium">+ Child Seat</div>}
                  </div>
                </div>
              </div>


              <div className="mt-5 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trip fare</span>
                  <span className="font-medium text-gray-900">${baseTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment processing (2.5%)</span>
                  <span className="font-medium text-gray-900">${processingFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 text-[#18234B] border-t border-gray-200 mt-2">
                  <span>Total Amount</span>
                  <span>${finalTotal}</span>
                </div>
                <p className="text-[10px] text-gray-400 pt-1 text-center">
                  Secure 256-bit SSL encrypted payment
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}