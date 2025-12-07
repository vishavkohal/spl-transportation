'use client';
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, MapPin, Calendar, Users, Briefcase, Plane, ArrowLeft, ArrowRight, Navigation, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import type { BookingFormData, Route } from '../types';
import { Services } from './Services';
import CustomerReviews from './CustomerReviews';
import PopularRoutes from './PopularRoutes';

const DiscountSticker = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 'calc(80px + 20px)', // below navbar (h-20 = 80px) + 20px gap
      right: '20px',
      zIndex: 9999,
      cursor: 'pointer'
    }}>
      <Image
        src="/sticker.png"
        alt="Discount sticker"
        width={240}
        height={80}
        priority={false}
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </div>
  );
};

export default function HomePage(props: {
  formData: BookingFormData;
  handleInputChange: (field: keyof BookingFormData, value: string | number | boolean) => void;
  bookingStep: number;
  setBookingStep: (n: number) => void;
  setCurrentPage: (p: string) => void;
  AVAILABLE_LOCATIONS: string[];
  dropoffOptions: string[];
  selectedRoute: Route | null;
  clearSelectedRoute: () => void;
  calculatedPrice: number;
}) {
  const { formData, handleInputChange, bookingStep, setBookingStep, AVAILABLE_LOCATIONS, dropoffOptions, selectedRoute, calculatedPrice } = props;

  // Ref for auto-scrolling
  const formTopRef = useRef<HTMLDivElement>(null);

  // Local input state
  const [passengerInput, setPassengerInput] = useState<string>(String(formData.passengers));
  const [luggageInput, setLuggageInput] = useState<string>(String(formData.luggage));
  
  // --- NEW: VALIDATION STATE ---
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Helper to mark a field as touched (triggering validation visual)
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // --- NEW: FORCE SCROLL TO TOP ON LOAD ---
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Sync local inputs
  useEffect(() => { setPassengerInput(String(formData.passengers)); }, [formData.passengers]);
  useEffect(() => { setLuggageInput(String(formData.luggage)); }, [formData.luggage]);

  // Scroll logic
  useEffect(() => {
    if (bookingStep === 2 && formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [bookingStep]);

  useEffect(() => {
    if (formData.pickupLocation && formData.dropoffLocation && formTopRef.current) {
      const timer = setTimeout(() => {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Helpers
  const now = new Date();
  const minDateForInput = new Date(now.getTime() + 0).toISOString().slice(0, 10);
  const minDateTime = new Date(now.getTime() + 30 * 60_000);

  function formatTime(date: Date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function minTimeForDate(dateStr?: string) {
    if (!dateStr) return '00:00';
    if (dateStr === minDateForInput) return formatTime(minDateTime);
    return '00:00';
  }

  function isPickupAtLeast30Mins() {
    if (!formData.pickupDate || !formData.pickupTime) return false;
    const [h, m] = formData.pickupTime.split(':').map(Number);
    const dt = new Date(formData.pickupDate);
    dt.setHours(h, m, 0, 0);
    return dt.getTime() - Date.now() >= 30 * 60_000;
  }

  // --- NEW: CENTRALIZED VALIDATION LOGIC ---
  const getFieldError = (field: string): string | null => {
    // Only show error if the field has been touched by the user
    if (!touched[field]) return null;

    const value = formData[field as keyof BookingFormData];

    switch (field) {
      case 'pickupLocation':
      case 'dropoffLocation':
      case 'pickupDate':
        return value ? null : 'Required';
      
      case 'pickupTime':
        if (!value) return 'Required';
        if (!isPickupAtLeast30Mins()) return 'Min 30 mins notice';
        return null;
      
      // Step 2 Validation
      case 'fullName':
        return value ? null : 'Name is required';
      case 'email':
        if (!value) return 'Email is required';
        // Simple email regex
        return /\S+@\S+\.\S+/.test(String(value)) ? null : 'Invalid email';
      case 'contactNumber':
        return value ? null : 'Mobile is required';
        
      default:
        return null;
    }
  };

  // --- NEW: DYNAMIC CLASS GENERATOR ---
  // This replaces the hardcoded classes. It swaps Yellow focus for Red Border/Ring if error exists.
  const getInputClass = (field: string, hasIconPadding: boolean = true) => {
    const error = getFieldError(field);
    const padding = hasIconPadding ? "pl-10" : "pl-4";
    
    const base = `w-full ${padding} pr-4 py-3 rounded-xl outline-none font-medium text-base transition-all duration-200 appearance-none relative z-10 `;
    const theme = "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white ";
    
    if (error) {
      // ERROR STATE (Red)
      return `${base} ${theme} border border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-red-300`;
    } else {
      // NORMAL STATE (Gray to Yellow)
      return `${base} ${theme} border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-400`;
    }
  };

  // Handlers
  const onPassengersChange = (v: string) => {
    setPassengerInput(v);
    if (/^\d+$/.test(v)) {
      const parsed = Math.max(1, Math.min(10, parseInt(v, 10)));
      handleInputChange('passengers', parsed);
    }
  };
  const onPassengersBlur = () => {
    if (!/^\d+$/.test(passengerInput)) {
      setPassengerInput(String(formData.passengers));
    } else {
      const parsed = Math.max(1, Math.min(10, parseInt(passengerInput, 10)));
      setPassengerInput(String(parsed));
      handleInputChange('passengers', parsed);
    }
  };

  const onLuggageChange = (v: string) => {
    setLuggageInput(v);
    if (/^\d+$/.test(v)) {
      const parsed = Math.max(0, Math.min(10, parseInt(v, 10)));
      handleInputChange('luggage', parsed);
    }
  };
  const onLuggageBlur = () => {
    if (!/^\d+$/.test(luggageInput)) {
      setLuggageInput(String(formData.luggage));
    } else {
      const parsed = Math.max(0, Math.min(10, parseInt(luggageInput, 10)));
      setLuggageInput(String(parsed));
      handleInputChange('luggage', parsed);
    }
  };

  const onPickupDateChange = (v: string) => {
    handleInputChange('pickupDate', v);
    const minT = minTimeForDate(v);
    if (v === minDateForInput && formData.pickupTime && formData.pickupTime < minT) {
      handleInputChange('pickupTime', minT);
    }
  };

  // Step 2 Validation Check before submission
  const validateStep2 = () => {
    const fields = ['fullName', 'email', 'contactNumber'];
    const newTouched = { ...touched };
    let isValid = true;
    
    fields.forEach(f => {
      newTouched[f] = true;
      if (!formData[f as keyof BookingFormData]) isValid = false;
      // specific email check
      if (f === 'email' && !/\S+@\S+\.\S+/.test(formData.email)) isValid = false;
    });
    
    setTouched(newTouched);
    return isValid;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-5 md:pt-14">
      {/* Hero Section */}
      <div className="relative h-[500px] lg:h-[550px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80')" }}
        ></div>
        
        <div className="relative z-20 h-full container mx-auto px-4 flex items-center justify-center text-center">
          <div className="max-w-2xl py-10 lg:py-0">
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-bold tracking-wider mb-4 backdrop-blur-sm border border-yellow-400/30">
              PREMIUM TRANSFERS
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Your Ride, <br />
              <span className="text-yellow-400">Perfected.</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-lg">
              Experience reliable, comfortable transportation across Queensland. 
            </p>
          </div>
        </div>
      </div>

      {/* Floating Booking Form */}
      <div className="container max-w-5xl mx-auto px-4 relative z-30 -mt-32 lg:-mt-24 mb-20">
        <div 
          ref={formTopRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-xl overflow-hidden transition-colors duration-300"
        >
          
          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700">
            <div 
              className="h-full bg-yellow-400 transition-all duration-500 ease-out"
              style={{ width: bookingStep === 1 ? '50%' : '100%' }}
            ></div>
          </div>

          <div className="p-6 lg:p-8">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {bookingStep === 1 ? 'Booking Details' : 'Confirm & Pay'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {bookingStep === 1 ? 'Enter your trip information below' : 'Review your trip and add contact info'}
                </p>
              </div>

              <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 self-start md:self-auto">
                <div className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-default ${bookingStep === 1 ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                  1. Ride
                </div>
                <div className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-default ${bookingStep === 2 ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                  2. Checkout
                </div>
              </div>
            </div>

            {bookingStep === 1 ? (
              <div className="space-y-6">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* 1. Route Section (Col Span 5) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Pickup */}
                    <div className="group relative">
                      <MapPin className={`absolute left-3 top-9 ${getFieldError('pickupLocation') ? 'text-red-500' : 'text-yellow-500'} w-5 h-5 z-20 pointer-events-none transition-colors`} />
                      <div className="flex justify-between">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Pickup</label>
                        {getFieldError('pickupLocation') && <span className="text-xs font-bold text-red-500 animate-pulse">Required</span>}
                      </div>
                      <select
                        name="pickupLocation"
                        value={formData.pickupLocation || ''}
                        onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                        onBlur={() => markTouched('pickupLocation')}
                        className={getInputClass('pickupLocation')}
                      >
                        <option value="">Select Location</option>
                        {Array.isArray(AVAILABLE_LOCATIONS) && AVAILABLE_LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dropoff */}
                    <div className="group relative">
                      <MapPin className={`absolute left-3 top-9 ${getFieldError('dropoffLocation') ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} w-5 h-5 z-20 pointer-events-none transition-colors`} />
                      <div className="flex justify-between">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Dropoff</label>
                        {getFieldError('dropoffLocation') && <span className="text-xs font-bold text-red-500 animate-pulse">Required</span>}
                      </div>
                      <select
                        name="dropoffLocation"
                        value={formData.dropoffLocation || ''}
                        onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                        onBlur={() => markTouched('dropoffLocation')}
                        className={getInputClass('dropoffLocation')}
                      >
                        <option value="">Select Destination</option>
                        {Array.isArray(dropoffOptions) && dropoffOptions.length === 0 ? (
                          <option value="" disabled>Select pickup first</option>
                        ) : (
                          (dropoffOptions || []).map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* 2. Date, Time & Details Section (Col Span 7) */}
                  <div className="lg:col-span-7">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                        
                        {/* Date Input */}
                        <div className="col-span-1 sm:col-span-2">
                            <div className="relative group">
                                <div className="flex justify-between">
                                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Date</label>
                                  {getFieldError('pickupDate') && <span className="text-xs font-bold text-red-500">Required</span>}
                                </div>
                                <div className="relative">
                                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 ${getFieldError('pickupDate') ? 'text-red-500' : 'text-gray-400 group-focus-within:text-yellow-500'} w-5 h-5 pointer-events-none z-20 transition-colors`} />
                                    <input
                                        type="date"
                                        value={formData.pickupDate}
                                        min={minDateForInput}
                                        onChange={(e) => onPickupDateChange(e.target.value)}
                                        onBlur={() => markTouched('pickupDate')}
                                        className={`${getInputClass('pickupDate')} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Time Input */}
                        <div className="col-span-1 sm:col-span-2">
                            <div className="relative group">
                                <div className="flex justify-between">
                                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Time</label>
                                  {/* Show short error next to label if space permits, or under input */}
                                </div>
                                <div className="relative">
                                    <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 ${getFieldError('pickupTime') ? 'text-red-500' : 'text-gray-400 group-focus-within:text-yellow-500'} w-5 h-5 pointer-events-none z-20 transition-colors`} />
                                    <input
                                        type="time"
                                        value={formData.pickupTime}
                                        min={minTimeForDate(formData.pickupDate)}
                                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                                        onBlur={() => markTouched('pickupTime')}
                                        className={`${getInputClass('pickupTime')} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                </div>
                                {/* Dedicated Error Message for Time Logic */}
                                {getFieldError('pickupTime') && (
                                  <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-[10px] text-red-500 font-bold animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3 h-3" /> {getFieldError('pickupTime')}
                                  </div>
                                )}
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="col-span-1 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Pax</label>
                            <div className="relative group">
                                <Users className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none z-20 group-focus-within:text-yellow-500 transition-colors" />
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={passengerInput}
                                    onChange={(e) => onPassengersChange(e.target.value)}
                                    onBlur={onPassengersBlur}
                                    className={getInputClass('passengers').replace('pl-10', 'pl-9')}
                                />
                            </div>
                        </div>

                        {/* Luggage */}
                        <div className="col-span-1 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Bags</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none z-20 group-focus-within:text-yellow-500 transition-colors" />
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={luggageInput}
                                    onChange={(e) => onLuggageChange(e.target.value)}
                                    onBlur={onLuggageBlur}
                                    className={getInputClass('luggage').replace('pl-10', 'pl-9')}
                                />
                            </div>
                        </div>

                        {/* Flight # */}
                        <div className="col-span-2 md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 ml-1">Flight #</label>
                            <div className="relative group">
                                <Plane className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none z-20 group-focus-within:text-yellow-500 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.flightNumber}
                                    onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                                    placeholder="Optional"
                                    className={getInputClass('flightNumber').replace('pl-10', 'pl-9')}
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Address Fields */}
                {(formData.pickupLocation || formData.dropoffLocation) && (
                  <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                    {formData.pickupLocation && (
                      <input
                        type="text"
                        value={formData.pickupAddress}
                        onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                        placeholder="Enter specific pickup address (Optional)"
                        className={getInputClass('pickupAddress', false)}
                      />
                    )}
                    {formData.dropoffLocation && (
                      <input
                        type="text"
                        value={formData.dropoffAddress}
                        onChange={(e) => handleInputChange('dropoffAddress', e.target.value)}
                        placeholder="Enter specific dropoff address (Optional)"
                        className={getInputClass('dropoffAddress', false)}
                      />
                    )}
                  </div>
                )}

                {/* Route & Price Card */}
                {calculatedPrice > 0 && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                          <span className="text-gray-500 dark:text-gray-400 font-normal">Route:</span>
                          <span className="truncate">{formData.pickupLocation}</span>
                          <ArrowRight className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="truncate">{formData.dropoffLocation}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-300">
                          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-600">
                            <Navigation className="w-3 h-3 text-yellow-500" />
                            <span>Distance: <span className="font-semibold text-gray-900 dark:text-white">{selectedRoute?.distance || '-- km'}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-600">
                            <Clock className="w-3 h-3 text-yellow-500" />
                            <span>Duration: <span className="font-semibold text-gray-900 dark:text-white">{selectedRoute?.duration || '-- min'}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto text-right border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-600 pt-3 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between items-center md:items-end">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Fare</span>
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                          ${calculatedPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.childSeat ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300 dark:border-gray-500 bg-transparent'}`}>
                        {formData.childSeat && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.childSeat}
                        onChange={(e) => handleInputChange('childSeat', e.target.checked)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Child Seat (+$20)</span>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                        // Force all validations to show if user tries to click continue early
                        const fields = ['pickupLocation', 'dropoffLocation', 'pickupDate', 'pickupTime'];
                        let valid = true;
                        const newTouched = {...touched};
                        fields.forEach(f => {
                            newTouched[f] = true;
                            if (!formData[f as keyof BookingFormData]) valid = false;
                        });
                        if (!isPickupAtLeast30Mins()) {
                             newTouched['pickupTime'] = true;
                             valid = false;
                        }
                        setTouched(newTouched);
                        
                        if (valid && isPickupAtLeast30Mins()) {
                            setBookingStep(2);
                        }
                    }}
                    type="button" // Changed to type=button to prevent form submission if inside form tag
                    className="w-full md:w-auto bg-yellow-400 text-black px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase hover:bg-yellow-500 transition-all shadow-lg hover:shadow-yellow-400/20 flex items-center justify-center gap-2"
                  >
                    Continue Booking <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: Summary & Contact */
              <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Summary (Left) */}
                <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 relative order-1">
                  <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white dark:bg-gray-800 rounded-full"></div>
                  <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white dark:bg-gray-800 rounded-full"></div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Trip Summary
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formData.pickupLocation}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{formData.pickupAddress}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Date</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{formData.pickupDate}</span>
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-mono bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">{formData.pickupTime}</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700"></div>

                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formData.dropoffLocation}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{formData.dropoffAddress}</span>
                      </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Details</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.passengers} Pax, {formData.luggage} Bags</span>
                          {formData.childSeat && <span className="text-xs text-green-600 dark:text-green-400">+ Child Seat</span>}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end">
                      <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">Total Quote</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {selectedRoute && <span>{selectedRoute.distance} • {selectedRoute.duration}</span>}
                          </div>
                      </div>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">${calculatedPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Form (Right) */}
                <div className="w-full md:w-1/2 flex flex-col justify-between order-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Details</h3>
                    
                    <div className="space-y-3">
                       <div>
                        <div className="flex justify-between">
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Full Name</label>
                           {getFieldError('fullName') && <span className="text-xs text-red-500 font-bold">{getFieldError('fullName')}</span>}
                        </div>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          onBlur={() => markTouched('fullName')}
                          className={getInputClass('fullName', false)}
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between">
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email</label>
                           {getFieldError('email') && <span className="text-xs text-red-500 font-bold">{getFieldError('email')}</span>}
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onBlur={() => markTouched('email')}
                          className={getInputClass('email', false)}
                          placeholder="john@example.com"
                        />
                      </div>
                       <div>
                        <div className="flex justify-between">
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Mobile</label>
                           {getFieldError('contactNumber') && <span className="text-xs text-red-500 font-bold">{getFieldError('contactNumber')}</span>}
                        </div>
                        <input
                          type="tel"
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          onBlur={() => markTouched('contactNumber')}
                          className={getInputClass('contactNumber', false)}
                          placeholder="+61 400 000 000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                          if(validateStep2()) {
                             // Propagate Submit Logic
                             console.log("Ready to submit");
                          }
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                      Confirm Booking <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PopularRoutes />
      <Services />
      <CustomerReviews />  
    </div>
  );
}   