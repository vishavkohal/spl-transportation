import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://spltransportation.com.au";

export const metadata: Metadata = {
  title: {
    default: "SPL Transportation - Professional Airport & City Transfers",
    template: "%s | SPL Transportation",
  },
  description:
    "Reliable private airport and regional transfers across Cairns, Port Douglas, Palm Cove, Kuranda and Far North Queensland. Book online with SPL Transportation.",
  metadataBase: new URL(BASE_URL),

  // Google Verification (Paste your token)
  verification: {
    google: "PASTE_YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },

  // OpenGraph defaults
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

  // Hreflang (site-wide)
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-AU": BASE_URL,
      "x-default": BASE_URL,
    },
  },

  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload logo for faster branding */}
        <link rel="preload" as="image" href="/logo.png" />

        {/* LocalBusiness JSON-LD */}
        <script
          type="application/ld+json"
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
