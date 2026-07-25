import type { Metadata } from 'next';
import AboutPage from '../../components/AboutPage';
import { BASE_URL } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'About SPL Transportation | Trusted Cairns Airport Transfers Since 2004',
  description:
    'Learn about SPL Transportation — 20+ years of professional private airport transfers in Cairns, Port Douglas, Palm Cove and Tropical North Queensland. Licensed drivers, modern fleet, fixed pricing.',
  keywords: [
    'About SPL Transportation',
    'Cairns private transport company',
    'Port Douglas airport transfer service',
    'Palm Cove private driver',
    'Tropical North Queensland transfer team',
  ],
  alternates: {
    canonical: `${BASE_URL}/about`,
    languages: {
      'en-AU': `${BASE_URL}/about`,
      'x-default': `${BASE_URL}/about`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/about`,
    title: 'About SPL Transportation | Trusted Cairns Airport Transfers',
    description: '20+ years of trusted private transfers across Cairns, Port Douglas, Palm Cove & Tropical North Queensland.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: 'About SPL Transportation — Professional Airport Transfers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SPL Transportation | Cairns Airport Transfers',
    description: '20+ years of trusted private airport transfers across Tropical North Queensland.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

const aboutSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${BASE_URL}/about#webpage`,
    url: `${BASE_URL}/about`,
    name: 'About SPL Transportation',
    description:
      '20+ years of professional private airport transfers in Cairns, Port Douglas, Palm Cove and Tropical North Queensland.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SPL Transportation',
      url: BASE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'About Us', item: `${BASE_URL}/about` },
      ],
    },
    about: {
      '@type': 'Organization',
      name: 'SPL Transportation',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
    },
  },
];

export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutPage />
    </>
  );
}

