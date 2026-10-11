# WebDECOR

WebDECOR is Max’s independent web design practice, built as an Astro 5 static website. The main site uses a dark Cybercore visual identity with a direct service offer and contact path. Experimental directions live in the separate Design Lab.

Public project inquiries go to **info@webdecor.ca**. No launched client projects are currently presented; the work shown is clearly labelled as self-initiated concept work.

## Main site

- `/` — a six-section homepage: introduction, concept work, services, project budgets, studio, and contact.
- `/services/` — services, deliverables, package budgets, and how the proposal defines the scope.
- `/studio/` — Max’s practice and approach.
- `/start/` — direct email contact and an optional project brief tool.
- `/work/forme/` and `/work/object/` — self-initiated fashion and interiors concepts, with responsive landing-page and detail-page previews and explanations of the design decisions.

The concept interfaces are static design previews, not live shops or commissioned client websites. Their product descriptions and display controls are illustrative; they do not process orders or inquiries.

## Design Lab

- `/explore/` — the Design Lab for Collage, Swiss, Hackerlair, and The Weird Internet, with separate links to read a study or try its live experience.
- `/studies/collage/`, `/studies/swiss/`, `/studies/hackerlair/`, and `/studies/weird-internet/` — design-study pages.
- `/studies/collage/experience/`, `/studies/swiss/experience/`, and `/studies/hackerlair/experience/` — interactive versions of those studies.
- `/weird-internet/` — The Weird Internet, an alternate studio experience built around a movable desktop and CRT workstation. Its services, studio, project brief, and concept pages live below that route.

The study pages describe self-initiated experiments, not client commissions. The main site retains a consistent identity; visitors enter another direction through an explicit Design Lab link.

## Project inquiries

Visitors can email `info@webdecor.ca` directly without completing a form. The optional brief tool runs in the browser and opens a prefilled `mailto:` draft addressed to WebDECOR. The visitor reviews and sends the draft in their email application. A separate action downloads `webdecor-project-brief.txt` to their device.

The website has no inquiry submission backend and does not send email automatically. The draft action needs an email application or handler; the visible address and downloaded brief provide a way to contact the studio from another mail service. Service and package links may preselect a valid option through `?service=` or `?plan=`.

## Compatibility redirects

Older bookmarks remain usable. `/chrome/` and `/cybercore/` redirect to `/`; `/cybercore/services/`, `/cybercore/studio/`, `/cybercore/start/`, and the old Cybercore project paths redirect to the matching short routes. `/underground/` redirects to `/weird-internet/` with its child pages preserved. The old `/collage/` address redirects to the collage experience.

Keep the redirect targets in `astro.config.mjs` and `public/_redirects` aligned. The latter provides hosting redirects for both trailing-slash variants; Astro generates static redirect pages as a fallback. Redirects point directly to the canonical destination, and hosting redirects preserve query strings.

## Development

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Astro serves the development site at `http://localhost:4321`. The static build is written to `dist/`.

## Source structure

| Path | Purpose |
| --- | --- |
| `src/components/StudioHome.astro` | Main homepage and its six sections. |
| `src/layouts/StudioLayout.astro` | Main-site header, navigation, metadata, footer, and three Latin font families. |
| `src/styles/studio-site.css` | Shared dark main-site styles. |
| `src/components/ConceptInterface.astro` | Static responsive interfaces used in concept cards and work pages. |
| `src/components/AgencyInquiry.astro` | Shared optional inquiry form. |
| `src/scripts/agency-inquiry.ts`, `src/scripts/agency-brief.ts` | Email draft, local download, and brief formatting. |
| `src/data/agency.ts` | Founder, contact details, service copy, packages, FAQs, and concept metadata. |
| `src/data/design-studies.ts` | Design Lab study content and live-experience links. |
| `src/layouts/AgencyLayout.astro`, `src/components/AgencyHome.astro` | Richer visual layouts retained for experimental experiences. |
| `src/components/underground/`, `src/scripts/underground*.ts` | Internal implementation of The Weird Internet; public URLs use `/weird-internet/`. |
| `src/pages/` | Canonical route templates and dynamic static routes. |
| `public/` | Original artwork, icons, and hosting redirects. |

Main-site imagery uses Astro’s `Image` component with imported originals, responsive widths, and lazy loading below the hero. Generated image assets are written to the build output; the originals remain in `public/images/` for existing experimental experiences. The main homepage has no canvas effects. Experimental motion and visual effects respect reduced-motion preferences, and the interactive workstation supports keyboard and pointer controls.

Blank booking and social URLs in `src/data/agency.ts` do not create active main-site links. Add real public URLs when those channels are ready. Keep concepts labelled until permission and evidence are available to publish real client work.

See [the October site review](docs/site-review.md) for the accepted criticism, qualified claims, verification results, and remaining cleanup candidates.

## Hosting and synchronization

Site registration settings are stored in `.openai/hosting.json`, with `dist/` as the static artifact directory and the existing WebDECOR project ID. The build’s site URL is configured in `astro.config.mjs`.

The GitHub repository is a manually synchronized source copy; the Site’s managed source remains separate, so later changes must be synced deliberately. Publish the exact managed-source commit with its generated build, then mirror the source files to GitHub. Compare tracked paths and file contents to confirm synchronization: the two repositories have independent commit histories, so matching commit IDs are not expected. Generated `dist/` and `node_modules/` directories are not source files to mirror.
