/** scripts/crops/*.sizes.json + public/img/{orig,cases}/*.webp 를 lib/imageSizes.generated.json 에 합친다. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const target = 'lib/imageSizes.generated.json';
const sizes = JSON.parse(fs.readFileSync(target, 'utf8'));
let n = 0;
for (const dir of ['orig', 'cases']) {
  const d = `public/img/${dir}`;
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter((f) => f.endsWith('.webp'))) {
    const key = `${dir}/${path.basename(f, '.webp')}`;
    const m = await sharp(path.join(d, f)).metadata();
    if (!sizes[key] || sizes[key].w !== m.width || sizes[key].h !== m.height) n++;
    sizes[key] = { w: m.width, h: m.height };
  }
}
fs.writeFileSync(target, JSON.stringify(sizes, null, 1) + '\n');
console.log('merged', n, 'total', Object.keys(sizes).length);
