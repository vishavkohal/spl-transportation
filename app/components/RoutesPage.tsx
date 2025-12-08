'use client';
import React, { useEffect, useState } from 'react';
import { BusFront, Clock, Users } from 'lucide-react'; 
import type { Route } from '../types';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Heading, Primary Text)
const ACCENT_COLOR = '#A61924'; // Deep Red (Accent/Button)
const CARD_BG = '#FFFFFF'; // White (Fixed Card Background)
const TEXT_COLOR_LIGHT_PAGE = '#202124'; // Dark text for light page sections (used for body text)
const MUTED_TEXT_COLOR = '#5F6368'; // Medium Gray (Muted Text)

export default function RoutesPage({
  setCurrentPage,
  onSelectRoute
}: {
  setCurrentPage?: (page: string) => void;
  onSelectRoute?: (route: Route) => void;
}) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/routes');
      if (!res.ok) throw new Error(`Failed to load routes (${res.status})`);
      const data = await res.json();
      setRoutes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleBooking = (route: Route) => {
    try {
      if (typeof onSelectRoute === 'function') onSelectRoute(route);
      if (typeof setCurrentPage === 'function') setCurrentPage('home');
    } catch (e) {
      console.error('Error during route selection/page change:', e);
    }
  };

  return (
    // Main page container remains light (default background: white or gray-50)
    <div className="min-h-screen max-w-7xl mx-auto px-6 pb-12 pt-24 md:pt-32 transition-colors bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <h1
          className="text-3xl md:text-4xl font-extrabold"
          style={{ color: PRIMARY_COLOR }} // Heading is Dark Navy
        >
        Private Transfers Routes & Pricing
        </h1>

        <button
          onClick={load}
          disabled={loading}
          className="mt-3 md:mt-0 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      {/* Loading and Error messages */}
      {loading && <p className="text-gray-600">Loading routes data...</p>}
      {error && <p className="text-red-500 font-medium">Error: {error}</p>}
      {!loading && !error && routes.length === 0 && (
        <p className="text-gray-600">No routes configured.</p>
      )}

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {routes.map(route => (
          <div
            key={route.id}
            // CARD: Fixed White Background, light border, subtle shadow
            className="p-7 rounded-2xl shadow-lg border border-gray-100 transition-all flex flex-col hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: CARD_BG }} 
          >
            {/* 📍 Route Names and Icons */}
            <div className="mb-4 border-b border-gray-100 pb-4">
              <h3
                className="text-2xl font-bold tracking-tight mb-2"
                style={{ color: PRIMARY_COLOR }} // Route Name: Dark Navy
              >
                {route.from}
                <span className="mx-2 text-xl" style={{ color: ACCENT_COLOR, fontWeight: '900' }}> → </span> {/* Arrow: Deep Red */}
                {route.to}
              </h3>

              {/* Distance and Duration with Lucide Icons */}
              <div className="flex items-center space-x-6 text-sm" style={{ color: MUTED_TEXT_COLOR }}>
                <span className="flex items-center font-medium">
                  <BusFront className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> {/* Icon: Dark Navy */}
                  {route.distance}
                </span>
                <span className="flex items-center font-medium">
                  <Clock className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> {/* Icon: Dark Navy */}
                  {route.duration}
                </span>
              </div>
            </div>

            {/* 💰 Pricing Table */}
            <div className="flex-grow">
              {/* Table Header */}
              <div 
                className="grid grid-cols-2 text-xs font-semibold uppercase mb-2 pb-1 border-b border-gray-100" 
                style={{ color: MUTED_TEXT_COLOR }}
              >
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" style={{ color: MUTED_TEXT_COLOR }} />
                  Passengers
                </span>
                <span className="text-right">Price</span>
              </div>

              {/* Pricing Rows */}
              {route.pricing.map((p, idx) => {
                const isFeatured = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 items-center py-3 px-2 rounded-lg transition-all ${
                      isFeatured
                        ? 'bg-red-50/50 font-semibold' // Subtle Deep Red background highlight
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ color: TEXT_COLOR_LIGHT_PAGE }} // Text is Dark Gray
                  >
                    {/* Passenger Column */}
                    <p className="text-base">
                      {p.passengers}
                    </p>
                    {/* Price Column - Primary color highlight */}
                    <p
                      className="text-xl font-bold text-right"
                      style={{ color: isFeatured ? ACCENT_COLOR : PRIMARY_COLOR }} // Price: Deep Red or Dark Navy
                    >
                      ${p.price}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-xs mt-6 italic pt-4 border-t border-gray-100" style={{ color: MUTED_TEXT_COLOR }}>
              <span className="font-bold">Note:</span> Child seat available for additional $20
            </p>

            {/* Book Button - Primary Action (Deep Red) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBooking(route);
              }}
              className="w-full mt-8 px-6 py-3 text-lg text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg hover:brightness-110"
              style={{ 
                backgroundColor: ACCENT_COLOR, // Deep Red Button
                boxShadow: `0 4px 6px -1px rgba(166, 25, 36, 0.4), 0 2px 4px -2px rgba(166, 25, 36, 0.4)`
              }}
              aria-label={`Book route from ${route.from} to ${route.to}`}
            >
              Book This Route
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}