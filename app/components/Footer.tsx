'use client';
import React from 'react';
import { Mail, Phone, Clock, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import { PageKey } from '../page';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

export default function Footer({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  
  const currentYear = new Date().getFullYear();

  return (
    // Set Footer Background to Primary Color (#18234B)
    <footer 
      className="text-gray-300 pt-16 pb-8 mt-0 border-t border-gray-800"
      style={{ backgroundColor: PRIMARY_COLOR }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                SPL <span style={{ color: ACCENT_COLOR }}>Transportation</span> {/* Accent Color for word */}
              </h3>
              {/* Accent-colored divider */}
              <div 
                className="w-12 h-1 rounded-full mt-2"
                style={{ backgroundColor: ACCENT_COLOR }}
              ></div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Premium ride transfer services across Queensland. We prioritize safety, punctuality, and comfort in every journey we take.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="bg-gray-800 p-2 rounded-full transition-colors duration-300"
                  style={{ 
                    '--hover-bg': ACCENT_COLOR, 
                    '--hover-text': PRIMARY_COLOR 
                  } as React.CSSProperties}
                  // Apply Accent Color on hover for background and Primary Color for text
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLAnchorElement;
                    target.style.backgroundColor = ACCENT_COLOR;
                    target.style.color = PRIMARY_COLOR;
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLAnchorElement;
                    target.style.backgroundColor = '#1F2937'; // bg-gray-800 equivalent
                    target.style.color = '#D1D5DB'; // text-gray-300 equivalent
                  }}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contact Details</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <MapPin className="w-5 h-5 mt-1 shrink-0" style={{ color: ACCENT_COLOR }} /> {/* Accent Color */}
                <span className="group-hover:text-white transition-colors">
                  Queensland, Australia
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} /> {/* Accent Color */}
                <a href="tel:+61470032460" className="group-hover:text-white transition-colors">
                  +61 470 032 460
                </a>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} /> {/* Accent Color */}
                <a href="mailto:spltransportation.australia@gmail.com" className="group-hover:text-white transition-colors break-all">
                  spltransportation.australia@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 shrink-0" style={{ color: ACCENT_COLOR }} /> {/* Accent Color */}
                <span>Available 24 Hours / 7 Days</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', page: 'about' },
                { label: 'Our Fleet', page: 'fleet' },
                { label: 'Pricing & Routes', page: 'routes' },
                { label: 'Terms & Conditions', page: 'terms' },
                { label: 'Contact Support', page: 'contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setCurrentPage(link.page)}
                    className="flex items-center space-x-2 text-gray-400 transition-all duration-300 group"
                  >
                    <ArrowRight 
                      className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform" 
                      style={{ '--hover-text': ACCENT_COLOR } as React.CSSProperties} // Set hover color for arrow
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = ACCENT_COLOR;
                        e.currentTarget.closest('button')!.style.color = ACCENT_COLOR;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#4B5563'; // text-gray-600 equivalent
                        e.currentTarget.closest('button')!.style.color = '#9CA3AF'; // text-gray-400 equivalent
                      }}
                    />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} SPL Transportation. All rights reserved.  | ABN: 64 957 177 372</p>
          <div className="flex space-x-6">
            <button className="hover:text-white transition">Privacy Policy</button>
            <button className="hover:text-white transition">Cookie Policy</button>
          </div>
        </div>
        
      </div>
    </footer>
  );
}