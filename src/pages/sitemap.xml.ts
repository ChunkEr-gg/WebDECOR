import type { APIRoute } from 'astro';
import { studies } from '../data/agency';
import { designStudies } from '../data/design-studies';

const experienceWorlds = ['collage', 'swiss', 'hackerlair'];

export const GET: APIRoute = ({ site }) => {
  const paths = [
    '/', '/services/', '/studio/', '/start/', '/explore/',
    ...studies.map(study => `/work/${study.slug}/`),
    ...designStudies.map(study => `/studies/${study.slug}/`),
    ...designStudies.filter(study => experienceWorlds.includes(study.world)).map(study => `/studies/${study.slug}/experience/`),
    '/weird-internet/', '/weird-internet/services/', '/weird-internet/studio/', '/weird-internet/start/',
    ...studies.map(study => `/weird-internet/work/${study.slug}/`),
  ];
  const urls = paths.map(path => `  <url><loc>${new URL(path, site)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
