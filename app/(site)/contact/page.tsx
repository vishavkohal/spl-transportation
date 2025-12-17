// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "../../lib/blogPosts";
import ContactPage from "../../components/ContactPage";
const PRIMARY_COLOR = "#18234B";
const ACCENT_COLOR = "#A61924";

export default function ContactIndexPage() {
  

  return (
    <>
      <ContactPage  />
</>
      );
    }