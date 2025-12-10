'use client';
import React, { useEffect, useState } from 'react';

// 1. UPDATED: Type definition to match the backend DTO
export type PricingItem = {
  passengers: string;
  price: number;
  vehicleType: string;
};

export type Route = {
  id: number;                                                                                                                                                                                                                          
  from: string;
  to: string;
  label: string | null;
  description: string | null;
  distance: string;
  duration: string;
  pricing: PricingItem[];
};

// Booking type for admin view
// NOTE: id is string to match Prisma (BookingWhereUniqueInput.id is string)
type Booking = {
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

  // NEW: support for booking type & hourly hire
  bookingType?: 'standard' | 'hourly' | null;
  hourlyPickupLocation?: string | null;
  hourlyHours?: number | null;
  hourlyVehicleType?: string | null;
};

// Define the custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red
const SUCCESS_COLOR = '#16A34A'; // Green

const DISTANCE_UNIT = 'km';
const DURATION_UNIT = 'min';

type PricingRow = { passengers: string; price: number | string; vehicleType: string };

type FormState = {
  from: string;
  to: string;
  label: string;
  description: string;
  distance: string | number;
  duration: string | number;
  pricing: PricingRow[];
};

type FormErrors = {
  from?: string;
  to?: string;
  label?: string;
  description?: string;
  distance?: string;
  duration?: string;
  pricing?: (string | null)[];
  _form?: string | null;
};

const getInputClass = (hasError: boolean): string => {
  const base =
    'p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-150';
  const errorStyle = 'border-red-500';
  const normalStyle = `border-gray-200 focus:ring-[${ACCENT_COLOR}]`;
  return `${base} ${hasError ? errorStyle : normalStyle}`;
};

const parseNumericInput = (displayValue: string | null): number | null => {
  if (!displayValue) return null;
  const value = String(displayValue).replace(/[^0-9.]/g, '').trim();
  const parsed = Number(value);
  return isNaN(parsed) || value === '' ? null : parsed;
};

type AdminTab = 'routes' | 'bookings';

