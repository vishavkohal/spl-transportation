'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ArrowUpRight
} from 'lucide-react';

// Brand colors
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const TEXT_MUTED = '#94a3b8'; // Slate-400 for better readability on dark-blue

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="pt-20 pb-10 text-slate-200 border-t border-white/5"
      style={{ backgroundColor: PRIMARY_COLOR }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <h3 className="text-2xl font-bold tracking-tight text-white">
                SPL <span style={{ color: ACCENT_COLOR }}>Transportation</span>
              </h3>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: TEXT_MUTED }}>
              Professional private transfers across Queensland.
              Elevating your journey with safety, puntuality, and premium comfort.
            </p>

            {/* Minimal Social Icons */}
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
                  aria-label="Social Link"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer (Span 1) */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Quick Links (Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Our Fleet', href: '/fleet' },
                { label: 'Pricing & Routes', href: '/transfers' },
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

          {/* Contact (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="font-semibold text-white mb-6">Contact</h4>
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
