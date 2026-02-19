'use client';

import React from 'react';
import { Calendar, MapPin, User, Clock, Plane, Car } from 'lucide-react';
import type { Booking } from '../AdminPanel';

interface UpcomingTripsProps {
    bookings: Booking[];
}

const PRIMARY_COLOR = '#18234B';

export default function UpcomingTrips({ bookings }: UpcomingTripsProps) {
    // Filter and Sort Bookings
    const upcomingBookings = bookings
        .filter(b => {
            // Must be PAID
            if (b.status !== 'PAID') return false;

            // Must be FUTURE or TODAY
            // Parse pickupDate. Assuming 'YYYY-MM-DD' or similar standard format.
            // If it's a string like "2026-02-19", we can just compare strings if format is ISO.
            // Or create Date objects.

            // Let's use a safe date comparison.
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const bookingDate = new Date(b.pickupDate);
            if (isNaN(bookingDate.getTime())) return false; // Invalid date

            // Check if booking date is today or in future
            // We'll compare timestamps to be safe
            return bookingDate.getTime() >= today.getTime();
        })
        .sort((a, b) => {
            // Sort Ascending (Earliest first)
            const dateA = new Date(`${a.pickupDate}T${a.pickupTime || '00:00'}`);
            const dateB = new Date(`${b.pickupDate}T${b.pickupTime || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
        });

    // Group by Date for better visualization?
    // For now, simple list view is good as per request "like a booking calender" usually implies date-ordered.

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>Upcoming Trips</h2>
                    <p className="text-gray-500 text-sm">
                        Showing {upcomingBookings.length} confirmed paid bookings scheduled for the future.
                    </p>
                </div>
            </div>

            {/* Content */}
            {upcomingBookings.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Upcoming Trips</h3>
                    <p className="text-gray-500 mt-1">There are no paid bookings scheduled for today or the future.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 relative overflow-hidden"
                        >
                            {/* Left Accent Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500" />

                            {/* Date & Time Column */}
                            <div className="min-w-[140px] flex flex-row md:flex-col gap-4 md:gap-1 items-center md:items-start md:border-r border-gray-100 md:pr-6">
                                <div className="text-center md:text-left">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short' })}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 leading-none my-1">
                                        {new Date(booking.pickupDate).getDate()}
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium">
                                        {booking.pickupDate.split('-')[0]}
                                    </div>
                                </div>
                                <div className="hidden md:block w-px h-full bg-gray-100 mx-auto" />
                                <div className="flex items-center gap-1.5 text-gray-700 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {booking.pickupTime}
                                </div>
                            </div>

                            {/* Details Column */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                            {booking.bookingType === 'hourly' ? 'HOURLY CHARTER' : booking.bookingType === 'daytrip' ? 'DAY TRIP' : 'TRANSFER'}
                                        </span>
                                        {booking.flightNumber && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                                                <Plane className="w-3 h-3" /> {booking.flightNumber}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-3 relative ml-2">
                                        <div className="absolute left-[5px] top-[8px] bottom-[8px] w-0.5 bg-gray-100" />

                                        <div className="flex items-start gap-3 relative">
                                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0 ring-4 ring-white" />
                                            <div>
                                                <div className="text-xs text-gray-400 font-medium mb-0.5">PICKUP</div>
                                                <div className="font-medium text-gray-900">
                                                    {booking.bookingType === 'hourly' ? (booking.hourlyPickupLocation || booking.pickupLocation) : booking.pickupLocation}
                                                </div>
                                                {booking.pickupAddress && (
                                                    <div className="text-xs text-gray-500 mt-0.5">{booking.pickupAddress}</div>
                                                )}
                                            </div>
                                        </div>

                                        {(booking.bookingType !== 'hourly' || (booking.bookingType === 'hourly' && !booking.hourlyPickupLocation)) && (
                                            <div className="flex items-start gap-3 relative">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0 ring-4 ring-white" />
                                                <div>
                                                    <div className="text-xs text-gray-400 font-medium mb-0.5">DROPOFF</div>
                                                    <div className="font-medium text-gray-900">
                                                        {booking.dropoffLocation || 'As Directed'}
                                                    </div>
                                                    {booking.dropoffAddress && (
                                                        <div className="text-xs text-gray-500 mt-0.5">{booking.dropoffAddress}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-400 font-medium mb-1">CUSTOMER</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {booking.fullName.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900 truncate" title={booking.fullName}>
                                                        {booking.fullName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-medium mb-1">PASSENGERS</div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {booking.passengers} Pax
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-medium mb-1">VEHICLE</div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                    <Car className="w-4 h-4 text-gray-400" />
                                                    {booking.dayTripVehicleType || booking.hourlyVehicleType || 'Standard'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-medium mb-1">AMOUNT</div>
                                                <div className="text-sm font-bold text-green-600">
                                                    ${(booking.totalPriceCents / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end p-2">
                                        <span className="text-xs font-mono text-gray-300">ID: {booking.id.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
