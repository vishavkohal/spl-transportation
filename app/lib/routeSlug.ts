// lib/routeSlug.ts
import type { Route } from "../types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Build slug purely from DB route (from + to)
export function routeToSlug(route: Route): string {
  const from = route.from.trim();
  const to = route.to.trim();
  return slugify(`${from}-${to}`);
}
