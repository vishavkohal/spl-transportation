'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, AlertTriangle, Repeat, Calendar, Clock, Users, Briefcase, Plane, CheckCircle, ChevronDown } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import {
  AFTER_HOURS_SURCHARGE,
  AFTER_HOURS_SURCHARGE_NOTICE,
  isAfterHours,
} from '@/app/lib/afterHours';
import { getStoredUtms } from '@/app/lib/utm';
import type { Route } from '@/app/types';
import { toast } from 'sonner';

const MAX_PASSENGERS = 7;
const MAX_LUGGAGE_LIMIT = 4; // Absolute fallback limit

/* ---------------- Utils ---------------- */

function parsePassengerRange(range: string): [number, number] {
  const [min, max] = range.split('-').map(Number);
  return [min, max];
}

function priceForPassengers(pricing: Route['pricing'], pax: number) {
  if (!pricing?.length) return 0;
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

function isPickupAtLeast30Mins(pickupDate: string, pickupTime: string) {
  if (!pickupDate || !pickupTime) return true;
  const [h, m] = pickupTime.split(':').map(Number);
  const dt = new Date(pickupDate);
  dt.setHours(h, m, 0, 0);
  return dt.getTime() - Date.now() >= 30 * 60_000;
}

function getMaxBagsForCurrentPax(pax: number): number {
  const count = pax || 1;
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
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const [step, setStep] = useState<1 | 2>(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickupLocation = direction === 'forward' ? route.from : route.to;
  const dropoffLocation = direction === 'forward' ? route.to : route.from;

  const [form, setForm] = useState({
    transferType: 'one-way',
    pickupDate: '',
    pickupTime: '',
    passengers: 1,
    luggage: 0,
    childSeat: false,
    flightNumber: '',
    returnDate: '',
    returnTime: '',
    returnFlightNumber: '',
    fullName: '',
    email: '',
    countryCode: '+61',
    phone: ''
  });

  const update = (k: string, v: any) =>
    setForm(p => ({ ...p, [k]: v }));

  const handlePassengerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > MAX_PASSENGERS) val = MAX_PASSENGERS;

    const newMaxLuggage = getMaxBagsForCurrentPax(val);
    setForm(prev => ({
      ...prev,
      passengers: val,
      luggage: prev.luggage > newMaxLuggage ? newMaxLuggage : prev.luggage
    }));
  };

  const handleLuggageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;

    const maxAllowed = getMaxBagsForCurrentPax(form.passengers);
    if (val > maxAllowed) return;

    update('luggage', val);
  };

  /* ---------------- Pricing ---------------- */

  const basePrice = useMemo(
    () => {
      let p = priceForPassengers(route.pricing, form.passengers);
      if (form.transferType === 'round-trip') p = p * 2;
      return p;
    },
    [route.pricing, form.passengers, form.transferType]
  );

  const baseTotal = basePrice + (form.childSeat ? 20 : 0) + (isAfterHours(form.pickupTime) ? AFTER_HOURS_SURCHARGE : 0) + (form.transferType === 'round-trip' && isAfterHours(form.returnTime) ? AFTER_HOURS_SURCHARGE : 0);
  const processingFee = calculateProcessingFee(baseTotal);
  const finalTotal = calculateFinalAmount(baseTotal);

  /* ---------------- Validation ---------------- */

  const isStep1Valid =
    Boolean(form.pickupDate) &&
    Boolean(form.pickupTime) &&
    form.passengers >= 1 &&
    form.passengers <= MAX_PASSENGERS;

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
      const utms = getStoredUtms();
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
          currency: 'AUD',
          utm: utms ?? undefined,
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
    if (!isStep2Valid) {
      toast.error('Please enter valid contact details.');
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

      sessionStorage.setItem('spl_stripe_redirect', '1');
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  }

  /* ---------------- UI ---------------- */

  const inputBase =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] text-black';

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

          {/* Transfer Type Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold mb-2">
            <button
              type="button"
              onClick={() => update('transferType', 'one-way')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                (form.transferType || 'one-way') === 'one-way'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              onClick={() => update('transferType', 'round-trip')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                form.transferType === 'round-trip'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Round Trip
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pr-1">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[#102A43]" />
                Pickup Date
              </label>
              <input
                type="date"
                min={minDate()}
                value={form.pickupDate}
                onChange={e => update('pickupDate', e.target.value)}
                className="w-full min-w-0 rounded-lg border border-gray-200 px-0.5 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] text-gray-900 bg-white"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <div className="flex items-center justify-between mb-1 ml-1">
                <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#102A43]" />
                  Time
                </label>
              </div>
              <input
                type="time"
                min={minTimeForDate(form.pickupDate)}
                value={form.pickupTime}
                onChange={e => update('pickupTime', e.target.value)}
                className="w-full min-w-0 rounded-lg border border-gray-200 px-1 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] text-gray-900 bg-white"
              />
              {form.pickupDate && form.pickupTime && !isPickupAtLeast30Mins(form.pickupDate, form.pickupTime) && (
                <div className="flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg bg-red-50/90 border border-red-200/90 text-red-700 text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Min 30 mins advance notice required</span>
                </div>
              )}
              {isAfterHours(form.pickupTime) && (
                <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px] text-amber-900 shadow-xs">
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>After-hours (9 PM - 5 AM): <strong>+$30 fee</strong></span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {form.transferType === 'round-trip' && (
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Return Transfer Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    min={form.pickupDate || minDate()}
                    value={form.returnDate || ''}
                    onChange={e => update('returnDate', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Return Time</label>
                  <input
                    type="time"
                    value={form.returnTime || ''}
                    onChange={e => update('returnTime', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Return Flight # (Optional)</label>
                  <input
                    type="text"
                    value={form.returnFlightNumber || ''}
                    onChange={e => update('returnFlightNumber', e.target.value)}
                    placeholder="e.g. QF802"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pr-1">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-[#102A43]" />
                Passengers
              </label>
              <div className="relative">
                <select
                  value={form.passengers}
                  onChange={handlePassengerChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] text-gray-900 bg-white appearance-none"
                >
                  {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-[#102A43]" />
                Luggage
                <span className="text-gray-400 text-[10px] ml-auto font-normal">(Max {getMaxBagsForCurrentPax(form.passengers)})</span>
              </label>
              <div className="relative">
                <select
                  value={form.luggage}
                  onChange={handleLuggageChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] text-gray-900 bg-white appearance-none"
                >
                  {Array.from({ length: getMaxBagsForCurrentPax(form.passengers) + 1 }, (_, i) => i).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2 md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-[#102A43]" />
                Flight Number (Optional)
              </label>
              <input
                type="text"
                value={form.flightNumber}
                onChange={e => update('flightNumber', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] text-gray-900 bg-white"
                placeholder="e.g. JQ953"
              />
            </div>

          </div>

          <label className="flex items-center space-x-2 cursor-pointer group py-1">
            <div
              className="w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0"
              style={{
                backgroundColor: form.childSeat ? '#0F766E' : 'transparent',
                borderColor: form.childSeat ? '#0F766E' : 'rgb(209 213 219)'
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
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
              Child Seat Required (+$20)
            </span>
          </label>

          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Fare</div>
              <div className="text-3xl font-extrabold text-[#102A43]">${baseTotal}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                GST included · No hidden fees
              </div>
            </div>
            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="bg-[#102A43] hover:bg-[#0C5D59] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
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
            <h3 className="text-base font-bold text-[#102A43] mb-2">Contact Details</h3>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900 placeholder:text-gray-400"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <div className="flex gap-2">
                <input
                  value={form.countryCode}
                  onChange={e => update('countryCode', e.target.value)}
                  className="w-20 text-center rounded-lg border border-gray-300 px-2 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900 font-medium"
                />
                <input
                  value={form.phone}
                  onChange={e =>
                    update('phone', e.target.value.replace(/\D/g, ''))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900 placeholder:text-gray-400 font-medium"
                  placeholder="400000000"
                />
              </div>
            </div>

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

              <h3 className="text-base font-bold text-[#102A43] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                Trip Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Pickup</div>
                    <div className="font-bold text-[#102A43]">{pickupLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Date</div>
                    <div className="font-semibold text-gray-900">{form.pickupDate}</div>
                    <div className="text-xs text-[#0F766E] bg-[#0F766E]/10 px-1 rounded inline-block font-mono mt-0.5">{form.pickupTime}</div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Dropoff</div>
                    <div className="font-bold text-[#102A43]">{dropoffLocation}</div>
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
                {isAfterHours(form.pickupTime) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      After-hours surcharge
                    </span>
                    <span className="font-medium text-amber-600">${AFTER_HOURS_SURCHARGE}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment processing (2.5%)</span>
                  <span className="font-medium text-gray-900">${processingFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 text-[#102A43] border-t border-gray-200 mt-2">
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
