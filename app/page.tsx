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
import { Services } from './components/Services';
import PopularDestinations from './components/PopularDestinations';
import Faqsection from './components/FaqSection';

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
  contactNumber: '',
  hourlyPickupLocation: '',
  hourlyHours: 0,
  hourlyVehicleType: ''
};

const normalizeLocation = (value: string) => value.trim();

export default function TaxiBookingApp() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<BookingFormData>(initialFormData);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  // ----------------------------------
  // 🟢 Internet Connectivity State
  // ----------------------------------
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [retryFlag, setRetryFlag] = useState<boolean>(false);

  // Detect online/offline events
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setRetryFlag(true); // auto-reload routes
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ----------------------------------
  // 🟢 Load Routes with Auto-Retry
  // ----------------------------------
  useEffect(() => {
    let ignore = false;

    const loadRoutes = async () => {
      setRoutesLoading(true);

      try {
        const res = await fetch('/api/routes', { cache: 'no-store' });

        if (!res.ok) throw new Error('Failed to fetch routes');

        const json = await res.json();
        const data = Array.isArray(json) ? json : json.routes;

        if (!Array.isArray(data)) throw new Error('Invalid routes format');

        const sanitized: Route[] = data.map((r: Route) => ({
          ...r,
          from: normalizeLocation(String(r.from)),
          to: normalizeLocation(String(r.to))
        }));

        if (!ignore) {
          setRoutes(sanitized);
          setRoutesError(null);
        }
      } catch (err) {
        if (!ignore) {
          setRoutesError(isOnline ? 'Failed to load routes' : 'No internet connection');
        }
      } finally {
        if (!ignore) {
          setRoutesLoading(false);
          setRetryFlag(false);
        }
      }
    };

    // Only run fetch when online
    if (isOnline) loadRoutes();

    return () => {
      ignore = true;
    };
  }, [isOnline, retryFlag]);

  // ----------------------------------
  // LOCATION OPTIONS
  // ----------------------------------
  const availableLocations = useMemo(
    () =>
      Array.from(
        new Set(routes.flatMap(r => [normalizeLocation(r.from), normalizeLocation(r.to)]))
      ).sort(),
    [routes]
  );

  const dropoffOptions = useMemo(() => {
    if (!formData.pickupLocation) return availableLocations;

    const pickup = normalizeLocation(formData.pickupLocation);
    const connected = new Set<string>();

    routes.forEach(r => {
      const from = normalizeLocation(r.from);
      const to = normalizeLocation(r.to);

      if (from === pickup) connected.add(to);
      if (to === pickup) connected.add(from);
    });

    return Array.from(connected)
      .filter(loc => loc !== pickup)
      .sort();
  }, [availableLocations, formData.pickupLocation, routes]);

  // ----------------------------------
  // CURRENT ROUTE
  // ----------------------------------
  const currentRoute: Route | null = useMemo(() => {
    const pickup = normalizeLocation(formData.pickupLocation);
    const dropoff = normalizeLocation(formData.dropoffLocation);

    if (!pickup || !dropoff) return null;

    let route = routes.find(
      r => normalizeLocation(r.from) === pickup && normalizeLocation(r.to) === dropoff
    );

    if (!route) {
      const reverse = routes.find(
        r => normalizeLocation(r.from) === dropoff && normalizeLocation(r.to) === pickup
      );

      if (reverse) {
        return { ...reverse, from: pickup, to: dropoff } as Route;
      }
    }

    return route ?? null;
  }, [routes, formData.pickupLocation, formData.dropoffLocation]);

  // ----------------------------------
  // PRICE CALCULATION
  // ----------------------------------
  const calculatedPrice = useMemo(() => {
    if (!currentRoute) return 0;

    let basePrice = 0;
    const pax = formData.passengers;

    if (pax <= 4) basePrice = currentRoute.pricing?.[0]?.price || 0;
    else if (pax <= 6) basePrice = currentRoute.pricing?.[1]?.price || 0;
    else basePrice = currentRoute.pricing?.[2]?.price || 0;

    if (basePrice === 0 && currentRoute.pricing) {
      basePrice = currentRoute.pricing[currentRoute.pricing.length - 1].price || 0;
    }

    return basePrice + (formData.childSeat ? 20 : 0);
  }, [currentRoute, formData.passengers, formData.childSeat]);

  // ----------------------------------
  // INPUT HANDLER
  // ----------------------------------
  const handleInputChange = useCallback(
    (field: keyof BookingFormData, value: string | number | boolean) => {
      setFormData(prev => {
        if (field === 'pickupLocation') {
          const newPickup = normalizeLocation(String(value));
          const connected = new Set<string>();

          routes.forEach(r => {
            const from = normalizeLocation(r.from);
            const to = normalizeLocation(r.to);

            if (from === newPickup) connected.add(to);
            if (to === newPickup) connected.add(from);
          });

          const dropoffValid = connected.has(normalizeLocation(prev.dropoffLocation));

          return {
            ...prev,
            pickupLocation: newPickup,
            dropoffLocation: dropoffValid ? prev.dropoffLocation : ''
          };
        }

        return { ...prev, [field]: value };
      });
    },
    [routes]
  );

  // ----------------------------------
  // ROUTE SELECT HANDLER
  // ----------------------------------
  const handleRouteSelect = useCallback((route: Route) => {
    setFormData(prev => ({
      ...prev,
      pickupLocation: normalizeLocation(route.from),
      dropoffLocation: normalizeLocation(route.to)
    }));

    setBookingStep(1);
    setCurrentPage('home');

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔴 Notification if offline */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium">
          No internet connection. Some features may be unavailable.
        </div>
      )}

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
            routesLoading={routesLoading}
          />

          <PlaceCarousel />
          <FeatureSection />
          <PopularDestinations />
          <HowToBookModern />
          <RoutesSection
            routes={routes}
            loading={routesLoading}
            error={routesError}
            setCurrentPage={(page: string) => setCurrentPage(page as PageKey)}
            onSelectRoute={handleRouteSelect}
          />
          <Services />
          <CustomerReviews />
          <Faqsection />
        </main>
      )}

      {currentPage === 'routes' && (
        <RoutesPage
          setCurrentPage={(page: string) => setCurrentPage(page as PageKey)}
          onSelectRoute={handleRouteSelect}
        />
      )}

      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'terms' && <TermsPage />}
      {currentPage === 'contact' && <ContactPage />}

      <Footer setCurrentPage={(page: string) => setCurrentPage(page as PageKey)} />
    </div>
  );
}
