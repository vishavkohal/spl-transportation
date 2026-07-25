'use client';

import React from 'react';
import { FileText, MessageSquare, MapPin, CalendarCheck, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const COMPANY_PHONE = '+61470032460';
const WHATSAPP_URL = 'https://wa.me/61470032460?text=Hi%20SPL%20Transportation%2C%20I%20would%20like%20to%20inquire%20about%20a%20private%20transfer.';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isBookActive = pathname === '/';
  const isRoutesActive = pathname.startsWith('/transfers');

  const scrollToBooking = () => {
    if (pathname === '/') {
      const element = document.getElementById('booking-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      router.push('/#booking-form');
    }
  };

  const goToRoutes = () => {
    if (pathname === '/') {
      const element = document.getElementById('routes-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    router.push('/transfers');
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_10px_30px_rgba(16,42,67,0.18)] rounded-2xl p-1.5 flex items-center justify-around ring-1 ring-black/5">
          
          {/* Quick Book */}
          <button
            type="button"
            onClick={scrollToBooking}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200
              ${isBookActive ? 'bg-[#102A43] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}
            `}
          >
            <CalendarCheck className={`w-5 h-5 mb-0.5 ${isBookActive ? 'text-[#2DD4BF]' : ''}`} />
            <span className="text-[11px] font-bold tracking-tight">Book</span>
          </button>

          {/* Transfer Routes */}
          <button
            type="button"
            onClick={goToRoutes}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200
              ${isRoutesActive ? 'bg-[#102A43] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}
            `}
          >
            <MapPin className={`w-5 h-5 mb-0.5 ${isRoutesActive ? 'text-[#2DD4BF]' : ''}`} />
            <span className="text-[11px] font-bold tracking-tight">Routes</span>
          </button>

          {/* Manage Booking */}
          <button
            type="button"
            onClick={() => router.push('/manage-booking')}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200
              ${pathname === '/manage-booking' ? 'bg-[#102A43] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}
            `}
          >
            <Search className={`w-5 h-5 mb-0.5 ${pathname === '/manage-booking' ? 'text-[#2DD4BF]' : ''}`} />
            <span className="text-[11px] font-bold tracking-tight">Manage</span>
          </button>

          {/* WhatsApp Chat */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 hover:text-[#25D366] transition-all duration-200 active:scale-95"
          >
            <MessageSquare className="w-5 h-5 mb-0.5 text-[#25D366]" />
            <span className="text-[11px] font-bold tracking-tight">WhatsApp</span>
          </a>

          {/* Request Custom Quote */}
          <button
            type="button"
            onClick={() => router.push('/contact')}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200
              ${pathname === '/contact' ? 'bg-[#102A43] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}
            `}
          >
            <FileText className={`w-5 h-5 mb-0.5 ${pathname === '/contact' ? 'text-[#2DD4BF]' : 'text-[#0F766E]'}`} />
            <span className="text-[11px] font-bold tracking-tight">Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}
