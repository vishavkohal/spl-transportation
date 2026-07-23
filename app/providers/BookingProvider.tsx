'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import Cookies from 'js-cookie';
import { COOKIE_CONSENT_KEY } from '../components/CookieConsent';
import { AFTER_HOURS_SURCHARGE, isAfterHours } from '../lib/afterHours';
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

/* ---- Routes sessionStorage cache ---- */
const ROUTES_CACHE_KEY = 'spl_cached_routes';

function readCachedRoutes(): Route[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(ROUTES_CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Route[];
  } catch {
    return [];
  }
}

function writeCachedRoutes(routes: Route[]) {
  try {
    sessionStorage.setItem(ROUTES_CACHE_KEY, JSON.stringify(routes));
  } catch {}
}

const normalizeLocation = (v: string) => v.trim();

/* ---------------- Provider ---------------- */

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);

  // Always start with loading=true and empty routes for consistent SSR/CSR hydration.
  // Routes are loaded from sessionStorage (instant) or fetched (async) in useEffect below.
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

  /* -------- Load Routes (post-hydration) -------- */

  useEffect(() => {
    // First, try loading from sessionStorage for instant display
    const cached = readCachedRoutes();
    if (cached.length > 0) {
      setRoutes(cached);
      setRoutesLoading(false);
    }

    if (!isOnline) {
      if (cached.length === 0) {
        setRoutesLoading(false);
        setRoutesError('No internet connection');
      }
      return;
    }

    // Background fetch to get fresh data (or initial data if no cache)
    let cancelled = false;

    fetch('/api/routes')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(json => {
        if (cancelled) return;
        const data = Array.isArray(json) ? json : json.routes ?? [];
        const sanitized = (data as Route[]).map(r => ({
          ...r,
          from: normalizeLocation(r.from),
          to: normalizeLocation(r.to),
        }));
        writeCachedRoutes(sanitized);
        setRoutes(sanitized);
        setRoutesError(null);
        setRoutesLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        if (cached.length === 0) {
          setRoutesError('Failed to load routes. Please refresh.');
        }
        setRoutesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, retryFlag]);

  /* -------- User Data Cookie Storage -------- */
  
  useEffect(() => {
    // Load initial user data from cookies if present
    const savedData = Cookies.get('spl_user_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          email: parsed.email || prev.email,
          contactNumber: parsed.contactNumber || prev.contactNumber,
        }));
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  useEffect(() => {
    // Save user data to cookies when it changes, but ONLY if they consented
    const consent = Cookies.get(COOKIE_CONSENT_KEY);
    if (consent === 'granted') {
      const { fullName, email, contactNumber } = formData;
      if (fullName || email || contactNumber) {
        Cookies.set('spl_user_data', JSON.stringify({ fullName, email, contactNumber }), { expires: 365, path: '/' });
      }
    }
  }, [formData.fullName, formData.email, formData.contactNumber]);

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

    let price = tier?.price || 0;
    if (formData.childSeat) price += 20;
    if (isAfterHours(formData.pickupTime)) price += AFTER_HOURS_SURCHARGE;
    return price;
  }, [currentRoute, formData.passengers, formData.childSeat, formData.pickupTime]);

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
