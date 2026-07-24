'use client';

import { useState } from 'react';
import Navigation from "../components/Navigation"; 
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <>
      <Navigation/>

      <main className="pt-20 min-h-screen bg-white dark:bg-white">
        {children}
      </main>

      <Footer/>

      {/* Global Sticky Mobile Bottom Navigation (Visible on all pages for mobile) */}
      <MobileBottomNav />
    </>
  );
}
