'use client';
import React from 'react';
import { FileText, Phone, Mail } from 'lucide-react';

// Define the custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

export default function TermsPage() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 pb-12 pt-24 md:pt-32 transition-colors">
      
      {/* Page Header */}
      <div className="flex flex-col mb-10 border-b border-gray-200 pb-5">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8" style={{ color: ACCENT_COLOR }} />
          <h1 
            className="text-4xl font-extrabold"
            style={{ color: PRIMARY_COLOR }}
          >
            Terms & Conditions
          </h1>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          These terms apply to all Private Transfer services. By making a booking, you confirm that you have read, understood, and agreed to these terms.
        </p>

        {/* Contact Info from the provided text */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
            <a href="tel:+61470032460" className="hover:underline">+61 470 032 460</a>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
            <a href="mailto:spltransportation.australia@gmail.com" className="hover:underline">spltransportation.australia@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Terms Container */}
      <div className="space-y-8">

        {/* Section 1: Rates & Payment */}
        <TermsSection 
          title="1. Rates & Payment" 
          primaryColor={PRIMARY_COLOR}
          accentColor={ACCENT_COLOR}
        >
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>All rates are in AUD, inclusive of GST (10%).</li>
            <li>Full payment is required at the time of booking.</li>
            <li>A <strong>2.2% payment processing fee</strong> applies to all transactions and is non-refundable.</li>
            <li>We accept all major credit/debit cards (online/phone only). No cash accepted onboard.</li>
          </ul>
        </TermsSection>

        {/* Section 2: Cancellation Policy */}
        <TermsSection 
          title="2. Refund & Cancellation" 
          primaryColor={PRIMARY_COLOR}
          accentColor={ACCENT_COLOR}
        >
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Cancellation requests must be submitted <strong>in writing (email or SMS)</strong>.</li>
            <li><strong>Within 24 hours</strong> of service date: No refund.</li>
            <li><strong>Within 48 hours</strong> of service date: 50% refund.</li>
            <li><strong>Beyond 48 hours</strong> of service date: Subject to a <strong>$30 administration fee</strong>.</li>
            <li>Card processing fees (2.2%) are non-refundable and will be deducted from any refund.</li>
          </ul>
        </TermsSection>

        {/* Section 3: Airport Transfers & Flight Changes */}
        <TermsSection 
          title="3. Airport Transfers & Flight Changes" 
          primaryColor={PRIMARY_COLOR}
          accentColor={ACCENT_COLOR}
        >
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>You must notify us in writing of <strong>any flight changes</strong> immediately.</li>
            <li>If the new flight time differs by <strong>more than 2 hours</strong> from the original booking, the booking becomes invalid, and a new transfer must be booked (subject to availability and fees).</li>
            <li>We are <strong>not responsible for missed flights</strong>. Customers must check their own updates.</li>
            <li><strong>Airport Wait Times</strong>: Fees apply after 60 minutes and must be paid to the driver.</li>
          </ul>
        </TermsSection>

        {/* Section 4: Luggage & Vehicle Assignment */}
        <TermsSection 
          title="4. Luggage & Vehicle Policy" 
          primaryColor={PRIMARY_COLOR}
          accentColor={ACCENT_COLOR}
        >
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li><strong>Allowance</strong>: One small carry-on bag and one standard suitcase per passenger.</li>
            <li><strong>Excess Luggage</strong>: Additional items <strong>MUST be disclosed</strong> at booking. We reserve the right to refuse undisclosed luggage. Surcharges apply ($15 per item).</li>
            <li>Vehicles are assigned based on group size/luggage for safety; <strong>special vehicle requests are not guaranteed</strong>.</li>
            <li><strong>Child Seats</strong>: Baby/booster seats are <strong>free of charge</strong> but must be pre-arranged.</li>
          </ul>
        </TermsSection>
        
        {/* Section 5: Conduct, Cleaning & Lost Items */}
        <TermsSection 
          title="5. Conduct, Fees & Liability" 
          primaryColor={PRIMARY_COLOR}
          accentColor={ACCENT_COLOR}
        >
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li><strong>Prohibited</strong>: Alcohol, smoking, vaping, illicit substances, food, and drinks (except bottled water).</li>
            <li><strong>Damage/Disruptive Behavior</strong>: Aggressive behavior results in immediate cancellation (no refund). Passengers are liable for vehicle damage.</li>
            <li><strong>Cleaning Fee</strong>: A <strong>$300 AUD fee</strong> applies for spills, bodily fluids, or excessive soiling requiring professional cleaning.</li>
            <li><strong>Lost Items</strong>: We are not responsible for lost items. Item retrieval incurs a fee equal to the transfer rate.</li>
          </ul>
        </TermsSection>
        
        {/* Section 6: Surcharges & Additional Stops */}
        <TermsSection 
          title="6. Surcharges & Special Requests" 
          primaryColor={PRIMARY_COLOR}
          accentColor={ACCENT_COLOR}
        >
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li><strong>After-Hours (8 PM – 7 AM)</strong>: A <strong>$30 surcharge</strong> applies per trip.</li>
            <li><strong>Public Holidays</strong>: A <strong>$30 fee</strong> applies to designated public holidays.</li>
            <li><strong>Multiple Stops</strong>: Must be pre-arranged and are subject to a <strong>$30 per 15 minutes</strong> surcharge.</li>
            <li><strong>Delays</strong>: We are not liable for delays caused by traffic, weather, or circumstances beyond our control.</li>
          </ul>
        </TermsSection>
      </div>
    </div>
  );
}

// Helper Component for consistent section styling
function TermsSection({ title, children, primaryColor, accentColor }: { title: string, children: React.ReactNode, primaryColor: string, accentColor: string }) {
    return (
      <section className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        <h2 
          className="text-xl font-bold mb-3"
          style={{ color: primaryColor }}
        >
          {title}
        </h2>
        {children}
      </section>
    );
  }