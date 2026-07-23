'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { X, Cookie } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const COOKIE_CONSENT_KEY = 'spl_cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide cookie consent banner on admin and CMS pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/cms')) {
      setShow(false);
      return;
    }

    const consent = Cookies.get(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, [pathname]);

  // Do not render anything on admin or cms routes or if consent given
  if (!show || pathname?.startsWith('/admin') || pathname?.startsWith('/cms')) {
    return null;
  }

  const handleAccept = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'granted', { expires: 365, path: '/' });
    setShow(false);
  };

  const handleDecline = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'denied', { expires: 365, path: '/' });
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
      <div className="pointer-events-auto bg-[#102A43]/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-white/15 text-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Cookie className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
            <p className="text-slate-200 leading-relaxed font-medium">
              We use cookies to improve your booking experience and save details for easy checkouts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-0.5 shrink-0"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0C5D59] text-xs font-bold text-white shadow-sm transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
