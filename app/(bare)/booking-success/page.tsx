import { Suspense } from 'react';
import BookingSuccessClient from './BookingSuccessClient';

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600 text-sm">Loading booking…</p>
        </div>
      }
    >
      <BookingSuccessClient />
    </Suspense>
  );
}
