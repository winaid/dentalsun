// 원본 이미지 목록을 한 장짜리 미리보기(contact sheet)로 — 무엇을 어디에 쓸지 눈으로 고르기 위해
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const JOB = 'C:/Users/FORYOUCOM/Desktop/dental-builder/jobs/09cb870aa8fd';
const images = JSON.parse(fs.readFileSync(path.join(JOB, 'images.json'), 'utf8'));
const skip = /(_m|-m|_mo)\.(png|jpg)$|^(quickScrollMenu|m-icon|top-btn|home-icon|phone-icon|logo|add\.png|배너|8_test|implant07-[12])/i;
const list = images.filter((i) => !skip.test(i.file));
const W = 470, H = 300, COLS = 4, ROWS = 3, PER = COLS * ROWS;
fs.mkdirSync('C:/tmp/sun-sheets', { recursive: true });
for (let s = 0; s * PER < list.length; s++) {
  const chunk = list.slice(s * PER, (s + 1) * PER);
  const tiles = [];
  for (let i = 0; i < chunk.length; i++) {
    const im = chunk[i];
    const buf = await sharp(path.join(JOB, 'img', im.file)).resize(W, H, { fit: 'inside', background: '#eee' }).png().toBuffer();
    const meta = await sharp(buf).metadata();
    const label = Buffer.from(`<svg width="${W}" height="24"><rect width="${W}" height="24" fill="#111"/><text x="4" y="17" font-size="14" fill="#fff" font-family="sans-serif">${i + 1 + s * PER}. ${im.file} ${im.width}x${im.height}</text></svg>`);
    tiles.push({ input: buf, left: (i % COLS) * (W + 8) + 4, top: Math.floor(i / COLS) * (H + 32) + 28 });
    tiles.push({ input: label, left: (i % COLS) * (W + 8) + 4, top: Math.floor(i / COLS) * (H + 32) + 4 });
  }
  await sharp({ create: { width: COLS * (W + 8), height: ROWS * (H + 32) + 4, channels: 3, background: '#fff' } }).composite(tiles).jpeg({ quality: 80 }).toFile(`C:/tmp/sun-sheets/sheet${s + 1}.jpg`);
  console.log('sheet', s + 1, chunk.map((c, i) => `${i + 1 + s * PER}:${c.file}`).join(' '));
}
