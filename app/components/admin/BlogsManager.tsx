'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import BlogEditor, { BlogPost } from './blogs/BlogEditor';

const PRIMARY_COLOR = '#18234B';

export default function BlogsManager() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

    const fetchBlogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/blogs');
            if (!res.ok) throw new Error('Failed to fetch blogs');
            const data = await res.json();
            setBlogs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleCreate = () => {
        setEditingBlog(null);
        setView('editor');
    };

    const handleEdit = (blog: BlogPost) => {
        setEditingBlog(blog);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete blog');
            fetchBlogs();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSave = () => {
        setView('list');
        fetchBlogs();
    };

    if (view === 'editor') {
        return (
            <BlogEditor
                initialData={editingBlog}
                onSave={handleSave}
                onCancel={() => setView('list')}
            />
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col text-gray-900">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>Blog Management</h2>
                    <p className="text-sm text-gray-500">Create, edit, and manage your blog posts.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-[#A61924] text-white rounded-lg text-sm font-medium hover:bg-[#8B151F] transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> New Post
                    </button>
                    <button
                        onClick={fetchBlogs}
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
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {!loading && blogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm">No blog posts found.</p>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                            {/* Featured Image Preview */}
                            <div className="h-40 bg-gray-100 overflow-hidden relative">
                                {blog.featuredImage ? (
                                    <img
                                        src={`/api/images/${blog.featuredImage.id}`}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2" title={blog.title}>{blog.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{blog.excerpt}</p>

                                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3 mt-auto">
                                    <span>{new Date(blog.publishedAt || '').toLocaleDateString()}</span>
                                    <span className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(blog)}
                                            className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
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
                    <div className="text-center py-12 text-gray-400">Loading blogs...</div>
                )}
            </div>
        </div>
    );
}

function ImageIcon({ className }: { className?: string }) {
    return <FileText className={className} />;
}
