'use client';
import React from 'react';
import { FileText, Phone, Mail, ChevronRight } from 'lucide-react';

// Define the custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

export default function TermsPage() {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Floating Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden mb-16">

          {/* Header Section */}
          <div className="bg-slate-50 border-b border-gray-100 px-8 py-12 md:px-12 md:py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6 text-navy-900 mx-auto">
              <FileText className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
            </div>

            <h1
              className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              Terms & Conditions
            </h1>

            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Please read our terms carefully. By booking a transfer with SPL, you agree to the policies outlined below.
            </p>

            {/* Contact Mini-Bar */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm font-medium text-gray-600">
              <a href="tel:+61470032460" className="flex items-center gap-2 hover:text-navy-700 transition-colors">
                <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-navy-700" style={{ color: PRIMARY_COLOR }}>
                  <Phone className="w-4 h-4" />
                </span>
                +61 470 032 460
              </a>
              <a href="mailto:spltransportation.australia@gmail.com" className="flex items-center gap-2 hover:text-navy-700 transition-colors">
                <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-navy-700" style={{ color: PRIMARY_COLOR }}>
                  <Mail className="w-4 h-4" />
                </span>
                spltransportation.australia@gmail.com
              </a>
            </div>
          </div>

          {/* Content Body */}
          <div className="px-8 py-10 md:px-12 md:py-14 space-y-12">

            {/* Rates */}
            <TermsSection number="01" title="Rates & Payment">
              <ul className="space-y-3 text-gray-600 leading-relaxed">
                <ListItem>All rates are quoted in <strong>AUD</strong> and include GST (10%).</ListItem>
                <ListItem>Full payment is required at the time of booking to secure your transfer.</ListItem>
                <ListItem>A <strong>2.5% payment processing fee</strong> applies to all card transactions (non-refundable).</ListItem>
                <ListItem>We accept all major credit/debit cards online or via phone. <strong>No cash accepted onboard.</strong></ListItem>
              </ul>
            </TermsSection>

            {/* Cancellation */}
            <TermsSection number="02" title="Refund & Cancellation">
              <ul className="space-y-3 text-gray-600 leading-relaxed">
                <ListItem>Cancellation requests must be submitted in writing (email or SMS).</ListItem>
                <ListItem><strong>Within 48 hours</strong> of service: No refund provided.</ListItem>
                <ListItem><strong>Outside 48 hours</strong>: Full refund less processing fees.</ListItem>
                <ListItem>Card processing fees (2.2%) are non-refundable.</ListItem>
              </ul>
            </TermsSection>

            {/* Flights */}
            <TermsSection number="03" title="Airport Transfers">
              <ul className="space-y-3 text-gray-600 leading-relaxed">
                <ListItem>You must notify us of any flight schedule changes immediately.</ListItem>
                <ListItem>New flight times differing by <strong>&gt;2 hours</strong> require a new booking (subject to availability).</ListItem>
                <ListItem>We are not responsible for missed flights due to customer lateness.</ListItem>
                <ListItem><strong>Wait Times:</strong> Fees apply after 60 mins of landing.</ListItem>
              </ul>
            </TermsSection>

            {/* Luggage */}
            <TermsSection number="04" title="Luggage & Vehicles">
              <ul className="space-y-3 text-gray-600 leading-relaxed">
                <ListItem><strong>Allowance:</strong> 1 carry-on + 1 suitcase per passenger.</ListItem>
                <ListItem><strong>Excess Luggage:</strong> Must be disclosed; $15 surcharge per undisclosed item.</ListItem>
                <ListItem>Vehicles assigned based on capacity; special requests generally not guaranteed.</ListItem>
                <ListItem><strong>Child Seats:</strong> Free of charge (must pre-book).</ListItem>
              </ul>
            </TermsSection>

            {/* Conduct */}
            <TermsSection number="05" title="Conduct & Liability">
              <ul className="space-y-3 text-gray-600 leading-relaxed">
                <ListItem><strong>Prohibited:</strong> Alcohol, smoking/vaping, food (water ok).</ListItem>
                <ListItem><strong>Cleaning Fee:</strong> $300 AUD charge for spills or excessive mess.</ListItem>
                <ListItem>We reserve the right to refuse service to aggressive or intoxicated passengers.</ListItem>
              </ul>
            </TermsSection>

          </div>

          {/* Footer Note */}
          <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              SPL Transportation • Cairns, QLD
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components
function TermsSection({ number, title, children }: { number: string, title: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 border-b border-gray-100 pb-12 last:border-0 last:pb-0">
      <div className="shrink-0 flex md:block items-center gap-4">
        <span className="text-sm font-bold tracking-widest text-gray-300 select-none block md:mb-2">{number}</span>
        <h2 className="text-2xl font-bold text-gray-900 w-48 leading-tight" style={{ color: PRIMARY_COLOR }}>{title}</h2>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  )
}