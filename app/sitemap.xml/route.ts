import { NextResponse } from "next/server";
import { getRoutes } from "../lib/routesStore";
import { routeToSlug } from "../lib/routeSlug";
import { blogPosts } from "../lib/blogPosts";

const BASE_URL = "https://www.spltransportation.com.au";
const NOW = new Date().toISOString();

export async function GET() {
  const routes = (await getRoutes()) ?? [];

  const staticPages = [
    { loc: `${BASE_URL}/`, priority: "1.0", freq: "daily" },
    { loc: `${BASE_URL}/transfers`, priority: "0.95", freq: "weekly" },
    { loc: `${BASE_URL}/about`, priority: "0.80", freq: "monthly" },
    { loc: `${BASE_URL}/contact`, priority: "0.80", freq: "monthly" },
    { loc: `${BASE_URL}/terms`, priority: "0.70", freq: "yearly" },
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

    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
  }).join("");

  const blogUrls = (blogPosts ?? []).map(post => {
    const loc = `${BASE_URL}/blog/${post.slug}`;
    const lastMod = post.updatedAt ?? post.publishedAt ?? NOW;

    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`;
  }).join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
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
