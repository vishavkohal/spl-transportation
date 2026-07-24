'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  ArrowUpRight
} from 'lucide-react';

import { COLORS } from '../lib/colors';

// Brand colors
const BG_COLOR = COLORS.heroOverlay;
const ACCENT_COLOR = COLORS.primary;
const TEXT_MUTED = '#94a3b8'; // Slate-400 for better readability on dark bg

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="pt-20 pb-10 text-slate-200 border-t border-white/5"
      style={{ backgroundColor: BG_COLOR }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="SPL Transportation"
                width={200}
                height={70}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: TEXT_MUTED }}>
              Professional private transfers across Tropical North Queensland.
              Elevating your journey with safety, punctuality, and premium comfort.
            </p>

            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/spltransportation"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.instagram.com/spltransportation"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-white mb-6">Navigation</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'All Transfers', href: '/transfers' },
                { label: 'Book Now', href: '/book' },
                { label: 'Travel Guides', href: '/blog' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 hover:text-white transition-colors duration-200"
                    style={{ color: TEXT_MUTED }}
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="font-semibold text-white mb-6">Popular Transfer Routes</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Cairns Airport → Port Douglas', href: '/transfers/cairns-airport-to-port-douglas' },
                { label: 'Cairns Airport → Palm Cove', href: '/transfers/cairns-airport-to-palm-cove' },
                { label: 'Cairns Airport → Cairns City', href: '/transfers/cairns-airport-to-cairns-city' },
                { label: 'Cairns City → Kuranda', href: '/transfers/cairns-city-to-kuranda' },
                { label: 'Cairns City → Atherton Tablelands', href: '/transfers/cairns-city-to-tablelands' },
                { label: 'Palm Cove → Cairns Airport', href: '/transfers/palm-cove-to-cairns-airport' },
              ].map((route) => (
                <li key={route.label}>
                  <Link
                    href={route.href}
                    className="group flex items-center justify-between hover:text-white transition-colors duration-200"
                    style={{ color: TEXT_MUTED }}
                  >
                    <span>{route.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-white mb-6">Contact & Support</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: ACCENT_COLOR }} strokeWidth={1.5} />
                <span style={{ color: TEXT_MUTED }}>
                  Cairns & Port Douglas, <br /> Queensland, Australia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} strokeWidth={1.5} />
                <a
                  href="tel:+61470032460"
                  className="hover:text-white transition-colors"
                  style={{ color: TEXT_MUTED }}
                >
                  +61 470 032 460
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} strokeWidth={1.5} />
                <a
                  href="mailto:spltransportation.australia@gmail.com"
                  className="hover:text-white transition-colors break-all"
                  style={{ color: TEXT_MUTED }}
                >
                  spltransportation.australia@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p style={{ color: TEXT_MUTED }}>
            © {currentYear} SPL Transportation. All rights reserved. | ABN: 64 957 177 372
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors" style={{ color: TEXT_MUTED }}>
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors" style={{ color: TEXT_MUTED }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
