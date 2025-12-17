'use client';

import { useBooking } from '../providers/BookingProvider';

import HomePage from '../components/HomePage';
import FeatureSection from '../components/FeatureSection';
import PlaceCarousel from '../components/PlaceCarousal';
import PopularDestinations from '../components/PopularDestinations';
import HowToBookModern from '../components/HowToBook';
import RoutesSection from '../components/RoutesSection';
import { Services } from '../components/Services';
import CustomerReviews from '../components/CustomerReviews';
import Faqsection from '../components/FaqSection';

export default function Home() {
  const {
    formData,
    handleInputChange,
    bookingStep,
    setBookingStep,
    availableLocations,
    dropoffOptions,
    currentRoute,
    calculatedPrice,
    routes,
    routesLoading,
    routesError,
    handleRouteSelect
  } = useBooking();

  return (
    <>
      {/* 🔴 Offline Banner */}
      {!navigator.onLine && (
        <div className="bg-white-600 text-black text-center py-2 text-sm font-medium">
          No internet connection. Some features may be unavailable.
        </div>
      )}

      {/* HERO + BOOKING */}
      <HomePage
        formData={formData}
        handleInputChange={handleInputChange}
        bookingStep={bookingStep}
        setBookingStep={setBookingStep}
        AVAILABLE_LOCATIONS={availableLocations}
        dropoffOptions={dropoffOptions}
        selectedRoute={currentRoute}
        calculatedPrice={calculatedPrice}
        routesLoading={routesLoading}
      />

      {/* CONTENT SECTIONS */}
      <PlaceCarousel />
      <FeatureSection />
      <PopularDestinations />
      <HowToBookModern />

      <RoutesSection
        routes={routes}
        loading={routesLoading}
        error={routesError}
        onSelectRoute={handleRouteSelect}
      />

      <Services />
      <CustomerReviews />
      <Faqsection />
    </>
  );
}
