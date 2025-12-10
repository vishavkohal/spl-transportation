// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getRoutes } from "../lib/routesStore";
import { routeToSlug } from "../lib/routeSlug";
import { blogPosts } from "../lib/blogPosts";

const BASE_URL = "https://www.spltransportation.com.au"; // ✅ fixed

export async function GET() {
  const routes = await getRoutes();

  // ---------- Dynamic transfer route URLs ----------
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

  // ---------- Static page URLs ----------
  const homepageLoc = `${BASE_URL}/`;
  const transfersLoc = `${BASE_URL}/transfers`;
  const contactLoc = `${BASE_URL}/contact`;
  const blogLoc = `${BASE_URL}/blog`;

  // ---------- Blog post URLs ----------
  const blogUrls = blogPosts
    .map((post) => {
      const loc = `${BASE_URL}/blog/${post.slug}`;
      const lastMod = post.updatedAt ?? post.publishedAt;

      return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.80</priority>
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

  <!-- Contact page -->
  <url>
    <loc>${contactLoc}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
    <xhtml:link
      rel="alternate"
      hreflang="en-au"
      href="${contactLoc}"
    />
    <xhtml:link
      rel="alternate"
      hreflang="x-default"
      href="${contactLoc}"
    />
  </url>

  <!-- Blog index -->
  <url>
    <loc>${blogLoc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <xhtml:link
      rel="alternate"
      hreflang="en-au"
      href="${blogLoc}"
    />
    <xhtml:link
      rel="alternate"
      hreflang="x-default"
      href="${blogLoc}"
    />
  </url>

  <!-- Dynamic transfer routes -->
  ${routeUrls}

  <!-- Blog posts -->
  ${blogUrls}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
