// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  ArrowRight,
  BookOpen,
  MapPin,
  Compass,
  Shield,
  FileText,
} from "lucide-react";

import { BASE_URL } from "@/app/lib/constants";

export const metadata: Metadata = {
  title: "Cairns & Tropical North Queensland Travel Blog | SPL Transportation",
  description:
    "Discover the best places to visit in Cairns, Port Douglas, Palm Cove, Kuranda, Mission Beach and more. Travel tips, guides and private transfer advice for Tropical North Queensland.",
  keywords: [
    "Cairns travel blog",
    "Port Douglas travel guides",
    "Tropical North Queensland transfer tips",
    "Cairns airport transfer advice",
    "Palm Cove travel guide",
    "SPL Transportation blog",
  ],
  alternates: {
    canonical: `${BASE_URL}/blog`,
    languages: {
      "en-AU": `${BASE_URL}/blog`,
      "x-default": `${BASE_URL}/blog`,
    },
  },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/blog`,
    title: "Cairns & Tropical Queensland Travel Blog | SPL Transportation",
    description:
      "Local guides to attractions, hidden gems, and airport transfer tips across Cairns, Port Douglas, Palm Cove & Kuranda.",
    siteName: "SPL Transportation",
    locale: "en_AU",
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: "Cairns & Tropical Queensland Travel Blog — SPL Transportation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cairns & Tropical Queensland Travel Blog | SPL Transportation",
    description:
      "Travel guides and airport transfer tips across Cairns, Port Douglas & Palm Cove.",
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    include: {
      featuredImage: {
        select: {
          id: true,
          altText: true,
        },
      },
    },
  });

  const schemaGraph = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/blog#webpage`,
      url: `${BASE_URL}/blog`,
      name: "Cairns & Tropical North Queensland Travel Blog",
      description:
        "Local travel guides, attraction overviews, and private transfer advice across Cairns and Tropical North Queensland.",
      isPartOf: {
        "@type": "WebSite",
        name: "SPL Transportation",
        url: BASE_URL,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Travel Guides & Articles",
      itemListElement: posts.map((post, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* ================= HERO HEADER (HOMEPAGE STYLED) ================= */}
      <section className="relative bg-[#102A43] text-white pt-16 pb-20 md:pt-20 md:pb-24 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-mercedes.webp"
            alt="Cairns & Tropical North Queensland Travel Guides"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/68 via-[#102A43]/72 to-[#102A43] z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>TRAVEL GUIDES &amp; INSIGHTS</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight mb-4">
              Cairns &amp; Tropical<br />
              <span className="text-[#2DD4BF]">Queensland Travel Blog</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-200 font-light mb-6 max-w-2xl leading-relaxed drop-shadow">
              Browse our local guides to the best attractions, hidden gems, and airport
              transfer tips across Cairns, Port Douglas, Palm Cove, Kuranda &amp; the Daintree.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-white">
              <div className="flex items-center gap-2 drop-shadow bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <Compass className="w-4 h-4 text-[#2DD4BF]" />
                <span>Local Expert Advice</span>
              </div>
              <div className="flex items-center gap-2 drop-shadow bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <MapPin className="w-4 h-4 text-[#2DD4BF]" />
                <span>Destination Guides</span>
              </div>
              <div className="flex items-center gap-2 drop-shadow bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <Shield className="w-4 h-4 text-[#2DD4BF]" />
                <span>Airport Transfer Tips</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN BLOG CONTAINER (CLEAN GRID) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-20">
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-slate-200/80 my-6">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-800">No blog posts yet</h3>
            <p className="text-sm text-slate-500 mt-2">
              Check back soon for travel guides and Tropical Queensland tips!
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#102A43] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0F766E]" />
                Latest Travel Articles &amp; Guides
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {posts.length} Articles
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200/80 flex flex-col"
                >
                  {/* Featured Image */}
                  <Link href={`/blog/${post.slug}`} className="block relative overflow-hidden">
                    <div className="relative w-full h-52 bg-slate-100">
                      {post.featuredImage ? (
                        <Image
                          src={`/api/images/${post.featuredImage.id}`}
                          alt={post.featuredImage.altText || post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Tags */}
                    {post.tags && (post.tags as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(post.tags as string[]).slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                        {post.readMinutes} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-[#102A43] mb-2 group-hover:text-[#0F766E] transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#0C5D59] mt-auto pt-4 border-t border-slate-100 group-hover:gap-2.5 transition-all"
                    >
                      Read full guide
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="py-16 bg-[#102A43] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready for Your Tropical Queensland Trip?
          </h2>
          <p className="text-base text-slate-300 mb-8 max-w-xl mx-auto">
            Enjoy fixed fares, zero surge pricing, and professional meet &amp; greet private transfer service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] shadow-lg shadow-teal-900/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              Book Transfer Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/transfers"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              View Popular Routes
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
