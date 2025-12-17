import { NextResponse } from "next/server";
import { getRoutes } from "../lib/routesStore";
import { routeToSlug } from "../lib/routeSlug";
import { blogPosts } from "../lib/blogPosts";

const BASE_URL = "https://www.spltransportation.com.au";
const NOW = new Date().toISOString();

export async function GET() {
  const routes = (await getRoutes()) ?? [];

  /* -------------------------------------------------
     Dynamic transfer route URLs
  -------------------------------------------------- */
  const routeUrls = routes
    .map(route => {
      const slug = routeToSlug(route);
      const loc = `${BASE_URL}/transfers/${slug}`;

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="en-au" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
  </url>`;
    })
    .join("");

  /* -------------------------------------------------
     Static page URLs
  -------------------------------------------------- */
  const staticPages = [
    { loc: `${BASE_URL}/`, priority: "1.0", freq: "daily" },
    { loc: `${BASE_URL}/transfers`, priority: "0.95", freq: "weekly" },
    { loc: `${BASE_URL}/about`, priority: "0.80", freq: "monthly" },
    { loc: `${BASE_URL}/contact`, priority: "0.80", freq: "monthly" },
    { loc: `${BASE_URL}/terms`, priority: "0.70", freq: "yearly" },
    { loc: `${BASE_URL}/blog`, priority: "0.85", freq: "weekly" },
  ];

  const staticUrls = staticPages
    .map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en-au" href="${p.loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.loc}" />
  </url>
`)
    .join("");

  /* -------------------------------------------------
     Blog post URLs
  -------------------------------------------------- */
  const blogUrls = (blogPosts ?? [])
    .map(post => {
      const loc = `${BASE_URL}/blog/${post.slug}`;
      const lastMod = post.updatedAt ?? post.publishedAt ?? NOW;

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
    <xhtml:link rel="alternate" hreflang="en-au" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
  </url>`;
    })
    .join("");

  /* -------------------------------------------------
     Final sitemap
  -------------------------------------------------- */
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
>
${staticUrls}
${routeUrls}
${blogUrls}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
