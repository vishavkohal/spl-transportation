'use client';

import React, { useState } from 'react';
import { Search, Calendar, Clock, MapPin, Plane, User, Phone, Mail, CheckCircle2, AlertCircle, Edit2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetails {
  id: string;
  invoiceId?: string;
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
  totalPriceCents: number;
  status: string;
  transferType?: string;
  returnDate?: string;
  returnTime?: string;
  returnFlightNumber?: string;
  createdAt: string;
}

export default function ManageBookingClient() {
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [returnFlightNumber, setReturnFlightNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !email) {
      toast.error('Please enter both your Booking Reference and Email');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/manage?bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No booking found');
      }

      setBooking(data.booking);
      setPickupDate(data.booking.pickupDate || '');
      setPickupTime(data.booking.pickupTime || '');
      setFlightNumber(data.booking.flightNumber || '');
      setReturnDate(data.booking.returnDate || '');
      setReturnTime(data.booking.returnTime || '');
      setReturnFlightNumber(data.booking.returnFlightNumber || '');
      setFullName(data.booking.fullName || '');
      setContactNumber(data.booking.contactNumber || '');
      toast.success('Booking retrieved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Lookup failed');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      setUpdating(true);
      const res = await fetch('/api/bookings/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          email: booking.email,
          pickupDate,
          pickupTime,
          flightNumber,
          returnDate,
          returnTime,
          returnFlightNumber,
          fullName,
          contactNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking');

      setBooking(data.booking);
      setIsEditing(false);
      toast.success('Booking updated! Notification sent to admin.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 mb-3">
            <Search className="w-3.5 h-3.5" /> Self-Service Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight">
            Manage Your Booking
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
            Retrieve your transfer details, update pickup times or flight numbers, and manage your reservation.
          </p>
        </div>

        {/* Lookup Form */}
        {!booking && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-md mx-auto">
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Booking Reference or Invoice #
                </label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  placeholder="e.g. SPL-INV-123456 or ID"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="The email used during booking"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#102A43] hover:bg-[#0C5D59] text-white shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Searching…' : 'Find My Booking'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {/* Booking Card Display */}
        {booking && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden space-y-6 p-6 sm:p-8">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Booking Reference</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                    {booking.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#102A43] mt-0.5">
                  {booking.invoiceId || booking.id}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#0C5D59] text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditing ? 'Cancel Editing' : 'Modify Booking'}
                </button>
                <button
                  onClick={() => setBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Search Another
                </button>
              </div>
            </div>

            {/* Read-Only View */}
            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-700">
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-[#102A43] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0F766E]" /> Outbound Transfer
                  </h3>
                  <div>
                    <span className="text-xs text-slate-400 block">Route</span>
                    <span className="font-semibold text-slate-900">{booking.pickupLocation} → {booking.dropoffLocation}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Date & Time</span>
                    <span className="font-semibold text-slate-900">{booking.pickupDate} at {booking.pickupTime}</span>
                  </div>
                  {booking.flightNumber && (
                    <div>
                      <span className="text-xs text-slate-400 block">Flight Number</span>
                      <span className="font-semibold text-slate-900">{booking.flightNumber}</span>
                    </div>
                  )}
                </div>

                {booking.transferType === 'round-trip' && (
                  <div className="space-y-3 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                    <h3 className="font-bold text-[#0F766E] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#0F766E]" /> Return Transfer
                    </h3>
                    <div>
                      <span className="text-xs text-slate-400 block">Return Route</span>
                      <span className="font-semibold text-slate-900">{booking.dropoffLocation} → {booking.pickupLocation}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Return Date & Time</span>
                      <span className="font-semibold text-slate-900">{booking.returnDate || 'N/A'} at {booking.returnTime || 'N/A'}</span>
                    </div>
                    {booking.returnFlightNumber && (
                      <div>
                        <span className="text-xs text-slate-400 block">Return Flight Number</span>
                        <span className="font-semibold text-slate-900">{booking.returnFlightNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                  <h3 className="font-bold text-[#102A43] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0F766E]" /> Passenger Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block">Passenger Name</span>
                      <span className="font-semibold text-slate-900">{booking.fullName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Email</span>
                      <span className="font-semibold text-slate-900">{booking.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Contact Phone</span>
                      <span className="font-semibold text-slate-900">{booking.contactNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Editable Form */
              <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    Updating your trip details will notify dispatch immediately. Changes within 24 hours of travel are subject to driver availability.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flight Number (Optional)</label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={e => setFlightNumber(e.target.value)}
                      placeholder="e.g. JQ953"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                    />
                  </div>

                  {booking.transferType === 'round-trip' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={e => setReturnDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Return Time</label>
                        <input
                          type="time"
                          value={returnTime}
                          onChange={e => setReturnTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Return Flight Number (Optional)</label>
                        <input
                          type="text"
                          value={returnFlightNumber}
                          onChange={e => setReturnFlightNumber(e.target.value)}
                          placeholder="e.g. QF802"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={e => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0F766E] hover:bg-[#0C5D59] text-white shadow-md transition"
                  >
                    {updating ? 'Saving Updates…' : 'Save & Notify Admin'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
