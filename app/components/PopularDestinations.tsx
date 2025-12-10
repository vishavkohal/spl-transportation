"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "../types";          // adjust path if needed
import { routeToSlug } from "../lib/routeSlug"; // uses the helper above

type DestinationCard = {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  slug: string;
};

const PRIMARY_COLOR = "#18234B";
const ACCENT_COLOR = "#A61924";

// Map “marketing cards” to real DB routes via from/to
const popularRouteConfigs = [
  {
    key: "cairns-airport-cairns-city",
    from: "Cairns Airport",
    to: "Cairns City",
    label: "Cairns Airport Shuttle",
    subtitle:
      "Fast, comfortable transfers connecting the airport with hotels and the city.",
  },
  {
    key: "cairns-airport-port-douglas",
    from: "Cairns Airport",
    to: "Port Douglas",
    label: "Port Douglas Getaway",
    subtitle:
      "Seamless travel to the gateway of the world-famous Daintree Rainforest.",
  },
  {
    key: "cairns-airport-palm-cove",
    from: "Cairns Airport",
    to: "Palm Cove",
    label: "Palm Cove Coastal Transfer",
    subtitle:
      "A smooth ride to one of Tropical North Queensland’s most scenic beach towns.",
  },
  {
    key: "cairns-airport-palm-cove-return",
    from: "Palm Cove",
    to: "Cairns Airport",
    label: "Palm Cove to Airport",
    subtitle: "Stress-free return transfer back to Cairns Airport.",
  },
  {
    key: "cairns-city-tablelands",
    from: "Cairns City",
    to: "Tablelands",
    label: "Atherton Tablelands Tour",
    subtitle:
      "Journey through lush highlands, crater lakes, and stunning waterfalls.",
  },
  {
    key: "cairns-city-kuranda",
    from: "Cairns City",
    to: "Kuranda",
    label: "Kuranda Experience",
    subtitle:
      "Perfect for exploring the Kuranda markets, Skyrail and scenic mountain railway.",
  },
];

function getFromPrice(route: Route): string {
  if (!route.pricing || !route.pricing.length) return "Contact for price";
  const min = Math.min(...route.pricing.map((p) => p.price));
  return `From $${min}`;
}

export default function PopularDestinations() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await fetch("/api/routes", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load routes (${res.status})`);
        const data: Route[] = await res.json();
        setRoutes(data);
      } catch (err) {
        console.error("Error loading routes for PopularDestinations:", err);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const cards: DestinationCard[] = useMemo(() => {
    if (!routes.length) return [];

    return popularRouteConfigs
      .map((cfg) => {
        const match = routes.find(
          (r) => r.from.trim() === cfg.from && r.to.trim() === cfg.to
        );

        if (!match) return null;

        return {
          id: match.id,
          title: cfg.label,
          subtitle: cfg.subtitle,
          price: getFromPrice(match),
          slug: routeToSlug(match), // ✅ same as in [slug]/page.tsx
        };
      })
      .filter(Boolean) as DestinationCard[];
  }, [routes]);

  if (loading && !cards.length) {
    return (
      <section className="py-14 px-6 bg-gray-50">
        <p className="text-center text-gray-500 text-sm">
          Loading popular routes…
        </p>
      </section>
    );
  }

  if (!cards.length) return null;

  return (
    <section className="py-14 px-6 bg-gray-50">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-animate {
          opacity: 0;
          transform: translateY(12px);
          animation-name: fadeUp;
          animation-duration: 450ms;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.2, 0.9, 0.2, 1);
          will-change: transform, opacity;
        }
      `}</style>

      <p
        className="text-[11px] text-center sm:text-[15px] md:text-xm font-semibold tracking-[0.24em] uppercase mb-1.5"
        style={{ color: ACCENT_COLOR }}
      >
        Most Popular
      </p>

      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-extrabold"
          style={{ color: PRIMARY_COLOR }}
        >
          Popular Trips & Routes
          <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
        </h2>

        <p className="mt-3 max-w-2xl mx-auto text-gray-600 text-sm sm:text-base">
          Discover our most frequently booked routes across Tropical North
          Queensland — from airport transfers to day-trip destinations.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {cards.map((item, idx) => (
          <article key={item.id} className="h-full">
            <div
              className={`
                card-animate
                bg-white border border-gray-200 rounded-2xl p-6
                text-center flex flex-col items-center h-full
                transition-transform duration-200
                hover:-translate-y-2 hover:shadow-xl active:translate-y-0
              `}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>

              <p className="mt-3 text-sm text-gray-500 max-w-xs">
                {item.subtitle}
              </p>

              <p
                className="mt-6 text-3xl font-extrabold pb-4"
                style={{ color: ACCENT_COLOR }}
              >
                {item.price}
              </p>

              <Link
                href={`/transfers/${item.slug}`}
                className="mt-auto px-5 py-2.5 rounded-lg font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 inline-block"
                style={{ backgroundColor: PRIMARY_COLOR }}
                aria-label={`Book ${item.title}`}
              >
                Book Now
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
