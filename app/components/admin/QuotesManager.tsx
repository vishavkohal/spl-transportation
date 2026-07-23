'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, Trash2, FileText, Download, Save, CheckCircle, Clock, MapPin, Calendar, User, DollarSign, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const PRIMARY_COLOR = '#102A43';
const ACCENT_COLOR = '#0F766E';

export type QuoteRequestItem = {
  id: string;
  travelDate: string;
  travelTime: string;
  passengers: number;
  pickupAddress: string;
  dropoffAddress: string;
  checkInBags?: number;
  carryOnBags?: number;
  childSeats?: string;
  flightArrivalType?: string | null;
  flightArrivalNumber?: string | null;
  flightArrivalTime?: string | null;
  flightDepartureType?: string | null;
  flightDepartureNumber?: string | null;
  flightDepartureTime?: string | null;
  fullName: string;
  email: string;
  phone: string;
  message?: string | null;
  status: 'PENDING' | 'QUOTED' | 'CANCELLED';
  amount?: number | null;
  processingFee?: number | null;
  totalAmount?: number | null;
  adminNotes?: string | null;
  createdAt: string;
};

export default function QuotesManager() {
  const [quotes, setQuotes] = useState<QuoteRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'QUOTED' | 'CANCELLED'>('all');
  
  // Expanded quote item for detail view / pricing edits
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('QUOTED');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  function loadQuotes() {
    setLoading(true);
    fetch('/api/admin/quote-requests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuotes(data);
        }
      })
      .catch(err => console.error('Failed to load quotes:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = quotes;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(quote =>
        [quote.fullName, quote.email, quote.phone, quote.pickupAddress, quote.dropoffAddress, quote.id]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(quote => quote.status === statusFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotes, search, statusFilter]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const pending = quotes.filter(q => q.status === 'PENDING').length;
    const quoted = quotes.filter(q => q.status === 'QUOTED').length;
    return { total, pending, quoted };
  }, [quotes]);

  const handleExpand = (quote: QuoteRequestItem) => {
    if (expandedId === quote.id) {
      setExpandedId(null);
    } else {
      setExpandedId(quote.id);
      setEditAmount(quote.amount !== undefined && quote.amount !== null ? String(quote.amount) : '');
      setEditStatus(quote.status || 'QUOTED');
      setEditNotes(quote.adminNotes || '');
      setSaveSuccess(null);
    }
  };

  const calculatedFee = useMemo(() => {
    const num = parseFloat(editAmount);
    if (isNaN(num) || num <= 0) return 0;
    return Number((num * 0.025).toFixed(2));
  }, [editAmount]);

  const calculatedTotal = useMemo(() => {
    const num = parseFloat(editAmount);
    if (isNaN(num) || num <= 0) return 0;
    return Number((num + calculatedFee).toFixed(2));
  }, [editAmount, calculatedFee]);

  const handleSaveQuote = async (id: string) => {
    setSavingId(id);
    setSaveSuccess(null);

    const amountNum = editAmount.trim() === '' ? null : parseFloat(editAmount);

    try {
      const res = await fetch('/api/admin/quote-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          amount: amountNum,
          status: editStatus,
          adminNotes: editNotes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save quote updates');
      }

      setSaveSuccess(id);
      loadQuotes();
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving quote:', err);
      alert('Failed to save quote changes.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote request?')) return;

    try {
      const res = await fetch('/api/admin/quote-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        loadQuotes();
      } else {
        alert('Failed to delete quote request.');
      }
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Requested Quotes</p>
            <h3 className="text-2xl font-bold mt-1 text-[#102A43]">{stats.total}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#102A43]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending Action</p>
            <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Completed Quotes</p>
            <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.quoted}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>Requested Quotes</h2>
            <p className="text-sm text-gray-500">Manage customer quote requests, calculate fares & fees, and download official quote PDFs.</p>
          </div>
          <button
            onClick={loadQuotes}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              placeholder="Search by name, email, phone, address or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#102A43] text-gray-900 font-medium"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="QUOTED">Quoted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Quotes List */}
        <div className="divide-y divide-gray-100">
          {filteredQuotes.map(quote => {
            const isExpanded = expandedId === quote.id;

            return (
              <div key={quote.id} className="transition-colors hover:bg-gray-50/50">
                {/* Item Summary Bar */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400 font-semibold">QTE-{quote.id.slice(-8).toUpperCase()}</span>
                      <h3 className="font-bold text-gray-900 text-base">{quote.fullName}</h3>

                      {/* Status Badge */}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border ${
                        quote.status === 'QUOTED'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : quote.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {quote.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{quote.email}</span>
                      <span className="text-gray-300">|</span>
                      <span>{quote.phone}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1">
                      <span className="flex items-center gap-1 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-[#102A43]" />
                        {quote.travelDate} at {quote.travelTime}
                      </span>

                      <span className="flex items-center gap-1 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                        {quote.pickupAddress} → {quote.dropoffAddress}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Pricing Right Side */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Quoted</div>
                      <div className="text-lg font-extrabold text-[#102A43]">
                        {quote.totalAmount ? `$${quote.totalAmount.toFixed(2)} AUD` : quote.amount ? `$${quote.amount.toFixed(2)}` : 'Not Set'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExpand(quote)}
                        className="px-3.5 py-2 bg-[#102A43] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#0C5D59] transition-all"
                      >
                        {isExpanded ? <>Hide Details <ChevronUp className="w-4 h-4" /></> : <>Edit / Details <ChevronDown className="w-4 h-4" /></>}
                      </button>

                      <a
                        href={`/api/admin/quote-requests/${quote.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Download Quote PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="p-2 border border-red-100 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50 border-t border-b border-gray-200 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">

                      {/* Left: Customer & Trip Specs */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                        <h4 className="font-bold text-sm text-[#102A43] border-b pb-2 uppercase tracking-wide">Trip Specifications</h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 block font-medium">Passengers:</span>
                            <span className="font-bold text-gray-900">{quote.passengers} Person(s)</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-medium">Child Seats:</span>
                            <span className="font-bold text-gray-900">{quote.childSeats || 'No'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-medium">Check in Bags:</span>
                            <span className="font-bold text-gray-900">{quote.checkInBags ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-medium">Carry on Bags:</span>
                            <span className="font-bold text-gray-900">{quote.carryOnBags ?? 0}</span>
                          </div>
                        </div>

                        {quote.flightArrivalNumber && (
                          <div className="pt-2 border-t text-xs">
                            <span className="text-gray-400 block font-medium">Flight Arrival Info:</span>
                            <span className="font-semibold text-gray-900">
                              {quote.flightArrivalType || 'Arrival'} - Flight #{quote.flightArrivalNumber} ({quote.flightArrivalTime || 'N/A'})
                            </span>
                          </div>
                        )}

                        {quote.flightDepartureNumber && (
                          <div className="pt-2 border-t text-xs">
                            <span className="text-gray-400 block font-medium">Flight Departure Info:</span>
                            <span className="font-semibold text-gray-900">
                              {quote.flightDepartureType || 'Departure'} - Flight #{quote.flightDepartureNumber} ({quote.flightDepartureTime || 'N/A'})
                            </span>
                          </div>
                        )}

                        {quote.message && (
                          <div className="pt-2 border-t text-xs">
                            <span className="text-gray-400 block font-medium">Customer Notes:</span>
                            <p className="text-gray-700 italic mt-0.5">{quote.message}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Pricing Calculator & Status Update */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
                        <h4 className="font-bold text-sm text-[#102A43] border-b pb-2 uppercase tracking-wide">Quote Pricing & Management</h4>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Base Quote Amount ($ AUD)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 150.00"
                              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#102A43]/20 outline-none"
                              value={editAmount}
                              onChange={e => setEditAmount(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Automatic Calculations Box */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Base Fare:</span>
                            <span className="font-bold text-gray-900">${editAmount || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Processing Fee (2.5% Auto):</span>
                            <span className="font-bold text-gray-900">${calculatedFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200">
                            <span className="font-bold text-[#102A43]">Total Quoted Amount:</span>
                            <span className="font-extrabold text-[#0F766E]">${calculatedTotal.toFixed(2)} AUD</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white text-gray-900 outline-none"
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value)}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="QUOTED">QUOTED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Admin Notes
                            </label>
                            <input
                              type="text"
                              placeholder="Internal note..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none"
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleSaveQuote(quote.id)}
                            disabled={savingId === quote.id}
                            className="flex-1 py-2.5 bg-[#0F766E] hover:bg-[#0C5D59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <Save className="w-4 h-4" />
                            {savingId === quote.id ? 'Saving...' : 'Save Quote & Calculate Fee'}
                          </button>

                          <a
                            href={`/api/admin/quote-requests/${quote.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download Quote PDF
                          </a>
                        </div>

                        {saveSuccess === quote.id && (
                          <div className="p-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>Quote updated and fee calculated successfully!</span>
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filteredQuotes.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-gray-800">No quote requests found</p>
              <p className="text-xs text-gray-500 mt-1">Check back later or clear your filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
