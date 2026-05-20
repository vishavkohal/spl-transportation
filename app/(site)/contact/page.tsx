import type { Metadata } from 'next';
import ContactPage from '../../components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact SPL Transportation | Cairns Airport Transfer Enquiries',
  description:
    'Get in touch with SPL Transportation for private airport transfer enquiries, bookings, and quotes. Available 24/7 for Cairns, Port Douglas, Palm Cove and Tropical North Queensland transfers.',
  alternates: {
    canonical: 'https://www.spltransportation.com.au/contact',
  },
  openGraph: {
    title: 'Contact SPL Transportation | Cairns Transfers',
    description: 'Contact us for private transfer quotes and bookings across Tropical North Queensland.',
    url: 'https://www.spltransportation.com.au/contact',
  },
};

export default function ContactIndexPage() {
  return <ContactPage />;
}