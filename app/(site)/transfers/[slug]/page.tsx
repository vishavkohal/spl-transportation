// app/transfers/[slug]/page.tsx

import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  CheckCircle,
  Shield,
  Car,
  Compass,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

// Types & Stores
import type { Route } from "../../../types";
import { getRoutes } from "../../../lib/routesStore";
import { routeToSlug } from "../../../lib/routeSlug";
import { getLandmarks } from "../../../lib/routeLandmarks";
import { getRoutePageContent } from "../../../lib/routePageContent";

// Components
import RouteBookingForm from "../../../components/RouteBookingForm";
import RouteMapClient from "../../../components/RouteMapClient";
import CustomerReviews from "@/app/components/CustomerReviews";

const BASE_URL = "https://www.spltransportation.com.au";
export const revalidate = 300;

import { COLORS } from "@/app/lib/colors";

// Brand colors
const PRIMARY_COLOR = COLORS.heroOverlay; // #19324D / #102A43
const ACCENT_COLOR = COLORS.primary; // #0F766E

/* ----------------------------------------
   Helpers
---------------------------------------- */

type RouteWithSlug = Route & { slug: string };

async function getAllRoutes(): Promise<RouteWithSlug[]> {
  const routes = await getRoutes();
  return routes.map((r) => ({
    ...r,
    slug: routeToSlug(r),
  }));
}

