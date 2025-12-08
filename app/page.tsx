'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import RoutesPage from './components/RoutesPage';
import AboutPage from './components/AboutPage';
import TermsPage from './components/TermsPage';
import ContactPage from './components/ContactPage';
import type { BookingFormData, Route } from './types';
import FeatureSection from './components/FeatureSection';
import CustomerReviews from './components/CustomerReviews';
import RoutesSection from './components/RoutesSection';
import PlaceCarousel from './components/PlaceCarousal';
import HowToBookModern from './components/HowToBook';

// Optional: export this if you want Navigation/Footer/RoutesPage to reuse it
export type PageKey = 'home' | 'routes' | 'about' | 'terms' | 'contact';

const initialFormData: BookingFormData = {
  pickupLocation: '',
  pickupAddress: '',
  dropoffLocation: '',
  dropoffAddress: '',
  pickupDate: '',
  pickupTime: '',
  passengers: 1,
  luggage: 0,
  flightNumber: '',
  childSeat: false,
  fullName: '',
  email: '',
  contactNumber: ''
};

export default function TaxiBookingApp() {
  // Page / UI state
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1); // ✅ matches HomePage props

  // Booking data state
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);

  // Routes data
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  // -------------------------------
  // LOAD ROUTES FROM API
  // -------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch('/api/routes');
        if (!res.ok) throw new Error('Failed to fetch routes');
        const data: Route[] = await res.json();
        if (mounted) {
          setRoutes(data);
          setRoutesError(null);
        }
      } catch (e) {
        console.error('Error loading routes', e);
        if (mounted) {
          setRoutesError(
            e instanceof Error ? e.message : 'Failed to load routes'
          );
        }
      } finally {
        if (mounted) setRoutesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // -------------------------------
  // AVAILABLE LOCATIONS
  // -------------------------------
  const availableLocations = useMemo(
    () => Array.from(new Set(routes.flatMap(r => [r.from, r.to]))).sort(),
    [routes]
  );

  // -------------------------------
  // DROPOFF OPTIONS (based on pickup)
  // -------------------------------
  const dropoffOptions = useMemo(() => {
    if (!formData.pickupLocation) return availableLocations;
    const options = routes
      .filter(r => r.from === formData.pickupLocation)
      .map(r => r.to);
    return Array.from(new Set(options)).sort();
  }, [availableLocations, formData.pickupLocation, routes]);

  // -------------------------------
  // CURRENT ROUTE (derived)
  // -------------------------------
  const currentRoute: Route | null = useMemo(
    () =>
      routes.find(
        r => r.from === formData.pickupLocation && r.to === formData.dropoffLocation
      ) ?? null,
    [routes, formData.pickupLocation, formData.dropoffLocation]
  );

  // -------------------------------
  // PRICE CALCULATION (derived)
  // -------------------------------
  const calculatedPrice = useMemo(() => {
    if (!currentRoute) return 0;

    let basePrice = 0;
    const pax = formData.passengers;

    if (pax <= 2) basePrice = currentRoute.pricing[0].price;
    else if (pax <= 4) basePrice = currentRoute.pricing[1].price;
    else basePrice = currentRoute.pricing[2].price;

    const childSeatCost = formData.childSeat ? 20 : 0;

    return basePrice + childSeatCost;
  }, [currentRoute, formData.passengers, formData.childSeat]);

  // -------------------------------
  // CENTRALIZED INPUT HANDLER
  // -------------------------------
  const handleInputChange = useCallback(
    (field: keyof BookingFormData, value: string | number | boolean) => {
      setFormData(prev => {
        // Handle pickup location and keep dropoff valid
        if (field === 'pickupLocation') {
          const newPickup = String(value);
          const validDropoffs = routes
            .filter(r => r.from === newPickup)
            .map(r => r.to);
          const uniqueDropoffs = Array.from(new Set(validDropoffs));
          const dropoffValid = uniqueDropoffs.includes(prev.dropoffLocation);

          return {
            ...prev,
            pickupLocation: newPickup,
            dropoffLocation: dropoffValid ? prev.dropoffLocation : ''
          };
        }

        // Clamp passengers
        if (field === 'passengers') {
          const parsed = Number(value);
          const n = Number.isFinite(parsed)
            ? Math.max(1, Math.min(10, Math.floor(parsed)))
            : prev.passengers;
          return { ...prev, passengers: n };
        }

        // Clamp luggage
        if (field === 'luggage') {
          const parsed = Number(value);
          const n = Number.isFinite(parsed)
            ? Math.max(0, Math.min(10, Math.floor(parsed)))
            : prev.luggage;
          return { ...prev, luggage: n };
        }

        return { ...prev, [field]: value };
      });
    },
    [routes]
  );

  // -------------------------------
  // HANDLE ROUTE SELECTION FROM ROUTES PAGE / SECTION
  // -------------------------------
  const handleRouteSelect = useCallback((route: Route) => {
    // Fill pickup & dropoff
    setFormData(prev => ({
      ...prev,
      pickupLocation: route.from,
      dropoffLocation: route.to
    }));

    // Take user to step 1 of home page with filled-in locations
    setBookingStep(1);
    setCurrentPage('home');

    // Scroll user to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // -------------------------------
  // RENDER PAGES
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {currentPage === 'home' && (
        <main>
          <HomePage
            formData={formData}
            handleInputChange={handleInputChange}
            bookingStep={bookingStep}
            setBookingStep={setBookingStep}
            setCurrentPage={(page: string) => setCurrentPage(page as PageKey)}
            AVAILABLE_LOCATIONS={availableLocations}
            dropoffOptions={dropoffOptions}
            selectedRoute={currentRoute}
            calculatedPrice={calculatedPrice}
          />
          <PlaceCarousel />
          <HowToBookModern />

          {/* ✅ Wait until routes have finished loading before showing the section */}
          {!routesLoading && (
            <RoutesSection
              routes={routes}
              loading={routesLoading}
              error={routesError}
              setCurrentPage={(page: string) => setCurrentPage(page as PageKey)}
              onSelectRoute={handleRouteSelect}
            />
          )}

          <FeatureSection />
          <CustomerReviews />
        </main>
      )}

      {currentPage === 'routes' && (
        <RoutesPage
          setCurrentPage={(page: string) => setCurrentPage(page as PageKey)}
          onSelectRoute={handleRouteSelect}
          // You can also pass routes/loading if RoutesPage supports it:
          // routes={routes}
          // loading={routesLoading}
        />
      )}

      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'terms' && <TermsPage />}
      {currentPage === 'contact' && <ContactPage />}

      <Footer setCurrentPage={(page: string) => setCurrentPage(page as PageKey)} />
    </div>
  );
}
