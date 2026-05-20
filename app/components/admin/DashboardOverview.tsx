'use client';

import React, { useMemo } from 'react';
import { DollarSign, type LucideIcon, TrendingUp, Users, Calendar, MapPin, Clock, BarChart3, Target } from 'lucide-react';
import type { Booking, Route, BookingLead } from '../AdminPanel';

interface DashboardOverviewProps {
    bookings: Booking[];
    routes: Route[];
    leads: BookingLead[];
}

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const SUCCESS_COLOR = '#16A34A';

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: LucideIcon, color: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
    </div>
);

export default function DashboardOverview({ bookings, routes, leads }: DashboardOverviewProps) {
    // Basic Stats
    const totalRevenue = useMemo(() => bookings.reduce((sum, b) => sum + (b.totalPriceCents / 100), 0), [bookings]);
    const totalBookings = bookings.length;
    const totalLeads = leads.length;
    const activeRoutes = routes.length;

    // Conversion Rate
    const conversionRate = totalLeads > 0 ? ((totalBookings / totalLeads) * 100).toFixed(1) : '0.0';

    // Top Routes
    const topRoutes = useMemo(() => {
        const counts: Record<string, number> = {};
        bookings.forEach(b => {
            if (b.bookingType === 'standard' && b.pickupLocation && b.dropoffLocation) {
                const routeName = `${b.pickupLocation} → ${b.dropoffLocation}`;
                counts[routeName] = (counts[routeName] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [bookings]);

    // UTM Performance
    const utmStats = useMemo(() => {
        const stats: Record<string, { leads: number, bookings: number }> = {};
        
        leads.forEach(l => {
            const source = l.utmSource || 'direct/organic';
            if (!stats[source]) stats[source] = { leads: 0, bookings: 0 };
            stats[source].leads += 1;
        });

        // Try to match bookings to leads to count UTM conversions if they share email/phone
        // or just count source directly if we had utm stored on bookings (which we do if via checkout session)
        bookings.forEach(b => {
            // bookings might not have UTM directly unless we pass it, but let's assume we do 
            // or we match by email to a lead. For simplicity, we match by email to lead.
            const matchingLead = leads.find(l => l.email === b.email);
            const source = matchingLead?.utmSource || 'direct/organic';
            if (!stats[source]) stats[source] = { leads: 0, bookings: 0 };
            stats[source].bookings += 1;
        });

        return Object.entries(stats)
            .map(([source, data]) => ({ source, ...data }))
            .sort((a, b) => b.bookings - a.bookings || b.leads - a.leads)
            .slice(0, 5);
    }, [leads, bookings]);


    // Recent 5 Bookings
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: PRIMARY_COLOR }}>Dashboard Overview</h2>
                <p className="text-gray-500 text-sm">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color={SUCCESS_COLOR}
                />
                <StatCard
                    label="Conversion Rate"
                    value={`${conversionRate}%`}
                    icon={TrendingUp}
                    color={PRIMARY_COLOR}
                />
                <StatCard
                    label="Total Leads"
                    value={totalLeads.toString()}
                    icon={Users}
                    color="#F59E0B"
                />
                <StatCard
                    label="Total Bookings"
                    value={totalBookings.toString()}
                    icon={Calendar}
                    color={ACCENT_COLOR}
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Routes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                        <MapPin className="w-5 h-5 text-blue-500" /> Top Performing Routes
                    </h3>
                    <div className="space-y-4">
                        {topRoutes.length > 0 ? topRoutes.map(([route, count]) => (
                            <div key={route} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <span className="font-medium text-gray-700">{route}</span>
                                <span className="text-sm font-bold bg-blue-100 text-blue-800 py-1 px-3 rounded-full">{count} trips</span>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500">No route data yet.</p>
                        )}
                    </div>
                </div>

                {/* UTM Marketing Performance */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                        <Target className="w-5 h-5 text-purple-500" /> Marketing Sources
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-4 py-2">Source</th>
                                    <th className="px-4 py-2 text-right">Leads</th>
                                    <th className="px-4 py-2 text-right">Bookings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {utmStats.length > 0 ? utmStats.map((stat) => (
                                    <tr key={stat.source} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900 capitalize">{stat.source}</td>
                                        <td className="px-4 py-3 text-right text-orange-600 font-bold">{stat.leads}</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-bold">{stat.bookings}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">No data available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>Recent Bookings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Route</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentBookings.length > 0 ? recentBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {booking.fullName}
                                        <div className="text-xs text-gray-400 font-normal">{booking.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {booking.pickupLocation} <span className="text-gray-400">→</span> {booking.dropoffLocation}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {booking.pickupDate} <span className="text-xs text-gray-400">at {booking.pickupTime}</span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        ${(booking.totalPriceCents / 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.status === 'PAID' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
