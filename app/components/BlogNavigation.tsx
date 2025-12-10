// app/components/BlogNavigation.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';

type PageKey = 'home' | 'routes' | 'about' | 'contact' | 'terms' | 'blog';

export default function BlogNavigation() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // On the blog, we don't have SPA "pages",
  // so we use this function to navigate by URL instead.
  const handleSetCurrentPage = (page: PageKey) => {
    if (page === 'blog') {
      router.push('/blog');
   
      return;
    }
     else if (page === 'contact') {
        router.push('/contact'); 
        return;
}

    // For now, send all other pages back to the main app at `/`
    // (your main TaxiBookingApp handles home/routes/about/contact/terms).
    router.push('/');
  };

  return (
    <Navigation
      currentPage="blog"
      setCurrentPage={handleSetCurrentPage}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
    />
  );
}
