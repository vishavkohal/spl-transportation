'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, Trash2, Megaphone, MapPin, Calendar, Filter, User, DollarSign } from 'lucide-react';
import type { BookingLead } from '../AdminPanel';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

export default function LeadsManager() {
    const [leads, setLeads] = useState<BookingLead[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [search, setSearch] = useState('');
    const [utmFilter, setUtmFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'converted'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'standard' | 'hourly' | 'daytrip'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadLeads();
    }, []);

    function loadLeads() {
        setLoading(true);
        fetch('/api/admin/leads')
            .then(r => r.json())
            .then(setLeads)
            .finally(() => setLoading(false));
    }

    const filtered = useMemo(() => {
        let result = leads;

        // 1. Text Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(l =>
                [l.fullName, l.email, l.contactNumber, l.source, l.utmSource, l.utmMedium, l.utmCampaign]
                    .join(' ').toLowerCase().includes(q)
            );
        }

        // 2. UTM Source Filter
        if (utmFilter !== 'all') {
            if (utmFilter === 'affiliate') {
                // Special logic for "Affiliate" - matches if utm_medium is affiliate or source is specific affiliate logic
                result = result.filter(l => l.utmMedium === 'affiliate' || l.utmSource === 'affiliate');
            } else if (utmFilter === 'direct') {
                result = result.filter(l => !l.utmSource);
            } else {
                result = result.filter(l => l.utmSource === utmFilter);
            }
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(l => l.status === statusFilter);
        }

        // 4. Appointment Type Filter
        if (typeFilter !== 'all') {
            const type = (l: BookingLead) => l.bookingType || 'standard';
            result = result.filter(l => type(l) === typeFilter);
        }

        // 5. Date Range Filter
        if (dateFrom) {
            const from = new Date(dateFrom).getTime();
            result = result.filter(l => new Date(l.createdAt).getTime() >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(l => new Date(l.createdAt).getTime() <= to.getTime());
        }

        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [leads, search, utmFilter, statusFilter, typeFilter, dateFrom, dateTo]);

    async function deleteLead(id: string) {
        if (!confirm("Delete this lead?")) return;
        await fetch('/api/admin/bookings', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadLeads();
    }

    const uniqueSources = Array.from(new Set(leads.map(l => l.utmSource).filter(Boolean)));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>Leads & Quotes</h2>
                    <p className="text-sm text-gray-500">Track incomplete bookings and marketing performance.</p>
                </div>
                <button onClick={loadLeads} className="p-2 border rounded hover:bg-gray-50 text-gray-500 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters Toolbar */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-3">

                {/* Top Row: Search & Quick Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#18234B]/10 focus:border-[#18234B] outline-none text-gray-900 placeholder:text-gray-500"
                            placeholder="Search by name, email, or UTM param..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-[#18234B] text-gray-900"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft (Abandoned)</option>
                            <option value="converted">Converted</option>
                        </select>

                        <select
                            className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-[#18234B] text-gray-900"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value as any)}
                        >
                            <option value="all">All Types</option>
                            <option value="standard">Standard</option>
                            <option value="hourly">Hourly</option>
                            <option value="daytrip">Day Trip</option>
                        </select>
                    </div>
                </div>

                {/* Bottom Row: Date & Source */}
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date:</span>
                        <input
                            type="date"
                            className="px-2 py-1.5 border rounded text-sm bg-white outline-none focus:border-[#18234B] text-gray-900"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            className="px-2 py-1.5 border rounded text-sm bg-white outline-none focus:border-[#18234B] text-gray-900"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="px-3 py-1.5 border rounded text-sm bg-white outline-none focus:border-[#18234B] w-full md:w-auto text-gray-900"
                            value={utmFilter}
                            onChange={e => setUtmFilter(e.target.value)}
                        >
                            <option value="all">All Sources</option>
                            <option value="direct">Direct / Organic</option>
                            <option value="affiliate">Affiliate</option>
                            <option value="google">Google Ads</option>
                            <option disabled>──────────</option>
                            {uniqueSources.map(s => <option key={s} value={s!}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="divide-y divide-gray-100">
                {filtered.map(lead => {
                    const isAffiliate = lead.utmMedium === 'affiliate' || lead.utmSource === 'affiliate';

                    return (
                        <div key={lead.id} className={`p-6 hover:bg-gray-50 transition-colors ${isAffiliate ? 'bg-purple-50/30' : ''}`}>
                            <div className="flex flex-col md:flex-row justify-between gap-6">

                                {/* Lead Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900">{lead.fullName || 'Anonymous User'}</h3>

                                        {/* Status Badge */}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border ${lead.status === 'converted'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {lead.status}
                                        </span>

                                        {/* Booking Type Badge */}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border ${lead.bookingType === 'hourly'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : lead.bookingType === 'daytrip'
                                                ? 'bg-teal-100 text-teal-700 border-teal-200'
                                                : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {lead.bookingType || 'Standard'}
                                        </span>

                                        {/* Affiliate Badge */}
                                        {isAffiliate && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Affiliate Lead
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-600 mb-3 flex flex-wrap gap-x-4 gap-y-1">
                                        <span>{lead.email}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{lead.contactNumber}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-100 p-2 rounded w-fit shadow-sm">
                                        <MapPin className="w-3 h-3 text-[#A61924]" />
                                        {lead.bookingType === 'hourly'
                                            ? <span className="font-medium">Hourly Hire • {lead.hourlyHours} hrs • {lead.hourlyPickupLocation || 'No pickup set'}</span>
                                            : lead.bookingType === 'daytrip'
                                                ? <span className="font-medium">Day Trip • {lead.dayTripDestination} • <span className="text-gray-400">Pickup:</span> {lead.dayTripPickup}</span>
                                                : <span className="font-medium">{lead.pickupLocation} <span className="text-gray-300 mx-1">→</span> {lead.dropoffLocation}</span>
                                        }
                                    </div>
                                </div>

                                {/* Attribution & Value */}
                                <div className="flex flex-col items-end gap-3 text-right min-w-[200px]">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Potential Value</div>
                                        <div className="text-xl font-bold text-[#18234B] flex items-center justify-end gap-1">
                                            {lead.quotedPriceCents ? (
                                                <>
                                                    <span className="text-sm text-gray-400">$</span>
                                                    {(lead.quotedPriceCents / 100).toFixed(2)}
                                                    <span className="text-xs font-normal text-gray-400 ml-1">AUD</span>
                                                </>
                                            ) : <span className="text-gray-300 text-lg">—</span>}
                                        </div>
                                    </div>

                                    {/* Detailed UTM Grid */}
                                    <div className="w-full bg-gray-50 rounded-lg p-3 text-xs border border-gray-100 space-y-1">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-500">Source:</span>
                                            <span className="font-medium text-gray-900">{lead.utmSource || '—'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-500">Medium:</span>
                                            <span className="font-medium text-gray-900">{lead.utmMedium || '—'}</span>
                                        </div>
                                        {lead.utmCampaign && (
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">Campaign:</span>
                                                <span className="font-medium text-gray-900 truncate max-w-[120px]" title={lead.utmCampaign}>{lead.utmCampaign}</span>
                                            </div>
                                        )}
                                        {/* Affiliate specific content */}
                                        {lead.utmContent && (
                                            <div className="pt-1 mt-1 border-t border-gray-200 flex justify-between gap-4">
                                                <span className="text-purple-600 font-medium">Ref ID:</span>
                                                <span className="font-mono text-gray-600">{lead.utmContent}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(lead.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900">No leads found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
