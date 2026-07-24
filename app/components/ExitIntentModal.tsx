'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, MessageCircle, Phone, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BUSINESS_PHONE, WHATSAPP_NUMBER } from '../lib/constants';
import { useBooking } from '../providers/BookingProvider';

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { bookingStep } = useBooking();
  const step2TimeRef = useRef<number>(0);
  const isTypingRef = useRef<boolean>(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 🔴 ONLY run if customer is on Step 2 (Checkout / Payment step)
    if (bookingStep !== 2) {
      setIsOpen(false);
      return;
    }

    // Don't show if already dismissed in this session
    const dismissed = sessionStorage.getItem('spl_exit_intent_dismissed');
    if (dismissed) return;

    step2TimeRef.current = Date.now();

    // 1. Inactivity Timer: trigger after 45s of idle time on Step 2
    let idleTimer: NodeJS.Timeout | null = null;

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);

      // Indicate user is actively typing/interacting
      isTypingRef.current = true;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
      }, 3000); // 3-second pause after typing stops

      // Reset 45-second idle timer
      idleTimer = setTimeout(() => {
        const dismissedCheck = sessionStorage.getItem('spl_exit_intent_dismissed');
        if (!dismissedCheck) {
          setIsOpen(true);
        }
      }, 45000);
    };

    // Initial 45s idle timer upon entering Step 2
    idleTimer = setTimeout(() => {
      const dismissedCheck = sessionStorage.getItem('spl_exit_intent_dismissed');
      if (!dismissedCheck && !isTypingRef.current) {
        setIsOpen(true);
      }
    }, 45000);

    // Listen for typing and field interaction on Step 2
    const activityEvents = ['keydown', 'input', 'change'];
    activityEvents.forEach(evt =>
      window.addEventListener(evt, resetIdleTimer, { passive: true })
    );

    // 2. Mouse Leave Exit Intent (Desktop top exit cursor)
    const handleMouseLeave = (e: MouseEvent) => {
      const timeOnStep2 = Date.now() - step2TimeRef.current;
      // Only trigger if on step 2 for at least 12 seconds and NOT actively typing
      if (e.clientY <= 10 && timeOnStep2 >= 12000 && !isTypingRef.current) {
        const dismissedCheck = sessionStorage.getItem('spl_exit_intent_dismissed');
        if (!dismissedCheck) {
          setIsOpen(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      activityEvents.forEach(evt =>
        window.removeEventListener(evt, resetIdleTimer)
      );
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [bookingStep]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('spl_exit_intent_dismissed', 'true');
  };

  // 🔴 Never render if not on Step 2 or if modal is not active
  if (!isOpen || bookingStep !== 2) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hi SPL Transportation, I have a question about my booking.'
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Decorative Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#102A43] via-[#0F766E] to-[#2DD4BF]" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shadow-inner">
            <HelpCircle className="w-7 h-7" />
          </div>

          <h3 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Need help finishing your booking?
          </h3>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            Have questions about your transfer or pricing? We&apos;re here to help 24/7. Speak with our team directly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-emerald-900/20 transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:${BUSINESS_PHONE}`}
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#102A43] hover:bg-[#0C5D59] shadow-md transition-all duration-200"
          >
            <Phone className="w-4 h-4" />
            <span>Call Us ({BUSINESS_PHONE})</span>
          </a>

          <Link
            href="/contact"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span>Send a Custom Enquiry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dismiss Text */}
        <div className="mt-5 text-center">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
          >
            No thanks, return to booking
          </button>
        </div>
      </div>
    </div>
  );
}
