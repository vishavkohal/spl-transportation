import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, Phone, Lock } from 'lucide-react';
import { BASE_URL, BUSINESS_EMAIL, BUSINESS_PHONE } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy | SPL Transportation',
  description:
    'Read the Privacy Policy for SPL Transportation. Learn how we collect, protect, and handle your personal booking and payment information across Cairns and Queensland transfers.',
  alternates: {
    canonical: `${BASE_URL}/privacy-policy`,
    languages: {
      'en-AU': `${BASE_URL}/privacy-policy`,
      'x-default': `${BASE_URL}/privacy-policy`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/privacy-policy`,
    title: 'Privacy Policy | SPL Transportation',
    description: 'Learn how SPL Transportation protects your personal data and booking privacy.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: 'SPL Transportation Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | SPL Transportation',
    description: 'Read the Privacy Policy for SPL Transportation private transfer services.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

const privacySchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/privacy-policy#webpage`,
    url: `${BASE_URL}/privacy-policy`,
    name: 'Privacy Policy | SPL Transportation',
    description: 'Read how SPL Transportation handles customer data, booking information, and payment security.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SPL Transportation',
      url: BASE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${BASE_URL}/privacy-policy` },
      ],
    },
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />

      {/* Hero Header */}
      <section className="relative bg-[#102A43] text-white pt-16 pb-20 md:pt-20 md:pb-24 overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>DATA PROTECTION &amp; PRIVACY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-6">
            SPL Transportation is committed to safeguarding your personal data and ensuring your booking privacy across all transfer services in Tropical North Queensland.
          </p>

          <div className="inline-flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 border border-white/10">
            <span>Last Updated: July 2026</span>
            <span>•</span>
            <span>Australian Privacy Act Compliant</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 text-slate-700 leading-relaxed text-sm">
          
          <div>
            <h2 className="text-xl font-bold text-[#102A43] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you reserve a transfer or request a quote with SPL Transportation, we collect only essential personal details needed to fulfill your trip safely and punctually:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Full name and contact details (email address and phone number).</li>
              <li>Pickup and drop-off locations, travel dates, and flight arrival/departure numbers.</li>
              <li>Passenger counts, luggage volume, and child safety seat requirements.</li>
              <li>Payment details processed securely via Stripe SSL encryption (no raw card data is stored on our servers).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#102A43] mb-3">
              2. How We Use Your Data
            </h2>
            <p className="mb-3">
              Your personal information is strictly used for the following operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Dispatching professional local drivers and dispatch notifications for your transfer.</li>
              <li>Monitoring real-time flight status at Cairns Airport to adjust pickup times for delays.</li>
              <li>Sending automated booking confirmations, SMS driver updates, and Stripe transaction receipts.</li>
              <li>Providing customer support and processing authorized modifications or cancellations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#102A43] mb-3">
              3. Data Security &amp; Third-Party Services
            </h2>
            <p>
              We implement industry-standard 256-bit SSL encryption across all website forms. We do not sell, rent, or trade your personal information to third-party marketers. Third-party integrations (such as Stripe for payment processing and Google Analytics for aggregated traffic insights) operate under strict confidentiality agreements and compliance standards.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#102A43] mb-3">
              4. Your Privacy Rights &amp; Contact
            </h2>
            <p className="mb-3">
              Under Australian privacy laws, you have the right to access, update, or request the deletion of your personal booking record at any time.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <p className="font-semibold text-[#102A43]">Have questions regarding privacy?</p>
              <div className="flex flex-col sm:flex-row gap-4 text-xs">
                <a href={`mailto:${BUSINESS_EMAIL}`} className="flex items-center gap-1.5 text-[#0F766E] font-bold hover:underline">
                  <Mail className="w-3.5 h-3.5" />
                  {BUSINESS_EMAIL}
                </a>
                <a href={`tel:${BUSINESS_PHONE.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 text-[#0F766E] font-bold hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  {BUSINESS_PHONE}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#102A43] hover:text-[#0F766E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/terms"
              className="text-xs font-bold text-[#0F766E] hover:underline"
            >
              View Terms &amp; Conditions →
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}
