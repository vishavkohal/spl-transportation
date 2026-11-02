# Execution Checklist: Full-Site SEO & Schema Optimization

- [x] **Phase 1: Centralized Identity Graph & Deprecation of Duplicate Schemas** <!-- id: 0 -->
  - [x] Update `app/layout.tsx` to replace `next/script` `strategy="lazyOnload"` with server-rendered `<script type="application/ld+json">` declaring `#website` and canonical `#organization` (`LocalBusiness` + `TaxiService`) <!-- id: 1 -->
  - [x] Delete `app/components/JsonLd.tsx` (removes invalid `LimoService`, non-www domain, and duplicate schema injection) <!-- id: 2 -->
  - [x] Remove `<JsonLd />` imports and tags from `app/(site)/page.tsx` and `app/(site)/transfers/page.tsx` <!-- id: 3 -->

- [x] **Phase 2: Fix Google Rich Results & Merchant Listing Errors on Transfers** <!-- id: 4 -->
  - [x] In `app/(site)/transfers/[slug]/page.tsx`, remove `aggregateRating` from `Service` (`#service`) to resolve Google error: `Invalid object type for field "<parent_node>"` <!-- id: 5 -->
  - [x] In `app/(site)/transfers/[slug]/page.tsx`, update `Product` schema: add required `image: [ogImageUrl]`, fix `brand: { "@type": "Brand", "name": "SPL Transportation" }`, and re-point reviews' `itemReviewed` to `${url}#product` <!-- id: 6 -->
  - [x] Remove duplicate `LocalBusiness` definition from `transfers/[slug]/page.tsx` (linking to canonical root `#organization` instead) <!-- id: 7 -->

- [x] **Phase 3: Harmonize JSON-LD Across All Remaining Site Pages** <!-- id: 8 -->
  - [x] `app/(site)/page.tsx`: Remove `aggregateRating` from `TransportService`, remove retired `SearchAction`, connect `provider` to `#organization` <!-- id: 9 -->
  - [x] `app/(site)/services/page.tsx`: Strip duplicate `LocalBusiness`, link to root `#organization` <!-- id: 10 -->
  - [x] `app/(site)/book/page.tsx`: Strip duplicate `LocalBusiness`, link to root `#organization` and `#website` <!-- id: 11 -->
  - [x] `app/(site)/about/page.tsx`: Format into clean `@graph` linking to `#website` and `#organization` <!-- id: 12 -->
  - [x] `app/(site)/contact/page.tsx`: Format into clean `@graph` linking to `#website` and `#organization` <!-- id: 13 -->
  - [x] `app/(site)/privacy-policy/page.tsx` & `terms/page.tsx`: Standardize into clean `@graph` <!-- id: 14 -->
  - [x] `app/(site)/blog/page.tsx`: Fix `ItemList` to use `item: string` in `ListItem` <!-- id: 15 -->
  - [x] `app/(site)/blog/[slug]/page.tsx`: Standardize `BlogPosting` publisher and author `@id` references <!-- id: 16 -->

- [x] **Phase 4: Sitemaps, Robots.txt & Metadata Indexing Discipline** <!-- id: 17 -->
  - [x] `app/sitemap.xml/route.ts`: Add missing `/services` route, verify changefreq and priorities <!-- id: 18 -->
  - [x] `app/robots.txt/route.ts`: Add disallow for `/booking-success`, `/booking-cancelled`, `/manage-booking` <!-- id: 19 -->
  - [x] `app/(bare)/booking-cancelled/page.tsx`: Add server metadata with `robots: { index: false, follow: false }` <!-- id: 20 -->
  - [x] Verify social share image dimensions and fix double suffix in page titles <!-- id: 21 -->

- [x] **Phase 5: Verification & Google Rich Results Validation Gate** <!-- id: 22 -->
  - [x] Run `npm run lint` and TypeScript check `npx tsc --noEmit` <!-- id: 23 -->
  - [x] Run build test `npm run build` <!-- id: 24 -->
  - [x] Validate generated JSON-LD against schema.org and Google Rich Results parser <!-- id: 25 -->
