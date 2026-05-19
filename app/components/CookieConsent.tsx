'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { X } from 'lucide-react';

export const COOKIE_CONSENT_KEY = 'spl_cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, []);

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

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] pb-4 sm:pb-6 pointer-events-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-auto flex items-center justify-between gap-x-6 rounded-2xl bg-[#18234B] p-4 sm:p-6 shadow-2xl ring-1 ring-white/10">
          <p className="text-sm leading-6 text-white max-w-3xl">
            We use cookies to improve your booking experience and provide personalized service. 
            By accepting, we can save your contact details for future bookings. 
            You can still book normally without accepting.
          </p>
          <div className="flex flex-col sm:flex-row flex-none items-center gap-x-3 gap-y-2 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={handleDecline}
              className="w-full sm:w-auto text-sm font-semibold leading-6 text-gray-300 hover:text-white"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="w-full sm:w-auto rounded-full bg-[#A61924] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#8f141f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A61924]"
            >
              Accept all
            </button>
            <button type="button" className="hidden sm:block p-1.5 focus-visible:outline-none" onClick={handleClose}>
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
