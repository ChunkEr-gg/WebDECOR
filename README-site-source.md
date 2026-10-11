# WebDECOR

An Astro agency website with five design directions:

- `/` — the cybercore WebDECOR agency homepage.
- `/collage/` — the original collage landing page, retained in the design archive.
- `/magazine/` — The Expression Issue, a maximalist fashion editorial with a full-bleed cover, scattered annotations, overlapping typography, original fashion imagery, and freeform spreads.
- `/underground/` — The Weird Internet: vermilion brutalist type, warm ivory text, an acid-yellow issue sticker, a connected movable CRT workstation, independent paper assets, handwritten notes, and monochrome project worlds.
- `/cybercore/` — The WebDECOR agency website: homepage with an interactive service selector and live generative studio instrument, services, studio, two clearly labelled design studies, and a local project brief builder. Cybercore: custom geometric typography, monochrome archival imagery, signal-red accents, and a continuous modular grid. Material-scan and wireframe concept artwork with custom geometric project wordmarks, measured project frames, four technical specimen windows, an orbital studio schematic, numbered process cells, and a full-width geometric footer carry the visual language throughout the page.
- `/cinematic/` — A surreal ASCII direction with rushing forest light, an asymmetric project gallery, an interactive image treatment study, a compact studio note, and a direct closing invitation. Original project images remain clear inside case studies.
- `/explore/` — comparison of all directions.

## Development

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Shared components provide the style selector, project details, and local project brief download. Fonts are hosted locally. Motion respects reduced-motion preferences. Portfolio projects are explicitly labeled concepts. The brief downloads on the visitor's device and sends no message or personal data.

Site registration is stored in `.openai/hosting.json`. Publishing preserves the existing audience.

Both new directions assemble generated assets in the browser. The retro monitor, live screen, keyboard, and mouse move as one connected workstation; the collage pieces remain independent. Arrange controls support mouse/touch dragging, arrow-key movement, Home to reset a focused part, and reset-all. Arrangement defaults off on coarse pointers so visitors can scroll normally. WebGL effects add subtle scan grain or flowing light; effects stop when the tab is hidden, are optional, and respect reduced motion. Static artwork remains available when WebGL fails. New photocopy and liquid still-life artwork continues through the project, studio, practice, and contact sections.

## Agency content

Baseline agency copy is centralised in `src/data/agency.ts`: services, three pricing options ($1,200 / $2,400 / Custom), process, FAQs, study descriptions, and contact configuration. Package selections carry into the project brief. Add a real public email or booking URL there when ready. The project-start form currently creates a local text download; it does not submit or send personal data. With a configured email, it also provides an email-draft button for the visitor to review and send. The form remains disabled until its local script is ready.

Agency routes: `/cybercore/`, `/cybercore/services/`, `/cybercore/studio/`, `/cybercore/start/`, `/cybercore/work/forme/`, `/cybercore/work/object/`. Other design directions remain in the design archive.

The generative studio instrument offers orbit, wave, and field modes, keyboard-accessible rotation and pause/play, a static SVG fallback, and reduced-motion support. Rendering pauses off-screen and when the tab is hidden. Header navigation and service tabs remain accessible across screen sizes.
