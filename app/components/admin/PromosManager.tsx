'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle, XCircle, Percent, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCodeItem {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  targetType: 'ALL' | 'ROUND_TRIP';
  minSpend?: number | null;
  isActive: boolean;
  usageCount: number;
  maxUsages?: number | null;
  createdAt: string;
}

export default function PromosManager() {
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'ROUND_TRIP'>('ALL');
  const [minSpend, setMinSpend] = useState('');
  const [maxUsages, setMaxUsages] = useState('');

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      if (res.ok && data.promos) {
        setPromos(data.promos);
      }
    } catch (e) {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.error('Please fill in required promo details');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          targetType,
          minSpend: minSpend ? parseFloat(minSpend) : null,
          maxUsages: maxUsages ? parseInt(maxUsages, 10) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create promo');

      toast.success(`Promo code ${data.promo.code} created!`);
      setCode('');
      setDiscountValue('');
      setMinSpend('');
      setMaxUsages('');
      fetchPromos();
    } catch (err: any) {
      toast.error(err.message || 'Error creating promo code');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success('Promo status updated');
        fetchPromos();
      }
    } catch (e) {
      toast.error('Failed to update promo');
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${codeName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Deleted ${codeName}`);
        fetchPromos();
      }
    } catch (e) {
      toast.error('Failed to delete promo');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#102A43] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#0F766E]" />
            Promos & Discounts Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage promotional codes, round-trip discount rules, and usage limits.
          </p>
        </div>
        <button
          onClick={fetchPromos}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Create Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43] mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#0F766E]" />
          Create New Promo Code
        </h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Promo Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER10"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Type</label>
            <select
              value={discountType}
              onChange={e => setDiscountType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount ($ AUD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '($ AUD)'}
            </label>
            <input
              type="number"
              step="any"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              placeholder={discountType === 'PERCENTAGE' ? '10' : '20'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Applies To</label>
            <select
              value={targetType}
              onChange={e => setTargetType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            >
              <option value="ALL">All Transfers (One-Way & Round-Trip)</option>
              <option value="ROUND_TRIP">Round-Trip Transfers Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Spend ($ Optional)</label>
            <input
              type="number"
              value={minSpend}
              onChange={e => setMinSpend(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Usages (Optional)</label>
            <input
              type="number"
              value={maxUsages}
              onChange={e => setMaxUsages(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide bg-[#102A43] hover:bg-[#0C5D59] text-white shadow-md transition-all disabled:opacity-50"
            >
              {creating ? 'Saving…' : 'Create Promo Code'}
            </button>
          </div>
        </form>
      </div>

      {/* Promos Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Active & Past Promo Codes</h3>
          <span className="text-xs text-slate-500 font-medium">{promos.length} Code(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading promo codes…</div>
        ) : promos.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No promo codes created yet. Create one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Usage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {promos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-[#102A43]">{p.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `$${p.discountValue} OFF`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.targetType === 'ROUND_TRIP' ? 'Round-Trip Only' : 'All Transfers'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.usageCount} {p.maxUsages ? `/ ${p.maxUsages}` : 'uses'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleActive(p.id, p.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.isActive ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete promo code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
