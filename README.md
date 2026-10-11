# WebDECOR

WebDECOR is an Astro 5 static website for an independent web design practice. The main site lives at the root URL, with short, descriptive paths for its pages and a separate route for The Weird Internet experience.

## Main site

- `/` — the WebDECOR homepage.
- `/services/`, `/studio/`, and `/start/` — services, studio information, and the project brief.
- `/work/forme/` and `/work/object/` — self-initiated fashion and interiors concepts.

## Design archive

- `/explore/` — the design archive for Collage, Swiss, Hackerlair, and The Weird Internet.
- `/studies/collage/`, `/studies/swiss/`, `/studies/hackerlair/`, and `/studies/weird-internet/` — design-study pages.
- `/studies/collage/experience/`, `/studies/swiss/experience/`, and `/studies/hackerlair/experience/` — interactive versions of those studies.
- `/weird-internet/` — The Weird Internet, an alternate studio experience built around a movable desktop and CRT workstation. Its services, studio, project brief, and concept pages live below that route.

The study pages describe self-initiated concepts, not client commissions. The project brief is generated as a text download in the visitor's browser; it is not submitted to WebDECOR or sent automatically.

## Compatibility redirects

Older bookmarks remain usable. `/chrome/` and `/cybercore/` redirect to `/`; the old `/cybercore/services/`, `/studio/`, `/start/`, and project paths redirect to the matching short routes. `/underground/` redirects to `/weird-internet/` with its child pages preserved. The old `/collage/` address redirects to the collage experience.

## Development

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Astro serves the development site at `http://localhost:4321`. The static build is written to `dist/`.

Agency copy and contact configuration live in `src/data/agency.ts`. Design-study content lives in `src/data/design-studies.ts`. Page templates and components are in `src/pages/` and `src/components/`; images and icons are in `public/`. Motion and visual effects respect reduced-motion preferences, and the interactive workstation supports keyboard and pointer controls.

Site registration settings are stored in `.openai/hosting.json`. The GitHub repository is a manually synchronized source copy; the Site's managed source remains separate, so later changes must be synced deliberately.
