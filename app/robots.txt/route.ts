// app/robots.txt/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://spltransportation.com.au";

export async function GET() {
  const body = `
User-agent: *
Disallow: /admin
Allow: /
Disallow: /admin/api
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
