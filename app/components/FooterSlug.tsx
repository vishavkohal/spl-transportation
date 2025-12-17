// Place this inside your components folder, e.g., components/Footer.tsx
'use client';
import React from 'react';
import { Mail, Phone, Clock, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="text-gray-300 pt-16 pb-8 mt-24 border-t border-gray-800"
      style={{ backgroundColor: PRIMARY_COLOR }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                SPL <span style={{ color: ACCENT_COLOR }}>Transportation</span>
              </h3>
              <div 
                className="w-12 h-1 rounded-full mt-2"
                style={{ backgroundColor: ACCENT_COLOR }}
              />
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
              Premium ride transfer services across Queensland. We prioritize safety, punctuality, and comfort in every journey we take.
            </p>
            <div className="flex space-x-4 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="bg-gray-800 p-2 rounded-full transition-all duration-300 hover:text-[#18234B]"
                  style={{ '--hover-bg': ACCENT_COLOR } as any}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contact Details</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 group">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: ACCENT_COLOR }} />
                <span className="group-hover:text-white transition-colors">Queensland, Australia</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} />
                <a href="tel:+61470032460" className="group-hover:text-white transition-colors">+61 470 032 460</a>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} />
                <a href="mailto:spltransportation.australia@gmail.com" className="group-hover:text-white transition-colors break-all">
                  spltransportation.australia@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} />
                <span>Available all Week Days</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/' },
                { label: 'Our Fleet', href: '/' },
                { label: 'Transfers', href: '/' },
                { label: 'Terms & Conditions', href: '/' },
                { label: 'Contact Support', href: '/' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-2 text-sm text-gray-400 transition-all duration-300 group hover:text-white"
                  >
                    <ArrowRight 
                      className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:text-[#A61924] transition-all" 
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} SPL Transportation. All rights reserved. | ABN: 64 957 177 372</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}