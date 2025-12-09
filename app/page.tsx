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

// ⭐ helper to normalize locations (trim spaces, you can add .toUpperCase() if needed)
const normalizeLocation = (value: string) => value.trim();

export default function TaxiBookingApp() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<BookingFormData>(initialFormData);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  // -------------------------------
  // LOAD ROUTES FROM API
  // -------------------------------
  useEffect(() => {
    let ignore = false;

    const loadRoutes = async () => {
      setRoutesLoading(true);

      try {
        const res = await fetch('/api/routes', {
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch routes (status ${res.status})`);
        }

        const json = await res.json();
        const data = Array.isArray(json) ? json : json.routes;

        if (!Array.isArray(data)) {
          throw new Error('Invalid routes format from API');
        }

        // ⭐ sanitize all route endpoints once here
        const sanitizedRoutes: Route[] = (data as Route[]).map(r => ({
          ...r,
          from: normalizeLocation(String(r.from)),
          to: normalizeLocation(String(r.to))
        }));

        if (!ignore) {
          setRoutes(sanitizedRoutes);
          setRoutesError(null);
        }
      } catch (e) {
        console.error('Error loading routes', e);
        if (!ignore) {
          setRoutes([]);
          setRoutesError(
            e instanceof Error ? e.message : 'Failed to load routes'
          );
        }
      } finally {
        if (!ignore) {
          setRoutesLoading(false);
        }
      }
    };

    loadRoutes();

    return () => {
      ignore = true;
    };
  }, []);

  // -------------------------------
  // AVAILABLE LOCATIONS
  // -------------------------------
  const availableLocations = useMemo(
    () =>
      Array.from(
        new Set(
          routes.flatMap(r => [
            normalizeLocation(r.from),
            normalizeLocation(r.to)
          ])
        )
      ).sort(),
    [routes]
  );

  // -------------------------------
  // DROPOFF OPTIONS
  // -------------------------------
  const dropoffOptions = useMemo(() => {
    if (!formData.pickupLocation) return availableLocations;

    const connectedLocations = new Set<string>();
    const pickup = normalizeLocation(formData.pickupLocation);

    routes.forEach(r => {
      const from = normalizeLocation(r.from);
      const to = normalizeLocation(r.to);

      if (from === pickup) {
        connectedLocations.add(to);
      } else if (to === pickup) {
        connectedLocations.add(from);
      }
    });

    return Array.from(connectedLocations)
      .filter(loc => loc !== pickup)
      .sort();
  }, [availableLocations, formData.pickupLocation, routes]);

  // -------------------------------
  // CURRENT ROUTE
  // -------------------------------
  const currentRoute: Route | null = useMemo(() => {
    const pickup = formData.pickupLocation
      ? normalizeLocation(formData.pickupLocation)
      : '';
    const dropoff = formData.dropoffLocation
      ? normalizeLocation(formData.dropoffLocation)
      : '';

    if (!pickup || !dropoff) return null;

    // 1. Try P -> D
    let route = routes.find(
      r =>
        normalizeLocation(r.from) === pickup &&
        normalizeLocation(r.to) === dropoff
    );

    // 2. Try D -> P
    if (!route) {
      const reverse = routes.find(
        r =>
          normalizeLocation(r.from) === dropoff &&
          normalizeLocation(r.to) === pickup
      );

      if (reverse) {
        return {
          ...reverse,
          from: pickup,
          to: dropoff
        } as Route;
      }
    }

    return route ?? null;
  }, [routes, formData.pickupLocation, formData.dropoffLocation]);

  // -------------------------------
  // PRICE CALCULATION
  // -------------------------------
  const calculatedPrice = useMemo(() => {
    if (!currentRoute) return 0;

    let basePrice = 0;
    const pax = formData.passengers;

    if (pax <= 4) {
      basePrice = currentRoute.pricing?.[0]?.price || 0;
    } else if (pax <= 6) {
      basePrice = currentRoute.pricing?.[1]?.price || 0;
    } else {
      basePrice = currentRoute.pricing?.[2]?.price || 0;
    }

    if (basePrice === 0 && currentRoute.pricing) {
      basePrice =
        currentRoute.pricing[currentRoute.pricing.length - 1].price || 0;
    }

    const childSeatCost = formData.childSeat ? 20 : 0;

    return basePrice + childSeatCost;
  }, [currentRoute, formData.passengers, formData.childSeat]);

  // -------------------------------
  // CENTRALIZED INPUT HANDLER
  // -------------------------------
  const handleInputChange = useCallback(
    (field: keyof BookingFormData, value: string | number | boolean) => {
      setFormData(prev => {
        if (field === 'pickupLocation') {
          // ⭐ normalize pickup value
          const newPickup = normalizeLocation(String(value));
          const connectedLocations = new Set<string>();

          routes.forEach(r => {
            const from = normalizeLocation(r.from);
            const to = normalizeLocation(r.to);

            if (from === newPickup) {
              connectedLocations.add(to);
            } else if (to === newPickup) {
              connectedLocations.add(from);
            }
          });

          const dropoffValid = connectedLocations.has(
            normalizeLocation(prev.dropoffLocation)
          );

          return {
            ...prev,
            pickupLocation: newPickup,
            dropoffLocation: dropoffValid ? prev.dropoffLocation : ''
          };
        }

        if (field === 'passengers') {
          const parsed = Number(value);
          const n = Number.isFinite(parsed)
            ? Math.max(1, Math.min(10, Math.floor(parsed)))
            : prev.passengers;
          return { ...prev, passengers: n };
        }

        if (field === 'luggage') {
          const parsed = Number(value);
          const n = Number.isFinite(parsed)
            ? Math.max(0, Math.min(10, Math.floor(parsed)))
            : prev.luggage;
          return { ...prev, luggage: n };
        }

        // ⭐ normalize dropoff too, just in case
        if (field === 'dropoffLocation') {
          return { ...prev, dropoffLocation: normalizeLocation(String(value)) };
        }

        return { ...prev, [field]: value };
      });
    },
    [routes]
  );

  // -------------------------------
  // HANDLE ROUTE SELECTION
  // -------------------------------
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
          <RoutesSection
            routes={routes}
            loading={routesLoading}
            error={routesError}
            setCurrentPage={(page: string) => setCurrentPage(page as PageKey)}
            onSelectRoute={handleRouteSelect}
          />
          <FeatureSection />
          <CustomerReviews />
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
