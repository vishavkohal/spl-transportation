'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon, Eye, Code, RefreshCw } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';

export type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    imageId: string;
    readMinutes: number;
    featuredImage?: {
        id: string;
        // other fields if needed for display
    };
    publishedAt?: string;
    tags?: string[];
};

interface BlogEditorProps {
    initialData?: BlogPost | null;
    onSave: () => void;
    onCancel: () => void;
}

export default function BlogEditor({ initialData, onSave, onCancel }: BlogEditorProps) {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        readMinutes: 5,
        imageId: '',
    });
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                excerpt: initialData.excerpt || '',
                content: initialData.content || '',
                readMinutes: initialData.readMinutes || 5,
                imageId: initialData.imageId || '',
            });
            if (initialData.imageId) {
                setImagePreview(`/api/images/${initialData.imageId}`);
            }
        }
    }, [initialData]);

    // Auto-generate slug from title if empty
    useEffect(() => {
        if (!initialData && formData.title && !formData.slug) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    }, [formData.title, formData.slug, initialData]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));

            // Auto upload on select? Or wait for save?
            // Better to upload on save to avoid orphans, OR upload now to get ID.
            // Let's upload now to simplify logic, but maybe better to do it on save?
            // Verification step said "Upload an image while creating a blog".
            // Let's do it on Save or provide a separate "Upload" button if needed?
            // Actually, standard is usually upload immediately or on save.
            // I'll do it on Save to minimize requests if user cancels.
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            let finalImageId = formData.imageId;

            // 1. Upload Image if new file selected
            if (imageFile) {
                const data = new FormData();
                data.append('file', imageFile);
                data.append('altText', formData.title); // Use title as alt text default

                const uploadRes = await fetch('/api/images', {
                    method: 'POST',
                    body: data,
                });

                if (!uploadRes.ok) throw new Error('Image upload failed');
                const imageJson = await uploadRes.json();
                finalImageId = imageJson.id;
            }

            if (!finalImageId) {
                throw new Error('Please upload a featured image');
            }

            // 2. Save Blog
            const payload = {
                ...formData,
                imageId: finalImageId,
                readMinutes: Number(formData.readMinutes),
            };

            const url = initialData ? `/api/blogs/${initialData.id}` : '/api/blogs';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to save blog');
            }

            onSave();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                    {initialData ? 'Edit Blog Post' : 'New Blog Post'}
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    >
                        {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {previewMode ? 'Edit HTML' : 'Preview'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl">
                        {error}
                    </div>
                )}

                <form id="blog-form" onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                    {/* Main Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    required
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter blog title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    required
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] outline-none"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="url-friendly-slug"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Read Time (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] outline-none"
                                    value={formData.readMinutes}
                                    onChange={(e) => setFormData({ ...formData, readMinutes: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative h-full min-h-[200px]">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            {imagePreview ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-48 rounded-lg object-contain shadow-sm mb-2"
                                    />
                                    <p className="text-xs text-gray-500">Click to replace</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <ImageIcon className="w-10 h-10 mb-2" />
                                    <span className="text-sm font-medium">Upload Featured Image</span>
                                    <span className="text-xs mt-1">Supports JPG, PNG, WEBP</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] outline-none resize-y"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Short summary for listing cards..."
                        />
                    </div>

                    {/* HTML Content Editor */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
                            <span className="text-xs text-gray-400">Supports Tailwind classes</span>
                        </div>

                        {previewMode ? (
                            <div
                                className="prose prose-lg max-w-none p-6 border border-gray-200 rounded-xl bg-gray-50 min-h-[400px]"
                                dangerouslySetInnerHTML={{ __html: formData.content }}
                            />
                        ) : (
                            <textarea
                                required
                                rows={15}
                                className="w-full p-4 font-mono text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A61924]/20 focus:border-[#A61924] outline-none resize-y bg-gray-50"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="<p>Write your article content here...</p>"
                            />
                        )}
                    </div>
                </form>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2 bg-[#A61924] text-white rounded-xl text-sm font-bold hover:bg-[#8B151F] transition-colors shadow-lg flex items-center gap-2"
                >
                    {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {initialData ? 'Update Post' : 'Publish Post'}
                </button>
            </div>
        </div>
    );
}
