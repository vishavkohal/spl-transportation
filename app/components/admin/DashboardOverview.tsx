'use client';

import React from 'react';
import { DollarSign, type LucideIcon, TrendingUp, Users, Calendar, MapPin } from 'lucide-react';
import type { Booking, Route, BookingLead } from '../AdminPanel';

interface DashboardOverviewProps {
    bookings: Booking[];
    routes: Route[];
    leads: BookingLead[];
}

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

export default function DashboardOverview({ bookings, routes, leads }: DashboardOverviewProps) {

    // Calculate Stats
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPriceCents / 100), 0);
    const totalBookings = bookings.length;
    const totalLeads = leads.length;
    const activeRoutes = routes.length;

    // Recent 5 Bookings
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: PRIMARY_COLOR }}>Dashboard Overview</h2>
                <p className="text-gray-500 text-sm">Welcome back, Admin. Here's what's happening today.</p>
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
                    label="Total Bookings"
                    value={totalBookings.toString()}
                    icon={Calendar}
                    color={PRIMARY_COLOR}
                />
                <StatCard
                    label="Active Routes"
                    value={activeRoutes.toString()}
                    icon={MapPin}
                    color={ACCENT_COLOR}
                />
                <StatCard
                    label="Total Leads"
                    value={totalLeads.toString()}
                    icon={Users}
                    color="#F59E0B"
                />
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
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Paid
                                        </span>
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

const SUCCESS_COLOR = '#16A34A';
