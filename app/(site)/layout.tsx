'use client';

import { useState } from 'react';
import Navigation from "../components/Navigation"; 
import Footer from "../components/Footer";
export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <>
      <Navigation/>

      <main className="pt-20 min-h-screen bg-white dark:bg-white">
        {children}
      </main>

      <Footer/>
    </>
  );
}
