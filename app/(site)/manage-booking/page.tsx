import { Metadata } from 'next';
import ManageBookingClient from '@/app/components/ManageBookingClient';

export const metadata: Metadata = {
  title: 'Manage Your Booking | SPL Transportation',
  description: 'View or modify your private transfer reservation details, flight numbers, and schedule.',
};

export default function ManageBookingPage() {
  return <ManageBookingClient />;
}
