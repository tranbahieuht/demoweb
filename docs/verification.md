# Olive typography refinement verification

Verified on 15 October 2026 (Vietnam time), continuing the existing Maison project.

- ESLint, TypeScript, and Next.js production build: passed.
- Production browser suite: 17 passed across desktop Chromium, Pixel 7, and iPad Mini emulation.
- Public routes: home, property listing, property detail, and contact, with five locale variants. Admin, philosophy, people, journal, and blog URLs return 404 in production. Existing admin tools are available only in explicitly enabled development mode (`MAISON_DEMO_ADMIN=true`); they have no public navigation link.
- Every public page type was checked in English, Vietnamese, Russian, Korean, and Chinese at desktop and mobile widths. Localized form notices are checked explicitly.
- Screenshots cover all four page types at 1440, 768, 430, and 390 pixels. All 16 page/width combinations have no horizontal overflow. See `visual-review/balanced/` for screenshots and `report.json`.
- The development admin smoke check passed: inquiry status changes persist across reloads, property edits appear on the detail page, and property creation/deletion work.

The review checked shared heading scales, compact sans-serif property titles, prices, readable body text, form labels and inputs, navigation, metadata, captions, and footer text. Desktop hero/H1/H2/H3 sizes now cap at 68/60/46/32px; mobile caps are 48/40/34/24px, with a separate tablet scale. Display tracking is less tight. Body text remains 16px, large copy 18px, interface text 14px, and metadata 13px. The cream/ivory/sand backgrounds, photography, serif/sans direction, multilingual switching, and working motion remain. The previous scope cleanup remains intact, including the focused navigation and homepage sections. The desktop signature animation remains intact.

Contrast ratios for text on cream / ivory / sand respectively:

| Text token               | Cream | Ivory | Sand |
| ------------------------ | ----: | ----: | ---: |
| Deep olive `#444B3C`     |  7.98 |  8.85 | 7.05 |
| Primary olive `#5F6650`  |  5.28 |  5.85 | 4.66 |
| Metadata olive `#616851` |  5.13 |  5.68 | 4.53 |

Lighter olives are reserved for decoration. Image overlays retain ivory text; the hero shading was strengthened for readability.

Browser checks cover keyword/type/location/bedroom/price filters, both sorting directions, result counts, filter reset and chips, mobile filter drawers, locale-preserved paths and queries, keyboard dropdowns, form validation and browser persistence, property references, storage failures, gallery controls and swipes, all 12 property galleries, normal-motion reveals, card hover, mobile dialogs, and GSAP cleanup. Rapid consecutive filter updates could overwrite the previous bound; updates now read the latest URL, with a regression check for combined bounds, descending sorting, and reload persistence.

This remains a frontend demonstration: inquiries are saved only in the browser and are not delivered to a company. Company details, team, reviews, and statistics are fictional; maps are illustrative. Development admin access is an opt-in demo tool, not production authentication. Browser verification uses Chromium device emulation; physical devices and other engines were not tested.
