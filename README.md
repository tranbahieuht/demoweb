# Maison Residences

A complete frontend demonstration for a fictional luxury rental brand in Vietnam.

```powershell
npm install
npm run dev
```

Open http://localhost:3000/en. Locale routes are `/en`, `/vi`, `/ru`, `/ko`, and `/zh`. The public experience contains only home, properties, property detail, and contact. `/admin` returns 404 by default and in every production build.

To use the existing admin tools for a local demonstration, set `MAISON_DEMO_ADMIN=true` in `.env.local` and restart `npm run dev`. Visit `/admin` directly; it has no public navigation link. Property editing, creation, deletion, and inquiry management still use the same browser-local records. This setting enables tools only in development and is not production authentication. With that development server running, `node scripts/verify-admin.mjs` verifies the admin workflows in an isolated browser context.

Features: 12 localized homes; keyword, type, location, bedroom, and price filters; sorting; grid/list layouts; touch and fullscreen galleries; React Hook Form/Zod inquiries; browser-persisted inquiries; localized UI; mobile menu and filter drawer; reduced-motion support; Lenis smooth scrolling; Motion reveals; GSAP signature scene.

The refinement preserves the original cream palette, photography, and working animations. Shared olive text tokens and responsive type scales balance display headings, property titles and prices, navigation, forms, metadata, and footer text. Home, Properties, and Contact are the only primary navigation items. The redundant services section and public admin entry point have been removed. It adds readable interface typography, a consistent spacing scale, transparent-to-solid navigation, a full-screen mobile menu, keyboard-accessible animated dropdowns, removable filter chips, accent-insensitive search, masked headings and image reveals, desktop parallax, and clearer contact and viewing actions. Mobile motion stays lightweight, with reduced-motion preferences respected.

## Architecture

- `src/app`: Next.js App Router pages and locale layouts.
- `src/i18n`: next-intl routing, navigation, request configuration, and five-language dictionaries.
- `src/data/properties.ts`: editable mock collection, company details, and demonstration statistics.
- `src/lib/mock-service.ts`: centralized data boundary; replace its browser persistence with backend calls when integrating a real service.
- `src/components`: public experience, forms, galleries, motion, and administration.

`maison-demo-v1` in localStorage holds both properties and inquiries. Records persist across reloads and same-origin browser tabs. The data service and administration component remain available for future authenticated integration, but have no public administration route. Failed storage writes are reported as failures. No information is sent to a company. This is not a production authentication system.

Original property data and the public interface include all five languages. The serif/sans pairing uses self-hosted multilingual fonts and system sans fallbacks.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests use Playwright and the local dev server. Install its Chromium browser with `npx playwright install chromium` if necessary. The dev server must be running for the tests.

The suite covers desktop Chromium and touch-emulated Pixel 7 / iPad Mini layouts: all five languages across every public page type, filters and sorting, combined price bounds and reload persistence, locale-preserved navigation, form validation and browser persistence, storage failure handling, gallery controls and swipes, image loading, and GSAP pin cleanup. It also verifies navigation scope and 404 responses for retired routes.

Final typography refinement screenshots for all four page types at 1440, 768, 430, and 390-pixel widths are in `docs/visual-review/balanced/`. Regenerate them against a running server with `TEST_BASE_URL` and `node scripts/visual-review.mjs balanced`. The heading scale now caps desktop hero/H1/H2/H3 at 68/60/46/32px and mobile at 48/40/34/24px, while body and interface text retain their readable sizes. See `docs/verification.md` for checks and demo limitations.

To test a production server on another port, set `TEST_BASE_URL` before running the suite. Run build and TypeScript checks sequentially because Next.js regenerates route types during the build.

## Demonstration content and images

All brand details, people, reviews, and statistics are fictional examples. Property photography is illustrative and does not depict actual listings at the given Vietnam addresses. The map is an intentional illustration, not a live geolocation service. Prices are illustrative monthly VND rents. No backend, delivery service, analytics, API keys, or production authentication is included.

Architectural and portrait photography is downloaded from Unsplash's image CDN and stored locally so runtime browsing does not require an external image provider. Asset source IDs are recorded in `scripts/photo-sources.json`; `scripts/download-assets.mjs` can refresh them. UI uses `next/image` with optimized local imagery and an architectural fallback.

The production dependency audit is clean. The complete dependency audit currently reports five development-only advisories inherited from Next.js's ESLint plugin through `braces`; the registry offers no compatible patched release. These do not occur in the production dependency tree.

Fonts are self-hosted through Fontsource: Cormorant Garamond and Manrope, including Vietnamese/Cyrillic subsets, plus Noto Serif KR and SC for Korean and Chinese headings. Unicode ranges load only the needed font subsets.
