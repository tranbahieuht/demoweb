# Maison Residences

A complete frontend demonstration for a fictional luxury rental brand in Vietnam.

```powershell
npm install
npm run dev
```

Open http://localhost:3000/en. Locale routes are `/en`, `/vi`, `/ru`, `/ko`, and `/zh`. Administration is at `/admin` (deliberately unauthenticated demo mode).

Features: 12 localized homes; keyword, type, location, bedroom, and price filters; sorting; grid/list layouts; touch and fullscreen galleries; React Hook Form/Zod inquiries; browser-persisted property CRUD and inquiry statuses; localized UI; mobile menu and filter drawer; reduced-motion support; Lenis smooth scrolling; Motion reveals; GSAP signature scene.

The refinement preserves the original cream palette, photography, and editorial sections. It adds readable interface typography, a consistent spacing scale, transparent-to-solid navigation, a full-screen mobile menu, keyboard-accessible animated dropdowns, removable filter chips, accent-insensitive search, masked headings and image reveals, desktop parallax, and clearer contact and viewing actions. Mobile motion stays lightweight, with reduced-motion preferences respected.

## Architecture

- `src/app`: Next.js App Router pages and locale layouts.
- `src/i18n`: next-intl routing, navigation, request configuration, and five-language dictionaries.
- `src/data/properties.ts`: editable mock collection, company details, and demonstration statistics.
- `src/lib/mock-service.ts`: centralized data boundary; replace its browser persistence with backend calls when integrating a real service.
- `src/components`: public experience, forms, galleries, motion, and administration.

`maison-demo-v1` in localStorage holds both properties and inquiries. Edits update public pages immediately and persist across reloads and same-origin browser tabs. Restore the original demo from the admin overview. Failed storage writes are reported as failures. No information is sent to a company. This is not a production authentication system.

The admin editor supports all five locale fields. Blank translations for newly created content fall back to the English text; original data includes meaningful translations in every locale. The public interface is translated; the separate demo management interface is English.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests use Playwright and the local dev server. Install its Chromium browser with `npx playwright install chromium` if necessary. The dev server must be running for the tests.

The suite contains 15 cases across desktop Chromium and touch-emulated Pixel 7 / iPad Mini layouts. It covers all five languages, filters and sorting, locale-preserved navigation, form validation, storage failure handling, persistent inquiries, admin CRUD, gallery controls and swipes, image loading, and GSAP pin cleanup. Normal-motion checks cover masked reveals, navigation colors, keyboard dropdown selection, filter chips, card hover, and 390/430-pixel fullscreen gallery positioning. The final suite was also run against the production server.

Before/after visual reviews of the homepage, collection, residence, contact, and admin pages are in `docs/visual-review/`. Each review covers 1440, 768, 430, and 390-pixel widths. To regenerate screenshots against a running server, set `TEST_BASE_URL` and run `node scripts/visual-review.mjs after`. See `docs/verification.md` for the final checks and demo limitations.

To test a production server on another port, set `TEST_BASE_URL` before running the suite. Run build and TypeScript checks sequentially because Next.js regenerates route types during the build.

## Demonstration content and images

All brand details, people, reviews, and statistics are fictional examples. Property photography is illustrative and does not depict actual listings at the given Vietnam addresses. The map is an intentional illustration, not a live geolocation service. Prices are illustrative monthly VND rents. No backend, delivery service, analytics, API keys, or production authentication is included.

Architectural and portrait photography is downloaded from Unsplash's image CDN and stored locally so runtime browsing does not require an external image provider. Asset source IDs are recorded in `scripts/photo-sources.json`; `scripts/download-assets.mjs` can refresh them. UI uses `next/image` with optimized local imagery and an architectural fallback.

The production dependency audit is clean. The complete dependency audit currently reports five development-only advisories inherited from Next.js's ESLint plugin through `braces`; the registry offers no compatible patched release. These do not occur in the production dependency tree.

Fonts are self-hosted through Fontsource: Cormorant Garamond and Manrope, including Vietnamese/Cyrillic subsets, plus Noto Serif KR and SC for Korean and Chinese headings. Unicode ranges load only the needed font subsets.
