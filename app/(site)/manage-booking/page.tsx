import { Metadata } from 'next';
import ManageBookingClient from '@/app/components/ManageBookingClient';
import { BASE_URL } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'Manage Your Booking | SPL Transportation',
  description: 'View or modify your private transfer reservation details, flight numbers, and schedule.',
  alternates: {
    canonical: `${BASE_URL}/manage-booking`,
    languages: {
      'en-AU': `${BASE_URL}/manage-booking`,
      'x-default': `${BASE_URL}/manage-booking`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/manage-booking`,
    title: 'Manage Your Booking | SPL Transportation',
    description: 'View or modify your private transfer reservation details, flight numbers, and schedule.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [{ url: `${BASE_URL}/hero-mercedes.webp`, width: 1200, height: 630, alt: 'Manage Booking — SPL Transportation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manage Your Booking | SPL Transportation',
    description: 'View or modify your private transfer reservation details.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

export default function ManageBookingPage() {
  return <ManageBookingClient />;
}

