import type { Metadata } from 'next';
import Terms from '../../components/TermsPage';
import { BASE_URL } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SPL Transportation',
  description:
    'Read the terms and conditions for SPL Transportation private transfer services. Covers rates, payment, cancellation policy, luggage allowance, and conduct guidelines.',
  alternates: {
    canonical: `${BASE_URL}/terms`,
    languages: {
      'en-AU': `${BASE_URL}/terms`,
      'x-default': `${BASE_URL}/terms`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/terms`,
    title: 'Terms & Conditions | SPL Transportation',
    description: 'Service agreement, rates, payment, cancellation policy, and luggage guidelines.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [{ url: `${BASE_URL}/hero-mercedes.webp`, width: 1200, height: 630, alt: 'Terms & Conditions — SPL Transportation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | SPL Transportation',
    description: 'Read the terms and conditions for SPL Transportation private transfer services.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

const termsSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/terms#webpage`,
    url: `${BASE_URL}/terms`,
    name: 'Terms & Conditions | SPL Transportation',
    description: 'Read the terms and conditions for SPL Transportation private transfer services.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SPL Transportation',
      url: BASE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Terms & Conditions', item: `${BASE_URL}/terms` },
      ],
    },
  },
];

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />
      <Terms />
    </>
  );
}

