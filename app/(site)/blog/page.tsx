// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

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
      <main className="min-h-screen bg-slate-50">
        {/* Hero Header */}
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(166,25,36,0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            }} />
          </div>
          <div className="max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-16 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-white/60" />
              <p className="text-sm font-semibold tracking-[0.22em] uppercase text-white/60">
                Travel Guides & Tips
              </p>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4 text-white">
              Cairns & Tropical North
              <br />
              <span style={{ color: '#f87171' }}>Queensland Travel Blog</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">
              Browse our latest guides to the best attractions in Cairns, Port Douglas,
              Palm Cove, Kuranda, Mission Beach and the islands.
            </p>
          </div>
          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full">
              <path d="M0 60L1440 60V30C1200 0 240 0 0 30V60Z" fill="#f8fafc" />
            </svg>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No blog posts yet.</p>
              <p className="text-sm">Check back soon for travel guides and tips!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <article
                  key={post.slug}
                  className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col ${
                    index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  {/* Featured Image */}
                  <Link href={`/blog/${post.slug}`} className="block relative overflow-hidden">
                    <div className={`relative w-full ${index === 0 ? 'h-72' : 'h-52'} bg-slate-100`}>
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
                            className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readMinutes} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      className={`font-bold mb-2 group-hover:text-[#A61924] transition-colors leading-snug ${
                        index === 0 ? 'text-2xl' : 'text-lg'
                      }`}
                      style={{ color: PRIMARY_COLOR }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className={`text-gray-500 leading-relaxed mb-4 flex-grow ${
                        index === 0 ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
                      }`}>
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto pt-4 border-t border-gray-100 group-hover:gap-2.5 transition-all"
                      style={{ color: ACCENT_COLOR }}
                    >
                      Read full guide
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
