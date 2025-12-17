// app/transfers/[slug]/page.tsx

import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Types & Stores
import type { Route } from "../../../types";
import { getRoutes } from "../../../lib/routesStore";
import { routeToSlug } from "../../../lib/routeSlug";
import { getLandmarks } from "../../../lib/routeLandmarks";



// Components
import { ScrollFadeIn } from "../../../components/ScrollFadeIn";
import RouteBookingForm from "../../../components/RouteBookingForm";
import Footer from "../../../components/FooterSlug"; 
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

/* ----------------------------------------
    Static Params
---------------------------------------- */

export async function generateStaticParams() {
  const routes = await getAllRoutes();
  return routes.map((r) => ({ slug: r.slug }));
}

/* ----------------------------------------
    Metadata
---------------------------------------- */

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

  const minPrice =
    route.pricing?.length
      ? Math.min(...route.pricing.map((p) => p.price))
      : null;

  const fromPrice = minPrice ? `From $${minPrice}` : null;

  const title = `${route.from} → ${route.to} | ${
    fromPrice ?? "Private transfer"
  } | SPL Transportation`;

  const description =
    route.description ??
    `Book private transfers from ${route.from} to ${route.to}. Fixed pricing, local drivers and comfortable vehicles.`;

  const url = `${BASE_URL}/transfers/${route.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
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
const landmarks = getLandmarks(route);

  const minPrice =
    route.pricing?.length
      ? Math.min(...route.pricing.map((p) => p.price))
      : null;

  const fromPrice = minPrice ? `${minPrice}` : null;
  const routeName = route.label ?? `${route.from} to ${route.to}`;

  /* FAQ Data */
  const faqs = [
    {
      question: `How long does the transfer from ${route.from} to ${route.to} take?`,
      answer: route.duration
        ? `Typically around ${route.duration}, depending on traffic and weather.`
        : "Travel time depends on traffic and conditions.",
    },
    {
      question: "Is this a private transfer?",
      answer: "Yes. You will have a private vehicle exclusively for your group.",
    },
    {
      question: "Are prices per person?",
      answer: "No. Prices are per vehicle, not per passenger.",
    },
    {
      question: "What if my flight is delayed?",
      answer: "We monitor flights for airport pickups and adjust pickup time when possible.",
    },
  ];

 return (
  <main className="bg-gradient-to-b from-slate-50 via-white to-slate-50 text-gray-900">
    <div className="max-w-7xl mx-auto px-4 py-10 lg:py-16">

      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm text-gray-500 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-gray-800">Home</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{routeName}</span>
      </nav>

      {/* ================= HERO ================= */}
      <section className="grid gap-10 lg:grid-cols-[1.5fr,1fr] items-start">

        {/* LEFT */}
        <div className="space-y-8">
          <header className="space-y-5">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: `${ACCENT_COLOR}10`,
                color: ACCENT_COLOR,
              }}
            >
              Private transfer
            </span>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              {routeName}
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              {route.description ??
                `Reliable door-to-door transfers between ${route.from} and ${route.to}.`}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {["Fixed pricing", "Private vehicle", "Local drivers"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-gray-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </header>

          {/* Image */}
          <div className="relative h-150 sm:h-116 rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={`/routes/${route.slug}.jpg`}
              alt={`${routeName} transfer`}
              fill
              priority
              className="object-cover"
            />

 {/* 1. Gradient from Top: Essential for white text at the top of an image */}
<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />

<div className="absolute inset-0 p-5 md:p-8">
  <div className="flex flex-row justify-between items-start gap-4">
    
    {/* Left Side: Destination & Service Tag */}
    <div className="flex flex-col items-start gap-2">
      <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md text-white border border-white/20 rounded">
        Premium Private Transfers
      </span>
      
      <h2 className="text-xl md:text-xl font-bold text-white leading-tight drop-shadow-sm">
        {route.to}
      </h2>
    </div>

    {/* Right Side: Pricing (Clean & Compact) */}
    {fromPrice && (
      <div className="flex flex-col items-end text-white">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          Starting from
        </span>
        <div className="flex items-baseline gap-1 mt-5">
          <span className="text-xl font-black tabular-nums">$ {fromPrice}</span>
          <span className="text-xs font-light opacity-80 whitespace-nowrap">/ vehicle</span>
        </div>
      </div>
    )}
    
  </div>
</div>
          </div>
        </div>

        {/* RIGHT – BOOKING */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl p-6 lg:p-8">
            <h2
              className="text-xl font-bold mb-5"
              style={{ color: PRIMARY_COLOR }}
            >
              Book your transfer
            </h2>

            <RouteBookingForm route={route} />

            <p className="mt-6 text-xs text-center text-gray-500">
              Need a custom quote?{" "}
              <Link
                href="/contact"
                className="font-medium underline hover:text-gray-800"
              >
                Contact our team
              </Link>
            </p>
          </div>
        </aside>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="mt-24 space-y-20">
{/* ================= ROUTE INFORMATION ================= */}
<ScrollFadeIn>
  <section className="grid gap-12 lg:grid-cols-2 items-start">
    
    {/* LEFT – TEXT */}
    <div className="space-y-6">
      <h2
        className="text-3xl md:text-4xl font-bold"
        style={{ color: PRIMARY_COLOR }}
      >
        The Journey: {route.from} to {route.to}
      </h2>

      <p className="text-gray-600 leading-relaxed text-lg">
        The transfer from <strong>{route.from}</strong> to{" "}
        <strong>{route.to}</strong> takes you through some of the most scenic
        parts of Tropical North Queensland. Our professional drivers ensure a
        smooth, comfortable and stress-free journey.
      </p>

      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <h3
          className="text-xl font-semibold mb-4"
          style={{ color: PRIMARY_COLOR }}
        >
          Route information
        </h3>

        <ul className="space-y-3 text-gray-700">
          <li className="flex justify-between">
            <span>Estimated travel time</span>
            <span className="font-medium">
              {route.duration ?? "Approx. 60–70 minutes"}
            </span>
          </li>

          <li className="flex justify-between">
            <span>Transfer type</span>
            <span className="font-medium">Private vehicle</span>
          </li>

          <li className="flex justify-between">
            <span>Pricing</span>
            <span className="font-medium">Per vehicle (not per person)</span>
          </li>
        </ul>
      </div>

      {/* LANDMARKS */}
      <div>
        <h4 className="font-semibold mb-3 text-gray-800">
          Highlights along the route
        </h4>

        <ul className="grid sm:grid-cols-2 gap-3 text-gray-600">
          {landmarks.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ACCENT_COLOR }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* RIGHT – MAP (Google Embed or Image fallback) */}
    <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
    <RouteMapClient from={route.from} to={route.to} />
    </div>
  </section>
</ScrollFadeIn>

       {/* WHY US - Dark Theme */}
<ScrollFadeIn>
  <section 
    className="rounded-[1.5rem] p-8 md:p-16 text-white shadow-2xl overflow-hidden relative"
    style={{ backgroundColor: PRIMARY_COLOR }}
  >
    {/* Subtle Background Decorative Element */}
    <div 
      className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
      style={{ backgroundColor: ACCENT_COLOR }}
    />

    <div className="relative z-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center lg:text-left">
        Why choose SPL Transportation
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {[
          {
            title: "Reliable & Professional",
            text: "Door-to-door private transfers with experienced local drivers focused on safety, punctuality and comfort.",
          },
          {
            title: "Regional Experts",
            text: "Trusted by travellers across Cairns, Port Douglas, Palm Cove and Tropical North Queensland.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl p-8 transition-all duration-300 border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <div 
              className="w-12 h-1 mb-6 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
            <h3 className="font-bold text-xl mb-4 group-hover:text-white transition-colors">
              {item.title}
            </h3>
            <p className="text-slate-300 leading-relaxed text-base">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
</ScrollFadeIn>
        {/* FAQ */}
        
      {/* FAQ - Refined White Theme */}
<ScrollFadeIn>
  <section className="max-w-4xl mx-auto">
    <div className="text-center mb-12">
      <h2
        className="text-3xl md:text-4xl font-bold mb-4"
        style={{ color: PRIMARY_COLOR }}
      >
        Frequently asked questions
      </h2>
      <p className="text-gray-600">
        Everything you need to know about your journey with SPL Transportation.
      </p>
    </div>

    <div className="space-y-4">
      {[
        ...faqs, // Keeps your existing 4 FAQs
        {
          question: "Do you provide child seats?",
          answer: "Yes, we can provide baby seats and booster seats upon request. Please specify the age of the children when booking to ensure the correct seat is fitted.",
        },
        {
          question: "Where do I meet my driver at the airport?",
          answer: "Your driver will be waiting in the arrivals hall holding a sign with your name on it. Detailed meeting instructions will be sent with your booking confirmation.",
        },
        {
          question: "Is there an extra charge for luggage?",
          answer: "Standard luggage (one suitcase and one carry-on per person) is included. If you have oversized items like surfboards or golf clubs, please let us know in advance.",
        },
      ].map((faq, i) => (
        <details
          key={i}
          className="group rounded-2xl bg-white border border-gray-200 p-2 open:shadow-md transition-all duration-300"
        >
          <summary className="cursor-pointer list-none flex justify-between items-center p-4 font-semibold text-gray-800">
            <span className="pr-6">{faq.question}</span>
            <span 
              className="text-xl transition-transform duration-300 group-open:rotate-45"
              style={{ color: ACCENT_COLOR }}
            >
              +
            </span>
          </summary>
          <div className="px-4 pb-4 pt-1">
            <div className="h-px w-full bg-gray-100 mb-4" />
            <p className="text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  </section>
</ScrollFadeIn>
</section>
    </div>
    <section><CustomerReviews /></section>
     <section> {/* Spacer before footer */}
      </section>
  </main>
);
}