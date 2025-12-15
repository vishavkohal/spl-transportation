import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const BASE_URL = "https://spltransportation.com.au";
const GA_ID = "G-0F1THLNR5M";

export const metadata: Metadata = {
  title: {
    default: "SPL Transportation - Professional Airport & City Transfers",
    template: "%s | SPL Transportation",
  },
  description:
    "Reliable private airport and regional transfers across Cairns, Port Douglas, Palm Cove, Kuranda and Far North Queensland. Book online with SPL Transportation.",
  metadataBase: new URL(BASE_URL),

  // ✅ Google Search Console verification (BEST PRACTICE)
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
        url: "/logo.png",
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
    images: ["/logo.png"],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Preload brand logo */}
        <link rel="preload" as="image" href="/logo.png" />

        {/* ✅ Google Analytics (safe for TS + App Router) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              anonymize_ip: true,
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* ✅ LocalBusiness JSON-LD */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "SPL Transportation",
              url: BASE_URL,
              image: `${BASE_URL}/logo.png`,
              description:
                "Private airport and regional transfers across Cairns, Port Douglas and Far North Queensland.",
              telephone: "+61 450 565 078",
              address: {
                "@type": "PostalAddress",
                addressCountry: "AU",
                addressRegion: "QLD",
              },
              areaServed: [
                "Cairns",
                "Port Douglas",
                "Palm Cove",
                "Kuranda",
                "Northern Beaches",
                "Atherton Tablelands",
              ],
              priceRange: "$$",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
