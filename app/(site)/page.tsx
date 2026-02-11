'use client';


import { useBooking } from '../providers/BookingProvider';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

import dynamic from 'next/dynamic';

import HomePage from '../components/HomePage';
const FeatureSection = dynamic(() => import('../components/FeatureSection'));
const PlaceCarousel = dynamic(() => import('../components/PlaceCarousal'));
const PopularDestinations = dynamic(() => import('../components/PopularDestinations'));
const HowToBookModern = dynamic(() => import('../components/HowToBook'));
const RoutesSection = dynamic(() => import('../components/RoutesSection').then(mod => mod.default));
const Services = dynamic(() => import('../components/Services').then(mod => mod.Services));
const CustomerReviews = dynamic(() => import('../components/CustomerReviews'));
const Faqsection = dynamic(() => import('../components/FaqSection'));

export default function Home() {
    const isOnline = useOnlineStatus();

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
            {!isOnline && (
                <div className="bg-red-600 text-white text-center py-2 text-sm font-medium sticky top-0 z-50 shadow-md">
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
