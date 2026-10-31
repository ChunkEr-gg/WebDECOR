// Generates the smaller responsive copies referenced by srcset on the main site.
// Run after replacing a source image: node scripts/make-image-variants.mjs
import sharp from 'sharp';
const variants = {
  'crt-foil': [480], 'crt-eye': [480], 'crt-moon': [640],
  'cybercore-forme-scan': [800], 'cybercore-object-wireframe': [800],
  forme: [800], object: [800], 'collage-playground': [640],
};
for (const [name, widths] of Object.entries(variants)) {
  for (const width of widths) {
    const out = `public/images/${name}-${width}.webp`;
    await sharp(`public/images/${name}.webp`).resize({ width }).webp({ quality: 78 }).toFile(out);
    console.log(out);
  }
}
