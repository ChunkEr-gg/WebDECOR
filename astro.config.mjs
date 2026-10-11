import { defineConfig } from 'astro/config';

const legacyPaths = [
  ['/chrome', '/'],
  ['/cybercore', '/'],
  ['/cybercore/services', '/services/'],
  ['/cybercore/studio', '/studio/'],
  ['/cybercore/start', '/start/'],
  ['/cybercore/work/forme', '/work/forme/'],
  ['/cybercore/work/object', '/work/object/'],
  ['/underground', '/weird-internet/'],
  ['/underground/services', '/weird-internet/services/'],
  ['/underground/studio', '/weird-internet/studio/'],
  ['/underground/start', '/weird-internet/start/'],
  ['/underground/work/forme', '/weird-internet/work/forme/'],
  ['/underground/work/object', '/weird-internet/work/object/'],
  ['/collage', '/studies/collage/experience/'],
];
const redirects = Object.fromEntries(legacyPaths);

export default defineConfig({
  output: 'static',
  redirects,
  site: 'https://webdecor-studio.webdecor-1069.chatgpt.site',
});
