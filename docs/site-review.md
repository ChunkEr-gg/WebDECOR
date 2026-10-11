# Agency website review — October 2026

**Current state:** the owner requested the original visual style after reviewing version 67. The editorial page layouts and light default have been restored, including the alternate Cybercore appearance. Public contact, Max’s identity, email-draft/download behavior, canonical routes, and mobile preview fixes remain. The logo links home, and the header’s **Activate Cybercore** button changes the appearance. The control sits beside desktop navigation and below the compact navigation bar. The sections below document the version 67 redesign and its measurements; they are historical, not current performance claims.

Claude’s assessment identified useful problems in the previous agency homepage. Source inspection supported the main contact, hierarchy, branding, accessibility, and asset-delivery criticism. Exact measurements from that assessment were not independently reproduced against the old build.

## Version 67 changes

| Finding | Response |
| --- | --- |
| No contact destination | Added the owner-supplied public address, `info@webdecor.ca`, as direct contact. The optional brief tool opens an email draft for the visitor to review and send. Download remains a separate local action. |
| Hidden house style and logo toggle | Version 67 used dark Cybercore immediately. The logo linked home; navigation stayed available while scrolling. |
| Decorative hero and repeated homepage | Added a prominent service proposition. Reduced the homepage to six sections, with detailed service information on Services and experiments in the Design Lab. |
| Anonymous practice | Identified Max using the owner’s supplied name. No location, team size, experience claim, or client results were invented. |
| Weak concept demonstrations | Version 67 showed distinct composed landing and detail interfaces for FORME and OBJECT / ROOM, with responsive layouts and specific design explanations. |
| Mobile preview gaps and overlaps | Corrected the old even-card stagger reset, separated mobile preview controls from artwork, and adjusted Collage and Swiss preview compositions. |
| Small text and weak contrast | Main-site labels start at 12px, navigation and controls have at least 44px height, and the shared muted colour is lighter on the dark surfaces. Concept interface labels also start at 12px. |
| Heavy main-page delivery | Version 67 used a smaller shared layout and stylesheet with three Latin font families. Images used Astro-generated responsive sources; content below the hero loaded lazily. That homepage had no canvas effects or hidden world images. |
| Incomplete navigation context | Main inner pages show the current page in their breadcrumb. Legacy route redirects continue to target the canonical paths directly. |

## Criticism qualified or rejected

- Removing concept labels would misrepresent the work. The owner confirmed there are no launched client projects yet. Concepts remain accurately labelled; real work and testimonials can be added when evidence and permission exist.
- “No storefront screens at all” overstated the old implementation: a basic responsive DOM mock existed. Version 67 added fuller interfaces; the owner subsequently requested the original visual composition.
- “No design tokens” was inaccurate. Colour variables already existed, although the old cascade was difficult to maintain. Version 67 centralised main-site colours, typography, and spacing in `studio-site.css`; that stylesheet was removed when the original style was restored.
- The count of canvas elements did not establish that twelve canvases were actively rendering. Experimental rendering already had world, visibility, and motion guards. The version 67 homepage avoided those effects entirely.

## Scope and behavior

The brief tool does not submit to a backend or send email automatically. Visitors must review and send the draft in their email app. The visible email address works independently of the form. Package budgets retain the existing prices; page count, functionality, currency, and schedule require agreement in the proposal.

Version 67 kept richer layouts and interactions inside the Design Lab. Its performance and typography improvements to the main agency routes did not rewrite every experimental experience. The restored site uses the original design archive and main-page effects.

## Cleanup candidates

- `scripts/check-ascii.mjs`, `scripts/check-energy.mjs`, `scripts/check-hackerlair.mjs` — manual checks outside npm scripts and CI. After `npm ci`, they run with `node scripts/check-ascii.mjs`, `node scripts/check-energy.mjs`, and `node scripts/check-hackerlair.mjs`. These use bundled source with small DOM adapters: ASCII and Hackerlair cover the terminal study; energy covers the restored agency effects. Keep them while those effects remain supported; consider adding documented npm commands if they become part of routine verification.
- `docs/sculptural-art-direction.md` — archived generation notes. Retained for provenance; an archive directory would make its status clearer if more historical documents accumulate.

`src/scripts/agency-activation.ts` is retained and required by the restored appearance control. Original images remain needed by the main and experimental routes. Generated `dist/`, `node_modules/`, temporary QA files, and deployment archives are not source files to mirror to GitHub.

## Visual restoration verification

- Production build completed for 20 content pages and 14 compatibility redirects.
- All 615 built internal links and fragments resolved.
- Installed Chromium checked the seven main pages at 390px and 1920px: restored editorial layouts, no horizontal page overflow, no missing loaded images, and no JavaScript errors.
- The appearance control switched to Cybercore and retained the selection after reload. It was subsequently moved from the footer to the header at the owner’s request. The logo continued to navigate home.
- A later owner request added a short energy surge to the home logos. The effect uses a temporary, non-interactive SVG overlay and clears after the animation. Reduced-motion and modified clicks use normal link behavior.
- The top control was checked at 320px, 390px, 768px, 1100px, and 1920px. Activation, persistence, keyboard logo activation, surge cleanup, and home navigation passed without browser errors. Reduced-motion navigation skipped the effect; final button labels measured 12px with targets at least 44px high.
- The restored inquiry form enabled correctly, preserved service/package presets, enforced required fields, downloaded the expected brief, and generated an email draft to `info@webdecor.ca` with the same content. No email was sent. Hackerlair’s action buttons fit at 320px and 390px after adding wrapping.

## Historical version 67 verification

- Production Astro build completed for 20 content pages plus 14 static redirects.
- All built internal links and fragments resolved, with one h1 on each main route.
- Installed Chromium checked seven main routes at 320, 390, 768, and 1920px: no horizontal overflow, no visible text below 12px, and no JavaScript errors. Sticky navigation, current breadcrumbs, mobile menu keyboard order, and Escape focus restoration passed.
- The brief tool preserved valid service/package presets, enforced required fields and email validation, downloaded the expected filename/content, and opened a draft addressed to the public studio email. There were no server POSTs. Direct email remained available with JavaScript disabled. Headless Chromium has no mail handler, so inbox delivery was not tested.
- The rendered homepage measured 5,490px at 390px and 4,661px at 1920px. After scrolling, loaded images totalled approximately 87KB and 159KB respectively. Linked homepage CSS totalled approximately 24KB before compression. These are local production-build measurements, not a hosted Lighthouse score.
