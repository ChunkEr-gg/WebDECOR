# WebDECOR

WebDECOR is an Astro 5 static website for an independent web design practice. The root route (`/`) and `/cybercore/` render the same Cybercore agency homepage.

## Routes

- `/` and `/cybercore/` — the Cybercore agency homepage.
- `/cybercore/services/`, `/cybercore/studio/`, and `/cybercore/start/` — services, studio information, and the project brief.
- `/cybercore/work/forme/` and `/cybercore/work/object/` — self-initiated fashion and interiors concepts.
- `/underground/` — The Weird Internet, an alternate studio experience built around a movable desktop and CRT workstation.
- `/explore/` — the design archive for Collage, Swiss, Hackerlair, and The Weird Internet.
- `/studies/collage/`, `/studies/swiss/`, `/studies/hackerlair/`, and `/studies/weird-internet/` — design-study pages.
- `/studies/collage/experience/`, `/studies/swiss/experience/`, and `/studies/hackerlair/experience/` — interactive versions of those studies. The Weird Internet experience is `/underground/`.
- `/collage/` — a standalone earlier collage composition retained as a legacy route.
- `/chrome/` redirects to `/cybercore/`.

The study pages describe self-initiated concepts, not client commissions. The project brief is generated as a text download in the visitor's browser; it is not submitted to WebDECOR or sent automatically.

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

