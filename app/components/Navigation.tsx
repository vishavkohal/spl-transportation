'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, ChevronDown, MapPin, ArrowRight, Search, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBooking } from '../providers/BookingProvider';
import { routeToSlug } from '../lib/routeSlug';
import type { Route } from '../types';

const COMPANY_PHONE = '+61470032460';

function useSafeRoutes(): { routes: Route[]; loading: boolean } {
  try {
    const { routes, routesLoading } = useBooking();
    return { routes, loading: routesLoading };
  } catch {
    return { routes: [], loading: false };
  }
}



export default function Navigation() {
  const pathname = usePathname();
  const { routes } = useSafeRoutes();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileTransfersOpen, setMobileTransfersOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Desktop Hover Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMoreMouseEnter = () => {
    if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
    setMoreDropdownOpen(true);
  };

  const handleMoreMouseLeave = () => {
    moreTimeoutRef.current = setTimeout(() => {
      setMoreDropdownOpen(false);
    }, 150);
  };

  // Secondary fallback fetch if routes list from provider is empty
  const [fallbackRoutes, setFallbackRoutes] = useState<Route[]>([]);
  useEffect(() => {
    if (!routes || routes.length === 0) {
      fetch('/api/routes')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setFallbackRoutes(data);
        })
        .catch(() => {});
    }
  }, [routes]);

  const activeRoutes = routes && routes.length > 0 ? routes : fallbackRoutes;

  // Filter out day trip routes if desired, or keep all
  const displayRoutes = activeRoutes.filter(
    (r) => !r.from.toLowerCase().includes('day trip')
  );

  const filteredRoutes = displayRoutes.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.from.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q) ||
      (r.label && r.label.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  const scrollBooking = () => {
    const booking = document.getElementById('booking-form');
    if (booking) {
      booking.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      window.location.href = '/#booking';
    }
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xs border-b border-slate-200'
          : 'bg-white/90 backdrop-blur-lg border-b border-slate-100/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SPL Transportation"
                width={220}
                height={80}
                priority
                className="h-14 sm:h-16 md:h-[68px] w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-8 xl:gap-10">
              <Link
                href="/"
                className={`relative pb-1 text-sm font-semibold transition-colors duration-200 ${
                  isActive('/') ? 'text-[#0F766E]' : 'text-slate-800 hover:text-[#0F766E]'
                }`}
              >
                Home
                {isActive('/') && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-7 h-[2.5px] rounded-full bg-[#0F766E]" />
                )}
              </Link>

              {/* TRANSFERS WITH DROPDOWN ON HOVER */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/transfers"
                  className={`inline-flex items-center gap-1.5 pb-1 text-sm font-semibold transition-colors duration-200 ${
                    isActive('/transfers')
                      ? 'text-[#0F766E]'
                      : 'text-slate-800 hover:text-[#0F766E]'
                  }`}
                >
                  <span>Transfers</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-[#0F766E]' : 'text-slate-400'
                    }`}
                  />
                  {isActive('/transfers') && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-7 h-[2.5px] rounded-full bg-[#0F766E]" />
                  )}
                </Link>

                {/* HOVER DROPDOWN PANEL */}
                {dropdownOpen && (
                  <div
                    className="
                      absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[560px]
                      animate-in fade-in slide-in-from-top-2 duration-200 z-50
                    "
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-5 overflow-hidden ring-1 ring-black/5">
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#0F766E]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Available Transfer Routes
                          </span>
                        </div>

                        <Link
                          href="/transfers"
                          onClick={() => setDropdownOpen(false)}
                          className="text-xs font-bold text-[#0F766E] hover:text-[#0C5D59] flex items-center gap-1 transition-colors"
                        >
                          View All ({activeRoutes.length})
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Search box inside dropdown if many routes */}
                      {displayRoutes.length > 4 && (
                        <div className="relative mb-3">
                          <input
                            type="text"
                            placeholder="Filter destination..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 outline-none focus:border-[#0F766E]"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      )}

                      {/* Routes Grid */}
                      <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
                        {filteredRoutes.length > 0 ? (
                          filteredRoutes.map((route) => {
                            const slug = routeToSlug(route);

                            return (
                              <Link
                                key={route.id}
                                href={`/transfers/${slug}`}
                                onClick={() => setDropdownOpen(false)}
                                className="
                                  group flex items-center justify-between p-2.5 rounded-xl
                                  hover:bg-slate-50 border border-transparent hover:border-slate-100
                                  transition-all duration-200
                                "
                              >
                                <p className="text-xs font-semibold text-slate-700 group-hover:text-[#0F766E] transition-colors truncate">
                                  {route.from} <span className="text-slate-400 font-normal mx-1">→</span> {route.to}
                                </p>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                              </Link>
                            );
                          })
                        ) : (
                          <div className="col-span-2 text-center py-4 text-xs text-slate-400">
                            No matching routes found.
                          </div>
                        )}
                      </div>

                      {/* Dropdown Footer Banner */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 -mx-5 -mb-5 p-3 px-5">
                        <span className="text-slate-500 font-medium">
                          Need a custom pickup?
                        </span>
                        <Link
                          href="/contact"
                          onClick={() => setDropdownOpen(false)}
                          className="font-bold text-[#0F766E] hover:underline"
                        >
                          Contact Chauffeur
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CONTACT */}
              <Link
                href="/contact"
                className={`relative pb-1 text-sm font-semibold transition-colors duration-200 ${
                  isActive('/contact') ? 'text-[#0F766E]' : 'text-slate-800 hover:text-[#0F766E]'
                }`}
              >
                Contact Us
                {isActive('/contact') && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-7 h-[2.5px] rounded-full bg-[#0F766E]" />
                )}
              </Link>

              {/* MANAGE BOOKING */}
              <Link
                href="/manage-booking"
                className={`relative pb-1 text-sm font-semibold transition-colors duration-200 ${
                  isActive('/manage-booking') ? 'text-[#0F766E]' : 'text-slate-800 hover:text-[#0F766E]'
                }`}
              >
                Manage Booking
                {isActive('/manage-booking') && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-7 h-[2.5px] rounded-full bg-[#0F766E]" />
                )}
              </Link>

              {/* MORE DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={handleMoreMouseEnter}
                onMouseLeave={handleMoreMouseLeave}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 pb-1 text-sm font-semibold transition-colors duration-200 ${
                    ['/about', '/blog', '/terms'].some(p => isActive(p))
                      ? 'text-[#0F766E]'
                      : 'text-slate-800 hover:text-[#0F766E]'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      moreDropdownOpen ? 'rotate-180 text-[#0F766E]' : 'text-slate-400'
                    }`}
                  />
                  {['/about', '/blog', '/terms'].some(p => isActive(p)) && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-7 h-[2.5px] rounded-full bg-[#0F766E]" />
                  )}
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 top-full pt-3 w-48 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 space-y-1 ring-1 ring-black/5 text-xs font-semibold">
                      <Link
                        href="/about"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0F766E] transition-colors"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/blog"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0F766E] transition-colors"
                      >
                        Travel Blog
                      </Link>
                      <Link
                        href="/terms"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0F766E] transition-colors"
                      >
                        Terms & Conditions
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`tel:${COMPANY_PHONE}`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-[#0F766E] hover:text-[#0F766E]"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>

            <Link
              href="/contact"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#19324D] px-5 text-xs font-bold text-white shadow-md shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#112336]"
            >
              <FileText className="w-4 h-4" />
              Request Quote
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="ml-auto lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-slate-800"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden bg-white transition-all duration-300 lg:hidden ${
          menuOpen ? 'max-h-[700px] border-t border-slate-200' : 'max-h-0'
        }`}
      >
        <div className="space-y-2 px-6 py-6 max-h-[85vh] overflow-y-auto">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
              isActive('/') ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>

          {/* Mobile Transfers Accordion */}
          <div>
            <div className="flex items-center justify-between">
              <Link
                href="/transfers"
                onClick={() => setMenuOpen(false)}
                className={`flex-1 rounded-xl px-4 py-3 text-base font-medium transition ${
                  isActive('/transfers')
                    ? 'bg-[#0F766E]/10 text-[#0F766E]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Transfers
              </Link>

              <button
                onClick={() => setMobileTransfersOpen(!mobileTransfersOpen)}
                className="p-3 text-slate-500 hover:text-slate-800"
                aria-label="Toggle transfer routes"
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    mobileTransfersOpen ? 'rotate-180 text-[#0F766E]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Sub-routes list on mobile */}
            {mobileTransfersOpen && (
              <div className="ml-4 pl-3 border-l-2 border-slate-200 my-1 space-y-1">
                {displayRoutes.slice(0, 8).map((route) => (
                  <Link
                    key={route.id}
                    href={`/transfers/${routeToSlug(route)}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#0F766E]"
                  >
                    {route.from} → {route.to}
                  </Link>
                ))}

                <Link
                  href="/transfers"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-bold text-[#0F766E]"
                >
                  View All Routes →
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
              isActive('/about') ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            About
          </Link>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
              isActive('/contact') ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Contact Us
          </Link>

          <Link
            href="/terms"
            onClick={() => setMenuOpen(false)}
            className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
              isActive('/terms') ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Terms
          </Link>

          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
              isActive('/blog') ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Blog
          </Link>

          <Link
            href="/manage-booking"
            onClick={() => setMenuOpen(false)}
            className={`block rounded-xl px-4 py-3 text-base font-semibold transition ${
              isActive('/manage-booking') ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-[#0F766E] hover:bg-[#0F766E]/5'
            }`}
          >
            Manage My Booking →
          </Link>

          <a
            href={`tel:${COMPANY_PHONE}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-slate-700"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </a>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#19324D] py-3 font-semibold text-white shadow-sm hover:bg-[#112336]"
          >
            <FileText className="w-4 h-4" />
            Request Quote
          </Link>
        </div>
      </div>
    </nav>
  );
}