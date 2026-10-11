# Agency website review — October 2026

Claude’s assessment identified useful problems in the previous agency homepage. Source inspection supported the main contact, hierarchy, branding, accessibility, and asset-delivery criticism. Exact measurements from that assessment were not independently reproduced against the old build.

## Changes made

| Finding | Response |
| --- | --- |
| No contact destination | Added the owner-supplied public address, `info@webdecor.ca`, as direct contact. The optional brief tool opens an email draft for the visitor to review and send. Download remains a separate local action. |
| Hidden house style and logo toggle | The main site now uses dark Cybercore immediately. The logo links home; navigation stays available while scrolling. |
| Decorative hero and repeated homepage | Added a prominent service proposition. Reduced the homepage to six sections, with detailed service information on Services and experiments in the Design Lab. |
| Anonymous practice | Identified Max using the owner’s supplied name. No location, team size, experience claim, or client results were invented. |
| Weak concept demonstrations | FORME and OBJECT / ROOM now show distinct composed landing and detail interfaces, with responsive layouts and specific design explanations. |
| Mobile preview gaps and overlaps | Corrected the old even-card stagger reset, separated mobile preview controls from artwork, and adjusted Collage and Swiss preview compositions. |
| Small text and weak contrast | Main-site labels start at 12px, navigation and controls have at least 44px height, and the shared muted colour is lighter on the dark surfaces. Concept interface labels also start at 12px. |
| Heavy main-page delivery | Main routes use a smaller shared layout and stylesheet with three Latin font families. Images use Astro-generated responsive sources; content below the hero loads lazily. The homepage has no canvas effects or hidden world images. |
| Incomplete navigation context | Main inner pages show the current page in their breadcrumb. Legacy route redirects continue to target the canonical paths directly. |

## Criticism qualified or rejected

- Removing concept labels would misrepresent the work. The owner confirmed there are no launched client projects yet. Concepts remain accurately labelled; real work and testimonials can be added when evidence and permission exist.
- “No storefront screens at all” overstated the old implementation: a basic responsive DOM mock existed. It needed fuller interfaces, which are now shown.
- “No design tokens” was inaccurate. Colour variables already existed, although the old cascade was difficult to maintain. Main-site colours, typography, and spacing are now centralised in `studio-site.css`.
- The count of canvas elements did not establish that twelve canvases were actively rendering. Experimental rendering already had world, visibility, and motion guards. The new main homepage avoids those effects entirely.

## Scope and behavior

The brief tool does not submit to a backend or send email automatically. Visitors must review and send the draft in their email app. The visible email address works independently of the form. Package budgets retain the existing prices; page count, functionality, currency, and schedule require agreement in the proposal.

The richer layouts and interactions remain available inside the Design Lab. Performance and typography improvements to the main agency routes should not be interpreted as a rewrite of every experimental experience.

## Cleanup candidates

- `src/scripts/agency-activation.ts` — retired logo-toggle implementation, with no remaining source import. Can be removed after deciding whether to retain it as an experiment.
- `scripts/check-ascii.mjs`, `scripts/check-energy.mjs`, `scripts/check-hackerlair.mjs` — manual checks for experimental behavior, currently outside npm scripts and CI. Keep and document a supported invocation, or archive them if that workflow is retired.
- `docs/sculptural-art-direction.md` — archived generation notes. Retained for provenance; an archive directory would make its status clearer if more historical documents accumulate.

Original images remain needed by the experimental routes. Generated `dist/`, `node_modules/`, temporary QA files, and deployment archives are not source files to mirror to GitHub.

## Verification

- Production Astro build completed for 20 content pages plus 14 static redirects.
- All built internal links and fragments resolved, with one h1 on each main route.
- Installed Chromium checked seven main routes at 320, 390, 768, and 1920px: no horizontal overflow, no visible text below 12px, and no JavaScript errors. Sticky navigation, current breadcrumbs, mobile menu keyboard order, and Escape focus restoration passed.
- The brief tool preserved valid service/package presets, enforced required fields and email validation, downloaded the expected filename/content, and opened a draft addressed to the public studio email. There were no server POSTs. Direct email remained available with JavaScript disabled. Headless Chromium has no mail handler, so inbox delivery was not tested.
- The rendered homepage measured 5,490px at 390px and 4,661px at 1920px. After scrolling, loaded images totalled approximately 87KB and 159KB respectively. Linked homepage CSS totalled approximately 24KB before compression. These are local production-build measurements, not a hosted Lighthouse score.
