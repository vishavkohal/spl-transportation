'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle, Calculator, ShieldCheck, Clock, FileText } from 'lucide-react';
import { COLORS } from '../lib/colors';

const PRIMARY_COLOR = COLORS.heading;
const ACCENT_COLOR = COLORS.primary;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    travelDate: '',
    travelTime: '',
    passengers: '1',
    pickupAddress: '',
    dropoffAddress: '',
    checkInBags: '0',
    carryOnBags: '0',
    childSeats: 'No',
    flightArrivalType: 'Arrival',
    flightArrivalNumber: '',
    flightArrivalTime: '',
    flightDepartureType: 'Departure',
    flightDepartureNumber: '',
    flightDepartureTime: '',
    fullName: '',
    email: '',
    phone: '',
    message: '',
    termsAccepted: false,
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setFormStatus('error');
      setErrorMessage('Please accept the terms and conditions before submitting.');
      return;
    }

    setFormStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit quote request.');
      }

      setFormStatus('success');
      setFormData({
        travelDate: '',
        travelTime: '',
        passengers: '1',
        pickupAddress: '',
        dropoffAddress: '',
        checkInBags: '0',
        carryOnBags: '0',
        childSeats: 'No',
        flightArrivalType: 'Arrival',
        flightArrivalNumber: '',
        flightArrivalTime: '',
        flightDepartureType: 'Departure',
        flightDepartureNumber: '',
        flightDepartureTime: '',
        fullName: '',
        email: '',
        phone: '',
        message: '',
        termsAccepted: false,
      });
    } catch (err: any) {
      setFormStatus('error');
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-[#f8fafc] transition-colors duration-300 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header - Focused on Custom Quote */}
        <div className="w-full text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Calculator className="w-4 h-4 text-[#0F766E]" />
            <span>CUSTOM QUOTE REQUEST</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#102A43] mb-4 tracking-tight">
            Request a Custom Transfer Quote
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Planning a private transfer, airport pickup, group tour, or custom itinerary? Submit your trip details below for a personalized fixed quote.
          </p>
        </div>
        {/* Responsive Grid: Benefits & Contact Info on Left, Custom Quote Form on Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">

          {/* Left Column: Custom Quote Benefits & Quick Contact Details */}
          <div className="w-full lg:col-span-4 bg-[#102A43] text-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-800 space-y-8 lg:sticky lg:top-24">

            {/* Why Request Custom Quote Banner (TOP FOCUS) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-700/80 pb-3">
                <Calculator className="w-5 h-5 text-[#2DD4BF]" />
                <h3 className="font-extrabold text-lg text-white">Why Request a Quote?</h3>
              </div>

              <ul className="text-xs sm:text-sm text-slate-200 space-y-3.5">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                  <span><strong>100% Fixed Fares:</strong> No hidden costs, toll surcharges, or peak pricing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                  <span><strong>Multi-stop & Charters:</strong> Perfect for corporate groups, weddings, and full-day tours.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                  <span><strong>Meet & Greet Included:</strong> Flight monitoring and driver assistance at arrivals.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                  <span><strong>Official Invoices:</strong> Receive a downloadable PDF quote ready for instant confirmation.</span>
                </li>
              </ul>
            </div>

            {/* Direct Contact Information */}
            <div className="pt-6 border-t border-slate-700/80 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Need Urgent Assistance?
              </h4>

              <ContactCardDark
                icon={Phone}
                title="Direct Phone"
                content="+61470032460"
                subtext="Call for immediate quotes or phone bookings"
                action="Call Driver"
                href="tel:+61470032460"
              />

              <ContactCardDark
                icon={Mail}
                title="Email Support"
                content="spltransportation.australia@gmail.com"
                subtext="Email us your travel itinerary anytime"
                action="Email Us"
                href="mailto:spltransportation.australia@gmail.com"
              />
            </div>

          </div>

          {/* Right Column: Custom Quote Form */}
          <div className="w-full lg:col-span-8 bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-slate-100">
            <div className="mb-6 sm:mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
                Request Your Custom Quote
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill in your trip details below. Our reservation team will review your request and calculate your exact fixed fare.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6">

              {/* Travel Date & Travel Time */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Travel Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    required
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                </div>

                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Travel Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="travelTime"
                    value={formData.travelTime}
                    onChange={handleChange}
                    required
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Passengers & Pickup Address */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Passengers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="passengers"
                    min="1"
                    max="14"
                    placeholder="Number of Passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    required
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                </div>

                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Pickup Location / Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pickupAddress"
                    placeholder="e.g. Cairns Airport Terminal or Hotel Name"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    required
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Drop-off Address */}
              <div className="w-full space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Drop-off Destination / Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dropoffAddress"
                  placeholder="e.g. Resort Name, Port Douglas, or Specific Address"
                  value={formData.dropoffAddress}
                  onChange={handleChange}
                  required
                  className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                />
              </div>

              {/* Check in Bags */}
              <div className="w-full space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Check-in Suitcases
                </label>
                <input
                  type="number"
                  name="checkInBags"
                  min="0"
                  placeholder="Number of large suitcases"
                  value={formData.checkInBags}
                  onChange={handleChange}
                  className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                />
              </div>

              {/* Carry on Bags & Child Seats */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Carry-on Bags
                  </label>
                  <input
                    type="number"
                    name="carryOnBags"
                    min="0"
                    placeholder="Number of small bags"
                    value={formData.carryOnBags}
                    onChange={handleChange}
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                </div>

                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Child / Booster Seats Needed
                  </label>
                  <select
                    name="childSeats"
                    value={formData.childSeats}
                    onChange={handleChange}
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  >
                    <option value="No">No child seats required</option>
                    <option value="Yes (1 Seat)">Yes (1 Child / Booster Seat)</option>
                    <option value="Yes (2 Seats)">Yes (2 Child / Booster Seats)</option>
                    <option value="Yes (3+ Seats)">Yes (3+ Seats)</option>
                  </select>
                </div>
              </div>

              {/* Select Flight Arrival Section */}
              <div className="w-full space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#102A43]">
                  Flight Arrival Details (Optional - for Airport Pickups)
                </label>
                <select
                  name="flightArrivalType"
                  value={formData.flightArrivalType}
                  onChange={handleChange}
                  className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 outline-none text-sm"
                >
                  <option value="Arrival">Arriving at Airport</option>
                  <option value="None">Not an Airport Pickup</option>
                </select>

                {formData.flightArrivalType === 'Arrival' && (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="flightArrivalNumber"
                      placeholder="Flight Number (e.g. QF672)"
                      value={formData.flightArrivalNumber}
                      onChange={handleChange}
                      className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 outline-none text-sm"
                    />
                    <input
                      type="time"
                      name="flightArrivalTime"
                      placeholder="Arrival Time"
                      value={formData.flightArrivalTime}
                      onChange={handleChange}
                      className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Personal Details Section */}
              <div className="w-full space-y-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-extrabold text-[#102A43]">
                  Your Contact Information <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                />

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address (Quote will be sent here)"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm transition-all"
                  />
                </div>

                <textarea
                  rows={4}
                  name="message"
                  placeholder="Special requests, multi-stops, oversized luggage, or additional trip details..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full box-border px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102A43]/20 focus:border-[#102A43] outline-none text-sm resize-none transition-all"
                ></textarea>
              </div>

              {/* Terms Checkbox */}
              <div className="w-full flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-[#102A43] rounded border-slate-300 focus:ring-[#102A43]"
                />
                <label htmlFor="termsAccepted" className="text-xs text-slate-600">
                  I accept the terms and conditions.
                </label>
              </div>

              {/* Error Banner */}
              {formStatus === 'error' && (
                <div className="w-full p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || 'Something went wrong. Please check your entries.'}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-300 text-white shadow-lg ${formStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#0F766E] hover:bg-[#0C5D59] hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xl'
                  }`}
              >
                {formStatus === 'idle' && (
                  <><span>Submit Custom Quote Request</span> <Send className="w-5 h-5 ml-1" /></>
                )}
                {formStatus === 'submitting' && (
                  <span className="animate-pulse">Calculating Your Custom Quote...</span>
                )}
                {formStatus === 'success' && (
                  <><span>Quote Request Submitted!</span> <CheckCircle className="w-5 h-5 ml-1 text-white" /></>
                )}
                {formStatus === 'error' && (
                  <><span>Retry Quote Request</span> <Send className="w-5 h-5 ml-1" /></>
                )}
              </button>

              {formStatus === 'success' && (
                <p className="w-full text-center text-xs text-green-700 bg-green-50 p-3 rounded-xl">
                  Thank you! Our reservation team has received your quote request and will generate your official custom fare quote shortly.
                </p>
              )}

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

// Dark Navy Helper Component for Contact Cards
function ContactCardDark({ icon: Icon, title, content, subtext, action, href }: any) {
  return (
    <a
      href={href}
      className="w-full flex items-start gap-4 bg-white/5 hover:bg-white/10 p-4 rounded-2xl 
                  border border-white/10 shadow-sm hover:shadow-md 
                  transition-all duration-300 hover:-translate-y-0.5 group"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0F766E] text-white shrink-0 group-hover:scale-105 transition-transform shadow-md">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-white mb-0.5">{title}</h4>
        <p className="text-slate-200 font-semibold text-xs mb-0.5 truncate">{content}</p>
        <p className="text-[11px] text-slate-400 mb-1.5">{subtext}</p>
        <span className="text-xs font-bold text-[#2DD4BF] group-hover:underline flex items-center gap-1">
          {action} →
        </span>
      </div>
    </a>
  );
}