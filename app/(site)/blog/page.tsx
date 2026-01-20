// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PRIMARY_COLOR = "#18234B";
const ACCENT_COLOR = "#A61924";

export const metadata: Metadata = {
  title: "Cairns & Tropical North Queensland Travel Blog | SPL Transportation",
  description:
    "Discover the best places to visit in Cairns, Port Douglas, Palm Cove, Kuranda, Mission Beach and more. Travel tips, guides and private transfer advice for Tropical North Queensland."
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
          altText: true
        }
      }
    }
  });

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-15 md:pt-15 pb-16">
        <header className="mb-10">
          <p
            className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase mb-2"
            style={{ color: ACCENT_COLOR }}
          >
            Travel Guides &amp; Tips
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3"
            style={{ color: PRIMARY_COLOR }}
          >
            Cairns &amp; Tropical North Queensland Travel Blog
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
            Browse our latest guides to the best attractions in Cairns, Port Douglas,
            Palm Cove, Kuranda, Mission Beach and the islands. Plan your trip and
            combine it with comfortable private transfers.
          </p>
        </header>

        <section className="space-y-6">
          {posts.map(post => (
            <article
              key={post.slug}
              className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-gray-500 mb-1">
                {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}{" "}
                · {post.readMinutes} min read
              </p>
              <h2
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{ color: PRIMARY_COLOR }}
              >
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-3">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold"
                style={{ color: ACCENT_COLOR }}
              >
                Read full guide →
              </Link>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
