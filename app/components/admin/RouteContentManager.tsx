'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, AlertCircle, ArrowRight, ChevronDown, ChevronUp, X, Upload } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';

type RouteInfo = { id: number; from: string; to: string };

type RouteContentEntry = {
    id: string;
    routeId: number;
    route: RouteInfo;
    content: ContentData;
    updatedAt: string;
    imageId?: string | null;
    image?: { id: string; altText: string | null } | null;
};

type ContentData = {
    intro: { h2: string; paragraphs: string[]; bullets: string[]; cta: string };
    destination: { h3: string; paragraphs: string[] };
    travelOptions: { h4: string; paragraphs: string[] };
    whyUs: { h2: string; paragraphs: string[]; bullets: string[]; cta: string };
    faqs: { question: string; answer: string }[];
};

const emptyContent: ContentData = {
    intro: { h2: '', paragraphs: [''], bullets: [''], cta: '' },
    destination: { h3: '', paragraphs: [''] },
    travelOptions: { h4: '', paragraphs: [''] },
    whyUs: { h2: '', paragraphs: [''], bullets: [''], cta: '' },
    faqs: [{ question: '', answer: '' }],
};

export default function RouteContentManager() {
    const [entries, setEntries] = useState<RouteContentEntry[]>([]);
    const [routes, setRoutes] = useState<RouteInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingEntry, setEditingEntry] = useState<RouteContentEntry | null>(null);

    const fetchEntries = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/route-content');
            if (!res.ok) throw new Error('Failed to fetch route content');
            const data = await res.json();
            setEntries(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const res = await fetch('/api/routes');
            if (!res.ok) throw new Error('Failed to fetch routes');
            const data = await res.json();
            setRoutes(data);
        } catch { }
    };

    useEffect(() => {
        fetchEntries();
        fetchRoutes();
    }, []);

    const handleCreate = () => {
        setEditingEntry(null);
        setView('editor');
    };

    const handleEdit = (entry: RouteContentEntry) => {
        setEditingEntry(entry);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this route content?')) return;
        try {
            const res = await fetch(`/api/route-content/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            fetchEntries();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSave = () => {
        setView('list');
        fetchEntries();
    };

    // Routes that already have content
    const usedRouteIds = new Set(entries.map(e => e.routeId));
    const availableRoutes = routes.filter(r => !usedRouteIds.has(r.id));

    if (view === 'editor') {
        return (
            <RouteContentEditor
                initialData={editingEntry}
                routes={editingEntry ? routes : availableRoutes}
                onSave={handleSave}
                onCancel={() => setView('list')}
            />
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col text-gray-900">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>Route Content</h2>
                    <p className="text-sm text-gray-500">Manage SEO content for transfer route pages.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCreate}
                        disabled={availableRoutes.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-[#A61924] text-white rounded-lg text-sm font-medium hover:bg-[#8B151F] transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" /> New Content
                    </button>
                    <button
                        onClick={fetchEntries}
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

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {!loading && entries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <p className="text-sm">No route content found. Click "New Content" to get started.</p>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {entries.map((entry) => (
                        <div key={entry.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-bold text-gray-900">{entry.route.from}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-900">{entry.route.to}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                                    {entry.content?.intro?.h2 || 'No intro heading'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3 mt-auto">
                                    <span>Updated: {new Date(entry.updatedAt).toLocaleDateString()}</span>
                                    <span className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(entry)}
                                            className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded"
                                        >
                                            Delete
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="text-center py-12 text-gray-400">Loading route content...</div>
                )}
            </div>
        </div>
    );
}

/* ───────────────────────────────────── EDITOR ───────────────────────────────────── */

function RouteContentEditor({
    initialData,
    routes,
    onSave,
    onCancel,
}: {
    initialData: RouteContentEntry | null;
    routes: RouteInfo[];
    onSave: () => void;
    onCancel: () => void;
}) {
    const isEditing = !!initialData;
    const [routeId, setRouteId] = useState<number>(initialData?.routeId ?? (routes[0]?.id ?? 0));
    const [content, setContent] = useState<ContentData>(
        initialData?.content
            ? JSON.parse(JSON.stringify(initialData.content))
            : JSON.parse(JSON.stringify(emptyContent))
    );
    const [imageId, setImageId] = useState<string | null>(initialData?.imageId ?? null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/images', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to upload image');

            const data = await res.json();
            setImageId(data.id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    // Collapsible sections
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        intro: true,
        destination: false,
        travelOptions: false,
        whyUs: false,
        faqs: false,
    });

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        if (!routeId) {
            setError('Please select a route');
            return;
        }
        setSaving(true);
        setError(null);

        try {
            const url = isEditing ? `/api/route-content/${initialData!.id}` : '/api/route-content';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ routeId, content, imageId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Helper to update nested content
    const updateIntro = (field: string, value: any) => {
        setContent(prev => ({ ...prev, intro: { ...prev.intro, [field]: value } }));
    };
    const updateDestination = (field: string, value: any) => {
        setContent(prev => ({ ...prev, destination: { ...prev.destination, [field]: value } }));
    };
    const updateTravelOptions = (field: string, value: any) => {
        setContent(prev => ({ ...prev, travelOptions: { ...prev.travelOptions, [field]: value } }));
    };
    const updateWhyUs = (field: string, value: any) => {
        setContent(prev => ({ ...prev, whyUs: { ...prev.whyUs, [field]: value } }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-gray-900">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                    {isEditing ? 'Edit Route Content' : 'New Route Content'}
                </h2>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Route Selector */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Route
                    </label>
                    <select
                        value={routeId}
                        onChange={e => setRouteId(Number(e.target.value))}
                        disabled={isEditing}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    >
                        {routes.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.from} → {r.to}
                            </option>
                        ))}
                    </select>
                </div>

                {/* IMAGE UPLOAD */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Hero Image
                    </label>
                    <div className="flex items-center gap-4">
                        {imageId ? (
                            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`/api/images/${imageId}`} alt="Hero Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setImageId(null)}
                                    className="absolute top-1 right-1 p-1 bg-white/90 rounded text-red-600 hover:bg-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <span className="text-xs mt-1">No custom image</span>
                            </div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                id="hero-image-upload"
                                className="hidden"
                            />
                            <label
                                htmlFor="hero-image-upload"
                                className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploadingImage ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Upload className="w-4 h-4" />
                                {uploadingImage ? 'Uploading...' : imageId ? 'Replace Image' : 'Upload Image'}
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                                Optional. If not provided, the default image from <code className="bg-gray-100 px-1 rounded">public/routes/</code> will be used.
                            </p>
                        </div>
                    </div>
                </div>

                {/* INTRO Section */}
                <CollapsibleSection title="Intro Section" isOpen={openSections.intro} onToggle={() => toggleSection('intro')}>
                    <FieldInput label="Heading (H2)" value={content.intro.h2} onChange={v => updateIntro('h2', v)} />
                    <DynamicTextList label="Paragraphs" items={content.intro.paragraphs} onChange={v => updateIntro('paragraphs', v)} multiline />
                    <DynamicTextList label="Bullet Points" items={content.intro.bullets} onChange={v => updateIntro('bullets', v)} />
                    <FieldInput label="Call to Action" value={content.intro.cta} onChange={v => updateIntro('cta', v)} />
                </CollapsibleSection>

                {/* DESTINATION Section */}
                <CollapsibleSection title="Destination Section" isOpen={openSections.destination} onToggle={() => toggleSection('destination')}>
                    <FieldInput label="Heading (H3)" value={content.destination.h3} onChange={v => updateDestination('h3', v)} />
                    <DynamicTextList label="Paragraphs" items={content.destination.paragraphs} onChange={v => updateDestination('paragraphs', v)} multiline />
                </CollapsibleSection>

                {/* TRAVEL OPTIONS Section */}
                <CollapsibleSection title="Travel Options Section" isOpen={openSections.travelOptions} onToggle={() => toggleSection('travelOptions')}>
                    <FieldInput label="Heading (H4)" value={content.travelOptions.h4} onChange={v => updateTravelOptions('h4', v)} />
                    <DynamicTextList label="Paragraphs" items={content.travelOptions.paragraphs} onChange={v => updateTravelOptions('paragraphs', v)} multiline />
                </CollapsibleSection>

                {/* WHY US Section */}
                <CollapsibleSection title="Why Us Section" isOpen={openSections.whyUs} onToggle={() => toggleSection('whyUs')}>
                    <FieldInput label="Heading (H2)" value={content.whyUs.h2} onChange={v => updateWhyUs('h2', v)} />
                    <DynamicTextList label="Paragraphs" items={content.whyUs.paragraphs} onChange={v => updateWhyUs('paragraphs', v)} multiline />
                    <DynamicTextList label="Bullet Points" items={content.whyUs.bullets} onChange={v => updateWhyUs('bullets', v)} />
                    <FieldInput label="Call to Action" value={content.whyUs.cta} onChange={v => updateWhyUs('cta', v)} />
                </CollapsibleSection>

                {/* FAQs Section */}
                <CollapsibleSection title="FAQs" isOpen={openSections.faqs} onToggle={() => toggleSection('faqs')}>
                    <FAQEditor
                        faqs={content.faqs}
                        onChange={faqs => setContent(prev => ({ ...prev, faqs }))}
                    />
                </CollapsibleSection>

                {/* Error */}
                {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${saving ? 'bg-gray-400' : 'bg-[#18234B] hover:shadow-xl'}`}
                    >
                        {saving ? 'Saving...' : isEditing ? 'Update Content' : 'Create Content'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────── Reusable Form Components ──────────────────────────── */

function CollapsibleSection({
    title,
    isOpen,
    onToggle,
    children,
}: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <span className="font-semibold text-gray-800">{title}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
}

function FieldInput({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
}) {
    const cls = "w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] transition-all text-sm";
    return (
        <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
            {multiline ? (
                <textarea rows={3} className={cls} value={value} onChange={e => onChange(e.target.value)} />
            ) : (
                <input type="text" className={cls} value={value} onChange={e => onChange(e.target.value)} />
            )}
        </div>
    );
}

function DynamicTextList({
    label,
    items,
    onChange,
    multiline = false,
}: {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    multiline?: boolean;
}) {
    const update = (idx: number, value: string) => {
        const copy = [...items];
        copy[idx] = value;
        onChange(copy);
    };
    const add = () => onChange([...items, '']);
    const remove = (idx: number) => {
        if (items.length <= 1) return;
        onChange(items.filter((_, i) => i !== idx));
    };

    const cls = "flex-1 p-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] transition-all text-sm";

    return (
        <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        {multiline ? (
                            <textarea rows={2} className={cls} value={item} onChange={e => update(i, e.target.value)} />
                        ) : (
                            <input type="text" className={cls} value={item} onChange={e => update(i, e.target.value)} />
                        )}
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            disabled={items.length <= 1}
                            className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={add}
                className="mt-2 text-xs font-medium text-[#A61924] hover:underline flex items-center gap-1"
            >
                <Plus className="w-3 h-3" /> Add {label.toLowerCase().replace(/s$/, '')}
            </button>
        </div>
    );
}

function FAQEditor({
    faqs,
    onChange,
}: {
    faqs: { question: string; answer: string }[];
    onChange: (faqs: { question: string; answer: string }[]) => void;
}) {
    const update = (idx: number, field: 'question' | 'answer', value: string) => {
        const copy = [...faqs];
        copy[idx] = { ...copy[idx], [field]: value };
        onChange(copy);
    };
    const add = () => onChange([...faqs, { question: '', answer: '' }]);
    const remove = (idx: number) => {
        if (faqs.length <= 1) return;
        onChange(faqs.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4">
            {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-gray-500">FAQ #{i + 1}</span>
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            disabled={faqs.length <= 1}
                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Question</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924]"
                            value={faq.question}
                            onChange={e => update(i, 'question', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Answer</label>
                        <textarea
                            rows={2}
                            className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924]"
                            value={faq.answer}
                            onChange={e => update(i, 'answer', e.target.value)}
                        />
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="text-xs font-medium text-[#A61924] hover:underline flex items-center gap-1"
            >
                <Plus className="w-3 h-3" /> Add FAQ
            </button>
        </div>
    );
}
