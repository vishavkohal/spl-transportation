import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const PRIMARY_COLOR = "#18234B";
const ACCENT_COLOR = "#A61924";
const BASE_URL = "https://spltransportation.com.au";

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ select: { slug: true } });
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { featuredImage: true }
  });

  if (!post) {
    return {
      title: "Blog post not found",
      description: "The requested travel guide could not be found."
    };
  }

  const url = `${BASE_URL}/blog/${post.slug}`;
  const imageUrl = post.featuredImage ? `${BASE_URL}/api/images/${post.featuredImage.id}` : '';

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.featuredImage?.altText || post.title
        }
      ] : []
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : []
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { featuredImage: true }
  });

  if (!post) notFound();

  const published = new Date(post.publishedAt);

  return (
    <main className="relative">
      {/* Soft Material background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-0 left-0 right-0 h-[560px] bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-slate-100/60 blur-3xl" />
      </div>

      <section className="mx-auto max-w-4xl px-4 md:px-6 pt-28 md:pt-32 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-slate-800 hover:underline">
            Home
          </Link>
          <span className="opacity-60">/</span>
          <Link href="/blog" className="hover:text-black hover:underline">
            Blog
          </Link>
          <span className="opacity-60">/</span>
          <span className="text-slate-700 line-clamp-1">{post.title}</span>
        </nav>

        {/* Header Card */}
        <header className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Brand strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, #18234B 0%, #A61924 65%, #18234B 100%)"
            }}
          />

          <div className="p-6 sm:p-8">
            {/* Category chip */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ACCENT_COLOR }}
              />
              <span style={{ color: PRIMARY_COLOR }}>Travel Guide</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              {post.title}
            </h1>

            <p className="mt-3 text-gray-900 text-sm sm:text-base leading-relaxed font-medium">
              {post.excerpt}
            </p>

            {/* Meta chips */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-700 font-medium">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                <span className="font-bold text-gray-900">Published</span>
                <span>
                  {published.toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                <span className="font-bold text-gray-900">Reading</span>
                <span>{post.readMinutes} min</span>
              </span>
            </div>

            {/* Tags row */}
            {post.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.slice(0, 6).map(tag => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 text-[11px] border bg-white"
                    style={{
                      borderColor: "rgba(24,35,75,0.18)",
                      color: PRIMARY_COLOR
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-[300px] sm:h-[400px]">
                <Image
                  src={`/api/images/${post.featuredImage.id}`}
                  alt={post.featuredImage.altText || post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </header>

        {/* Content Card */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] overflow-hidden">
          <div className="p-6 sm:p-10">
            <article
              className="
                prose prose-sm sm:prose-base lg:prose-lg
                max-w-none
                text-black

                /* Headings */
                prose-headings:tracking-tight
                prose-headings:text-[#18234B]
                prose-headings:font-bold
                prose-h1:text-4xl
                sm:prose-h1:text-5xl
                prose-h1:font-extrabold
                prose-h1:mb-8
                prose-h1:!leading-tight
                prose-h2:mt-16
                prose-h2:mb-6
                prose-h3:mt-12
                prose-h3:mb-5
                prose-h4:mt-10
                prose-h4:mb-4

                /* Paragraphs */
                prose-p:mb-6
                prose-p:leading-[1.9]
                prose-p:text-black
                prose-p:font-medium

                /* Lists */
                prose-ul:my-7
                prose-ul:list-disc
                prose-ul:pl-6
                prose-li:mb-2
                prose-li:leading-[1.75]
                prose-li:text-black
                prose-li:font-medium
                prose-li:marker:text-[#A61924] /* Red bullets */

                /* Blockquotes */
                prose-blockquote:border-l-4
                prose-blockquote:border-[#A61924]
                prose-blockquote:bg-slate-50
                prose-blockquote:px-6
                prose-blockquote:py-4
                prose-blockquote:rounded-r-lg
                prose-blockquote:not-italic
                prose-blockquote:text-black
                prose-blockquote:font-medium

                /* Divider */
                prose-hr:my-16
                prose-hr:border-slate-200

                /* Extra space after hr */
                prose-hr + h2:mt-20
                prose-hr + h3:mt-16
                prose-hr + h4:mt-14

                /* Strong */
                prose-strong:font-bold
                prose-strong:text-[#18234B]

                /* Links - High Visibility */
                prose-a:text-[#A61924]
                prose-a:font-bold
                prose-a:underline
                prose-a:underline-offset-4
                prose-a:decoration-[#A61924]/40
                prose-a:transition-all
                hover:prose-a:decoration-[#A61924]
                hover:prose-a:text-[#8a141d]
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Bottom CTA */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 sm:px-10 py-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: PRIMARY_COLOR }}
                >
                  Need a private transfer?
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Request a fixed-price quote with a professional driver and a
                  premium vehicle.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Back to blog */}
        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: PRIMARY_COLOR }}
          >
            ← Back to Blog
          </Link>
        </div>
      </section>
    </main>
  );
}
