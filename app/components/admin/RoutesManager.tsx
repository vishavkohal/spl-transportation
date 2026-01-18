'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, RefreshCw, X, Save, AlertCircle } from 'lucide-react';
import type { Route, PricingTier } from '../../types';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const SUCCESS_COLOR = '#16A34A';
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
        'p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-500 bg-white';
    const errorStyle = 'border-red-500 bg-red-50';
    const normalStyle = 'border-gray-200 focus:border-[#A61924] focus:ring-[#A61924]/20';
    return `${base} ${hasError ? errorStyle : normalStyle}`;
};

const parseNumericInput = (displayValue: string | null): number | null => {
    if (!displayValue) return null;
    const value = String(displayValue).replace(/[^0-9.]/g, '').trim();
    const parsed = Number(value);
    return isNaN(parsed) || value === '' ? null : parsed;
};

export default function RoutesManager() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Route | null>(null);

    const defaultPricing: PricingRow[] = [
        { passengers: '1-3', price: 0, vehicleType: 'Sedan' },
        { passengers: '4-7', price: 0, vehicleType: 'Van' },
        { passengers: '8-13', price: 0, vehicleType: 'Minibus' }
    ];

    const [form, setForm] = useState<FormState>({
        from: '',
        to: '',
        label: '',
        description: '',
        distance: '' as string | number,
        duration: '' as string | number,
        pricing: defaultPricing
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
            ? r.pricing.map((p: PricingTier) => ({
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
            newErrors.from || newErrors.to || newErrors.label || newErrors.description ||
            newErrors.distance || newErrors.duration || newErrors._form
        );
        const hasPricingErrors = Array.isArray(newErrors.pricing) && newErrors.pricing.some(x => x);
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>Route Management</h2>
                    <p className="text-sm text-gray-500">Add, edit, or delete transfer routes and pricing.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => startEdit(undefined)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#A61924] text-white rounded-lg text-sm font-medium hover:bg-[#8B151F] transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Route
                    </button>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 m-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* List */}
            <div className="divide-y divide-gray-100">
                {!loading && routes.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No routes found. Click "Add Route" to get started.
                    </div>
                )}

                {routes.map(r => (
                    <div key={r.id} className="p-6 hover:bg-gray-50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{r.from}</h3>
                                    <span className="text-gray-300">→</span>
                                    <h3 className="text-lg font-bold text-gray-900">{r.to}</h3>
                                    {r.label && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                                            {r.label}
                                        </span>
                                    )}
                                </div>

                                {(r.distance || r.duration) && (
                                    <div className="text-sm text-gray-500 flex gap-3 mb-3">
                                        {r.distance && <span>{r.distance}</span>}
                                        {r.distance && r.duration && <span>•</span>}
                                        {r.duration && <span>{r.duration}</span>}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {r.pricing && Array.isArray(r.pricing) && r.pricing.map((p, i) => (
                                        <div key={i} className="text-xs border rounded-md px-2 py-1 bg-white text-gray-600 shadow-sm flex items-center gap-1.5">
                                            <span className="font-semibold">{p.vehicleType}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>{p.passengers} pax</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="font-bold text-[#18234B]">${Number(p.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(r)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal/Drawer */}
            {editing !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                {(editing as any).id ? 'Edit Route' : 'New Route'}
                            </h3>
                            <button
                                onClick={() => setEditing(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                        <input
                                            className={getInputClass(!!errors.from)}
                                            value={form.from}
                                            onChange={e => updateField('from', e.target.value)}
                                            placeholder="e.g. Cairns Airport"
                                        />
                                        {errors.from && <p className="text-xs text-red-600 mt-1">{errors.from}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                        <input
                                            className={getInputClass(!!errors.to)}
                                            value={form.to}
                                            onChange={e => updateField('to', e.target.value)}
                                            placeholder="e.g. Port Douglas"
                                        />
                                        {errors.to && <p className="text-xs text-red-600 mt-1">{errors.to}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                        <input
                                            className={getInputClass(!!errors.distance)}
                                            value={form.distance}
                                            type="number"
                                            step="0.1"
                                            onChange={e => updateField('distance', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                        <input
                                            className={getInputClass(!!errors.duration)}
                                            value={form.duration}
                                            type="number"
                                            onChange={e => updateField('duration', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Label (Optional)</label>
                                    <input
                                        className={getInputClass(!!errors.label)}
                                        value={form.label}
                                        onChange={e => updateField('label', e.target.value)}
                                        placeholder="e.g. Popular"
                                    />
                                </div>

                                {/* Pricing Section */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 text-sm">Pricing Tiers</h4>
                                        <button
                                            type="button"
                                            onClick={addPricingRow}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            + Add Tier
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {form.pricing.map((row, i) => (
                                            <div key={i} className="flex gap-3 items-start">
                                                <div className="flex-1">
                                                    <input
                                                        className={getInputClass(!!(errors.pricing && errors.pricing[i]))}
                                                        placeholder="Vehicle"
                                                        value={row.vehicleType}
                                                        onChange={e => updatePricingRow(i, { vehicleType: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        className={getInputClass(!!(errors.pricing && errors.pricing[i]))}
                                                        placeholder="Pax"
                                                        value={row.passengers}
                                                        onChange={e => updatePricingRow(i, { passengers: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                                                    <input
                                                        className={`${getInputClass(!!(errors.pricing && errors.pricing[i]))} pl-6`}
                                                        placeholder="0.00"
                                                        type="number"
                                                        value={row.price}
                                                        onChange={e => updatePricingRow(i, { price: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePricingRow(i)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors._form && <p className="text-xs text-red-600 mt-2">{errors._form}</p>}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(null)}
                                        className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-[#A61924] text-white rounded-lg text-sm font-medium hover:bg-[#8B151F] transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Route
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
