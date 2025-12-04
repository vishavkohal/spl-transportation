'use client';
import React from 'react';
import { MapPin, Menu, X, Phone } from 'lucide-react';
import Image from 'next/image';
// --- CONFIGURATION ---
const COMPANY_PHONE = '+61470032460';

export default function Navigation({
  setCurrentPage,
  menuOpen,
  setMenuOpen
}: {
  setCurrentPage: (p: string) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}) {
  const handleNavClick = (page: string) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav
      className="fixed w-full top-0 z-50 transition-all duration-300 bg-white border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo + Text */}
          <div
            className="flex items-center gap-1 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="flex items-center p-1 dark:bg-white dark:shadow-md dark:border dark:border-gray-200 lg:dark:bg-transparent lg:dark:shadow-none lg:dark:border-0 pt-0.5 pb-0.5">
              <Image
                src="/spll.png"
                width={150}
                height={30}
                alt="SPL Transportation Logo"
                className="object-contain"
                priority
              />
              <Image
                src="/spllo.png"
                alt="SPL"
                width={120}
                height={15}
                className="object-contain ml-1"
                priority={false}
              />
            </div>
          </div>

          {/* Center: Links (Desktop) */}
          <div className="hidden lg:flex space-x-8 items-center">
            {['Home', 'Routes', 'About', 'Contact', 'Terms'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                className="text-sm font-semibold text-black 
                          hover:text-yellow-500 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right: CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={`tel:${COMPANY_PHONE}`}
                className="text-gray-900 hover:text-yellow-500 transition mr-2"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => handleNavClick('routes')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full 
                          bg-yellow-400 hover:bg-yellow-300 
                          text-gray-900 font-bold text-sm shadow-lg shadow-yellow-400/20 
                          transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Book Ride</span>
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}

                aria-label="Toggle menu"
                className="p-2 rounded-lg text-gray-600 
                          hover:bg-gray-100 transition-colors"
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
          {['Home', 'Routes', 'About', 'Contact', 'Terms'].map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item.toLowerCase())}
              className="block w-full text-left py-3 px-4 rounded-lg font-medium
                         text-black 
                         hover:bg-gray-50 hover:text-yellow-500 transition"
            >
              {item}
            </button>
          ))}

          {/* Mobile CTA */}
          <div className="pt-4 mt-2 border-t border-gray-100">
            <button
              onClick={() => handleNavClick('routes')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                        bg-yellow-400 text-gray-900 font-bold shadow-md active:scale-95 transition"
            >
              BOOK A TAXI
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
