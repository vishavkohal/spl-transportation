// app/transfers/[slug]/page.tsx
import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Route } from "../../types";
import { getRoutes } from "../../lib/routesStore";
import { routeToSlug } from "../../lib/routeSlug";
import { ScrollFadeIn } from "../../components/ScrollFadeIn"; // 👈 your existing animation component

const BASE_URL = "https://spltransportation.com.au";
export const revalidate = 300;

type RouteWithSlug = Route & { slug: string };

async function getAllRoutes(): Promise<RouteWithSlug[]> {
  const routes = await getRoutes();
  const withSlug = routes.map((r) => ({
    ...r,
    slug: routeToSlug(r),
  }));
  return withSlug;
}

// ---------- SSG: generateStaticParams ----------

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const routes = await getAllRoutes();
  return routes.map((r) => ({ slug: r.slug }));
}

// ---------- Metadata per route ----------

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
      title: `Route not found | SPL Transportation`,
      description: "The requested transfer route could not be found.",
    };
  }

  const minPrice =
    route.pricing && route.pricing.length
      ? Math.min(...route.pricing.map((p) => p.price))
      : null;
  const fromPrice = minPrice !== null ? `From $${minPrice}` : null;

  const title = `${route.from} → ${route.to} | ${
    fromPrice ?? "Private transfer"
  } | SPL Transportation`;

  const description =
    route.description ??
    `Book reliable transfers from ${route.from} to ${route.to} with SPL Transportation. ${
      fromPrice ?? ""
    } Comfortable vehicles and experienced local drivers.`;

  const routeUrl = `${BASE_URL}/transfers/${route.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: routeUrl,
      languages: {
        "en-AU": routeUrl,
        "x-default": routeUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: routeUrl,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og/routes-${route.slug}.jpg`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// ---------- Page component (server) ----------

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const routes = await getAllRoutes();
  const route = routes.find((r) => r.slug === slug);

  if (!route) {
    notFound();
  }

  const PRIMARY_COLOR = "#18234B";
  const ACCENT_COLOR = "#A61924";

  const minPrice =
    route.pricing && route.pricing.length
      ? Math.min(...route.pricing.map((p) => p.price))
      : null;
  const fromPrice = minPrice !== null ? `From $${minPrice}` : null;

  // Small helper for FAQ answers
  const friendlyDuration = route.duration
    ? route.duration
    : "Travel times can vary with traffic and weather.";

  const faqs = [
    {
      question: `How long does the transfer from ${route.from} to ${route.to} take?`,
      answer: route.duration
        ? `Typically around ${route.duration} in normal traffic. We always recommend allowing a little extra time during peak periods or bad weather.`
        : "Travel times can vary with traffic and weather. Our team will advise recommended pick-up times based on your flight or schedule.",
    },
    {
      question: "What is included in my transfer?",
      answer:
        "Door-to-door service, a private vehicle for your group, a professional local driver, help with luggage, and standard luggage allowance are included. Child seats can be arranged on request (subject to availability).",
    },
    {
      question: "Can you meet me inside the airport?",
      answer:
        "Yes. For airport pickups, your driver will wait at the designated meeting point with a sign, where possible. We monitor flights for delays and adjust the pick-up time if needed.",
    },
    {
      question: "What if my plans change or my flight is delayed?",
      answer:
        "Please let us know as soon as possible if your plans change. We understand travel can be unpredictable and always do our best to accommodate changes and delays.",
    },
    {
      question: "How do I pay for the transfer?",
      answer:
        "You can secure your booking online via our secure checkout. If you prefer, contact our team to discuss alternative payment options.",
    },
  ];

  const routeUrl = `${BASE_URL}/transfers/${route.slug}`;
  const routeName = route.label ?? `${route.from} to ${route.to}`;

  // JSON-LD including FAQ schema + Breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}#org`,
        name: "SPL Transportation",
        url: BASE_URL,
      },
      {
        "@type": "TaxiService",
        "@id": `${BASE_URL}#service`,
        name: "SPL Transportation",
        description: route.description,
        url: routeUrl,
        areaServed: [
          { "@type": "City", name: "Cairns" },
          { "@type": "City", name: "Port Douglas" },
          { "@type": "City", name: "Palm Cove" },
          { "@type": "City", name: "Kuranda" },
          { "@type": "City", name: "Atherton Tablelands" },
        ],
        serviceType: "Airport transfer",
        priceRange: fromPrice?.replace("From ", "") ?? "",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: routeName,
          description: route.description,
        },
        price: fromPrice ? fromPrice.replace(/[^\d.]/g, "") : "",
        priceCurrency: "AUD",
        availability: "https://schema.org/InStock",
        url: routeUrl,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
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
            item: routeUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-gray-800">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">
          {route.label ?? `${route.from} → ${route.to}`}
        </span>
      </nav>

      {/* Header + Hero */}
      <section className="space-y-6 lg:space-y-8">
        <ScrollFadeIn>
          <header className="max-w-3xl">
            <p
              className="text-xs uppercase tracking-[0.24em] font-semibold"
              style={{ color: ACCENT_COLOR }}
            >
              Route details
            </p>
            <h1
              className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              {route.label ?? `${route.from} → ${route.to}`}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600">
              {route.description ??
                `Relax with a private transfer between ${route.from} and ${route.to}. Local, professional drivers, modern vehicles and door-to-door service.`}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                Private transfer
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                Fixed upfront pricing
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                Local Queensland drivers
              </span>
            </div>
          </header>
          <div className="pt-10 text-left"> <Link
                    href="/"
                    className="inline-flex w-50 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    Book Now
                  </Link></div>
        </ScrollFadeIn>

        <ScrollFadeIn>
          {/* Hero image */}
          <div className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
            <Image
              src={`/images/routes/${route.slug}.jpg`}
              alt={`${
                route.label ?? `${route.from} to ${route.to}`
              } scenic transfer`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width:1024px) 90vw, 60vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
            {fromPrice && (
              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 backdrop-blur px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-800 shadow">
                {fromPrice} per vehicle
              </div>
            )}
          </div>
        </ScrollFadeIn>
      </section>

      {/* Main layout: details + booking card */}
      <section className="mt-10 lg:mt-12 grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,2fr),minmax(320px,1fr)]">
        {/* LEFT COLUMN */}
        <div className="space-y-10 lg:space-y-12">
          {/* Quick facts */}
          <ScrollFadeIn>
            <section aria-labelledby="quick-facts-heading">
              <h2
                id="quick-facts-heading"
                className="text-lg sm:text-xl font-semibold mb-4"
                style={{ color: PRIMARY_COLOR }}
              >
                At a glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Distance
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-800">
                    {route.distance || "Varies by route"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Typical duration
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-800">
                    {route.duration || "Depends on traffic"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {friendlyDuration}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pricing
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-800">
                    {fromPrice ?? "Contact us for a quote"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Per vehicle, not per person.
                  </p>
                </div>
              </div>
            </section>
          </ScrollFadeIn>

          {/* Why this route / highlights */}
          <ScrollFadeIn>
            <section aria-labelledby="highlights-heading">
              <h2
                id="highlights-heading"
                className="text-lg sm:text-xl font-semibold mb-3"
                style={{ color: PRIMARY_COLOR }}
              >
                Why travellers book this route with us
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-800">
                    Door-to-door convenience
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Pick-up and drop-off at your chosen address – hotel, home,
                    holiday rental or airport – with no waiting in taxi queues.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-800">
                    Local, professional drivers
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Experienced Queensland drivers who know the route, local
                    conditions and the best timings for your journey.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-800">
                    Comfort &amp; safety first
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Comfortable, air-conditioned vehicles with space for your
                    luggage. Child seats available on request (subject to
                    availability).
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-800">
                    Transparent pricing
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Fixed upfront pricing with no surge pricing or surprise
                    charges. The price you see is the price you pay.
                  </p>
                </div>
              </div>
            </section>
          </ScrollFadeIn>

          {/* Vehicle options & pricing */}
          {route.pricing?.length > 0 && (
            <ScrollFadeIn>
              <section aria-labelledby="pricing-heading">
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <h2
                    id="pricing-heading"
                    className="text-lg sm:text-xl font-semibold"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    Vehicle options & pricing
                  </h2>
                  {fromPrice && (
                    <p className="text-xs sm:text-sm text-gray-500">
                      {fromPrice} per vehicle • Private, not shared.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {route.pricing.map((tier, idx) => {
                    const isBestValue = idx === 0 && route.pricing!.length > 1;
                    return (
                      <div
                        key={idx}
                        className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm ${
                          isBestValue
                            ? "border-[rgba(166,25,36,0.4)] ring-1 ring-[rgba(166,25,36,0.2)]"
                            : "border-gray-200"
                        }`}
                      >
                        {isBestValue && (
                          <span
                            className="absolute -top-2 right-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
                            style={{ backgroundColor: ACCENT_COLOR }}
                          >
                            Popular
                          </span>
                        )}

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Up to {tier.passengers} passengers
                          </p>
                          {tier.vehicleType && (
                            <p className="mt-1 text-xs text-gray-500">
                              {tier.vehicleType}
                            </p>
                          )}
                        </div>

                        <div className="mt-4">
                          <p
                            className="text-2xl font-bold leading-tight"
                            style={{ color: ACCENT_COLOR }}
                          >
                            ${tier.price}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Total per vehicle, one way.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </ScrollFadeIn>
          )}

          {/* Good to know */}
          <ScrollFadeIn>
            <section aria-labelledby="good-to-know-heading">
              <h2
                id="good-to-know-heading"
                className="text-lg sm:text-xl font-semibold mb-3"
                style={{ color: PRIMARY_COLOR }}
              >
                Good to know before you travel
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2 text-sm text-gray-600">
                <p>• Flight monitoring for airport pickups where possible.</p>
                <p>• Drivers provide assistance with standard luggage.</p>
                <p>• Child seats can be requested in advance (subject to availability).</p>
                <p>• Please let us know about oversized items (surfboards, bikes, etc.).</p>
                <p>
                  • If your plans change, contact our team as soon as possible so
                  we can adjust your booking.
                </p>
              </div>
            </section>
          </ScrollFadeIn>

          {/* Give back / Impact section */}
          <ScrollFadeIn>
            <section id="give-back" aria-labelledby="give-back-heading">
              <h2
                id="give-back-heading"
                className="text-lg sm:text-xl font-semibold mb-3"
                style={{ color: PRIMARY_COLOR }}
              >
                Travel that gives back
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-5 shadow-sm">
                <p className="text-sm text-gray-700">
                  By choosing SPL Transportation, you are
                  supporting local, family-run operators and drivers who live and
                  work in the communities you visit.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-600 list-disc list-inside">
                  <li>We prioritise local drivers and locally owned businesses.</li>
                  <li>
                    We focus on safe, well-maintained vehicles and fair working conditions.
                  </li>
                  <li>
                    You can choose to leave a tip or special note of thanks for
                    your driver when you book or after your journey.
                  </li>
                </ul>
                <p className="mt-3 text-xs text-gray-500">
                  Have a community initiative or charity you&apos;d like us to
                  know about?{" "}
                  <Link
                    href="/contact"
                    className="font-medium underline underline-offset-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Get in touch with our team.
                  </Link>
                </p>
              </div>
            </section>
          </ScrollFadeIn>

          {/* FAQ section */}
          <ScrollFadeIn>
            <section id="faqs" aria-labelledby="faq-heading">
              <h2
                id="faq-heading"
                className="text-lg sm:text-xl font-semibold mb-3"
                style={{ color: PRIMARY_COLOR }}
              >
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <span className="text-sm font-medium text-gray-800">
                        {faq.question}
                      </span>
                      <span className="text-xs text-gray-400 group-open:hidden">
                        +
                      </span>
                      <span className="hidden text-xs text-gray-400 group-open:inline">
                        −
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </ScrollFadeIn>
        </div>

        {/* RIGHT COLUMN – Sticky booking card */}
        <aside className="lg:pt-2">
          <ScrollFadeIn>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Book this route
                </p>
                <p
                  className="mt-1 text-lg font-semibold leading-snug"
                  style={{ color: PRIMARY_COLOR }}
                >
                  {route.label ?? `${route.from} → ${route.to}`}
                </p>

                {fromPrice && (
                  <div className="mt-3">
                    <p
                      className="text-3xl font-bold leading-tight"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {fromPrice}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Per vehicle, one-way. Final price depends on vehicle type and
                      any extras selected.
                    </p>
                  </div>
                )}

                <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
                  <li>• Private, door-to-door service</li>
                  <li>• Licensed, insured local drivers</li>
                  <li>• Flight monitoring for airport pickups</li>
                  <li>• Transparent pricing, no surge charges</li>
                </ul>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    Start online booking
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Prefer to talk? Contact our team
                  </Link>
                </div>

                <p className="mt-3 text-[11px] text-gray-500">
                  Have special requirements, multiple stops or a return journey?{" "}
                  <Link
                    href="/"
                    className="font-medium underline underline-offset-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Request a tailored quote.
                  </Link>
                </p>
              </div>
            </div>
          </ScrollFadeIn>
        </aside>
      </section>
    </main>
  );
}
