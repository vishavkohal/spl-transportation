'use client';

import React, { useState, useEffect } from 'react';
import BlogsManager from '../components/admin/BlogsManager';
import { LogOut } from 'lucide-react';

export default function CMSPage() {
    const [isAuthed, setIsAuthed] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);

    // 1. Check Session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/cms/session', { method: 'GET' });
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
            const res = await fetch('/api/cms/login', {
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
            }
        } catch (err: any) {
            setAuthError('Login failed');
        } finally {
            setAuthLoading(false);
        }
    };

    async function handleLogout() {
        await fetch('/api/cms/logout', { method: 'POST' });
        window.location.reload();
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-gray-400">Loading CMS...</div>
            </div>
        );
    }

    if (!isAuthed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#18234B] mb-2 font-serif">Content Manager</h1>
                        <p className="text-sm text-gray-500">Please enter your credentials.</p>
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
                            {authLoading ? 'Verifying...' : 'Access CMS'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-[#18234B] font-serif">Content Manager</h1>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-medium text-gray-500">SPL Transportation</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <BlogsManager />
            </main>
        </div>
    );
}
