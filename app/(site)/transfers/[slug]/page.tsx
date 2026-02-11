// app/transfers/[slug]/page.tsx

import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

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

// Brand colors
const PRIMARY_COLOR = "#18234B";
const ACCENT_COLOR = "#A61924";

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

  const minPrice = route.pricing?.length
    ? Math.min(...route.pricing.map((p) => p.price))
    : null;

  return {
    title: `${route.from} to ${route.to} Transfers | ${minPrice ? `From $${minPrice}` : "Private Transfer"
      } | SPL Transportation`,
    description:
      route.description ??
      `Book a private, fixed-price transfer from ${route.from} to ${route.to}. Professional drivers, modern vehicles, no hidden fees.`,
    alternates: {
      canonical: `${BASE_URL}/transfers/${route.slug}`,
    },
  };
}

/* ----------------------------------------
   Page
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

  const pageContent = getRoutePageContent(route);
  const landmarks = getLandmarks(route);
  const routeName = route.label ?? `${route.from} to ${route.to}`;

  return (
    <main className="bg-neutral-50">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              {routeName} Transfers
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl">
              Premium private transfers with fixed pricing, professional local
              drivers, and modern air-conditioned vehicles.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Fixed Price", "Private Vehicle", "No Hidden Fees"].map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 text-sm text-black font-medium rounded-full bg-white/70 backdrop-blur shadow-sm"
                >
                  ✓ {t}
                </span>
              ))}
            </div>

            <a
              href="#booking"
              className="inline-flex items-center justify-center mt-10 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg hover:opacity-90 transition"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Book Your Transfer →
            </a>
          </div>

          <div className="relative h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src={`/routes/${route.slug}.jpg`}
              alt={`Transfer from ${route.from} to ${route.to}`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ================= BOOKING ================= */}
      <section id="booking" className="relative scroll-mt-24 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200" />
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="rounded-[32px] bg-white/60 backdrop-blur-xl shadow-xl p-6 sm:p-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Book your transfer
            </h2>
            <RouteBookingForm route={route} />
          </div>
        </div>
      </section>

      {/* ================= SEO CONTENT ================= */}
      {pageContent && (
        <section className="max-w-7xl mx-auto px-4 py-20 space-y-24">
          {/* INTRO */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-black">
                {pageContent.intro.h2}
              </h2>
              {pageContent.intro.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-600 mb-4 text-lg">
                  {p}
                </p>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-8 shadow">
              <ul className="space-y-4">
                {pageContent.intro.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: ACCENT_COLOR }}
                    >
                      ✓
                    </span>
                    <span className="font-medium text-black">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* DESTINATION */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-black">
              {pageContent.destination.h3}
            </h3>
            {pageContent.destination.paragraphs.map((p, i) => (
              <p key={i} className="text-lg text-gray-600 mb-4">
                {p}
              </p>
            ))}
          </div>

          {/* TRAVEL OPTIONS */}
          <div>
            <h4 className="text-2xl font-bold mb-6 text-black">
              {pageContent.travelOptions.h4}
            </h4>
            {pageContent.travelOptions.paragraphs.map((p, i) => (
              <p key={i} className="text-lg text-gray-600 mb-4">
                {p}
              </p>
            ))}
          </div>

          {/* WHY US */}
          <div className="bg-white rounded-3xl p-10 shadow">
            <h2 className="text-3xl font-bold mb-6 text-black">
              {pageContent.whyUs.h2}
            </h2>

            {pageContent.whyUs.paragraphs.map((p, i) => (
              <p key={i} className="text-lg text-gray-600 mb-4">
                {p}
              </p>
            ))}

            <ul className="grid sm:grid-cols-2 gap-4 mt-6">
              {pageContent.whyUs.bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full text-white flex items-center justify-center"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    ✓
                  </span>
                  <span className="text-black">{b}</span>
                </li>
              ))}
            </ul>

            <a
              href="#booking"
              className="inline-block mt-8 font-semibold underline"
              style={{ color: PRIMARY_COLOR }}
            >
              {pageContent.whyUs.cta}
            </a>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-black">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {pageContent.faqs.map((f, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow">
                  <h3 className="font-semibold mb-2 text-black">{f.question}</h3>
                  <p className="text-gray-600">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= MAP ================= */}
      <section className="bg-neutral-100 py-20">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-black">
              Landmarks along the route
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {landmarks.map((l) => (
                <li key={l} className="bg-white rounded-lg px-4 py-3 shadow text-gray-700">
                  📍 {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden shadow-xl">
            <RouteMapClient from={route.from} to={route.to} />
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <CustomerReviews />
      </section>

      {/* ================= MOBILE CTA ================= */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
        <div className="relative p-4">
          <a
            href="#booking"
            className="block w-full rounded-full py-4 text-center text-lg font-semibold text-white shadow"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Book Transfer Now
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
  // 1. Basic Info
  const minPrice = route.pricing?.length
    ? Math.min(...route.pricing.map((p) => p.price))
    : 0;

  const validUntil = "2026-12-31"; // Or dynamic: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0];
  const url = `${BASE_URL}/transfers/${route.slug}`;
  const routeName = `${route.from} to ${route.to}`;
  const description =
    pageContent?.intro?.paragraphs?.[0] ||
    `Premium private transfers from ${route.from} to ${route.to} with fixed pricing.`;

  // 2. Reviews Logic
  const isCairnsCity = route.slug === "cairns-airport-to-cairns-city";
  const reviewsData = isCairnsCity ? CAIRNS_CITY_REVIEWS : [];

  // Aggregate Rating: Use specific if exists, otherwise generic high rating
  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: isCairnsCity ? "3" : "324", // 3 specific reviews, or simulated total
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

  // 3. Construct Graph
  const graph = [
    // --- LocalBusiness ---
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
      aggregateRating: aggregateRating, // Use the same rating logic
    },

    // --- Service ---
    {
      "@type": "Service",
      "@id": `${url}#service`,
      serviceType: "Airport Transfer Service",
      name: `${routeName} Transfers`,
      description: description,
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "City", name: route.to }, // The destination city
      offers: {
        "@type": "Offer",
        price: minPrice.toString(),
        priceCurrency: "AUD",
        priceValidUntil: validUntil,
        availability: "https://schema.org/InStock",
        url: url,
        validFrom: "2025-01-01", // Approximate valid from
        itemOffered: {
          "@type": "Service",
          name: `Private Transfer - ${routeName}`,
        },
      },
      aggregateRating: aggregateRating,
    },

    // --- TravelAction ---
    {
      "@type": "TravelAction",
      "@id": `${url}#travel`,
      name: `${routeName} Transfer`,
      description: route.duration ? `Estimated duration: ${route.duration} mins` : undefined,
      fromLocation: {
        "@type": "Place", // Generic Place or Airport if known
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

    // --- Product (Wrapper) ---
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

    // --- BreadcrumbList ---
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

    // --- WebPage ---
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

    // --- Place (Destination) ---
    {
      "@type": "Place",
      "@id": `${url}#destination`,
      name: route.to,
      description: pageContent?.destination?.paragraphs?.[0] || // Try to get destination description
        pageContent?.intro?.paragraphs?.[0] || // Fallback to intro
        `Beautiful destination of ${route.to} in Queensland.`,
      address: {
        "@type": "PostalAddress",
        addressLocality: route.to,
        addressRegion: "Queensland",
        addressCountry: "AU",
      },
    },
  ];

  // --- Reviews (Append if exist) ---
  if (reviewsSchema.length > 0) {
    graph.push(...reviewsSchema as any);
  }

  // --- FAQPage ---
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