export async function generateStaticParams() {
  const routes = await getAllRoutes();
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const routes = await getAllRoutes();
  const route = routes.find((r) => r.slug === slug);

  if (!route) {
    return {
      title: "Route not found | SPL Transportation",
      description: "The requested transfer route could not be found.",
    };
  }

  const pageContent = await getRoutePageContent(route);
  const minPrice = route.pricing?.length
    ? Math.min(...route.pricing.map((p) => p.price))
    : null;

  const routeName = `${route.from} to ${route.to}`;
  const title = `${routeName} Private Transfers | ${
    minPrice ? `From $${minPrice}` : "Fixed Fare"
  } | SPL Transportation`;

  const description =
    route.description ||
    pageContent?.intro?.paragraphs?.[0] ||
    `Book private, fixed-price transfers from ${route.from} to ${route.to}. Professional drivers, modern vehicles, flight tracking, and no surge pricing across Queensland.`;

  const ogImageUrl = pageContent?.imageId
    ? `${BASE_URL}/api/images/${pageContent.imageId}`
    : `${BASE_URL}/routes/${route.slug}.jpg`;

  return {
    title,
    description,
    keywords: [
      `${route.from} to ${route.to} transfer`,
      `private transfer ${route.to}`,
      `airport transfer ${route.from}`,
      `private driver ${route.to}`,
      `SPL Transportation`,
      `Tropical North Queensland transfer`,
      `fixed price transfer ${route.to}`,
    ],
    alternates: {
      canonical: `${BASE_URL}/transfers/${route.slug}`,
      languages: {
        "en-AU": `${BASE_URL}/transfers/${route.slug}`,
        "x-default": `${BASE_URL}/transfers/${route.slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/transfers/${route.slug}`,
      title,
      description,
      siteName: "SPL Transportation",
      locale: "en_AU",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `SPL Transportation Private Transfer: ${routeName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}


/* ----------------------------------------
   Page Component
---------------------------------------- */

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const routes = await getAllRoutes();
  const route = routes.find((r) => r.slug === slug);

  if (!route) notFound();

  const pageContent = await getRoutePageContent(route);
  const landmarks = getLandmarks(route);
  const routeName = route.label ?? `${route.from} to ${route.to}`;

  const minPrice = route.pricing?.length
    ? Math.min(...route.pricing.map((p) => p.price))
    : null;

  const otherRoutes = routes.filter((r) => r.slug !== slug).slice(0, 6);


  return (
    <main className="bg-[#F8FAFC]">
      {/* ================= HERO BANNER (HOMEPAGE STYLED) ================= */}
      <section className="relative bg-[#102A43] text-white pt-16 pb-32 md:pt-20 md:pb-44 overflow-hidden">
        {/* Dynamic Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={
              pageContent?.imageId
                ? `/api/images/${pageContent.imageId}`
                : `/routes/${route.slug}.jpg`
            }
            alt={`Private Transfer: ${routeName}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/68 via-[#102A43]/72 to-[#102A43] z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>PRIVATE TRANSFER ROUTE</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight mb-4">
              {routeName}<br />
              <span className="text-[#2DD4BF]">Private Transfers</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-200 font-light mb-6 max-w-2xl leading-relaxed drop-shadow">
              Door-to-door private transfers with fixed pricing, professional local
              drivers, and premium air-conditioned vehicles across Queensland.
            </p>

            {/* Feature Badges & Fare Chip */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-white mb-6 sm:mb-8">
              <div className="flex items-center gap-2 drop-shadow bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <CheckCircle className="w-4 h-4 text-[#2DD4BF]" />
                <span>Fixed, All-Inclusive Fares</span>
              </div>
              <div className="flex items-center gap-2 drop-shadow bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <MapPin className="w-4 h-4 text-[#2DD4BF]" />
                <span>Meet &amp; Greet</span>
              </div>
              <div className="flex items-center gap-2 drop-shadow bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <Clock className="w-4 h-4 text-[#2DD4BF]" />
                <span>Flight Tracking</span>
              </div>
              {minPrice && (
                <div className="flex items-center gap-1.5 bg-[#0F766E] text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-teal-900/30 border border-teal-400/30">
                  <span>From ${minPrice} AUD</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= OVERLAPPING BOOKING FORM ================= */}
      <section className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 mb-16">
        <div
          id="booking"
          className="scroll-mt-24 rounded-3xl bg-white shadow-2xl border border-slate-200/80 p-6 sm:p-10"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#102A43]">
                Book Your {routeName} Transfer
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Instant confirmation • Fixed fares • 256-bit SSL encrypted checkout
              </p>
            </div>
          </div>
          <RouteBookingForm route={route} />
        </div>
      </section>

      {/* ================= QUICK SPECS STRIP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Route</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">{route.from} → {route.to}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Duration</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{route.duration ? `${route.duration} Mins` : "Direct Transfer"}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <Car className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Options</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">Sedan, SUV, Van (Up to 7)</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing</div>
            <div className="text-sm font-bold text-[#0F766E] mt-0.5">100% Fixed &amp; All-Inclusive</div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE ROUTE MAP & LANDMARKS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0F766E] mb-2">
              Interactive Map &amp; Stops
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Route Highlights &amp; Landmarks
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Explore the journey path and key scenic stops along {routeName}.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Landmarks List */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0F766E]" />
                Key Landmarks &amp; Waypoints
              </h3>
              <ul className="space-y-2.5">
                {landmarks.map((l) => (
                  <li
                    key={l}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#0F766E]/30 transition-all duration-200"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold flex items-center justify-center shrink-0">
                      📍
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Leaflet Route Map */}
            <div className="lg:col-span-7 h-[380px] sm:h-[440px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
              <RouteMapClient from={route.from} to={route.to} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEO CONTENT & TRAVEL GUIDE ================= */}
      {pageContent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-16">
          {/* Intro Section */}
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200/80">
            <div className="lg:col-span-7">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5">
                {pageContent.intro.h2}
              </h2>
              {pageContent.intro.paragraphs.map((p, i) => (
                <p key={i} className="text-slate-600 mb-4 text-base leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="lg:col-span-5 bg-slate-50/90 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#102A43] mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0F766E]" />
                What’s Included
              </h3>
              <ul className="space-y-3">
                {pageContent.intro.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Destination Highlights */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200/80">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5">
              {pageContent.destination.h3}
            </h3>
            {pageContent.destination.paragraphs.map((p, i) => (
              <p key={i} className="text-slate-600 mb-4 text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Travel Options */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200/80">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5">
              {pageContent.travelOptions.h4}
            </h4>
            {pageContent.travelOptions.paragraphs.map((p, i) => (
              <p key={i} className="text-slate-600 mb-4 text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Why Choose SPL */}
          <div className="bg-gradient-to-br from-[#102A43] to-[#19324D] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-6">
                {pageContent.whyUs.h2}
              </h2>

              {pageContent.whyUs.paragraphs.map((p, i) => (
                <p key={i} className="text-slate-200 mb-4 text-base sm:text-lg leading-relaxed max-w-3xl">
                  {p}
                </p>
              ))}

              <ul className="grid sm:grid-cols-2 gap-4 mt-8">
                {pageContent.whyUs.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-sm font-semibold">
                    <span className="w-6 h-6 rounded-full bg-[#2DD4BF] text-[#102A43] text-xs font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#booking"
                className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-full font-bold text-sm text-[#102A43] bg-white hover:bg-slate-100 shadow-lg transition-all duration-200"
              >
                {pageContent.whyUs.cta} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ================= CUSTOMER REVIEWS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <CustomerReviews />
      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
      {pageContent?.faqs?.length && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-10">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything you need to know about transfer from {route.from} to {route.to}
            </p>
          </div>

          <div className="space-y-4">
            {pageContent.faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:border-[#0F766E]/40 transition-all duration-200"
              >
                <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-[#0F766E] font-extrabold">Q.</span> {f.question}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed pl-5">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= RELATED ROUTES INTERLINKING ================= */}
      {otherRoutes.length > 0 && (

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0F766E] mb-1">
                Explore More Transfers
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Popular &amp; Nearby Transfer Routes
              </h2>
            </div>
            <a
              href="/transfers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
            >
              View All Transfer Routes <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherRoutes.map((r) => {
              const rMinPrice = r.pricing?.length
                ? Math.min(...r.pricing.map((p) => p.price))
                : null;
              return (
                <a
                  key={r.slug}
                  href={`/transfers/${r.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-[#0F766E]/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-400 mb-2">
                      <span className="truncate">{r.from}</span>
                      <span>→</span>
                      <span className="truncate">{r.to}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                      {r.from} to {r.to} Private Transfer
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">{r.duration ? `${r.duration} Mins` : "Direct Transfer"}</span>
                    <span className="font-bold text-[#0F766E]">
                      {rMinPrice ? `From $${rMinPrice} AUD` : "View Fare"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="py-16 bg-[#102A43] text-white">

        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Book Your {routeName} Transfer?
          </h2>
          <p className="text-base text-slate-300 mb-8 max-w-xl mx-auto">
            Enjoy fixed fares, zero surge pricing, and professional meet &amp; greet service.
          </p>
          <a
            href="#booking"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] shadow-lg shadow-teal-900/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Book Transfer Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ================= MOBILE STICKY CTA ================= */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-slate-200" />
        <div className="relative p-3.5 px-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Private Transfer</div>
            <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{routeName}</div>
          </div>
          <a
            href="#booking"
            className="flex-1 rounded-xl py-3 text-center text-xs font-bold text-white shadow-md bg-[#102A43] hover:bg-[#0C5D59]"
          >
            Book Now {minPrice ? `from $${minPrice}` : ""}
          </a>
        </div>
      </div>

      {/* ================= SCHEMA.ORG JSON-LD ================= */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSchema(route, pageContent)),
        }}
      />
    </main>
  );
}

/* ----------------------------------------
   Schema Generator
---------------------------------------- */

// Specific reviews for Cairns City route
const CAIRNS_CITY_REVIEWS = [
  {
    author: "Sarah Johnson",
    datePublished: "2025-10-12",
    reviewBody:
      "The driver was incredibly professional and arrived exactly on time. The car was spotless. Highly recommended!",
    ratingValue: "5",
  },
  {
    author: "Michael Chen",
    datePublished: "2025-09-28",
    reviewBody:
      "Best airport transfer I have ever used. The flight tracking feature is a lifesaver. Will definitely book again.",
    ratingValue: "5",
  },
  {
    author: "Emily Davis",
    datePublished: "2025-11-05",
    reviewBody:
      "Great service for city commuting. Very comfortable ride, though traffic was a bit heavy. Driver knew all the shortcuts!",
    ratingValue: "5",
  },
];

import { RoutePageContent } from "../../../lib/routePageContent";

function generateSchema(route: RouteWithSlug, pageContent: RoutePageContent | null) {
  const minPrice = route.pricing?.length
    ? Math.min(...route.pricing.map((p) => p.price))
    : 0;

  const validUntil = "2026-12-31";
  const url = `${BASE_URL}/transfers/${route.slug}`;
  const routeName = `${route.from} to ${route.to}`;
  const description =
    pageContent?.intro?.paragraphs?.[0] ||
    `Premium private transfers from ${route.from} to ${route.to} with fixed pricing.`;

  const isCairnsCity = route.slug === "cairns-airport-to-cairns-city";
  const reviewsData = isCairnsCity ? CAIRNS_CITY_REVIEWS : [];

  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: isCairnsCity ? "3" : "324",
    bestRating: "5",
    worstRating: "1",
  };

  const reviewsSchema = reviewsData.map((r, i) => ({
    "@type": "Review",
    "@id": `${url}#review${i + 1}`,
    itemReviewed: { "@id": `${url}#service` },
    author: { "@type": "Person", name: r.author },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.ratingValue,
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody: r.reviewBody,
    datePublished: r.datePublished,
  }));

  const graph = [
    {
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}/#organization`,
      name: "SPL Transportation",
      description:
        "Professional private transfers across Queensland. Elevating your journey with safety, punctuality, and premium comfort.",
      url: BASE_URL,
      telephone: "+61470032460",
      email: "spltransportation.australia@gmail.com",
      logo: `${BASE_URL}/logo.png`,
      image: `${BASE_URL}/logo.png`,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairns",
        addressRegion: "Queensland",
        addressCountry: "AU",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "-16.9186",
        longitude: "145.7781",
      },
      areaServed: [
        { "@type": "City", name: "Cairns" },
        { "@type": "City", name: "Port Douglas" },
        { "@type": "City", name: "Palm Cove" },
        { "@type": "State", name: "Queensland" },
      ],
      aggregateRating: aggregateRating,
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      serviceType: "Airport Transfer Service",
      name: `${routeName} Transfers`,
      description: description,
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "City", name: route.to },
      offers: {
        "@type": "Offer",
        price: minPrice.toString(),
        priceCurrency: "AUD",
        priceValidUntil: validUntil,
        availability: "https://schema.org/InStock",
        url: url,
        validFrom: "2025-01-01",
        itemOffered: {
          "@type": "Service",
          name: `Private Transfer - ${routeName}`,
        },
      },
      aggregateRating: aggregateRating,
    },
    {
      "@type": "TravelAction",
      "@id": `${url}#travel`,
      name: `${routeName} Transfer`,
      description: route.duration ? `Estimated duration: ${route.duration} mins` : undefined,
      fromLocation: {
        "@type": "Place",
        name: route.from,
        address: { "@type": "PostalAddress", addressLocality: "Cairns", addressCountry: "AU" }
      },
      toLocation: {
        "@type": "Place",
        name: route.to,
        address: { "@type": "PostalAddress", addressLocality: route.to, addressCountry: "AU" }
      },
      distance: route.distance || undefined,
    },
    {
      "@type": "Product",
      "@id": `${url}#product`,
      name: `${routeName} Private Transfer`,
      description: `Premium private transfer service from ${route.from} to ${route.to}.`,
      brand: { "@id": `${BASE_URL}/#organization` },
      offers: {
        "@type": "Offer",
        price: minPrice.toString(),
        priceCurrency: "AUD",
        availability: "https://schema.org/InStock",
        url: url,
        priceValidUntil: validUntil,
      },
      aggregateRating: aggregateRating,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Transfers",
          item: `${BASE_URL}/transfers`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: routeName,
          item: url,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url: url,
      name: `${routeName} Transfers | From $${minPrice} | SPL Transportation`,
      description: description,
      inLanguage: "en-AU",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      about: { "@id": `${url}#service` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${BASE_URL}/routes/${route.slug}.jpg`,
      },
    },
    {
      "@type": "Place",
      "@id": `${url}#destination`,
      name: route.to,
      description:
        pageContent?.destination?.paragraphs?.[0] ||
        pageContent?.intro?.paragraphs?.[0] ||
        `Beautiful destination of ${route.to} in Queensland.`,
      address: {
        "@type": "PostalAddress",
        addressLocality: route.to,
        addressRegion: "Queensland",
        addressCountry: "AU",
      },
    },
  ];

  if (reviewsSchema.length > 0) {
    graph.push(...(reviewsSchema as any));
  }

  if (pageContent?.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: pageContent.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    } as any);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
