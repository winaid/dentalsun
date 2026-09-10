/**
 * 첫 화면(히어로) 전폭 사진 — 오너가 준 실사(sega8074)에서 16:9 띠를 잘라 넣는다.
 * 사람 얼굴·무영등이 위쪽에 있어 위에서 조금만 잘라 낸다.
 */
import fs from 'node:fs';
import sharp from 'sharp';

const SRC = 'C:/Users/FORYOUCOM/Desktop/sega8074';
const OUT = 'public/img/sun';
const W = 2560;

/** key: [파일, 잘라 낼 띠의 위쪽 y] — 원본 5760x3840, 띠 높이 3240(16:9) */
const JOBS = {
  'hero-surgery': ['SEGA8085.jpg', 180],
  'hero-scan': ['SEGA8023.jpg', 120],
  'hero-loupe': ['SEGA8105.jpg', 260],
};

const sizesPath = 'lib/imageSizes.generated.json';
const sizes = JSON.parse(fs.readFileSync(sizesPath, 'utf8'));

for (const [key, [file, top]] of Object.entries(JOBS)) {
  const src = `${SRC}/${file}`;
  const meta = await sharp(src).metadata();
  const bandH = Math.round((meta.width * 9) / 16);
  const t = Math.min(Math.max(0, top), meta.height - bandH);
  const info = await sharp(src)
    .extract({ left: 0, top: t, width: meta.width, height: bandH })
    .resize({ width: W })
    .webp({ quality: 76 })
    .toFile(`${OUT}/${key}.webp`);
  sizes[`sun/${key}`] = { w: info.width, h: info.height };
  console.log(key, file, `${meta.width}x${meta.height}`, '->', `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}KB`);
}

fs.writeFileSync(sizesPath, JSON.stringify(sizes, null, 1));
console.log('sizes updated');
