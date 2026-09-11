/* 글별 사진 한눈에 — 번호 붙인 썸네일 격자(표지 고르기용). 실행: node scripts/contact-sheet.mjs → C:/tmp/sheets/<slug>.jpg */
import fs from 'node:fs';
import sharp from 'sharp';
const IMG_DIR = 'public/img/clinical';
const OUT = 'C:/tmp/sheets';
fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.webp')).sort();
const bySlug = {};
for (const f of files) (bySlug[f.replace(/-\d\d\.webp$/, '')] ??= []).push(f);
const W = 300, H = 200, COLS = 4;
for (const [slug, list] of Object.entries(bySlug)) {
  const rows = Math.ceil(list.length / COLS);
  const comps = [];
  for (let i = 0; i < list.length; i++) {
    const thumb = await sharp(`${IMG_DIR}/${list[i]}`).resize(W, H, { fit: 'cover' }).toBuffer();
    const x = (i % COLS) * (W + 10), y = Math.floor(i / COLS) * (H + 10);
    comps.push({ input: thumb, left: x, top: y });
    const n = list[i].match(/-(\d\d)\.webp$/)[1];
    const label = Buffer.from(`<svg width="60" height="34"><rect width="60" height="34" rx="6" fill="#f26f1e"/><text x="30" y="24" font-size="22" font-weight="700" fill="#fff" text-anchor="middle" font-family="Arial">${n}</text></svg>`);
    comps.push({ input: label, left: x + 6, top: y + 6 });
  }
  await sharp({ create: { width: COLS * (W + 10), height: rows * (H + 10), channels: 3, background: '#222' } }).composite(comps).jpeg({ quality: 80 }).toFile(`${OUT}/${slug}.jpg`);
  console.log(slug, list.length);
}
