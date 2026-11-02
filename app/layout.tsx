import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
import { BookingProvider } from "./providers/BookingProvider";
import UtmTracker from "@/app/components/UtmTracker";
import CookieConsent from "@/app/components/CookieConsent";
import WhatsAppButton from "@/app/components/WhatsAppButton";
import { Toaster } from 'sonner';
import {
  BASE_URL,
  GA_ID,
  SITE_NAME,
  BUSINESS_PHONE_RAW,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  SERVICED_AREAS,
  SOCIAL_LINKS,
} from "@/app/lib/constants";


export const metadata: Metadata = {
  title: {
    default: "SPL Transportation - Professional Airport & City Transfers",
    template: "%s | SPL Transportation",
  },
  description:
    "Reliable private airport and regional transfers across Cairns, Port Douglas, Palm Cove, Kuranda and Far North Queensland. Book online with SPL Transportation.",
  metadataBase: new URL(BASE_URL),

  verification: {
    google: "QCFxWVp8c9Oj8cesOYAukkgIHzRc7W71jrq74Hu_6EI",
  },

  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "SPL Transportation",
    title: "SPL Transportation - Private Airport & Regional Transfers",
    description:
      "Private, professional transport services across Cairns, Port Douglas, Palm Cove & Far North Queensland.",
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: "SPL Transportation - Premium Fleet & Private Transfers",
      },
      {
        url: `${BASE_URL}/logo.png`,
        width: 600,
        height: 600,
        alt: "SPL Transportation Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "SPL Transportation",
    description:
      "Private airport & regional transfers across Cairns and Port Douglas.",
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },

  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-AU": BASE_URL,
      "x-default": BASE_URL,
    },
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#102A43",
};

const rootSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: SITE_NAME,
      description:
        "Professional private airport and regional transfers across Cairns, Port Douglas, Palm Cove and Tropical North Queensland.",
      publisher: { "@id": `${BASE_URL}/#organization` },
      inLanguage: "en-AU",
    },
    {
      "@type": ["LocalBusiness", "TaxiService"],
      "@id": `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      image: `${BASE_URL}/hero-mercedes.webp`,
      telephone: BUSINESS_PHONE_RAW,
      email: BUSINESS_EMAIL,
      priceRange: "$$",
      description:
        "Private airport and regional transfers across Cairns, Port Douglas, Palm Cove and Far North Queensland.",
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS_ADDRESS.streetAddress,
        addressLocality: BUSINESS_ADDRESS.addressLocality,
        addressRegion: BUSINESS_ADDRESS.addressRegion,
        postalCode: BUSINESS_ADDRESS.postalCode,
        addressCountry: BUSINESS_ADDRESS.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -16.9186,
        longitude: 145.7781,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      areaServed: SERVICED_AREAS.map((area) => ({
        "@type": "City",
        name: area,
      })),
      sameAs: [SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Force reload when returning from Stripe checkout (runs BEFORE React) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  if (sessionStorage.getItem('spl_stripe_redirect')) {
                    sessionStorage.removeItem('spl_stripe_redirect');
                    location.reload();
                  }
                } catch(e){}
                window.addEventListener('pageshow', function(e) {
                  if (e.persisted) location.reload();
                });
              })();
            `,
          }}
        />
        {/* âœ… Preload LCP hero image */}
        <link rel="preload" as="image" href="/hero-mercedes.webp" type="image/webp" fetchPriority="high" />
        {/* âœ… Preload brand logo */}
        <link rel="preload" as="image" href="/logo.png" />
        {/* âœ… Preconnect to external origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* âœ… Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* âœ… LocalBusiness JSON-LD */}
        {/* Global Canonical Structured Data (WebSite + LocalBusiness) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(rootSchema),
          }}
        />
      </head>

      <body className={`${inter.variable} ${playfair.variable} bg-[#F8FAFC] text-[#475569] antialiased`}>
        {/* âœ… Global App State */}
        <BookingProvider>
          <UtmTracker />
          <CookieConsent />
          <WhatsAppButton />
          <Toaster position="bottom-right" richColors />
          {children}
        </BookingProvider>
      </body>
    </html>
  );
}
