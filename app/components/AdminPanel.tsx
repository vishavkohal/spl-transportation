'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './admin/AdminSidebar';
import DashboardOverview from './admin/DashboardOverview';
import RoutesManager from './admin/RoutesManager';
import BookingsManager, { type Booking } from './admin/BookingsManager';
import LeadsManager from './admin/LeadsManager';
import type { Route } from '../types';
import { Menu } from 'lucide-react';

// Re-export types for legacy compatibility if needed
export type { Route } from '../types';
export type { Booking };

export type BookingLead = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  bookingType: 'standard' | 'hourly' | 'daytrip';
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  dayTripPickup?: string | null;
  dayTripDestination?: string | null;
  dayTripVehicleType?: string | null;
  quotedPriceCents?: number | null;
  currency?: string | null;
  status: 'draft' | 'converted';
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  utmCapturedAt?: string | null;
  createdAt: string;
};

// Types for initial data loading
type AdminData = {
  bookings: Booking[];
  routes: Route[];
  leads: BookingLead[];
};

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'bookings' | 'leads'>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Dashboard Data State
  const [data, setData] = useState<AdminData>({
    bookings: [],
    routes: [],
    leads: []
  });

  // 1. Check Session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session', { method: 'GET' });
        setIsAuthed(res.ok);
        if (res.ok) loadDashboardData();
      } catch {
        setIsAuthed(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // 2. Load all data for Dashboard Overview
  async function loadDashboardData() {
    try {
      const [bookingsRes, routesRes, leadsRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/routes'),
        fetch('/api/admin/leads')
      ]);

      const bookings = await bookingsRes.json();
      const routes = await routesRes.json();
      const leads = await leadsRes.json();

      setData({
        bookings: Array.isArray(bookings) ? bookings : [],
        routes: Array.isArray(routes) ? routes : [],
        leads: Array.isArray(leads) ? leads : []
      });
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        setAuthError('Invalid password');
        setIsAuthed(false);
      } else {
        setIsAuthed(true);
        setPassword('');
        loadDashboardData();
      }
    } catch (err: any) {
      setAuthError('Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading Dashboard...</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#18234B] mb-2 font-serif">SPL Admin</h1>
            <p className="text-sm text-gray-500">Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full text-white font-bold px-4 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 ${authLoading ? 'bg-gray-400' : 'bg-[#18234B] hover:shadow-xl'
                }`}
            >
              {authLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="font-bold text-[#18234B]">SPL Admin</h1>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <DashboardOverview bookings={data.bookings} routes={data.routes} leads={data.leads} />
            )}
            {activeTab === 'routes' && <RoutesManager />}
            {activeTab === 'bookings' && <BookingsManager />}
            {activeTab === 'leads' && <LeadsManager />}
          </div>
        </main>
      </div>
    </div>
  );
}
