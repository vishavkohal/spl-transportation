'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Plane,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Shield,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useBooking } from '../providers/BookingProvider';
import { useDebouncedCallback } from 'use-debounce';
import {
  AFTER_HOURS_SURCHARGE,
  AFTER_HOURS_SURCHARGE_NOTICE,
  isAfterHours,
} from '@/app/lib/afterHours';
import { getStoredUtms } from '@/app/lib/utm';
import type { BookingFormData } from '../types';
import { toast } from 'sonner';

import { COLORS } from '../lib/colors';

const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.primary;
const MAX_PASSENGERS = 7;

function getMaxBagsForCurrentPax(pax: number): number {
  const count = pax || 1;
  if (count <= 5) return 3;
  if (count === 6) return 2;
  if (count <= MAX_PASSENGERS) return 4;
  return 4;
}

function getMinDateForInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getMinTimeForDate(dateStr: string | undefined) {
  const now = new Date();
  const minDate = getMinDateForInput();
  if (!dateStr) return '00:00';
  if (dateStr === minDate) return formatTime(new Date(now.getTime() + 30 * 60_000));
  return '00:00';
}

function isPickupAtLeast30Mins(pickupDate: string, pickupTime: string) {
  if (!pickupDate || !pickupTime) return false;
  const [h, m] = pickupTime.split(':').map(Number);
  const dt = new Date(pickupDate);
  dt.setHours(h, m, 0, 0);
  return dt.getTime() - Date.now() >= 30 * 60_000;
}

const PAYMENT_FEE_RATE = 0.025;

function calculateProcessingFee(amount: number) {
  return Number((amount * PAYMENT_FEE_RATE).toFixed(2));
}

/* ─── Reusable sub-components ─── */



function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-500 mt-1.5">
      <AlertCircle className="w-3 h-3" />
      {error}
    </span>
  );
}

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
          style={{
            backgroundColor: current >= 1 ? PRIMARY_COLOR : '#e5e7eb',
            color: current >= 1 ? '#fff' : '#9ca3af',
          }}
        >
          {current > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
        </div>
        <span
          className="text-xs font-semibold hidden xs:inline"
          style={{ color: current >= 1 ? PRIMARY_COLOR : '#9ca3af' }}
        >
          Trip Details
        </span>
      </div>

      {/* Connector */}
      <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: current >= 2 ? '100%' : '0%',
            backgroundColor: PRIMARY_COLOR,
          }}
        />
      </div>

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
          style={{
            backgroundColor: current >= 2 ? PRIMARY_COLOR : '#e5e7eb',
            color: current >= 2 ? '#fff' : '#9ca3af',
          }}
        >
          2
        </div>
        <span
          className="text-xs font-semibold hidden xs:inline"
          style={{ color: current >= 2 ? PRIMARY_COLOR : '#9ca3af' }}
        >
          Confirm & Pay
        </span>
      </div>
    </div>
  );
}

