import { NextResponse } from "next/server";
import { getRoutes } from "../lib/routesStore";
import { routeToSlug } from "../lib/routeSlug";
import { blogPosts } from "../lib/blogPosts";
import { BASE_URL } from "../lib/constants";

const NOW = new Date().toISOString();

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export async function GET() {
  const routes = (await getRoutes()) ?? [];

  const staticPages = [
    { loc: `${BASE_URL}/`, priority: "1.0", freq: "daily" },
    { loc: `${BASE_URL}/transfers`, priority: "0.95", freq: "weekly" },
    { loc: `${BASE_URL}/services`, priority: "0.90", freq: "weekly" },
    { loc: `${BASE_URL}/book`, priority: "0.95", freq: "daily" },
    { loc: `${BASE_URL}/about`, priority: "0.80", freq: "monthly" },
    { loc: `${BASE_URL}/contact`, priority: "0.80", freq: "monthly" },
    { loc: `${BASE_URL}/terms`, priority: "0.70", freq: "yearly" },
    { loc: `${BASE_URL}/privacy-policy`, priority: "0.70", freq: "yearly" },
    { loc: `${BASE_URL}/blog`, priority: "0.85", freq: "weekly" }
  ];

  const staticUrls = staticPages.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>
`).join("");

  const routeUrls = routes.map(route => {
    const slug = routeToSlug(route);
    const loc = `${BASE_URL}/transfers/${slug}`;
    const routeTitle = escapeXml(`${route.from} to ${route.to} Private Transfer`);
    const caption = escapeXml(`Door-to-door private transfers from ${route.from} to ${route.to}`);

    // High-value routes receive elevated priority
    const isTopCorridor = 
      slug.includes("cairns-airport-to-port-douglas") ||
      slug.includes("cairns-airport-to-palm-cove") ||
      slug.includes("cairns-airport-to-cairns-city") ||
      slug.includes("cairns-city-to-kuranda");

    const priority = isTopCorridor ? "0.90" : "0.85";

    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${BASE_URL}/routes/${slug}.jpg</image:loc>
      <image:title>${routeTitle}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`;
  }).join("");

  const blogUrls = (blogPosts ?? []).map(post => {
    const loc = `${BASE_URL}/blog/${post.slug}`;
    const lastMod = post.updatedAt ?? post.publishedAt ?? NOW;
    const postTitle = escapeXml(post.title);

    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
    <image:image>
      <image:loc>${BASE_URL}/hero-mercedes.webp</image:loc>
      <image:title>${postTitle}</image:title>
    </image:image>
  </url>`;
  }).join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${routeUrls}
${blogUrls}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
