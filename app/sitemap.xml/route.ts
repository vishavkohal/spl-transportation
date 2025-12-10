// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getRoutes } from "../lib/routesStore";
import { routeToSlug } from "../lib/routeSlug";

const BASE_URL = "https://spltransportation.com.au";

export async function GET() {
  const routes = await getRoutes();

  const routeUrls = routes
    .map((route) => {
      const slug = routeToSlug(route);
      const loc = `${BASE_URL}/transfers/${slug}`;

      return `
    <url>
      <loc>${loc}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.90</priority>
      <xhtml:link
        rel="alternate"
        hreflang="en-au"
        href="${loc}"
      />
      <xhtml:link
        rel="alternate"
        hreflang="x-default"
        href="${loc}"
      />
    </url>`;
    })
    .join("");

  const homepageLoc = `${BASE_URL}/`;
  const transfersLoc = `${BASE_URL}/transfers`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
>
  <!-- Homepage -->
  <url>
    <loc>${homepageLoc}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link
      rel="alternate"
      hreflang="en-au"
      href="${homepageLoc}"
    />
    <xhtml:link
      rel="alternate"
      hreflang="x-default"
      href="${homepageLoc}"
    />
  </url>

  <!-- Transfers list page -->
  <url>
    <loc>${transfersLoc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
    <xhtml:link
      rel="alternate"
      hreflang="en-au"
      href="${transfersLoc}"
    />
    <xhtml:link
      rel="alternate"
      hreflang="x-default"
      href="${transfersLoc}"
    />
  </url>

  <!-- Dynamic transfer routes -->
  ${routeUrls}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
