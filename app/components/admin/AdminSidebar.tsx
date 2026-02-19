'use client';

import React from 'react';
import { LayoutDashboard, Map, CalendarCheck, Users, LogOut, FileText, Calendar } from 'lucide-react';

import { motion } from 'framer-motion';

type AdminTab = 'overview' | 'routes' | 'bookings' | 'leads' | 'upcoming';


interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    onLogout: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upcoming', label: 'Upcoming Trips', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'routes', label: 'Routes', icon: Map },
    { id: 'leads', label: 'Leads', icon: Users },
] as const;

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    onLogout,
    isMobileOpen,
    setIsMobileOpen
}: AdminSidebarProps) {

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                        <h1 className="text-2xl font-bold font-serif tracking-tight" style={{ color: PRIMARY_COLOR }}>
                            SPL <span className="text-sm font-sans font-normal text-gray-400">Admin</span>
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id as AdminTab);
                                        setIsMobileOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'shadow-md translate-x-1'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                                    style={{
                                        backgroundColor: isActive ? PRIMARY_COLOR : 'transparent',
                                        color: isActive ? 'white' : undefined
                                    }}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
