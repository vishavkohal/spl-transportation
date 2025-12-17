'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import type { BookingFormData, Route } from '../types';

type BookingContextType = {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  routes: Route[];
  routesLoading: boolean;
  routesError: string | null;
  availableLocations: string[];
  dropoffOptions: string[];
  currentRoute: Route | null;
  calculatedPrice: number;
  bookingStep: 1 | 2;
  setBookingStep: (s: 1 | 2) => void;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
  handleRouteSelect: (route: Route) => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}

/* ---------------- Constants ---------------- */

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

const normalizeLocation = (v: string) => v.trim();

/* ---------------- Provider ---------------- */

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(true);
  const [retryFlag, setRetryFlag] = useState(false);

  /* -------- Online / Offline -------- */

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const onOnline = () => {
      setIsOnline(true);
      setRetryFlag(true);
    };

    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  /* -------- Load Routes -------- */

  useEffect(() => {
    let ignore = false;

    async function load() {
      setRoutesLoading(true);
      try {
        const res = await fetch('/api/routes', { cache: 'no-store' });
        if (!res.ok) throw new Error();

        const json = await res.json();
        const data = Array.isArray(json) ? json : json.routes;

        const sanitized = data.map((r: Route) => ({
          ...r,
          from: normalizeLocation(r.from),
          to: normalizeLocation(r.to)
        }));

        if (!ignore) {
          setRoutes(sanitized);
          setRoutesError(null);
        }
      } catch {
        if (!ignore) {
          setRoutesError(isOnline ? 'Failed to load routes' : 'No internet');
        }
      } finally {
        if (!ignore) {
          setRoutesLoading(false);
          setRetryFlag(false);
        }
      }
    }

    if (isOnline) load();
    return () => {
      ignore = true;
    };
  }, [isOnline, retryFlag]);

  /* -------- Derived Data -------- */

  const availableLocations = useMemo(() => {
    return Array.from(
      new Set(routes.flatMap(r => [r.from, r.to]))
    ).sort();
  }, [routes]);

  const dropoffOptions = useMemo(() => {
    if (!formData.pickupLocation) return availableLocations;

    const pickup = normalizeLocation(formData.pickupLocation);
    const connected = new Set<string>();

    routes.forEach(r => {
      if (r.from === pickup) connected.add(r.to);
      if (r.to === pickup) connected.add(r.from);
    });

    return Array.from(connected).filter(l => l !== pickup).sort();
  }, [routes, formData.pickupLocation, availableLocations]);

  const currentRoute = useMemo<Route | null>(() => {
    const p = normalizeLocation(formData.pickupLocation);
    const d = normalizeLocation(formData.dropoffLocation);
    if (!p || !d) return null;

    return (
      routes.find(r => r.from === p && r.to === d) ||
      routes.find(r => r.from === d && r.to === p) ||
      null
    );
  }, [routes, formData.pickupLocation, formData.dropoffLocation]);

  const calculatedPrice = useMemo(() => {
    if (!currentRoute) return 0;
    const pax = formData.passengers;
    const tiers = currentRoute.pricing || [];
    const tier =
      tiers.find(t => {
        const [min, max] = t.passengers.split('-').map(Number);
        return pax >= min && pax <= max;
      }) || tiers[tiers.length - 1];

    return (tier?.price || 0) + (formData.childSeat ? 20 : 0);
  }, [currentRoute, formData.passengers, formData.childSeat]);

  /* -------- Handlers -------- */

  const handleInputChange = useCallback(
    (field: keyof BookingFormData, value: any) => {
      setFormData(prev => {
        if (field === 'pickupLocation') {
          const connected = new Set<string>();
          routes.forEach(r => {
            if (r.from === value) connected.add(r.to);
            if (r.to === value) connected.add(r.from);
          });

          return {
            ...prev,
            pickupLocation: value,
            dropoffLocation: connected.has(prev.dropoffLocation)
              ? prev.dropoffLocation
              : ''
          };
        }

        return { ...prev, [field]: value };
      });
    },
    [routes]
  );

  const handleRouteSelect = useCallback((route: Route) => {
    setFormData(prev => ({
      ...prev,
      pickupLocation: route.from,
      dropoffLocation: route.to
    }));
    setBookingStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <BookingContext.Provider
      value={{
        formData,
        setFormData,
        routes,
        routesLoading,
        routesError,
        availableLocations,
        dropoffOptions,
        currentRoute,
        calculatedPrice,
        bookingStep,
        setBookingStep,
        handleInputChange,
        handleRouteSelect
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
