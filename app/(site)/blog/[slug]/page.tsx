import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "../../../lib/blogPosts";
import BlogNavigation from "../../../components/BlogNavigation";

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
      type: "article"
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
    <>
      <BlogNavigation />

      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-16">
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

        <header className="mb-6">
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

        <article
          className="prose prose-sm sm:prose-base max-w-none prose-headings:mt-6 prose-headings:mb-3 prose-p:mb-3 prose-li:mb-1 prose-a:text-blue-700 prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>
    </>
  );
}
