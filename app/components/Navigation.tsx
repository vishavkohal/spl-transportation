'use client';

import React, { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Brand colors
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

// Config
const COMPANY_PHONE = '+61470032460';

// Navigation links
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Transfers', href: '/transfers' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
  { label: 'Terms', href: '/terms' }
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/logo.png"
              width={150}
              height={30}
              alt="SPL Transportation Logo"
              className="object-contain"
              priority
              style={{ width: 'auto', height: '55px' }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-8 items-center">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold transition-colors"
                style={{
                  color: isActive(link.href) ? ACCENT_COLOR : PRIMARY_COLOR
                }}
                onMouseEnter={e => (e.currentTarget.style.color = ACCENT_COLOR)}
                onMouseLeave={e =>
                (e.currentTarget.style.color = isActive(link.href)
                  ? ACCENT_COLOR
                  : PRIMARY_COLOR)
                }
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/blog"
              className="text-sm font-semibold transition-colors"
              style={{
                color: pathname.startsWith('/blog')
                  ? ACCENT_COLOR
                  : PRIMARY_COLOR
              }}
              onMouseEnter={e => (e.currentTarget.style.color = ACCENT_COLOR)}
              onMouseLeave={e =>
              (e.currentTarget.style.color = pathname.startsWith('/blog')
                ? ACCENT_COLOR
                : PRIMARY_COLOR)
              }
            >
              Blog
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={`tel:${COMPANY_PHONE}`}
                className="transition"
                style={{ color: PRIMARY_COLOR }}
                onMouseEnter={e => (e.currentTarget.style.color = ACCENT_COLOR)}
                onMouseLeave={e => (e.currentTarget.style.color = PRIMARY_COLOR)}
              >
                <Phone className="w-5 h-5" />
              </a>

              {/* Desktop Book Now Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden lg:block px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Book Now
              </button>


            </div>



            {/* Mobile Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle menu"
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 py-4 space-y-2">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-medium transition"
              style={{
                color: isActive(link.href)
                  ? ACCENT_COLOR
                  : PRIMARY_COLOR
              }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className="block py-3 px-4 rounded-lg font-medium transition"
            style={{
              color: pathname.startsWith('/blog')
                ? ACCENT_COLOR
                : PRIMARY_COLOR
            }}
          >
            Blog
          </Link>
        </div>
      </div>
    </nav>
  );
}
