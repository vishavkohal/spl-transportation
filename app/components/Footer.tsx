'use client';
import React from 'react';
import { Mail, Phone, Clock, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';

export default function Footer({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 pt-16 pb-8 mt-0 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                SPL <span className="text-yellow-400">Transportation</span>
              </h3>
              <div className="w-12 h-1 bg-yellow-400 rounded-full mt-2"></div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Premium taxi & transfer services across Queensland. We prioritize safety, punctuality, and comfort in every journey we take.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="bg-gray-800 p-2 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-colors duration-300">
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
                <MapPin className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
                <span className="group-hover:text-white transition-colors">
                  Queensland, Australia
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone className="w-5 h-5 text-yellow-400 shrink-0" />
                <a href="tel:+61470032460" className="group-hover:text-white transition-colors">
                  +61 470 032 460
                </a>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail className="w-5 h-5 text-yellow-400 shrink-0" />
                <a href="mailto:spltransportation.australia@gmail.com" className="group-hover:text-white transition-colors break-all">
                  spltransportation.australia@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
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
                    className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 group"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-transform" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} SPL Transportation. All rights reserved.</p>
          <div className="flex space-x-6">
            <button onClick={() => setCurrentPage('privacy')} className="hover:text-white transition">Privacy Policy</button>
            <button onClick={() => setCurrentPage('cookies')} className="hover:text-white transition">Cookie Policy</button>
          </div>
        </div>
        
      </div>
    </footer>
  );
}