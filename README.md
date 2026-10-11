# WebDECOR

WebDECOR is an independent web design studio and a collection of self-initiated design studies. The main site uses a polished cybercore visual language: an editorial grid, custom typography, archival imagery, and vermilion accents. Click the WebDECOR mark in the header to switch on the dimensional neon identity and animated energy lines.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Astro serves the site at `http://localhost:4321`. Build the static site with `npm run build`; preview the result with `npm run preview`.

## Pages

- `/` — the WebDECOR studio homepage.
- `/cybercore/services/` — services, process, and pricing.
- `/cybercore/studio/` — studio approach and design principles.
- `/cybercore/start/` — interactive project brief.
- `/cybercore/work/forme/` and `/cybercore/work/object/` — fashion and interiors design concepts.
- `/explore/` — the design archive and alternate visual studies.
- `/studies/` — standalone study experiences, including Swiss, Collage, Hackerlair, and Weird Internet.

Other routes preserve earlier experimental compositions. All routes are generated as static pages.

## Content and assets

Agency copy, services, three pricing options ($1,200, $2,400, and Custom), process, FAQs, and social profile configuration live in `src/data/agency.ts`. Add confirmed contact details there when ready. The project brief is generated in the visitor's browser; it does not send the visitor's details to the studio. Unconfigured social profiles display as coming soon.

Fonts and original visual assets are stored locally in `public/`. Components live in `src/components/`, page templates in `src/pages/`, and the shared design system and responsive styles in `src/styles/`. Motion respects reduced-motion preferences, and interactive elements include keyboard-accessible controls.

The project is an Astro 5 static site. GitHub Pages and other static hosts can publish the output in `dist/`. Site registration settings are kept separately in `.openai/hosting.json`.
