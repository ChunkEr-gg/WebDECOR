# WebDECOR

WebDECOR is an Astro 5 static website for an independent web design practice. The main site lives at the root URL, with short, descriptive paths for its pages and a separate route for The Weird Internet experience.

The original editorial style is restored: a light grid-based appearance by default, with the chrome-and-orange Cybercore appearance available through the header’s **Activate Cybercore** button or the large homepage **WebDECOR** logo. Both controls switch between the same modes and remember the visitor’s selection. The small header logo and footer logo link home. WebDECOR is a two-person studio led by Max; public inquiries go to **info@webdecor.ca**.

## Main site

- `/` — the WebDECOR homepage.
- `/services/`, `/studio/`, and `/start/` — services, studio information, and the project brief.
- `/work/forme/` and `/work/object/` — self-initiated fashion and interiors concepts.

## Design archive

- `/explore/` — the design archive for Collage, Swiss, Hackerlair, and The Weird Internet.
- `/studies/collage/`, `/studies/swiss/`, `/studies/hackerlair/`, and `/studies/weird-internet/` — design-study pages.
- `/studies/collage/experience/`, `/studies/swiss/experience/`, and `/studies/hackerlair/experience/` — interactive versions of those studies.
- `/weird-internet/` — The Weird Internet, an alternate studio experience built around a movable desktop and CRT workstation. Its services, studio, project brief, and concept pages live below that route.

The study pages describe self-initiated concepts, not client commissions. The optional project brief runs in the visitor’s browser. By default its primary action opens an email draft to WebDECOR for the visitor to review and send; a separate action downloads a text copy. To send briefs directly from the website, set `formEndpoint` in `src/data/agency.ts` to a form-service URL such as Formspree (`https://formspree.io/f/<id>`); if that request fails, the brief falls back to an email draft. Direct email and a copy-address button are available without completing the form.

## Compatibility redirects

Older bookmarks remain usable. `/chrome/` and `/cybercore/` redirect to `/`; the old `/cybercore/services/`, `/cybercore/studio/`, `/cybercore/start/`, and project paths redirect to the matching short routes. `/underground/` redirects to `/weird-internet/` with its child pages preserved. The old `/collage/` address redirects to the collage experience.

## Development

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Astro serves the development site at `http://localhost:4321`. The static build is written to `dist/`.

The homepage is kept to hero, services, design studies, studio, questions, and the closing invitation. Pricing and the process live on `/services/`; the full design archive lives on `/explore/`.

Main-site labels and controls have a 12px minimum, set in `src/styles/agency-clarity.css`; the miniature website mock-ups keep their scale. Smaller homepage image copies are generated with `node scripts/make-image-variants.mjs` and must be regenerated when a source image changes. `public/og-image.jpg` is the social sharing image. `/sitemap.xml` and `/robots.txt` are generated from the `site` setting in `astro.config.mjs`, so update that setting if the site moves to its own domain.

Brand rules for the main site live in `src/styles/agency-brand.css`: one signal colour (Cybercore red-orange `#ff3616`, with `#b8320c` for text on the light appearance), Space Grotesk for headings and body text, and JetBrains Mono for labels. The written name is “WebDECOR”; the lowercase “webdecor.” is the logo only. The ® symbol is not used; add it back only once the mark is registered. The favicon is the “wd.” monogram drawn from the wordmark’s strokes. The single tagline is “Websites with character.”

Agency copy and contact configuration live in `src/data/agency.ts`. Social profiles without a URL are hidden. Design-study content lives in `src/data/design-studies.ts`. Page templates and components are in `src/pages/` and `src/components/`; images and icons are in `public/`. Motion and visual effects respect reduced-motion preferences, and the interactive workstation supports keyboard and pointer controls.

`AgencyLayout.astro` and `AgencyHome.astro` provide the restored visual composition. Mobile study-preview fixes and the functional inquiry improvements remain. [The October review](docs/site-review.md) records the previous redesign and its subsequent visual restoration; its performance figures describe that previous version.

Site registration settings are stored in `.openai/hosting.json`. The GitHub repository is a manually synchronized source copy; the Site's managed source remains separate, so later changes must be synced deliberately.
