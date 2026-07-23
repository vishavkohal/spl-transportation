'use client';

import React, { useState } from 'react';
import {
  FileText,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Luggage,
  Ban,
  ChevronRight,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

const SECTIONS = [
  { id: 'rates-payment', number: '01', label: 'Rates & Payment' },
  { id: 'cancellation-refunds', number: '02', label: 'Refunds & Cancellation' },
  { id: 'airport-policy', number: '03', label: 'Airport & Flight Tracking' },
  { id: 'luggage-vehicles', number: '04', label: 'Luggage & Child Seats' },
  { id: 'passenger-conduct', number: '05', label: 'Conduct & Cleaning Fees' },
  { id: 'liability', number: '06', label: 'Liability & Warranties' },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('rates-payment');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-slate-800">

      {/* Hero Section */}
      <section className="w-full bg-[#102A43] text-white py-16 md:py-20 relative overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
            <FileCheck className="w-4 h-4" />
            <span>TERMS OF SERVICE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Terms & Conditions
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-6">
            Please review our service agreement carefully. By booking a transfer with SPL Transportation, you accept the policies outlined below.
          </p>

          <div className="inline-flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 border border-white/10">
            <span>Last Updated: July 2026</span>
            <span>•</span>
            <span>Applicable to all Transfers & Charters</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Table of Contents
            </h3>

            <nav className="space-y-1">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? 'bg-[#102A43] text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#0F766E]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-mono ${isActive ? 'text-[#2DD4BF]' : 'text-slate-400'}`}>
                        {sec.number}
                      </span>
                      <span>{sec.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#2DD4BF]' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </nav>

            {/* Need Clarification Box */}
            <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-[#0F766E]" />
                <span>Questions about terms?</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contact our customer support team 24/7 for booking clarifications.
              </p>
              <a
                href="tel:+61470032460"
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#102A43] hover:border-[#0F766E] transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                +61 470 032 460
              </a>
            </div>
          </aside>

          {/* Right Section Details Column */}
          <main className="lg:col-span-8 space-y-12 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">

            {/* SECTION 01: Rates & Payment */}
            <section id="rates-payment" className="scroll-mt-28 space-y-4 border-b border-slate-100 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h2 className="text-2xl font-extrabold text-[#102A43]">
                  Rates & Payment Policy
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                All prices quoted on our website, quotes, and receipts are in Australian Dollars (AUD) and include Australian Goods and Services Tax (GST 10%).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                    <CreditCard className="w-4 h-4 text-[#0F766E]" />
                    <span>Card Processing Fee</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A non-refundable <strong>2.5% card processing fee</strong> applies to all online credit/debit card transactions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                    <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                    <span>Fixed Upfront Fare</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All fares are fixed upon confirmation. No unexpected meter rates, surge charges, or hidden toll fees.
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>Full payment is required at the time of booking to guarantee vehicle availability.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>Driver payments onboard must be pre-arranged in writing by prior corporate agreement.</span>
                </li>
              </ul>
            </section>

            {/* SECTION 02: Refund & Cancellation */}
            <section id="cancellation-refunds" className="scroll-mt-28 space-y-4 border-b border-slate-100 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h2 className="text-2xl font-extrabold text-[#102A43]">
                  Refunds & Cancellation Policy
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                We understand travel plans change. All cancellation requests must be submitted in writing by email or SMS with your booking reference.
              </p>

              {/* Cancellation Policy Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md shadow-2xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Outside 48 Hours</span>
                  </div>
                  <h4 className="text-sm font-bold text-emerald-950">Full Refund Eligible</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Cancellations made more than 48 hours prior to scheduled pickup receive a 100% refund (excluding the 2.5% card processing fee).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Within 48 Hours</span>
                  </div>
                  <h4 className="text-sm font-bold text-rose-950">Non-Refundable</h4>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Cancellations made within 48 hours of scheduled pickup time, or no-shows at pickup location, are non-refundable.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 03: Airport Policy */}
            <section id="airport-policy" className="scroll-mt-28 space-y-4 border-b border-slate-100 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h2 className="text-2xl font-extrabold text-[#102A43]">
                  Airport Transfers & Flight Tracking
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                We monitor all commercial flight arrivals at Cairns Airport in real time using live radar tracking data.
              </p>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                  <Clock className="w-4 h-4 text-[#0F766E]" />
                  <span>Complimentary Wait Time Allowance</span>
                </div>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0F766E] font-bold">•</span>
                    <span><strong>Airport Pickups:</strong> Up to 60 minutes free waiting time from the actual flight landing time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0F766E] font-bold">•</span>
                    <span><strong>Hotel & City Pickups:</strong> 15 minutes complimentary wait time from agreed pickup time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0F766E] font-bold">•</span>
                    <span><strong>Delays Over 2 Hours:</strong> If your flight is delayed by over 2 hours or diverted, we will re-assign drivers subject to schedule availability.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 04: Luggage & Child Seats */}
            <section id="luggage-vehicles" className="scroll-mt-28 space-y-4 border-b border-slate-100 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                  04
                </div>
                <h2 className="text-2xl font-extrabold text-[#102A43]">
                  Luggage & Child Seat Guidelines
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                    <Luggage className="w-4 h-4 text-[#0F766E]" />
                    <span>Standard Luggage Allowance</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Standard allowance is <strong>1 large check-in suitcase + 1 small carry-on bag per passenger</strong>. Oversized items (surfboards, golf bags) must be pre-declared.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                    <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                    <span>Complimentary Child Seats</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under Queensland road laws, children under 7 must use an approved child restraint. We provide child and booster seats upon pre-booking.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 05: Passenger Conduct */}
            <section id="passenger-conduct" className="scroll-mt-28 space-y-4 border-b border-slate-100 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                  05
                </div>
                <h2 className="text-2xl font-extrabold text-[#102A43]">
                  Passenger Conduct & Vehicle Care
                </h2>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Ban className="w-4 h-4 text-amber-600" />
                  <span>Prohibited Onboard Items & Behavior</span>
                </div>
                <ul className="text-xs sm:text-sm text-amber-800 space-y-2">
                  <li>• Smoking, vaping, and alcohol consumption are strictly prohibited in all vehicles.</li>
                  <li>• Hot food or messy snacks are not permitted inside vehicles (bottled water is allowed).</li>
                  <li>• <strong>Cleaning Surcharge:</strong> A minimum <strong>$300 AUD soiling fee</strong> applies for spills, vomit, or excessive interior mess requiring professional detailing.</li>
                </ul>
              </div>
            </section>

            {/* SECTION 06: Liability */}
            <section id="liability" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
                  06
                </div>
                <h2 className="text-2xl font-extrabold text-[#102A43]">
                  Liability & Force Majeure
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SPL Transportation is fully commercially licensed and insured under Queensland Transport regulations. We are not liable for travel delays caused by severe weather, road closures, traffic accidents, or unforeseen force majeure events beyond our reasonable control.
              </p>
            </section>

          </main>

        </div>
      </div>

      {/* Bottom CTA Banner */}
      <section className="w-full bg-[#102A43] text-white py-14 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to book your private transfer?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-lg mx-auto">
            Enjoy door-to-door comfort, professional drivers, and fixed pricing across Far North Queensland.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/#booking-form"
              className="px-7 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0C5D59] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Book Now
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-bold text-xs sm:text-sm transition-all"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}