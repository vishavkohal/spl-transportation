'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8 bg-gray-50">
      <div className="text-center max-w-xl mx-auto">
        <p className="text-base font-semibold text-[#A61924]">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#18234B] sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-full bg-[#18234B] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#121a38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18234B] flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link 
            href="/book" 
            className="text-sm font-semibold text-gray-900 hover:text-[#A61924] transition-colors flex items-center gap-1.5"
          >
            Book a Transfer <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
