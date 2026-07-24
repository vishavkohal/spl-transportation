// app/robots.txt/route.ts
import { NextResponse } from "next/server";
import { BASE_URL } from "../lib/constants";

export async function GET() {
  const body = `
User-agent: *
Disallow: /admin
Disallow: /cms
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`.trim();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
