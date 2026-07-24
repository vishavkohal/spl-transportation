'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Moon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AFTER_HOURS_SURCHARGE } from '../lib/afterHours';

interface SurchargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurchargeModal({ isOpen, onClose }: SurchargeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="
              relative w-full max-w-md bg-white 
              rounded-t-3xl sm:rounded-3xl 
              shadow-2xl border border-slate-100 
              overflow-hidden z-10
              p-6 sm:p-7
            "
          >
            {/* Header Handle for Mobile Sheet */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Late-Night & Early-Morning
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                  After-Hours Driver Surcharge
                </h3>
              </div>
            </div>

            {/* Price Badge */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pickups between 9:00 PM & 5:00 AM</span>
              </div>
              <span className="text-base font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl">
                +${AFTER_HOURS_SURCHARGE} AUD
              </span>
            </div>

            {/* Description */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-light">
              <p>
                A flat <strong className="text-slate-900 font-semibold">${AFTER_HOURS_SURCHARGE} AUD</strong> surcharge automatically applies to bookings scheduled between <strong className="text-slate-900 font-semibold">9:00 PM and 5:00 AM</strong>.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>Fair compensation for dedicated night-shift chauffeur drivers.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>Real-time flight tracking & terminal meet and greet included.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>Zero surge rate inflation—fixed transparent fee.</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="
                w-full py-3.5 px-4 rounded-xl 
                bg-[#102A43] hover:bg-[#091D30] text-white 
                font-bold text-sm shadow-md 
                active:scale-[0.98] transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <span>Understood</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
