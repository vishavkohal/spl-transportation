'use client';

import React from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Image from 'next/image';
import type { PageKey } from '../page'; // 👈 import the union type

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

// --- CONFIGURATION ---
const COMPANY_PHONE = '+61470032460';

// Pages we support in nav
const PAGES: PageKey[] = ['home', 'routes', 'about', 'contact', 'terms'];

type NavigationProps = {
  currentPage: PageKey;
  setCurrentPage: (p: PageKey) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
};

export default function Navigation({
  currentPage,
  setCurrentPage,
  menuOpen,
  setMenuOpen
}: NavigationProps) {
  const handleNavClick = (page: PageKey) => {
    setCurrentPage(page);
    setMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const labelFor = (page: PageKey) =>
    page.charAt(0).toUpperCase() + page.slice(1); // "home" -> "Home"

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo + Text */}
          <div
            className="flex items-center gap-1 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
          <div className="flex items-center p-1 dark:bg-transparent dark:shadow-none lg:dark:bg-transparent lg:dark:shadow-none pt-0.5 pb-0.5">
    <Image
        src="/logo.png"
        width={150}
        height={30}
        alt="SPL Transportation Logo"
        className="object-contain"
        priority
    />
            </div>
          </div>

          {/* Center: Links (Desktop) */}
          <div className="hidden lg:flex space-x-8 items-center">
            {PAGES.map(page => (
              <button
                key={page}
                onClick={() => handleNavClick(page)}
                className="text-sm font-semibold transition-colors"
                style={{ color: PRIMARY_COLOR }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = ACCENT_COLOR;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = PRIMARY_COLOR;
                }}
              >
                {labelFor(page)}
              </button>
            ))}
          </div>

          {/* Right: CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={`tel:${COMPANY_PHONE}`}
                className="transition mr-2"
                style={{ color: PRIMARY_COLOR }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = ACCENT_COLOR;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = PRIMARY_COLOR;
                }}
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => handleNavClick('routes')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full 
                           text-white font-bold text-sm shadow-lg transition-all 
                           hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  backgroundColor: ACCENT_COLOR,
                  boxShadow: `0 4px 10px ${ACCENT_COLOR}40`
                }}
              >
                <span>Book Now</span>
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {PAGES.map(page => (
            <button
              key={page}
              onClick={() => handleNavClick(page)}
              className="block w-full text-left py-3 px-4 rounded-lg font-medium transition"
              style={{ color: PRIMARY_COLOR }}
              onMouseEnter={e => {
                e.currentTarget.style.color = ACCENT_COLOR;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = PRIMARY_COLOR;
              }}
            >
              {labelFor(page)}
            </button>
          ))}

          {/* Mobile CTA */}
          <div className="pt-4 mt-2 border-t border-gray-100">
            <button
              onClick={() => handleNavClick('routes')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                         text-white font-bold shadow-md active:scale-95 transition"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              BOOK Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
