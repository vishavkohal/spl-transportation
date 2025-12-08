'use client';
import React, { useEffect, useState } from 'react';

// 1. UPDATED: Type definition to match the new backend DTO
// We include null for optional fields (label, description)
export type PricingItem = {
  passengers: string;
  price: number;
  vehicleType: string; // New field
};

export type Route = {
  id: number;
  from: string;
  to: string;
  label: string | null; // New field
  description: string | null; // New field
  distance: string;
  duration: string;
  pricing: PricingItem[];
};

// Booking type for admin view
type Booking = {
  id: number;
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
};

// Define the custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy (used for primary text/headings)
const ACCENT_COLOR = '#A61924'; // Deep Red (used for buttons, focus rings, and accents)
const SUCCESS_COLOR = '#16A34A'; // Tailwind green-600 for Save button

// --- CONSTANTS ---
const DISTANCE_UNIT = 'km';
const DURATION_UNIT = 'min';

// 2. UPDATED: PricingRow to include vehicleType
type PricingRow = { passengers: string; price: number | string; vehicleType: string };

// 3. UPDATED: Form state to include label and description
type FormState = {
  from: string;
  to: string;
  label: string; // Treat as string in form, submit null/empty string
  description: string; // Treat as string in form, submit null/empty string
  distance: string | number;
  duration: string | number;
  pricing: PricingRow[];
};

type FormErrors = {
  from?: string;
  to?: string;
  label?: string; // New field error
  description?: string; // New field error
  distance?: string;
  duration?: string;
  pricing?: (string | null)[];
  _form?: string | null;
};

// Reusable Input Class Generator for Form
const getInputClass = (hasError: boolean): string => {
  const base = `p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-150`;
  const errorStyle = `border-red-500`;
  const normalStyle = `border-gray-200 focus:ring-[${ACCENT_COLOR}]`;

  return `${base} ${hasError ? errorStyle : normalStyle}`;
};

// Helper to convert display value (e.g., "10 km") to raw number (10)
const parseNumericInput = (displayValue: string | null): number | null => {
  if (!displayValue) return null;
  const value = String(displayValue).replace(/[^0-9.]/g, '').trim();
  const parsed = Number(value);
  return isNaN(parsed) || value === '' ? null : parsed;
};

// =====================
// Top-level AdminPanel
// =====================

type AdminTab = 'routes' | 'bookings';

function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('routes');

  // Check if user is already logged in (cookie-based)
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

  // Authenticated layout with navbar (Routes / Bookings + Logout)
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
            <p className="text-xs text-gray-500">
              Manage routes and bookings
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
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

            {/* Logout in navbar */}
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

// =======================
// Routes Admin UI
// =======================

function RoutesAdminPanel() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Route | null>(null);

  // 4. UPDATED: default pricing includes vehicleType
  const defaultPricing: PricingRow[] = [
    { passengers: '1-2', price: 0, vehicleType: 'Sedan' },
    { passengers: '3-4', price: 0, vehicleType: 'SUV' },
    { passengers: '5+', price: 0, vehicleType: 'Van' }
  ];

  // 5. UPDATED: form state includes label and description
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

  // 6. UPDATED: startEdit to map new fields
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

  // 7. UPDATED: updatePricingRow to handle vehicleType
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

  // 9. UPDATED: validate to check label, description, and vehicleType
  function validate(): boolean {
    const newErrors: FormErrors = { pricing: [] };
    if (!form.from.trim()) newErrors.from = 'Start location is required';
    if (!form.to.trim()) newErrors.to = 'Destination is required';

    if (form.label.length > 50) newErrors.label = 'Label must be under 50 characters';
    if (form.description.length > 255) newErrors.description = 'Description must be under 255 characters';

    // Validate distance as a number
    if (form.distance && Number.isNaN(Number(form.distance))) {
      newErrors.distance = 'Must be a number';
    } else if (String(form.distance).length > 10) {
      newErrors.distance = 'Number too long';
    }

    // Validate duration as a number
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

  // 10. UPDATED: handleSave to include new fields in the payload
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
      {/* Header row for routes section */}
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
        {/* Left: routes list */}
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
                      {r.from}{' '}
                      <span style={{ color: ACCENT_COLOR }}>→</span> {r.to}
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

        {/* Right: Add / Edit form — shown only when editing !== null */}
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
              {/* Route Details (FROM/TO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-gray-100">
                {/* Start location */}
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

                {/* Destination */}
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

              {/* Label and Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-4 border-b border-gray-100">
                {/* Label */}
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

                {/* Description */}
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

              {/* Distance and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 pb-4 border-b border-gray-100">
                {/* Distance */}
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

                {/* Duration */}
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

              {/* Pricing Section */}
              <div>
                <div className="flex items-center justify-between mt-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                      {/* Vehicle Type */}
                      <div className="col-span-4 min-w-0 relative">
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

                      {/* Passenger range */}
                      <div className="col-span-4 min-w-0 relative">
                        {i === 0 && (
                          <label className="text-xs text-gray-600 absolute -top-5">
                            Passenger range
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

                      {/* Price */}
                      <div className="col-span-2 min-w-0 relative">
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

                      {/* Remove button */}
                      <div className="col-span-2 flex items-start">
                        <button
                          type="button"
                          className="w-full h-full px-1 py-2 border rounded text-sm hover:bg-gray-200 transition-colors text-gray-700"
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

              {/* Action Buttons */}
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

// =======================
// Bookings Admin UI
// =======================

function BookingsAdminPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      // You should implement this API on the backend using your booking.ts + Prisma
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

  return (
    <div className="bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: PRIMARY_COLOR }}
        >
          Bookings
        </h2>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-200 text-gray-700 transition-colors"
            onClick={loadBookings}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${bookings.length} bookings`}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 mb-4 font-medium p-3 bg-red-50 border border-red-200 rounded">
          Error: {error}
        </p>
      )}

      {!loading && bookings.length === 0 && !error && (
        <p className="text-sm text-gray-600 p-4 border rounded bg-white">
          No bookings found yet.
        </p>
      )}

      <ul className="space-y-4">
        {bookings.map(b => {
          const amount =
            typeof b.totalPriceCents === 'number'
              ? (b.totalPriceCents / 100).toFixed(2)
              : '—';
          return (
            <li
              key={b.id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                <div>
                  {/* Customer + route */}
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
                  </div>

                  <div className="mt-1 text-sm text-gray-700">
                    {b.pickupLocation}
                    {b.pickupAddress ? ` (${b.pickupAddress})` : ''}{' '}
                    <span style={{ color: ACCENT_COLOR }}>→</span>{' '}
                    {b.dropoffLocation}
                    {b.dropoffAddress ? ` (${b.dropoffAddress})` : ''}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    {b.pickupDate} • {b.pickupTime} • {b.passengers} pax •{' '}
                    {b.luggage} bags
                    {b.childSeat && ' • Child seat'}
                    {b.flightNumber && ` • Flight: ${b.flightNumber}`}
                  </div>

                  {b.stripeSessionId && (
                    <div className="mt-1 text-xs text-gray-400 break-all">
                      Session: {b.stripeSessionId}
                    </div>
                  )}
                </div>

                {/* Right: price & status */}
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
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
