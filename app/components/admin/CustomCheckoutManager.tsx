'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  Send,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  DollarSign,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  FileText,
} from 'lucide-react';

const QUICK_LOCATIONS = [
  'Cairns Airport',
  'Cairns City',
  'Port Douglas',
  'Palm Cove',
  'Kuranda',
  'Mission Beach',
];

export default function CustomCheckoutManager() {
  // Form State
  const [pickupLocation, setPickupLocation] = useState('Cairns Airport');
  const [dropoffLocation, setDropoffLocation] = useState('Port Douglas');
  const [pickupDate, setPickupDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState('12:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [childSeat, setChildSeat] = useState(false);
  const [includeProcessingFee, setIncludeProcessingFee] = useState(true);
  const [amount, setAmount] = useState('180');
  const [notes, setNotes] = useState('');

  // Mandatory Customer Contact State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // UI / Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    url: string;
    finalAmount: number;
    currency: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Field validation helper
  const isFormValid =
    pickupLocation.trim() !== '' &&
    dropoffLocation.trim() !== '' &&
    fullName.trim() !== '' &&
    email.trim() !== '' &&
    email.includes('@') &&
    contactNumber.trim() !== '' &&
    Number(amount) > 0;

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedResult(null);

    if (!isFormValid) {
      setError(
        'Please fill in all mandatory fields (Pickup, Dropoff, Fare Amount, Customer Name, Email, and Phone Number).'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/custom-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation,
          dropoffLocation,
          pickupDate,
          pickupTime,
          passengers: Number(passengers),
          luggage: Number(luggage),
          childSeat,
          amount: Number(amount),
          fullName,
          email,
          contactNumber,
          includeProcessingFee,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate payment link');
      }

      setGeneratedResult({
        url: data.url,
        finalAmount: data.finalAmount,
        currency: data.currency || 'AUD',
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while generating the link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedResult?.url) return;
    navigator.clipboard.writeText(generatedResult.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('0')) {
      clean = '+61' + clean.slice(1);
    }
    return clean.replace('+', '');
  };

  const handleWhatsAppShare = () => {
    if (!generatedResult?.url) return;
    const phoneClean = formatPhoneForWhatsApp(contactNumber);
    const message = encodeURIComponent(
      `Hi ${fullName},\n\nHere is your SPL Transportation payment link for transfer from ${pickupLocation} to ${dropoffLocation} ($${generatedResult.finalAmount} AUD):\n\n${generatedResult.url}\n\nThank you for riding with SPL Transportation!`
    );

    const waUrl = phoneClean
      ? `https://wa.me/${phoneClean}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(waUrl, '_blank');
  };

  const handleEmailShare = () => {
    if (!generatedResult?.url) return;
    const subject = encodeURIComponent(
      `SPL Transportation Payment Link: ${pickupLocation} to ${dropoffLocation}`
    );
    const body = encodeURIComponent(
      `Hi ${fullName},\n\nPlease click the link below to complete payment for your transfer from ${pickupLocation} to ${dropoffLocation} ($${generatedResult.finalAmount} AUD):\n\n${generatedResult.url}\n\nOnce confirmed, your booking receipt will be delivered immediately to this email.\n\nThank you!\nSPL Transportation Team`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleGoBack = () => {
    setGeneratedResult(null);
    setError(null);
  };

  const handleCreateNew = () => {
    setGeneratedResult(null);
    setError(null);
    setAmount('180');
    setNotes('');
    setFullName('');
    setEmail('');
    setContactNumber('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#19324D] to-[#0F766E] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
              <CreditCard className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>DRIVER &amp; ADMIN QUICK PAYMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {generatedResult ? 'Payment Link Created' : 'Create Custom Payment Link'}
            </h1>
            <p className="text-sm text-slate-200 mt-1 max-w-xl">
              {generatedResult
                ? 'Share the payment link via WhatsApp or Email below.'
                : 'Instantly generate custom checkout links for on-the-spot passengers, phone bookings, or direct quotes.'}
            </p>
          </div>

          {generatedResult && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go Back
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Create New
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Generation Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Generated Result Banner & Actions (Hides Form when active) */}
      {generatedResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#0F766E] shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Payment Link Ready
              </span>
              <h2 className="text-2xl font-extrabold text-[#102A43]">
                {pickupLocation} → {dropoffLocation}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customer: <strong>{fullName}</strong> ({email}) • {contactNumber}
              </p>
            </div>
            <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-xs text-slate-400 font-bold uppercase">Total Payable</div>
              <div className="text-3xl font-extrabold text-[#0F766E]">
                ${generatedResult.finalAmount} <span className="text-xs text-slate-400 font-normal">AUD</span>
              </div>
            </div>
          </div>

          {/* URL Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Stripe Checkout URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={generatedResult.url}
                className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#102A43] hover:bg-[#0F766E] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Action Buttons (Mobile-Optimized) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-4.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Send className="w-5 h-5" /> Share via WhatsApp ({contactNumber})
            </button>
            <button
              onClick={handleEmailShare}
              className="w-full py-4.5 px-5 rounded-2xl bg-[#102A43] hover:bg-slate-800 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/20 transition-all active:scale-98"
            >
              <Mail className="w-5 h-5" /> Email Link to {email}
            </button>
          </div>

          {/* Navigation Options Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back to Form
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0C5D59] text-white font-bold text-sm shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Create New Payment Link
            </button>
          </div>
        </div>
      ) : (
        /* Main Generator Form (Hidden when link is generated) */
        <form
          onSubmit={handleGenerateLink}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 space-y-8 animate-in fade-in duration-200"
        >
          {/* Section 1: Trip Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#102A43] flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-[#0F766E]" />
              1. Trip &amp; Route Details
            </h2>

            {/* Pickup & Dropoff Inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pickup Location (From) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Cairns Airport (CNS)"
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-sm text-slate-900"
                />
                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_LOCATIONS.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setPickupLocation(loc)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dropoff Location (To) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="e.g. Port Douglas Resort"
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-sm text-slate-900"
                />
                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_LOCATIONS.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setDropoffLocation(loc)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date, Time, Pax, Bags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0F766E]" /> Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0F766E]" /> Time
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0F766E]" /> Passengers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      {num} Pax
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#0F766E]" /> Bags
                </label>
                <select
                  value={luggage}
                  onChange={(e) => setLuggage(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      {num} Bags
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Fare Customization */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-extrabold text-[#102A43] flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-5 h-5 text-[#0F766E]" />
              2. Custom Fare &amp; Options
            </h2>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              {/* Custom Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Base Custom Fare ($ AUD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="180"
                    className="w-full p-3.5 pl-9 rounded-xl border border-slate-200 text-xl font-extrabold text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  />
                </div>
              </div>

              {/* Checkbox Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={childSeat}
                    onChange={(e) => setChildSeat(e.target.checked)}
                    className="w-5 h-5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    Include Child Seat (+ $20 AUD)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={includeProcessingFee}
                    onChange={(e) => setIncludeProcessingFee(e.target.checked)}
                    className="w-5 h-5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    Include 2.5% Card Processing Fee
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Mandatory Customer Info & Receipt Delivery */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#102A43] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0F766E]" />
                3. Customer Contact Info (Mandatory)
              </h2>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Receipt Auto-Delivered
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+61 412 345 678"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Driver / Admin Internal Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. On-the-spot passenger at domestic arrival gate 2"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          {/* Submit Action (Mobile Optimized Large Touch Target) */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-4 sm:py-5 px-8 rounded-2xl bg-[#102A43] hover:bg-[#0F766E] disabled:bg-slate-300 text-white font-extrabold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 active:scale-98"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Payment Link...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 text-[#2DD4BF]" />
                  Generate Payment Link (${Number(amount) > 0 ? (includeProcessingFee ? (Number(amount) * 1.025).toFixed(2) : amount) : '0'} AUD)
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
