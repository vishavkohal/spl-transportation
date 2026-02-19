'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Trash2, Search, Filter, Calendar, Mail, MapPin, User, DollarSign, Clock } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

// Types (copied/adapted from AdminPanel/Booking structure)
export type Booking = {
    id: string;
    stripeSessionId: string;
    pickupLocation: string;
    pickupAddress: string | null;
    dropoffLocation: string;
    dropoffAddress: string | null;
    pickupDate: string;
    pickupTime: string;
    passengers: number;
    luggage: number;
    flightNumber: string | null;
    childSeat: boolean;
    fullName: string;
    email: string;
    contactNumber: string;
    totalPriceCents: number;
    currency: string;
    emailSent: boolean;
    createdAt?: string;
    bookingType?: 'standard' | 'hourly' | 'daytrip' | null;
    hourlyPickupLocation?: string | null;
    hourlyHours?: number | null;
    hourlyVehicleType?: string | null;
    dayTripVehicleType?: string | null;
    invoiceId?: string | null; // NEW
    status?: string | null; // PENDING, PAID
};

export default function BookingsManager() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    async function loadBookings() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/bookings');
            if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
            const data: Booking[] = await res.json();
            setBookings(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBookings();
    }, []);

    async function handleDeleteBooking(id: string) {
        if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error || 'Failed to delete booking');
            await loadBookings();
        } catch (error: any) {
            alert(error.message || 'Delete failed');
        }
    }

    const filteredBookings = useMemo(() => {
        const searchLower = search.trim().toLowerCase();

        return bookings.filter(b => {
            // Search matching
            if (searchLower) {
                const text = [
                    b.fullName,
                    b.email,
                    b.contactNumber,
                    b.pickupLocation,
                    b.dropoffLocation,
                    b.stripeSessionId,
                    b.id
                ].join(' ').toLowerCase();
                if (!text.includes(searchLower)) return false;
            }

            // Type filter
            if (filterType !== 'all') {
                const type = b.bookingType || 'standard';
                if (type !== filterType) return false;
            }

            if (filterStatus === 'sent' && b.status !== 'PAID') return false;
            if (filterStatus === 'pending' && b.status !== 'PENDING') return false;

            // Date Filter (pickupDate is string, likely YYYY-MM-DD or DD/MM/YYYY)
            // We'll attempt a flexible match. Input filterDate is YYYY-MM-DD.
            if (filterDate) {
                // formatting varies, so let's try to normalize valid dates
                // If pickupDate is strictly YYYY-MM-DD, direct compare works.
                // If it's DD/MM/YYYY or localized, we might need parsing.
                // For now, simple substring or date object check:
                const bookingDate = new Date(b.pickupDate);
                const queryDate = new Date(filterDate);

                // If valid dates, compare via ISO string (YYYY-MM-DD)
                if (!isNaN(bookingDate.getTime()) && !isNaN(queryDate.getTime())) {
                    // CAUTION: timezone offset issues might arise if simple comparison.
                    // Safer to check if the string *contains* the date parts or similar?
                    // Let's assume the system stores dates relatively standardly.
                    // Let's try matching the exact YYYY-MM-DD string if possible
                    // OR convert both to YYYY-MM-DD chunks.
                    const bStr = bookingDate.toISOString().slice(0, 10); // UTC date part
                    const qStr = filterDate; // already YYYY-MM-DD
                    // This compares UTC dates. If local time differs, might be off-by-one.

                    // Alternative: String contains the parts
                    // If b.pickupDate is "2026-01-18", filterDate is "2026-01-18".
                    if (!b.pickupDate.includes(filterDate)) {
                        // Fallback: compare formatted
                        // If b.pickupDate is "18/01/2026"
                        // filterDate is "2026-01-18" -> parts [2026, 01, 18]
                        const [y, m, d] = filterDate.split('-');
                        const target1 = `${d}/${m}/${y}`; // AU format
                        const target2 = `${y}-${m}-${d}`; // ISO
                        if (!b.pickupDate.includes(target1) && !b.pickupDate.includes(target2)) return false;
                    }
                } else if (b.pickupDate !== filterDate) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [bookings, search, filterType, filterStatus]);

    function getInvoiceNumber(b: Booking): string {
        if (b.invoiceId) return b.invoiceId;

        // Fallback for legacy data
        if (!b.createdAt) return 'N/A';
        const created = new Date(b.createdAt);
        if (Number.isNaN(created.getTime())) return 'N/A';
        const datePart = created.toISOString().slice(0, 10).replace(/-/g, '');
        return `INV-${datePart}-${b.id.slice(0, 4).toUpperCase()}`;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Tools Header */}
            <div className="p-6 border-b border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>Bookings</h2>
                        <p className="text-sm text-gray-500">Manage upcoming trips and history.</p>
                    </div>
                    <button
                        onClick={loadBookings}
                        disabled={loading}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors self-start md:self-auto"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col xl:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] transition-all text-gray-900 placeholder:text-gray-500"
                            placeholder="Search by name, email, or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none text-gray-900"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="standard">Standard</option>
                            <option value="hourly">Hourly</option>
                            <option value="daytrip">Day Trip</option>
                        </select>
                        <select
                            className="px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none text-gray-900"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="sent">Confirmed (Paid)</option>
                            <option value="pending">Pending Payment</option>
                        </select>
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none text-gray-900 placeholder:text-gray-500"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Journey Details</th>
                            <th className="px-6 py-4">Date & Time / Invoice</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading bookings...</td></tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No bookings match your filters.</td></tr>
                        ) : (
                            filteredBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold shrink-0">
                                                {b.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{b.fullName}</div>
                                                <div className="text-xs text-gray-500">{b.email}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{b.contactNumber}</div>

                                                {/* Booking Type Badge */}
                                                <div className="mt-1 flex gap-1">
                                                    {b.bookingType === 'hourly' ? (
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">Hourly</span>
                                                    ) : b.bookingType === 'daytrip' ? (
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 uppercase">Day Trip</span>
                                                    ) : (
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Standard</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        {b.bookingType === 'hourly' ? (
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    {b.hourlyPickupLocation || b.pickupLocation}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {b.hourlyHours} Hours ({b.hourlyVehicleType})
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                    <span className="text-gray-900">{b.pickupLocation}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                                    <span className="text-gray-900">{b.dropoffLocation}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{b.passengers} Pax</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{b.luggage} Bags</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {b.pickupDate}
                                            </div>
                                            <div className="text-sm text-gray-500 pl-5.5">
                                                {b.pickupTime}
                                            </div>
                                            {b.flightNumber && (
                                                <div className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded w-fit mt-1">
                                                    🛬 {b.flightNumber}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-1">
                                                Inv: {getInvoiceNumber(b)}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        <div className="font-bold text-gray-900">
                                            ${(b.totalPriceCents / 100).toFixed(2)} <span className="text-xs font-normal text-gray-400">AUD</span>
                                        </div>
                                        <div className="mt-1">
                                            {b.status === 'PAID' ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <DollarSign className="w-3 h-3" /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                                    <Clock className="w-3 h-3" /> Pending Payment
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 align-top text-right">
                                        <button
                                            onClick={() => handleDeleteBooking(b.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Booking"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
