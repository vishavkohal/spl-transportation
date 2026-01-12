import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "../../../lib/blogPosts";

const PRIMARY_COLOR = "#18234B";
const ACCENT_COLOR = "#A61924";
const BASE_URL = "https://spltransportation.com.au";

export const revalidate = 600;

export async function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: "Blog post not found",
      description: "The requested travel guide could not be found."
    };
  }

  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      images: [
        {
          url: `${BASE_URL}${post.featuredImage.src}`,
          width: 1200,
          height: 630,
          alt: post.featuredImage.alt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${BASE_URL}${post.featuredImage.src}`]
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const published = new Date(post.publishedAt);

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>{" "}
        / <span className="text-gray-700">{post.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <p
          className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase mb-2"
          style={{ color: ACCENT_COLOR }}
        >
          Travel Guide
        </p>

        <h1
          className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3"
          style={{ color: PRIMARY_COLOR }}
        >
          {post.title}
        </h1>

        <p className="text-gray-600 text-sm sm:text-base mb-3">
          {post.excerpt}
        </p>

        <p className="text-xs text-gray-500">
          {published.toLocaleDateString("en-AU", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}{" "}
          · {post.readMinutes} min read
        </p>
      </header>

      {/* Featured Image */}
      <div className="mb-10">
        <Image
          src={post.featuredImage.src}
          alt={post.featuredImage.alt}
          width={1200}
          height={630}
          priority
          className="w-full h-auto rounded-xl object-cover"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
<article
  className="
    prose prose-sm sm:prose-base lg:prose-lg
    max-w-none

    /* Headings spacing */
    prose-headings:tracking-tight
    prose-headings:text-[#18234B]

    prose-h2:mt-16
    prose-h2:mb-6
    prose-h3:mt-12
    prose-h3:mb-5
    prose-h4:mt-10
    prose-h4:mb-4

    /* Paragraph spacing */
    prose-p:mb-6
    prose-p:leading-[1.75]
    prose-p:text-gray-700

    /* Lists spacing */
    prose-ul:my-7
    prose-li:mb-3
    prose-li:leading-[1.7]
    prose-li:text-gray-700

    /* Horizontal rule spacing */
    prose-hr:my-16
    prose-hr:border-gray-200

    /* 🚀 KEY FIX: extra space after HR before next heading */
    prose-hr + h2:mt-20
    prose-hr + h3:mt-16
    prose-hr + h4:mt-14

    /* Strong text */
    prose-strong:font-semibold
    prose-strong:text-gray-900

    /* Links */
    prose-a:text-[#A61924]
    prose-a:font-medium
    prose-a:no-underline
    hover:prose-a:underline
  "
  dangerouslySetInnerHTML={{ __html: post.content }}
/>

</div>
    </main>
  );
}