export default function LandingBookingForm() {
  const {
    formData,
    handleInputChange,
    bookingStep,
    setBookingStep,
    availableLocations,
    dropoffOptions,
    currentRoute,
    calculatedPrice,
    routesLoading,
  } = useBooking();

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passengerInput, setPassengerInput] = useState(String(formData.passengers));
  const [luggageInput, setLuggageInput] = useState(String(formData.luggage));

  const minDateForInput = getMinDateForInput();
  const markTouched = (f: string) => setTouched(p => ({ ...p, [f]: true }));

  useEffect(() => { setPassengerInput(String(formData.passengers)); }, [formData.passengers]);
  useEffect(() => { setLuggageInput(String(formData.luggage)); }, [formData.luggage]);

  // Scroll to top of form on step change
  useEffect(() => {
    if (bookingStep === 2) {
      document.getElementById('landing-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [bookingStep]);

  /* --- Field Error --- */
  const getFieldError = (field: string): string | null => {
    if (!touched[field]) return null;
    const value = formData[field as keyof BookingFormData];
    switch (field) {
      case 'pickupLocation':
      case 'dropoffLocation':
      case 'pickupDate':
        return value ? null : 'Required';
      case 'pickupTime':
        if (!value) return 'Required';
        if (!isPickupAtLeast30Mins(formData.pickupDate, String(value))) return 'Min 30 mins notice';
        return null;
      case 'passengers':
        return formData.passengers > MAX_PASSENGERS ? `Max ${MAX_PASSENGERS}` : null;
      case 'luggage': {
        const max = getMaxBagsForCurrentPax(formData.passengers);
        return formData.luggage > max ? `Max ${max} bags` : null;
      }
      case 'fullName':
        return value ? null : 'Required';
      case 'email':
        if (!value) return 'Required';
        return /\S+@\S+\.\S+/.test(String(value)) ? null : 'Invalid email';
      case 'contactNumber':
        return value ? null : 'Required';
      default:
        return null;
    }
  };

  const inputCls = (field: string) => {
    const err = getFieldError(field);
    const base =
      'landing-form-input w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-gray-900 placeholder-gray-400 outline-none ';
    if (err)
      return (
        base +
        'bg-red-50 border-2 border-red-400 ring-0 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
      );
    return (
      base +
      'bg-gray-50/80 border-2 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10'
    );
  };

  const selectCls = (field: string, disabled: boolean) => {
    return inputCls(field) + ' appearance-none' + (disabled ? ' cursor-not-allowed opacity-60' : '');
  };

  /* --- Passenger/luggage handlers --- */
  const onPassengersChange = (v: string) => {
    setPassengerInput(v);
    if (/^\d+$/.test(v)) {
      const parsed = Math.max(1, Math.min(MAX_PASSENGERS, parseInt(v, 10)));
      handleInputChange('passengers', parsed);
      const maxBags = getMaxBagsForCurrentPax(parsed);
      if (formData.luggage > maxBags) {
        handleInputChange('luggage', maxBags);
        setLuggageInput(String(maxBags));
      }
    }
  };

  const onPassengersBlur = () => {
    markTouched('passengers');
    const parsed = Math.max(1, Math.min(MAX_PASSENGERS, parseInt(passengerInput, 10) || 1));
    setPassengerInput(String(parsed));
    handleInputChange('passengers', parsed);
  };

  const onLuggageChange = (v: string) => {
    setLuggageInput(v);
    if (/^\d+$/.test(v)) handleInputChange('luggage', Math.max(0, parseInt(v, 10)));
  };

  const onLuggageBlur = () => {
    markTouched('luggage');
    const max = getMaxBagsForCurrentPax(formData.passengers);
    const parsed = Math.max(0, Math.min(parseInt(luggageInput, 10) || 0, max));
    setLuggageInput(String(parsed));
    handleInputChange('luggage', parsed);
  };

  const onPickupDateChange = (v: string) => {
    handleInputChange('pickupDate', v);
    const minT = getMinTimeForDate(v);
    if (v === minDateForInput && formData.pickupTime && formData.pickupTime < minT) {
      handleInputChange('pickupTime', minT);
    }
  };

  /* --- Validation --- */
  const isStep1Valid = () => {
    if (!currentRoute || calculatedPrice <= 0) return false;
    if (!formData.pickupLocation || !formData.dropoffLocation || !formData.pickupDate) return false;
    if (!formData.pickupTime || !isPickupAtLeast30Mins(formData.pickupDate, formData.pickupTime)) return false;
    if (formData.passengers > MAX_PASSENGERS) return false;
    if (formData.luggage > getMaxBagsForCurrentPax(formData.passengers)) return false;
    return true;
  };

  const isStep2Valid = () => {
    const { fullName, email, contactNumber } = formData;
    if (!fullName || !email || !contactNumber) return false;
    return /\S+@\S+\.\S+/.test(String(email));
  };

  const goToStep2 = () => {
    ['pickupLocation', 'dropoffLocation', 'pickupDate', 'pickupTime', 'passengers', 'luggage'].forEach(f => markTouched(f));
    if (isStep1Valid()) setBookingStep(2);
  };

  /* --- Lead autosave --- */
  const saveLead = useDebouncedCallback(async () => {
    if (bookingStep !== 2) return;
    if (!formData.email && !formData.contactNumber) return;
    try {
      const utms = getStoredUtms();
      const res = await fetch('/api/leads/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          bookingType: 'standard',
          source: 'landing-page',
          quotedPrice: calculatedPrice,
          utm: utms ?? undefined,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data?.leadId && !leadId) setLeadId(data.leadId);
    } catch {}
  }, 2500);

  useEffect(() => { saveLead(); }, [bookingStep, formData.fullName, formData.email, formData.contactNumber, saveLead]);

  /* --- Payment --- */
  async function pay() {
    ['fullName', 'email', 'contactNumber'].forEach(f => markTouched(f));
    if (!isStep2Valid()) { 
      toast.error('Please fill in all contact details correctly.'); 
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
            ...formData,
            ...getStoredUtms(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Payment failed');
      sessionStorage.setItem('spl_stripe_redirect', '1');
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  }

  /* --- Pricing --- */
  const baseTotal = calculatedPrice;
  const processingFee = calculateProcessingFee(baseTotal);
  const finalTotal = baseTotal + processingFee;

  const isPickupDisabled = routesLoading || availableLocations.length === 0;
  const isDropoffDisabled = routesLoading || !formData.pickupLocation || dropoffOptions.length === 0;

  return (
    <div id="landing-booking" className="scroll-mt-24">
      <div className="landing-form-card rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl">

        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: bookingStep === 1 ? '50%' : '100%',
              backgroundColor: ACCENT_COLOR,
            }}
          />
        </div>

        {/* Card body */}
        <div className="px-5 sm:px-8 py-6 sm:py-8">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: PRIMARY_COLOR }}>
              {bookingStep === 1 ? 'Book Your Transfer' : 'Confirm & Pay'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {bookingStep === 1
                ? 'Enter your trip information below'
                : 'Review your trip and complete payment'}
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={bookingStep as 1 | 2} />

          {/* ============= STEP 1 ============= */}
          {bookingStep === 1 && (
            <div className="space-y-6">

              {routesLoading && (
                <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 font-medium">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent flex-shrink-0" />
                  Fetching available routes…
                </div>
              )}

              {/* ── Transfer Type Toggle ── */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold mb-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('transferType', 'one-way')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    (formData.transferType || 'one-way') === 'one-way'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('transferType', 'round-trip')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    formData.transferType === 'round-trip'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Round Trip
                </button>
              </div>

              {/* ── Route + Schedule in one row ── */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_0.6fr_0.5fr] gap-3 sm:gap-4">
                  {/* Pickup */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Pickup
                    </label>
                    <div className="relative">
                      <select
                        value={formData.pickupLocation || ''}
                        onChange={e => handleInputChange('pickupLocation', e.target.value)}
                        onBlur={() => markTouched('pickupLocation')}
                        disabled={isPickupDisabled}
                        className={selectCls('pickupLocation', isPickupDisabled)}
                      >
                        {routesLoading ? (
                          <option value="">Loading…</option>
                        ) : (
                          <>
                            <option value="">Select Location</option>
                            {availableLocations.filter(l => !l.toLowerCase().includes('day trip')).map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <FieldError error={getFieldError('pickupLocation')} />
                  </div>

                  {/* Dropoff */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Dropoff
                    </label>
                    <div className="relative">
                      <select
                        value={formData.dropoffLocation || ''}
                        onChange={e => handleInputChange('dropoffLocation', e.target.value)}
                        onBlur={() => markTouched('dropoffLocation')}
                        disabled={isDropoffDisabled}
                        className={selectCls('dropoffLocation', isDropoffDisabled)}
                      >
                        {!formData.pickupLocation && !routesLoading && <option value="">Select pickup first</option>}
                        {formData.pickupLocation && routesLoading && <option value="">Loading…</option>}
                        {formData.pickupLocation && !routesLoading && dropoffOptions.length === 0 && <option value="">No destinations</option>}
                        {formData.pickupLocation && !routesLoading && dropoffOptions.length > 0 && (
                          <>
                            <option value="">Select Destination</option>
                            {dropoffOptions.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <FieldError error={getFieldError('dropoffLocation')} />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.pickupDate}
                      min={minDateForInput}
                      onChange={e => onPickupDateChange(e.target.value)}
                      onBlur={() => markTouched('pickupDate')}
                      className={inputCls('pickupDate')}
                    />
                    <FieldError error={getFieldError('pickupDate')} />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.pickupTime}
                      min={getMinTimeForDate(formData.pickupDate)}
                      onChange={e => handleInputChange('pickupTime', e.target.value)}
                      onBlur={() => markTouched('pickupTime')}
                      className={inputCls('pickupTime')}
                    />
                    <FieldError error={getFieldError('pickupTime')} />
                    {isAfterHours(formData.pickupTime) && (
                      <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 shadow-xs">
                        <span className="font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>After-hours (9 PM - 5 AM): <strong>+$30 surcharge</strong></span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formData.transferType === 'round-trip' && (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Return Transfer Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Return Date</label>
                      <input
                        type="date"
                        min={formData.pickupDate || minDateForInput}
                        value={formData.returnDate || ''}
                        onChange={e => handleInputChange('returnDate', e.target.value)}
                        className={inputCls('returnDate')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Return Time</label>
                      <input
                        type="time"
                        value={formData.returnTime || ''}
                        onChange={e => handleInputChange('returnTime', e.target.value)}
                        className={inputCls('returnTime')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Return Flight # (Optional)</label>
                      <input
                        type="text"
                        value={formData.returnFlightNumber || ''}
                        onChange={e => handleInputChange('returnFlightNumber', e.target.value)}
                        placeholder="e.g. QF802"
                        className={inputCls('returnFlightNumber')}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Passengers */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Passengers
                    </label>
                    <input
                      type="number" min={1} max={MAX_PASSENGERS}
                      value={passengerInput}
                      onChange={e => onPassengersChange(e.target.value)}
                      onBlur={onPassengersBlur}
                      className={inputCls('passengers')}
                    />
                    <FieldError error={getFieldError('passengers')} />
                  </div>

                  {/* Luggage */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Luggage{' '}
                      <span className="text-gray-400 font-normal">(Max {getMaxBagsForCurrentPax(formData.passengers)})</span>
                    </label>
                    <input
                      type="number" min={0} max={getMaxBagsForCurrentPax(formData.passengers)}
                      value={luggageInput}
                      onChange={e => onLuggageChange(e.target.value)}
                      onBlur={onLuggageBlur}
                      className={inputCls('luggage')}
                    />
                    <FieldError error={getFieldError('luggage')} />
                  </div>
                </div>
              </div>

              {/* ── Extras Section ── */}
              <div>

                {/* Flight number */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Flight Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.flightNumber}
                    onChange={e => handleInputChange('flightNumber', e.target.value)}
                    placeholder="e.g. JQ953"
                    className={inputCls('flightNumber')}
                  />
                </div>

                {/* Child seat */}
                <label className="flex items-center gap-2 cursor-pointer group py-1">
                  <div
                    className="w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0"
                    style={{
                      backgroundColor: formData.childSeat ? ACCENT_COLOR : 'transparent',
                      borderColor: formData.childSeat ? ACCENT_COLOR : 'rgb(209 213 219)',
                    }}
                  >
                    {formData.childSeat && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.childSeat}
                    onChange={e => handleInputChange('childSeat', e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 whitespace-nowrap">
                    Child Seat (+$20)
                  </span>
                </label>
              </div>

              {/* ── Price + CTA ── */}
              <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50 p-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Fare</div>
                    <div className="text-3xl sm:text-4xl font-extrabold mt-1" style={{ color: PRIMARY_COLOR }}>
                      {calculatedPrice > 0 ? `$${calculatedPrice}` : '—'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> GST included · No hidden fees
                    </div>
                  </div>
                  <button
                    onClick={goToStep2}
                    disabled={!isStep1Valid()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed bg-[#102A43] hover:bg-[#0C5D59] hover:shadow-xl active:scale-[0.98]"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============= STEP 2 ============= */}
          {bookingStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Contact Details */}
              <div className="order-2 md:order-1 space-y-5">


                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Full Name</label>
                  <input
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    onBlur={() => markTouched('fullName')}
                    className={inputCls('fullName')}
                    placeholder="e.g. John Doe"
                  />
                  <FieldError error={getFieldError('fullName')} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Email Address</label>
                  <input
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    onBlur={() => markTouched('email')}
                    className={inputCls('email')}
                    placeholder="john@example.com"
                  />
                  <FieldError error={getFieldError('email')} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Phone Number</label>
                  <input
                    value={formData.contactNumber}
                    onChange={e => handleInputChange('contactNumber', e.target.value)}
                    onBlur={() => markTouched('contactNumber')}
                    className={inputCls('contactNumber')}
                    placeholder="+61 400 000 000"
                  />
                  <FieldError error={getFieldError('contactNumber')} />
                </div>

                {/* Promo Code Input */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Have a promo code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.promoCode || ''}
                      onChange={e => handleInputChange('promoCode', e.target.value.toUpperCase())}
                      placeholder="e.g. SUMMER10"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold tracking-wider text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.promoCode) return;
                        try {
                          const res = await fetch('/api/promos/validate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              code: formData.promoCode,
                              amount: calculatedPrice,
                              transferType: formData.transferType || 'one-way',
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Invalid promo code');
                          handleInputChange('appliedDiscount', data.promo);
                          toast.success(`Code ${data.promo.code} applied! -$${data.promo.discountAmount} AUD`);
                        } catch (err: any) {
                          toast.error(err.message || 'Invalid promo code');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#102A43] text-white hover:bg-[#0F766E] transition"
                    >
                      Apply
                    </button>
                  </div>
                  {formData.appliedDiscount && (
                    <div className="text-[11px] font-bold text-emerald-700">
                      ✓ Promo Code {formData.appliedDiscount.code} applied (-${formData.appliedDiscount.discountAmount} AUD)
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-5 py-3.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={pay}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 shadow-lg shadow-green-600/20 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Pay & Confirm
                      </>
                    )}
                  </button>
                </div>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 pt-2 opacity-60">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <Shield className="w-3 h-3" /> SSL Secured
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <CreditCard className="w-3 h-3" /> Stripe Payments
                  </div>
                </div>
              </div>

              {/* Trip Summary */}
              <div className="order-1 md:order-2">
                <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Summary header */}
                  <div className="px-5 py-4 border-b border-gray-200" style={{ backgroundColor: `${PRIMARY_COLOR}08` }}>
                    <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
                      Trip Summary
                    </h3>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Route */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: PRIMARY_COLOR }} />
                        <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: `${PRIMARY_COLOR}30` }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pickup</div>
                          <div className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>{formData.pickupLocation}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Dropoff</div>
                          <div className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>{formData.dropoffLocation}</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gray-200" />

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Date</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.pickupDate}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Time</div>
                        <div className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>{formData.pickupTime}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Passengers</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.passengers} Pax</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Luggage</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.luggage} Bags</div>
                      </div>
                    </div>
                    {formData.childSeat && (
                      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 font-medium border border-green-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Child Seat Included
                      </div>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-200 px-5 py-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Trip fare</span>
                      <span className="font-semibold text-gray-900">${baseTotal}</span>
                    </div>
                    {isAfterHours(formData.pickupTime) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          After-hours surcharge
                        </span>
                        <span className="font-semibold text-amber-600">${AFTER_HOURS_SURCHARGE}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment processing (2.5%)</span>
                      <span className="font-semibold text-gray-900">${processingFee}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex justify-between font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
                      <span>Total</span>
                      <span>${finalTotal}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center pt-1 flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Secure 256-bit SSL encrypted payment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
