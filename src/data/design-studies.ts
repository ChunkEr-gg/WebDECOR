export const designStudies = [
  {
    slug: 'collage', number: '01', name: 'Collage', label: 'TACTILE / PLAYFUL / EXPRESSIVE',
    headline: 'Serious ideas.\nWild websites.',
    summary: 'A digital playground made from paper, colour, and a little creative misbehaviour.',
    question: 'Can a website feel handmade and still work with precision?',
    concept: 'Bring the energy of a studio wall onto the screen. Cutouts, tape, oversized lettering, and unexpected crops give every composition a human touch. The interface stays clear while the artwork refuses to sit still.',
    layout: 'An off-axis, image-led opening gives way to overlapping project compositions and generous editorial space. Uneven proportions create rhythm; repeated type and colour keep it coherent.',
    typography: 'Fredoka brings soft, sculptural display shapes. Handwritten Caveat annotations feel like notes from the studio. Straightforward sans-serif text carries the practical information.',
    motion: 'Paper layers settle into place, artwork shifts in depth, and project imagery reveals like a pasted-up spread. Movement follows the physical logic of the materials.',
    applications: ['Creative businesses', 'Independent brands', 'Culture & lifestyle'],
    palette: [['Paper','#f4f0e5'],['Cobalt','#2345ef'],['Butter','#fff04f'],['Ink','#191919']],
    specimen: 'Make\nsomething\nstrange.', typeLabel: 'SOFT DISPLAY + HUMAN ANNOTATIONS',
    live: '/studies/collage/experience/', world: 'collage',
  },
  {
    slug: 'swiss', number: '02', name: 'Swiss', label: 'CLARITY / SCALE / RESTRAINT',
    headline: 'A clear\npoint of view.',
    summary: 'Quiet confidence. Oversized typography, disciplined space, and one decisive red accent.',
    question: 'How much can an identity say with fewer elements?',
    concept: 'Make hierarchy the visual event. Type changes scale, margins become part of the composition, and a small number of graphic gestures carries the identity. Every element earns its place.',
    layout: 'A typographic opening replaces the Cybercore interface. Wide margins, asymmetric alignments, numbered indices, and flat editorial blocks give the pages a measured, almost print-like pace.',
    typography: 'Space Grotesk at sharply contrasting scales. Heavy display statements are balanced by compact labels and calm body text. Alignment does the work that decoration usually does.',
    motion: 'Measured horizontal reveals and precise graphic rotations. Short, restrained transitions preserve the clarity of the composition.',
    applications: ['Architecture studios', 'Professional practices', 'Design-led businesses'],
    palette: [['White','#ffffff'],['Ink','#121212'],['Signal','#e32922'],['Mist','#eeeeeb']],
    specimen: 'Clarity.\nCharacter.\nConviction.', typeLabel: 'ONE TYPE FAMILY / CONTRASTING SCALES',
    live: '/studies/swiss/experience/', world: 'swiss',
  },
  {
    slug: 'hackerlair', number: '03', name: 'Hackerlair', label: 'TERMINAL / HUMAN / EXPERIMENTAL',
    headline: 'Human input.\nStrange output.',
    summary: 'A working terminal workspace: open a file, read the studio, and explore photographs rendered as character fields.',
    question: 'Can a technical interface have an unmistakably human presence?',
    concept: 'Treat the agency as an open directory. Read capabilities, explore design studies, compare project scopes, and prepare a brief through named documents. A photograph becomes a field of characters beside the text, bringing a human presence into the terminal language.',
    layout: 'Three bordered panes organise the workspace: a file explorer, a scrollable document, and a live ASCII inspector. A command prompt and keyboard reference sit below. File links and commands open the same documents; the panes simplify into a compact document interface on smaller screens.',
    typography: 'JetBrains Mono carries the entire interface, from Markdown headings to filenames, prompts, and utility labels. Weight, spacing, syntax marks, and restrained scale changes create hierarchy within one monospaced family.',
    motion: 'Image luminance is sampled into a live ASCII canvas. The artwork changes with the open file; slow character drift and a local pointer ripple disturb its surface. Rendering rests offscreen and with reduced motion. Working commands, keyboard shortcuts, and a palette switch make the terminal an interface you can use.',
    applications: ['Developer tools', 'Experimental studios', 'Technology & digital culture'],
    palette: [['Terminal','#080c0a'],['Phosphor','#b6ff89'],['Lilac','#c29dff'],['Muted','#80917d']],
    specimen: '# Human input.\nStrange output_', typeLabel: 'ONE MONOSPACED FAMILY / DOCUMENT + INTERFACE',
    live: '/studies/hackerlair/experience/', world: 'hackerlair',
  },
  {
    slug: 'weird-internet', number: '04', name: 'The Weird Internet', label: 'NOSTALGIA / OBJECTS / DISCOVERY',
    headline: 'The internet\nshould be weirder.',
    summary: 'A working desktop full of windows, odd objects, and memories of a more personal internet.',
    question: 'What if exploring a studio felt like exploring someone’s computer?',
    concept: 'Reframe the website as a desktop you can inhabit. A retro operating system opens into a world of vintage hardware, photocopied imagery, expressive type, and independent design. Nostalgia becomes an invitation to explore.',
    layout: 'Movable windows, a taskbar, an application menu, and a changing desktop replace the usual section stack. Inside the windows, loose editorial compositions give the artwork room to breathe.',
    typography: 'System-like interface lettering surrounds bold condensed headlines and handwritten marginalia. The desktop and the documents each have a voice, held together by a shared sense of curiosity.',
    motion: 'Open, move, resize, minimise, and revisit windows. A working notepad and display settings make the world tangible. Familiar behaviours help visitors navigate the unexpected composition.',
    applications: ['Artist portfolios', 'Interactive campaigns', 'Digital exhibitions'],
    palette: [['Desktop','#245edb'],['Paper','#f2efe6'],['Vermilion','#ed3523'],['Ink','#171717']],
    specimen: 'Less ordinary.\nMore you.', typeLabel: 'SYSTEM LETTERING + EXPRESSIVE EDITORIAL TYPE',
    live: '/weird-internet/', world: 'weird-internet',
  },
] as const;

export type DesignStudy = typeof designStudies[number];

const collageAssets: Record<string, {src:string;alt:string}> = {
  '/images/cybercore-forme-scan.webp': {src:'/images/forme.webp',alt:'A sculptural silver handbag on cobalt paper with red satin and torn cutouts'},
  '/images/cybercore-object-wireframe.webp': {src:'/images/object.webp',alt:'A chrome chair and green lamp inside an architectural paper collage'},
  '/images/crt-foil.webp': {src:'/images/collage-playground.webp',alt:'A handmade collage of a clay eye, a paper hand, and primary-colour shapes'},
  '/images/crt-eye.webp': {src:'/images/collage-playground.webp',alt:'A clay eye and a smiling paper hand inside a colourful collage'},
};
export function studyImage(src:string, alt:string, world:string) {
  return world==='collage' ? collageAssets[src] || {src,alt} : {src,alt};
}
