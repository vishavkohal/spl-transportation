'use client';

import React from 'react';

export default function WhatsAppButton() {
  const phoneNumber = '61470032460';
  const defaultMessage = encodeURIComponent('Hi, I would like to book a transfer with SPL Transportation.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[calc(4.8rem+env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 group focus:outline-none"
    >
      {/* Tooltip Label */}
      <span className="hidden sm:inline-block bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10">
        Need help? Chat with us
      </span>

      {/* Button Body */}
      <div className="relative flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-110 active:scale-95">
        {/* Subtle Pulse Animation Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping -z-10 pointer-events-none" />

        {/* WhatsApp Official Icon */}
        <svg
          className="w-8 h-8 lg:w-10 lg:h-10 fill-current"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2a13.94 13.94 0 0 0-12 21.06L2 30l7.17-1.88A13.94 13.94 0 1 0 16 2zm0 25.5a11.5 11.5 0 0 1-5.86-1.59l-.42-.25-4.35 1.14 1.16-4.24-.28-.44A11.54 11.54 0 1 1 16 27.5zm6.32-8.54c-.35-.17-2.06-1.02-2.38-1.13s-.55-.17-.79.17-.92 1.13-1.13 1.37-.42.27-.77.1a9.7 9.7 0 0 1-2.86-1.76 10.7 10.7 0 0 1-1.98-2.47c-.2-.35 0-.54.17-.71s.35-.42.53-.63c.17-.2.23-.35.35-.58s.06-.44-.03-.61-.79-1.9-1.08-2.6c-.28-.68-.57-.59-.79-.6h-.67c-.23 0-.6.09-.92.44s-1.22 1.19-1.22 2.9 1.25 3.37 1.42 3.6 2.46 3.76 5.96 5.27c.83.36 1.48.57 1.99.73.83.26 1.59.23 2.19.14.67-.1 2.06-.84 2.35-1.65s.29-1.5.2-1.65-.33-.26-.68-.43z" />
        </svg>
      </div>
    </a>
  );
}
