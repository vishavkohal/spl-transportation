'use client'; // Error components must be Client Components

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8 bg-gray-50">
      <div className="text-center max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-full bg-[#102A43] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0C5D59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102A43] flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
