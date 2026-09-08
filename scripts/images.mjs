/**
 * 원본 홈페이지 이미지 → 새 사이트용 사진.
 * 원본 배너는 글자가 그림 안에 박혀 있어서, 글자가 없는 사진 부분만 잘라 쓴다.
 * 좌표는 원본 폭·높이에 대한 비율 [x0, y0, x1, y1]. 바꾸면 node scripts/images.mjs 로 다시 만든다.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const JOB = 'C:/Users/FORYOUCOM/Desktop/dental-builder/jobs/09cb870aa8fd/img';
const OUT = 'public/img';
const CROPS = {
  // 의료진
  'doctors/yang': ['dental_intro02.png', [0.0, 0.0, 0.5, 1.0], 1200, [4, 5], true],
  'doctors/hong': ['dental_intro03.png', [0.1, 0.02, 0.55, 1.0], 1200, [4, 5], true],
  // 진료 장면 (사진)
  'scene/surgery': ['jaw-join-treatment01_new.png', [0.56, 0.0, 1.0, 1.0], 1600],
  'scene/loupe': ['main01.png', [0.5, 0.0, 1.0, 1.0], 1400],
  'scene/endo': ['neurotherapy01.png', [0.5, 0.0, 1.0, 1.0], 1400],
  'scene/endosonic': ['cleaner01.png', [0.55, 0.0, 1.0, 1.0], 1400],
  'scene/nopain': ['analgesic_anesthetic02.png', [0.55, 0.0, 1.0, 1.0], 1400],
  'scene/wisdom': ['wisdom_teeth1.png', [0.02, 0.12, 0.24, 0.93], 1200],
  'scene/denture': ['1.png', [0.0, 0.0, 0.62, 1.0], 1400],
  'scene/consult': ['main04.png', [0.74, 0.0, 1.0, 1.0], 1000],
  'scene/patient': ['main04.png', [0.0, 0.0, 0.22, 1.0], 1000],
  'scene/sterile': ['main06.png', [0.78, 0.0, 1.0, 1.0], 1000],
  'scene/sterile2': ['main06.png', [0.0, 0.0, 0.2, 1.0], 1000],
  'scene/tmj-1': ['jaw-join-treatment02.png', [0.05, 0.35, 0.33, 0.72], 1000],
  'scene/tmj-2': ['jaw-join-treatment02.png', [0.35, 0.35, 0.63, 0.72], 1000],
  'scene/tmj-3': ['jaw-join-treatment02.png', [0.65, 0.35, 0.95, 0.72], 1000],
  'scene/tmj-sym-1': ['jaw-join-treatment04.png', [0.17, 0.22, 0.36, 0.72], 800],
  'scene/tmj-sym-2': ['jaw-join-treatment04.png', [0.39, 0.22, 0.58, 0.72], 800],
  'scene/tmj-sym-3': ['jaw-join-treatment04.png', [0.61, 0.22, 0.81, 0.72], 800],
  'scene/intro-1': ['dental_intro01.png', [0.48, 0.05, 0.82, 0.5], 1200],
  'scene/intro-2': ['dental_intro01.png', [0.05, 0.52, 0.42, 0.96], 1200],
  'scene/sleep': ['sleep01.png', [0.55, 0.0, 1.0, 1.0], 1200],
  'scene/smile': ['making_teeth1.png', [0.55, 0.45, 1.0, 1.0], 1200],
  'scene/xray-wisdom': ['wisdom_teeth2.png', [0.03, 0.12, 0.26, 0.93], 1000],
  // 장비
  'equip/laser': ['jaw-join-treatment06.png', [0.02, 0.05, 0.2, 0.95], 900],
  'equip/laser-room': ['jaw-join-treatment06.png', [0.78, 0.0, 1.0, 1.0], 900],
  'equip/ct': ['jaw-join-treatment07.png', [0.0, 0.0, 0.22, 1.0], 900],
  'equip/ct-3d': ['jaw-join-treatment07.png', [0.76, 0.0, 1.0, 1.0], 900],
  'equip/scanner': ['dental_intro04.png', [0.0, 0.62, 0.9, 1.0], 1400],
  'equip/ct2': ['dental_intro05.png', [0.0, 0.0, 0.24, 1.0], 900],
  'equip/planning': ['dental_intro06.png', [0.0, 0.52, 1.0, 0.96], 1600],
  'equip/guide': ['dental_intro07.png', [0.3, 0.45, 0.72, 1.0], 1000],
  'equip/printer': ['dental_intro08.png', [0.05, 0.45, 0.95, 1.0], 1400],
  'equip/airflow': ['scaler01.png', [0.5, 0.0, 1.0, 1.0], 1000],
  'equip/airflow-4': ['scaler02.png', [0.05, 0.42, 0.95, 0.98], 1400],
  'equip/painless-set': ['analgesic_anesthetic01.png', [0.0, 0.45, 0.3, 1.0], 900],
  'equip/gbt': ['teethbanner.png', [0.5, 0.05, 0.9, 0.95], 1000],
  'equip/gel': ['add_img_1.png', [0.05, 0.4, 0.95, 0.92], 1200],
  // 임플란트
  'implant/navigation': ['implant02.png', [0.55, 0.0, 1.0, 1.0], 1000],
  'implant/process-4': ['implant03.png', [0.08, 0.4, 0.92, 0.98], 1400],
  'implant/allinone-4': ['implant03-2.png', [0.1, 0.2, 0.9, 1.0], 1400],
  'implant/uv': ['1-1.png', [0.5, 0.05, 1.0, 0.8], 800],
  'implant/prf': ['1-2.png', [0.55, 0.0, 1.0, 0.85], 800],
  'implant/custom': ['1-3.png', [0.6, 0.05, 1.0, 0.85], 800],
  'implant/fullarch-model': ['2-2.png', [0.0, 0.42, 0.42, 0.92], 800],
  'implant/fullarch-4': ['full_arch_implant02.png', [0.08, 0.22, 0.92, 0.95], 1400],
  // 턱관절·기타 도해
  'tmj/splint': ['4-1.png', [0.0, 0.5, 0.4, 0.9], 800],
  'tmj/skull': ['4-1.png', [0.6, 0.45, 1.0, 0.9], 800],
  'tmj/jaw': ['jaw-join-treatment03.png', [0.0, 0.0, 0.2, 1.0], 800],
  'illust/tooth-mta': ['5-1.png', [0.15, 0.35, 0.85, 0.85], 800],
  'illust/aesthetic': ['5-2.png', [0.0, 0.45, 1.0, 0.85], 800],
  'illust/wisdom': ['5-3.png', [0.0, 0.45, 1.0, 0.85], 800],
  'illust/airflow-device': ['4-2.png', [0.0, 0.55, 0.45, 1.0], 800],
  'aesthetic/laminate': ['making_teeth2.png', [0.04, 0.12, 0.33, 0.88], 900],
  'aesthetic/allceramic': ['making_teeth3.png', [0.67, 0.14, 0.96, 0.9], 900],
  'aesthetic/zirconia': ['making_teeth4.png', [0.04, 0.12, 0.33, 0.9], 900],
  'aesthetic/whitening': ['making_teeth7.png', [0.04, 0.12, 0.33, 0.9], 900],
  'aesthetic/prosth-cases': ['making_teeth6.png', [0.05, 0.15, 0.95, 1.0], 1400],
  'aesthetic/whitening-cases': ['making_teeth9.png', [0.08, 0.15, 0.92, 1.0], 1400],
  'wisdom/steps': ['wisdom_teeth5.png', [0.03, 0.05, 0.97, 0.8], 1400],
  'wisdom/case': ['wisdom_teeth4.png', [0.02, 0.12, 0.98, 0.72], 1400],
};
const FULL = {
  'place/place01': 'place01.JPG', 'place/place02': 'place02.JPG', 'place/place03': 'place03.JPG', 'place/place04': 'place04.JPG', 'place/place05': 'place05.JPG',
  'place/place06': 'place06.JPG', 'place/place07': 'place07.JPG', 'place/place08': 'place08.JPG', 'place/place09': 'place09.JPG', 'place/place10': 'place10.JPG',
  'video/you-1': 'you-1.png', 'video/you-2': 'you-2.png', 'video/you-3': 'you-3.png', 'video/you-4': 'you-4.png',
  'notice/2026-09': '8_test.png',
};
const sizes = {};
async function crop(key, file, box, maxW, ratio, trim) {
  const src = path.join(JOB, file);
  const meta = await sharp(src).metadata();
  const [x0, y0, x1, y1] = box;
  const left = Math.round(meta.width * x0), top = Math.round(meta.height * y0);
  const width = Math.min(Math.round(meta.width * (x1 - x0)), meta.width - left), height = Math.min(Math.round(meta.height * (y1 - y0)), meta.height - top);
  const out = path.join(OUT, key + '.webp');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  /* trim: 배너 속 사진 둘레의 흰 여백을 잘라낸다(의료진 사진). extract 뒤 새 인스턴스에서 해야 영역 오류가 없다. */
  const region = trim ? await sharp(await sharp(src).extract({ left, top, width, height }).png().toBuffer()).trim({ threshold: 24 }).png().toBuffer() : null;
  const pipe = region ? sharp(region) : sharp(src).extract({ left, top, width, height });
  const info = ratio
    ? await pipe.resize({ width: Math.min(maxW, width), height: Math.round((Math.min(maxW, width) * ratio[1]) / ratio[0]), fit: 'cover', position: 'top' }).webp({ quality: 82 }).toFile(out)
    : await pipe.resize({ width: Math.min(maxW, width), withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  sizes[key] = { w: info.width, h: info.height };
}
for (const [key, [file, box, maxW, ratio, trim]] of Object.entries(CROPS)) { try { await crop(key, file, box, maxW, ratio, trim); } catch (e) { console.error('FAIL', key, file, e.message); } }
for (const [key, file] of Object.entries(FULL)) {
  const out = path.join(OUT, key + '.webp');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const info = await sharp(path.join(JOB, file)).rotate().resize({ width: key.startsWith('notice') ? 1024 : 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  sizes[key] = { w: info.width, h: info.height };
}
// 로고: 해 마크만 따로(머리말 다크 배경용), 전체 로고는 그대로
fs.mkdirSync(path.join(OUT, 'brand'), { recursive: true });
await sharp(path.join(JOB, 'logo.png')).toFile(path.join(OUT, 'brand/logo.png'));
const lm = await sharp(path.join(JOB, 'logo.png')).metadata();
await sharp(path.join(JOB, 'logo.png')).extract({ left: 0, top: 0, width: Math.round(lm.width * 0.215), height: lm.height }).png().toFile(path.join(OUT, 'brand/mark.png'));
const prev = fs.existsSync('lib/imageSizes.generated.json') ? JSON.parse(fs.readFileSync('lib/imageSizes.generated.json', 'utf8')) : {};
for (const [k, v] of Object.entries(prev)) if (k.startsWith('ai/') && !sizes[k]) sizes[k] = v;
fs.writeFileSync('lib/imageSizes.generated.json', JSON.stringify(sizes, null, 1));
console.log('images', Object.keys(sizes).length);
// 결과 확인용 시트
const keys = Object.keys(sizes);
const W = 380, H = 240, COLS = 5, ROWS = 4, PER = COLS * ROWS;
fs.mkdirSync('C:/tmp/sun-sheets/out', { recursive: true });
for (let s = 0; s * PER < keys.length; s++) {
  const chunk = keys.slice(s * PER, (s + 1) * PER);
  const tiles = [];
  for (let i = 0; i < chunk.length; i++) {
    const buf = await sharp(path.join(OUT, chunk[i] + '.webp')).resize(W, H, { fit: 'inside' }).png().toBuffer();
    const label = Buffer.from(`<svg width="${W}" height="22"><rect width="${W}" height="22" fill="#111"/><text x="4" y="16" font-size="13" fill="#fff" font-family="sans-serif">${chunk[i]} ${sizes[chunk[i]].w}x${sizes[chunk[i]].h}</text></svg>`);
    tiles.push({ input: buf, left: (i % COLS) * (W + 6) + 3, top: Math.floor(i / COLS) * (H + 28) + 25 }, { input: label, left: (i % COLS) * (W + 6) + 3, top: Math.floor(i / COLS) * (H + 28) + 3 });
  }
  await sharp({ create: { width: COLS * (W + 6), height: ROWS * (H + 28) + 3, channels: 3, background: '#fff' } }).composite(tiles).jpeg({ quality: 80 }).toFile(`C:/tmp/sun-sheets/out/out${s + 1}.jpg`);
}
console.log('sheets done');