function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('routes');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session', { method: 'GET' });
        setIsAuthed(res.ok);
      } catch {
        setIsAuthed(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

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
        const json = await res.json().catch(() => ({}));
        setAuthError(json.error || 'Invalid password');
        setIsAuthed(false);
      } else {
        setIsAuthed(true);
        setPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      setIsAuthed(false);
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
        <div className="text-gray-600 text-sm">Checking access…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow-md border">
          <h2
            className="text-xl font-bold mb-4 text-center"
            style={{ color: PRIMARY_COLOR }}
          >
            Admin Access
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter the admin password to manage routes.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-0"
                style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full text-white px-4 py-2 rounded shadow transition-all ${
                authLoading ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110'
              }`}
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              {authLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500">Manage routes and bookings</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full border bg-gray-50 p-1 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('routes')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeTab === 'routes'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={
                  activeTab === 'routes'
                    ? ({ color: PRIMARY_COLOR } as React.CSSProperties)
                    : undefined
                }
              >
                Routes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={
                  activeTab === 'bookings'
                    ? ({ color: PRIMARY_COLOR } as React.CSSProperties)
                    : undefined
                }
              >
                Bookings
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-white rounded shadow hover:brightness-110"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {activeTab === 'routes' ? <RoutesAdminPanel /> : <BookingsAdminPanel />}
      </main>
    </div>
  );
}

export default AdminPanel;

/* =======================
   Routes Admin UI
======================= */

function RoutesAdminPanel() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Route | null>(null);

  const defaultPricing: PricingRow[] = [
    { passengers: '1-2', price: 0, vehicleType: 'Sedan' },
    { passengers: '3-4', price: 0, vehicleType: 'SUV' },
    { passengers: '5+', price: 0, vehicleType: 'Van' }
  ];

  const [form, setForm] = useState<FormState>({
    from: '',
    to: '',
    label: '',
    description: '',
    distance: '' as string | number,
    duration: '' as string | number,
    pricing: defaultPricing as PricingRow[]
  });

  const [errors, setErrors] = useState<FormErrors>({ pricing: [] });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/routes');
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data: Route[] = await res.json();
      setRoutes(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this route?')) return;
    try {
      const res = await fetch('/api/routes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) {
        await load();
      } else {
        throw new Error('Delete failed');
      }
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  }

  function startEdit(r?: Route | null) {
    setErrors({ pricing: [] });
    setSaving(false);

    if (!r) {
      setEditing({} as Route);
      setForm({
        from: '',
        to: '',
        label: '',
        description: '',
        distance: '',
        duration: '',
        pricing: defaultPricing
      });
      return;
    }

    const distanceVal = parseNumericInput(r.distance) ?? (r as any).distance;
    const durationVal = parseNumericInput(r.duration) ?? (r as any).duration;

    const pricing = Array.isArray(r.pricing)
      ? r.pricing.map((p: PricingItem) => ({
          passengers: String(p.passengers || ''),
          price: p.price ?? 0,
          vehicleType: p.vehicleType || ''
        }))
      : defaultPricing;

    setEditing(r);
    setForm({
      from: r.from,
      to: r.to,
      label: r.label || '',
      description: r.description || '',
      distance: distanceVal,
      duration: durationVal,
      pricing
    });
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(s => ({ ...s, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function updatePricingRow(index: number, patch: Partial<PricingRow>) {
    setForm(s => {
      const pricing = s.pricing.map((row, i) => (i === index ? { ...row, ...patch } : row));
      return { ...s, pricing };
    });
    setErrors(e => {
      const pricingErr = (e.pricing || []).slice();
      pricingErr[index] = null;
      return { ...e, pricing: pricingErr };
    });
  }

  function addPricingRow() {
    setForm(s => ({
      ...s,
      pricing: [...s.pricing, { passengers: '', price: 0, vehicleType: '' }]
    }));
    setErrors(e => ({ ...e, pricing: [...(e.pricing || []), null] }));
  }

  function removePricingRow(index: number) {
    setForm(s => ({
      ...s,
      pricing: s.pricing.filter((_, i) => i !== index)
    }));
    setErrors(e => ({
      ...e,
      pricing: (e.pricing || []).filter((_, i) => i !== index)
    }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = { pricing: [] };
    if (!form.from.trim()) newErrors.from = 'Start location is required';
    if (!form.to.trim()) newErrors.to = 'Destination is required';

    if (form.label.length > 50) newErrors.label = 'Label must be under 50 characters';
    if (form.description.length > 255)
      newErrors.description = 'Description must be under 255 characters';

    if (form.distance && Number.isNaN(Number(form.distance))) {
      newErrors.distance = 'Must be a number';
    } else if (String(form.distance).length > 10) {
      newErrors.distance = 'Number too long';
    }

    if (form.duration && Number.isNaN(Number(form.duration))) {
      newErrors.duration = 'Must be a number';
    } else if (String(form.duration).length > 10) {
      newErrors.duration = 'Number too long';
    }

    if (!Array.isArray(form.pricing) || form.pricing.length === 0) {
      newErrors._form = 'Add at least one pricing row';
    } else {
      newErrors.pricing = [];
      form.pricing.forEach((p, i) => {
        if (!p.passengers || !String(p.passengers).trim()) {
          newErrors.pricing![i] = 'Passengers range is required';
        } else if (String(p.passengers).length > 30) {
          newErrors.pricing![i] = 'Passengers text too long';
        } else if (!p.vehicleType || !String(p.vehicleType).trim()) {
          newErrors.pricing![i] = 'Vehicle type is required';
        } else if (String(p.vehicleType).length > 30) {
          newErrors.pricing![i] = 'Vehicle type text too long';
        } else if (p.price === '' || p.price === null || Number.isNaN(Number(p.price))) {
          newErrors.pricing![i] = 'Price must be a number';
        } else if (Number(p.price) < 0) {
          newErrors.pricing![i] = 'Price cannot be negative';
        } else {
          newErrors.pricing![i] = null;
        }
      });
    }

    setErrors(newErrors);
    const hasFieldErrors = !!(
      newErrors.from ||
      newErrors.to ||
      newErrors.label ||
      newErrors.description ||
      newErrors.distance ||
      newErrors.duration ||
      newErrors._form
    );
    const hasPricingErrors =
      Array.isArray(newErrors.pricing) && newErrors.pricing.some(x => x);
    return !(hasFieldErrors || hasPricingErrors);
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const pricing = form.pricing.map(p => ({
        passengers: p.passengers,
        price: Number(p.price),
        vehicleType: p.vehicleType
      }));

      const payload = {
        from: form.from,
        to: form.to,
        label: form.label.trim() || null,
        description: form.description.trim() || null,
        distance: form.distance ? `${form.distance} ${DISTANCE_UNIT}` : '',
        duration: form.duration ? `${form.duration} ${DURATION_UNIT}` : '',
        pricing
      };

      if (editing && (editing as any).id) {
        const res = await fetch('/api/routes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: (editing as any).id, ...payload })
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch('/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Create failed');
      }

      await load();
      setEditing(null);
    } catch (err: any) {
      alert(err.message || 'Save failed — check pricing data');
    } finally {
      setSaving(false);
    }
  }

  const saveDisabled = saving || loading;

  return (
    <div className="bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: PRIMARY_COLOR }}
        >
          Routes
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex gap-3">
            <button
              className="text-white px-4 py-2 rounded shadow transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => startEdit(undefined)}
              style={{
                backgroundColor: ACCENT_COLOR,
                boxShadow: `0 3px 6px ${ACCENT_COLOR}30`,
                '--tw-ring-color': ACCENT_COLOR
              } as React.CSSProperties}
            >
              + Add route
            </button>
            <button
              className="px-4 py-2 border rounded hover:bg-gray-200 text-gray-700 transition-colors"
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="sm:ml-auto text-sm text-gray-600 mt-2 sm:mt-0">
            {loading ? 'Loading...' : `${routes.length} routes configured`}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 mb-4 font-medium p-3 bg-red-50 border border-red-200 rounded">
          Error: {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Routes list */}
        <div>
          {!loading && routes.length === 0 && (
            <p className="text-sm text-gray-600 p-4 border rounded bg-white">
              No routes configured.
            </p>
          )}

          <ul className="space-y-4">
            {routes.map(r => (
              <li
                key={r.id}
                className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {r.from} <span style={{ color: ACCENT_COLOR }}>→</span> {r.to}
                    </div>

                    {(r.label || r.description) && (
                      <div className="text-sm text-gray-700 mt-1">
                        {r.label && <span className="font-medium mr-1">{r.label}</span>}
                        {r.description && (
                          <span className="text-gray-500 italic">
                            ({r.description})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-gray-500 mt-1">
                      {r.distance} • {r.duration}
                    </div>

                    <div className="mt-3">
                      <div className="text-xs text-gray-500 uppercase mb-1 font-medium">
                        Pricing
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {r.pricing && Array.isArray(r.pricing) ? (
                          r.pricing.map((p: PricingItem, i: number) => (
                            <div
                              key={i}
                              className="text-sm px-2 py-1 border rounded bg-gray-50 font-medium"
                              style={{ color: PRIMARY_COLOR }}
                              title={p.vehicleType}
                            >
                              <span className="text-xs font-normal text-gray-600 mr-1">
                                {p.vehicleType} /
                              </span>
                              {p.passengers}:{' '}
                              <span className="font-bold">
                                ${Number(p.price).toFixed(2)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">—</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 sm:items-end flex-shrink-0">
                    <button
                      className="px-3 py-1 border rounded text-sm hover:bg-gray-200 text-gray-700 transition-colors"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Add / Edit form */}
        {editing !== null && (
          <div className="bg-white p-6 border rounded-lg shadow-xl sticky top-4 h-fit">
            <h3
              className="text-lg sm:text-xl font-bold mb-4"
              style={{ color: PRIMARY_COLOR }}
            >
              {(editing as any).id
                ? `Edit route #${(editing as any).id}`
                : 'Create new route'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4" noValidate>
              {/* Route Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-gray-100">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start location
                  </label>
                  <input
                    className={getInputClass(!!errors.from)}
                    style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                    placeholder="E.g. Airport"
                    value={form.from}
                    onChange={e => updateField('from', e.target.value)}
                    required
                  />
                  {errors.from && (
                    <div className="text-xs text-red-600 mt-1 absolute">
                      {errors.from}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    className={getInputClass(!!errors.to)}
                    style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                    placeholder="E.g. Downtown"
                    value={form.to}
                    onChange={e => updateField('to', e.target.value)}
                    required
                  />
                  {errors.to && (
                    <div className="text-xs text-red-600 mt-1 absolute">
                      {errors.to}
                    </div>
                  )}
                </div>
              </div>

              {/* Label / Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4 border-b border-gray-100">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label (Optional, max 50)
                  </label>
                  <input
                    className={getInputClass(!!errors.label)}
                    style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                    placeholder="E.g. Express Route, Premium"
                    value={form.label}
                    onChange={e => updateField('label', e.target.value)}
                    maxLength={50}
                  />
                  {errors.label && (
                    <div className="text-xs text-red-600 mt-1 absolute">
                      {errors.label}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional, max 255)
                  </label>
                  <input
                    className={getInputClass(!!errors.description)}
                    style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                    placeholder="E.g. Via highway 5, fastest route"
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                    maxLength={255}
                  />
                  {errors.description && (
                    <div className="text-xs text-red-600 mt-1 absolute">
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Distance / Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 pb-4 border-b border-gray-100">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance ({DISTANCE_UNIT})
                  </label>
                  <div className="relative">
                    <input
                      className={getInputClass(!!errors.distance) + ' pr-12'}
                      style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                      placeholder="E.g. 10"
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.distance}
                      onChange={e => updateField('distance', e.target.value)}
                    />
                    <span className="absolute right-0 top-0 h-full px-3 flex items-center bg-gray-100 border-l rounded-r text-sm text-gray-500 pointer-events-none">
                      {DISTANCE_UNIT}
                    </span>
                  </div>
                  {errors.distance && (
                    <div className="text-xs text-red-600 mt-1 absolute">
                      {errors.distance}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated duration ({DURATION_UNIT})
                  </label>
                  <div className="relative">
                    <input
                      className={getInputClass(!!errors.duration) + ' pr-12'}
                      style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                      placeholder="E.g. 15"
                      type="number"
                      min="0"
                      value={form.duration}
                      onChange={e => updateField('duration', e.target.value)}
                    />
                    <span className="absolute right-0 top-0 h-full px-3 flex items-center bg-gray-100 border-l rounded-r text-sm text-gray-500 pointer-events-none">
                      {DURATION_UNIT}
                    </span>
                  </div>
                  {errors.duration && (
                    <div className="text-xs text-red-600 mt-1 absolute">
                      {errors.duration}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <div className="flex items-center justify-between mt-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 pb-10">
                      Pricing (USD)
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-200 transition-colors text-gray-700 font-medium"
                    onClick={addPricingRow}
                  >
                    + Add row
                  </button>
                </div>

                {errors._form && (
                  <div className="text-xs text-red-600 mb-2 font-medium">
                    {errors._form}
                  </div>
                )}

                <div className="space-y-3">
                  {form.pricing.map((row, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3 min-w-0 relative">
                        {i === 0 && (
                          <label className="text-xs text-gray-600 absolute -top-5">
                            Vehicle Type
                          </label>
                        )}
                        <input
                          className={getInputClass(
                            !!(errors.pricing && errors.pricing[i])
                          )}
                          style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                          placeholder="E.g. Sedan, SUV"
                          value={row.vehicleType}
                          onChange={e =>
                            updatePricingRow(i, { vehicleType: e.target.value })
                          }
                          maxLength={30}
                        />
                      </div>

                      <div className="col-span-2 min-w-0 relative">
                        {i === 0 && (
                          <label className="text-xs text-gray-600 absolute -top-5">
                            Passenger
                          </label>
                        )}
                        <input
                          className={getInputClass(
                            !!(errors.pricing && errors.pricing[i])
                          )}
                          style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                          placeholder="E.g. 1-2"
                          value={row.passengers}
                          onChange={e =>
                            updatePricingRow(i, { passengers: e.target.value })
                          }
                          maxLength={30}
                        />
                      </div>

                      <div className="col-span-5 min-w-0 relative pl-6">
                        {i === 0 && (
                          <label className="text-xs text-gray-600 absolute -top-5">
                            Price
                          </label>
                        )}
                        <div className="relative">
                          <input
                            className={
                              getInputClass(
                                !!(errors.pricing && errors.pricing[i])
                              ) + ' pl-6'
                            }
                            style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            value={String(row.price)}
                            onChange={e =>
                              updatePricingRow(i, { price: e.target.value })
                            }
                          />
                          <span className="absolute left-0 top-0 h-full px-2 flex items-center text-sm text-gray-500 pointer-events-none">
                            $
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-start">
                        <button
                          type="button"
                          className="w-full bg-red-600 h-full px-1 py-2 border rounded text-xs hover:bg-red-700 transition-colors text-white"
                          onClick={() => removePricingRow(i)}
                        >
                          Remove
                        </button>
                      </div>

                      {errors.pricing && errors.pricing[i] && (
                        <div className="col-span-12 text-xs text-red-600 -mt-1 font-medium">
                          {errors.pricing[i]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 pt-2">
                  Prices are saved as numbers (e.g. 12.50). Vehicle type and passenger
                  range are required for each row.
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className={`text-white px-4 py-2 rounded shadow transition-all ${
                    saveDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                  style={{ backgroundColor: SUCCESS_COLOR }}
                  disabled={saveDisabled}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-200 transition-colors text-gray-700"
                  onClick={() => startEdit(undefined)}
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-200 transition-colors text-gray-700"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   Bookings Admin UI
======================= */

function BookingsAdminPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Filters
  const [search, setSearch] = useState('');
  const [filterBookingType, setFilterBookingType] = useState<'all' | 'standard' | 'hourly'>(
    'all'
  );
  const [filterEmailStatus, setFilterEmailStatus] = useState<'all' | 'sent' | 'not-sent'>(
    'all'
  );
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterInvoice, setFilterInvoice] = useState('');

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
    if (!confirm('Delete this booking?')) return;

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

  function getInvoiceNumber(b: Booking): string | null {
    if (!b.createdAt) return null;
    const created = new Date(b.createdAt);
    if (Number.isNaN(created.getTime())) return null;

    const y = created.getFullYear();
    const m = String(created.getMonth() + 1).padStart(2, '0');
    const d = String(created.getDate()).padStart(2, '0');
    const datePart = `${y}${m}${d}`;

    const hh = String(created.getHours()).padStart(2, '0');
    const mm = String(created.getMinutes()).padStart(2, '0');
    const ss = String(created.getSeconds()).padStart(2, '0');
    const ms = String(created.getMilliseconds()).padStart(3, '0');
    const timePart = `${hh}${mm}${ss}${ms}`;

    return `INV-${datePart}-${timePart}`;
  }

  // 🔎 Derived: filtered bookings
  const filteredBookings = React.useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const invoiceFilterLower = filterInvoice.trim().toLowerCase();

    // Parse date filters (if provided)
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;

    if (toDate) {
      // include the whole "to" day
      toDate.setHours(23, 59, 59, 999);
    }

    return bookings.filter(b => {
      const invoiceNumber = (getInvoiceNumber(b) || '').toLowerCase();

      // Search filter (name, email, phone, locations, session, invoice)
      if (searchLower) {
        const haystack = [
          b.fullName,
          b.email,
          b.contactNumber,
          b.pickupLocation,
          b.pickupAddress || '',
          b.dropoffLocation,
          b.dropoffAddress || '',
          b.id,
          invoiceNumber
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(searchLower)) return false;
      }

      // Invoice number filter
      if (invoiceFilterLower) {
        if (!invoiceNumber || !invoiceNumber.includes(invoiceFilterLower)) return false;
      }

      // Booking type filter
      const type = (b.bookingType || 'standard') as 'standard' | 'hourly';
      if (filterBookingType !== 'all' && type !== filterBookingType) return false;

      // Email status filter
      if (filterEmailStatus === 'sent' && !b.emailSent) return false;
      if (filterEmailStatus === 'not-sent' && b.emailSent) return false;

      // Date range filter (createdAt)
      if (b.createdAt && (fromDate || toDate)) {
        const created = new Date(b.createdAt);
        if (fromDate && created < fromDate) return false;
        if (toDate && created > toDate) return false;
      }

      return true;
    });
  }, [
    bookings,
    search,
    filterBookingType,
    filterEmailStatus,
    filterDateFrom,
    filterDateTo,
    filterInvoice
  ]);

  return (
    <div className="bg-gray-50 rounded-lg">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: PRIMARY_COLOR }}
          >
            Bookings
          </h2>
          <p className="text-xs text-gray-500">
            View &amp; manage all Stripe bookings (standard &amp; hourly hire)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-200 text-gray-700 transition-colors"
            onClick={loadBookings}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="text-sm text-gray-600 text-right">
            {loading
              ? 'Loading...'
              : `${filteredBookings.length} of ${bookings.length} bookings`}
          </div>
        </div>
      </div>

      {/* 🔍 Filters row */}
      <div className="mb-4 p-4 bg-white border rounded-lg shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search (name, email, phone, locations, session, invoice)
            </label>
            <input
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
              placeholder="Type to search bookings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Booking type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Booking type
            </label>
            <select
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
              value={filterBookingType}
              onChange={e =>
                setFilterBookingType(e.target.value as 'all' | 'standard' | 'hourly')
              }
            >
              <option value="all">All types</option>
              <option value="standard">Standard transfer</option>
              <option value="hourly">Hourly hire</option>
            </select>
          </div>

          {/* Email status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email status
            </label>
            <select
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
              value={filterEmailStatus}
              onChange={e =>
                setFilterEmailStatus(e.target.value as 'all' | 'sent' | 'not-sent')
              }
            >
              <option value="all">All</option>
              <option value="sent">Emails sent</option>
              <option value="not-sent">Emails not sent</option>
            </select>
          </div>
        </div>

        {/* Date range + Invoice filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Created from
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Created to
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
            />
          </div>

          {/* Invoice number filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Invoice number (INV-…)
            </label>
            <input
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
              placeholder="e.g. INV-20251210-175427470"
              value={filterInvoice}
              onChange={e => setFilterInvoice(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1 flex items-end justify-start sm:justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 text-xs border rounded text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setSearch('');
                setFilterBookingType('all');
                setFilterEmailStatus('all');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterInvoice('');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 mb-4 font-medium p-3 bg-red-50 border border-red-200 rounded">
          Error: {error}
        </p>
      )}

      {!loading && filteredBookings.length === 0 && !error && (
        <p className="text-sm text-gray-600 p-4 border rounded bg-white">
          No bookings match your filters.
        </p>
      )}

      <ul className="space-y-4">
        {filteredBookings.map(b => {
          const amount =
            typeof b.totalPriceCents === 'number'
              ? (b.totalPriceCents / 100).toFixed(2)
              : '—';

          const bookingType: 'standard' | 'hourly' =
            (b.bookingType as 'standard' | 'hourly') || 'standard';

          const bookingTypeLabel =
            bookingType === 'hourly' ? 'Hourly hire' : 'Standard transfer';

          const bookingTypeClass =
            bookingType === 'hourly'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-700';

          const invoiceNumber = getInvoiceNumber(b);

          return (
            <li
              key={b.id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                <div>
                  {/* Customer + badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="font-semibold text-base sm:text-lg"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {b.fullName}
                    </div>

                    <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600">
                      {b.email}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600">
                      {b.contactNumber}
                    </span>

                    {/* Booking type badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${bookingTypeClass}`}
                    >
                      {bookingTypeLabel}
                    </span>
                  </div>

                  {/* Route / hourly info */}
                  {bookingType === 'hourly' ? (
                    <>
                      <div className="mt-1 text-sm text-gray-700">
                        Pickup: {b.hourlyPickupLocation || b.pickupLocation}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Hours: {b.hourlyHours ?? 'N/A'} • Vehicle:{' '}
                        {b.hourlyVehicleType || 'N/A'}
                      </div>
                    </>
                  ) : (
                    <div className="mt-1 text-sm text-gray-700">
                      {b.pickupLocation}
                      {b.pickupAddress ? ` (${b.pickupAddress})` : ''}{' '}
                      <span style={{ color: ACCENT_COLOR }}>→</span>{' '}
                      {b.dropoffLocation}
                      {b.dropoffAddress ? ` (${b.dropoffAddress})` : ''}
                    </div>
                  )}

                  {/* Date & pax */}
                  <div className="mt-1 text-xs text-gray-500">
                    {b.pickupDate} • {b.pickupTime} • {b.passengers} pax •{' '}
                    {b.luggage} bags
                    {b.childSeat && ' • Child seat'}
                    {b.flightNumber && ` • Flight: ${b.flightNumber}`}
                  </div>

                  {b.id && (
                    <div className="mt-1 text-xs text-gray-400 break-all">
                      Session: {b.id}
                    </div>
                  )}

                  {invoiceNumber && (
                    <div className="mt-1 text-xs text-gray-500 break-all">
                      Invoice: <span className="font-mono">{invoiceNumber}</span>
                    </div>
                  )}
                </div>

                {/* Right: price & status & delete */}
                <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0 mt-2 sm:mt-0">
                  <div className="text-lg font-bold" style={{ color: PRIMARY_COLOR }}>
                    {amount !== '—' ? `${amount} ${b.currency || 'AUD'}` : '—'}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full border ${
                      b.emailSent
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}
                  >
                    {b.emailSent ? 'Emails sent' : 'Emails not sent'}
                  </div>
                  {b.createdAt && (
                    <div className="text-xs text-gray-400">
                      Created: {new Date(b.createdAt).toLocaleString()}
                    </div>
                  )}

                  <button
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    onClick={() => handleDeleteBooking(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
