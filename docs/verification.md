# Presentation verification

Verified on 14 October 2026 (Vietnam time), continuing the existing Maison implementation.

- ESLint: passed with no warnings.
- TypeScript: passed.
- Next.js production build: passed.
- Production dependency audit: no vulnerabilities.
- Production browser suite: 15 passed across desktop Chromium and touch-emulated Pixel 7 / iPad Mini.

Browser coverage includes all five locales, responsive typography, preserved locale paths and filter queries, search/filter/sort/reset, property galleries and touch swipes, inquiry validation and persistence, storage errors, property CRUD, rental and inquiry statuses, and client-navigation cleanup of the pinned GSAP scene. Local imagery was checked across all 12 property galleries.

Normal-motion checks additionally cover transparent hero navigation and its solid scrolled state, masked heading and image reveals, keyboard-accessible dropdowns, removable filters, accent-insensitive neighborhood search, card hover, and fullscreen gallery/menu entrances at 390 and 430 pixels. The image reveal observer watches its unclipped outer container so scrolling reliably reveals its inner image. Mobile fullscreen positioning remains stable throughout its entrance animation. Desktop parallax runs only on fine-pointer devices and is disabled for reduced motion.

Before/after visual reviews cover all five page types (home, collection, residence, contact, admin) at 1440, 768, 430, and 390 pixels: 20 page/width combinations per stage. The final review found no horizontal overflow. Screenshots and machine-readable overflow reports are in `docs/visual-review/before/` and `docs/visual-review/after/`, including mobile navigation, hero views, card hover, and grid/list presentation. Locale screenshots, gallery checks, and mobile admin records are also produced in `test-results/` by the browser suite.

This is a frontend demo: records are browser-local, inquiries are not delivered, company content is fictional, maps are illustrative, and the admin has no production authentication. Admin navigation is English; its property editor supports all five content locales. New content with blank translations falls back to English.

The development-only dependency advisories and setup instructions are documented in `README.md`. Verification uses Chromium device emulation; physical devices and other browser engines were not tested.
