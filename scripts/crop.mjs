// 옛 홈페이지 배너(글자가 박힌 큰 PNG)에서 사진 부분만 잘라 webp 로 저장한다.
// 사용법: node scripts/crop.mjs scripts/crops/<이름>.json
// spec: [{ "src": "원본파일명", "key": "orig/<slug>", "box": [x0,y0,x1,y1], "alt": "사진 설명" }]
//   - box 는 원본 크기 대비 0~1 비율
//   - 결과: public/img/<key>.webp, 검수 시트 C:/tmp/crops/<이름>-sheet.jpg
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ORIG = 'C:/Users/FORYOUCOM/Desktop/dental-builder/jobs/09cb870aa8fd/img';
const OUT = path.resolve('public/img');
const SHEET_DIR = 'C:/tmp/crops';
const MIN_WIDTH = 500;

const specPath = process.argv[2];
if (!specPath) {
  console.error('usage: node scripts/crop.mjs scripts/crops/<name>.json');
  process.exit(1);
}
const name = path.basename(specPath, '.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
if (!Array.isArray(spec) || spec.length === 0) {
  console.error('spec 이 비어 있다:', specPath);
  process.exit(1);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 검수 시트 배치
const TW = 480, TH = 320, LABEL = 26, GAP = 10, COLS = 4;
const tiles = [];
const results = [];
fs.mkdirSync(SHEET_DIR, { recursive: true });

for (let i = 0; i < spec.length; i++) {
  const it = spec[i];
  const src = path.join(ORIG, it.src);
  if (!fs.existsSync(src)) throw new Error(`원본 없음: ${src}`);
  const meta = await sharp(src).metadata();
  const [bx0, by0, bx1, by1] = it.box.map(clamp01);
  const left = Math.round(bx0 * meta.width);
  const top = Math.round(by0 * meta.height);
  const width = Math.round(bx1 * meta.width) - left;
  const height = Math.round(by1 * meta.height) - top;
  if (width <= 0 || height <= 0) throw new Error(`box 가 뒤집혔다: ${it.key} ${JSON.stringify(it.box)}`);

  const outFile = path.join(OUT, `${it.key}.webp`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const cropBuf = await sharp(src).extract({ left, top, width, height }).png().toBuffer();
  await sharp(cropBuf).webp({ quality: 84 }).toFile(outFile);

  const warn = width < MIN_WIDTH ? `  <-- 폭 ${MIN_WIDTH}px 미만` : '';
  console.log(`${it.key}  ${width}x${height}  <- ${it.src} @[${left},${top}]${warn}`);
  results.push({ key: it.key, width, height, src: it.src, alt: it.alt ?? '' });

  // 시트 타일 — 흰 여백이 들어갔는지 보이도록 회색 바탕 위에 올린다
  const thumb = await sharp(cropBuf).resize(TW, TH, { fit: 'inside' }).png().toBuffer();
  const tm = await sharp(thumb).metadata();
  const col = i % COLS, row = Math.floor(i / COLS);
  const cx = GAP + col * (TW + GAP), cy = GAP + row * (TH + LABEL + GAP);
  const label = Buffer.from(
    `<svg width="${TW}" height="${LABEL}"><rect width="${TW}" height="${LABEL}" fill="#111"/>` +
    `<text x="4" y="18" font-size="13" fill="#fff" font-family="sans-serif">${i + 1}. ${esc(it.key)} ${width}x${height}${width < MIN_WIDTH ? ' !!' : ''}</text></svg>`,
  );
  tiles.push({ input: label, left: cx, top: cy });
  tiles.push({ input: thumb, left: cx + Math.floor((TW - tm.width) / 2), top: cy + LABEL + Math.floor((TH - tm.height) / 2) });
}

const rows = Math.ceil(spec.length / COLS);
const sheetPath = path.join(SHEET_DIR, `${name}-sheet.jpg`);
await sharp({
  create: { width: GAP + COLS * (TW + GAP), height: GAP + rows * (TH + LABEL + GAP), channels: 3, background: '#b8b8b8' },
})
  .composite(tiles)
  .jpeg({ quality: 86 })
  .toFile(sheetPath);

console.log(`\n${results.length}장 -> ${OUT}  시트: ${sheetPath}`);
