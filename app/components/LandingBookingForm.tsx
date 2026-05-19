'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { useBooking } from '../providers/BookingProvider';
import { useDebouncedCallback } from 'use-debounce';
import { getStoredUtms } from '@/app/lib/utm';
import type { BookingFormData } from '../types';
import { toast } from 'sonner';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const MAX_PASSENGERS = 8;

function getMaxBagsForCurrentPax(pax: number): number {
  if (pax <= 5) return 3;
  if (pax === 6) return 2;
  if (pax <= MAX_PASSENGERS) return 4;
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
    const base = 'w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-black ';
    if (err) return base + 'bg-red-50 border border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500';
    return base + 'bg-white border border-gray-300 focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B]';
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
      <div className="rounded-[32px] bg-white/60 backdrop-blur-xl shadow-xl p-6 sm:p-10">

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: bookingStep === 1 ? '50%' : '100%', backgroundColor: ACCENT_COLOR }}
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
          {bookingStep === 1 ? 'Book Your Transfer' : 'Confirm & Pay'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {bookingStep === 1
            ? 'Select your route, date and passengers'
            : 'Review your trip and complete payment'}
        </p>

        {/* ============= STEP 1 ============= */}
        {bookingStep === 1 && (
          <div className="space-y-5">

            {routesLoading && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                Fetching available routes…
              </div>
            )}

            {/* Pickup & Dropoff */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Pickup
                  </label>
                  {getFieldError('pickupLocation') && <span className="text-xs font-bold text-red-500">Required</span>}
                </div>
                <select
                  value={formData.pickupLocation || ''}
                  onChange={e => handleInputChange('pickupLocation', e.target.value)}
                  onBlur={() => markTouched('pickupLocation')}
                  disabled={isPickupDisabled}
                  className={inputCls('pickupLocation') + (isPickupDisabled ? ' cursor-not-allowed opacity-60' : '')}
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
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Dropoff
                  </label>
                  {getFieldError('dropoffLocation') && <span className="text-xs font-bold text-red-500">Required</span>}
                </div>
                <select
                  value={formData.dropoffLocation || ''}
                  onChange={e => handleInputChange('dropoffLocation', e.target.value)}
                  onBlur={() => markTouched('dropoffLocation')}
                  disabled={isDropoffDisabled}
                  className={inputCls('dropoffLocation') + (isDropoffDisabled ? ' cursor-not-allowed opacity-60' : '')}
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
              </div>
            </div>

            {/* Date, Time, Passengers, Luggage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Date
                  </label>
                  {getFieldError('pickupDate') && <span className="text-xs font-bold text-red-500">Required</span>}
                </div>
                <input
                  type="date"
                  value={formData.pickupDate}
                  min={minDateForInput}
                  onChange={e => onPickupDateChange(e.target.value)}
                  onBlur={() => markTouched('pickupDate')}
                  className={inputCls('pickupDate')}
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Time
                  </label>
                  {getFieldError('pickupTime') && <span className="text-xs font-bold text-red-500">{getFieldError('pickupTime')}</span>}
                </div>
                <input
                  type="time"
                  value={formData.pickupTime}
                  min={getMinTimeForDate(formData.pickupDate)}
                  onChange={e => handleInputChange('pickupTime', e.target.value)}
                  onBlur={() => markTouched('pickupTime')}
                  className={inputCls('pickupTime')}
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Users className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Passengers
                  </label>
                  {getFieldError('passengers') && <span className="text-xs font-bold text-red-500">{getFieldError('passengers')}</span>}
                </div>
                <input
                  type="number" min={1} max={MAX_PASSENGERS}
                  value={passengerInput}
                  onChange={e => onPassengersChange(e.target.value)}
                  onBlur={onPassengersBlur}
                  className={inputCls('passengers')}
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Luggage
                    <span className="text-gray-400 text-[10px] ml-auto">(Max {getMaxBagsForCurrentPax(formData.passengers)})</span>
                  </label>
                </div>
                <input
                  type="number" min={0} max={getMaxBagsForCurrentPax(formData.passengers)}
                  value={luggageInput}
                  onChange={e => onLuggageChange(e.target.value)}
                  onBlur={onLuggageBlur}
                  className={inputCls('luggage')}
                />
              </div>
            </div>

            {/* Flight number */}
            <div>
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1">
                <Plane className="w-3 h-3" style={{ color: PRIMARY_COLOR }} /> Flight Number (Optional)
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
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div
                className="w-5 h-5 rounded border flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: formData.childSeat ? ACCENT_COLOR : 'white',
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
              <span className="text-sm font-medium text-gray-700">Child Seat (+$20)</span>
            </label>

            {/* Price + CTA */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-5">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Fare</div>
                <div className="text-3xl font-extrabold" style={{ color: PRIMARY_COLOR }}>
                  {calculatedPrice > 0 ? `$${calculatedPrice}` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">GST included · No hidden fees</div>
              </div>
              <button
                onClick={goToStep2}
                disabled={!isStep1Valid()}
                className="px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase text-white shadow-lg transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: isStep1Valid() ? PRIMARY_COLOR : undefined }}
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============= STEP 2 ============= */}
        {bookingStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Contact Details */}
            <div className="order-2 md:order-1 space-y-4">
              <h3 className="text-base font-bold" style={{ color: PRIMARY_COLOR }}>Contact Details</h3>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  onBlur={() => markTouched('fullName')}
                  className={inputCls('fullName')}
                  placeholder="e.g. John Doe"
                />
                {getFieldError('fullName') && <span className="text-xs text-red-500 mt-0.5 block">{getFieldError('fullName')}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  className={inputCls('email')}
                  placeholder="john@example.com"
                />
                {getFieldError('email') && <span className="text-xs text-red-500 mt-0.5 block">{getFieldError('email')}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <input
                  value={formData.contactNumber}
                  onChange={e => handleInputChange('contactNumber', e.target.value)}
                  onBlur={() => markTouched('contactNumber')}
                  className={inputCls('contactNumber')}
                  placeholder="+61 400 000 000"
                />
                {getFieldError('contactNumber') && <span className="text-xs text-red-500 mt-0.5 block">{getFieldError('contactNumber')}</span>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setBookingStep(1)}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={pay}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition shadow-lg shadow-green-500/20 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? 'Redirecting…' : 'Pay & Confirm'} <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="order-1 md:order-2">
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 relative">
                <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full" />
                <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full" />

                <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
                  Trip Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Pickup</div>
                      <div className="font-bold" style={{ color: PRIMARY_COLOR }}>{formData.pickupLocation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-0.5">Date</div>
                      <div className="font-semibold text-gray-900">{formData.pickupDate}</div>
                      <div className="text-xs font-mono px-1 rounded inline-block mt-0.5" style={{ color: ACCENT_COLOR, backgroundColor: `${ACCENT_COLOR}15` }}>
                        {formData.pickupTime}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gray-200" />

                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Dropoff</div>
                      <div className="font-bold" style={{ color: PRIMARY_COLOR }}>{formData.dropoffLocation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-0.5">Details</div>
                      <div className="font-medium text-gray-900">{formData.passengers} Pax, {formData.luggage} Bags</div>
                      {formData.childSeat && <div className="text-xs text-green-600 font-medium">+ Child Seat</div>}
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
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2" style={{ color: PRIMARY_COLOR }}>
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
    </div>
  );
}
