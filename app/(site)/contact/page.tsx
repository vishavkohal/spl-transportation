import type { Metadata } from 'next';
import ContactPage from '../../components/ContactPage';
import { BASE_URL } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us | 24/7 Airport Transfer Enquiries & Support',
  description:
    'Get in touch with SPL Transportation for private airport transfer enquiries, bookings, and quotes. Available 24/7 for Cairns, Port Douglas, Palm Cove and Tropical North Queensland transfers.',
  keywords: [
    'Contact SPL Transportation',
    'Cairns transfer phone number',
    'Port Douglas airport transfer quote',
    'Palm Cove private driver contact',
    '24/7 airport transfer support Cairns',
  ],
  alternates: {
    canonical: `${BASE_URL}/contact`,
    languages: {
      'en-AU': `${BASE_URL}/contact`,
      'x-default': `${BASE_URL}/contact`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/contact`,
    title: 'Contact SPL Transportation | Cairns Transfers & Support',
    description: 'Contact us 24/7 for private transfer quotes and bookings across Tropical North Queensland.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: 'Contact SPL Transportation - 24/7 Transfer Support',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact SPL Transportation | Cairns Transfers',
    description: 'Contact us 24/7 for private transfer quotes across Tropical North Queensland.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': `${BASE_URL}/contact#webpage`,
      url: `${BASE_URL}/contact`,
      name: 'Contact SPL Transportation',
      description:
        'Contact SPL Transportation 24/7 for private airport transfer quotes and customer support.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
        ],
      },
      mainEntity: { '@id': `${BASE_URL}/#organization` },
    },
  ],
};

export default function ContactIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactPage />
    </>
  );
}
