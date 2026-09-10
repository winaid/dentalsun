/**
 * 옛 홈페이지 배너에서 잘라 온 조각 다시 자르기 — 사진 덩어리만 남긴다.
 *
 * 왜: 손으로 잡은 비율 상자가 어긋나 흰 여백·남색 테두리·잘린 글자가 같이 들어왔다(오너 지적).
 * 어떻게: 배너에서 '잉크가 꽉 찬 칸'만 고른다.
 *   · 세로줄마다 흰색이 아닌 픽셀 비율을 재고, 비율이 높은 칸이 이어지는 구간 중 가장 넓은 곳이 사진이다.
 *   · 테두리 선(2~3px)이나 글줄은 비율이 낮거나 폭이 좁아 걸러진다.
 *   · 찾은 구간 안에서 같은 방법으로 위아래를 자른다.
 *
 * 실행:  node scripts/refit-crops.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const JOB = 'C:/Users/FORYOUCOM/Desktop/dental-builder/jobs/09cb870aa8fd/img';
const OUT = 'public/img';
const SIZES = 'lib/imageSizes.generated.json';

/** 자동 탐지가 안 되는 것(사진 바탕이 거의 흰색이라 잉크 비율이 낮다)은 상자를 손으로 준다 — 비율 [왼,위,오른,아래] */
const MANUAL = {
  'aesthetic/allceramic': [0.556, 0.2, 0.83, 0.97],
  'aesthetic/zirconia': [0.155, 0.055, 0.463, 0.62],
  /* 배너에 얹힌 글자를 물지 않도록 사진 덩어리만 */
  'implant/fullarch-model': [0.0, 0.45, 0.35, 0.93],
  'illust/airflow-device': [0.0, 0.47, 0.34, 0.97],
  'tmj/jaw': [0.0, 0.0, 0.52, 1.0],
};

/** key: [배너 파일, 사진을 찾을 대략의 영역(왼쪽·오른쪽 비율), 내보낼 최대 폭] */
const JOBS = {
  'aesthetic/laminate': ['making_teeth2.png', [0.0, 0.5], 900],
  'aesthetic/allceramic': ['making_teeth3.png', [0.5, 1.0], 900],
  'aesthetic/zirconia': ['making_teeth4.png', [0.0, 0.5], 900],
  'aesthetic/whitening': ['making_teeth7.png', [0.0, 0.5], 900],
  'implant/fullarch-model': ['2-2.png', [0.0, 0.5], 800],
  'illust/airflow-device': ['4-2.png', [0.0, 0.5], 800],
  'tmj/jaw': ['jaw-join-treatment03.png', [0.0, 0.5], 1000],
};

const dry = process.argv.includes('--dry');

/** 흰색이 아닌 픽셀의 비율을 세로줄·가로줄마다 잰다 */
async function inkProfile(img, box) {
  const { data, info } = await sharp(img).extract(box).greyscale().raw().toBuffer({ resolveWithObject: true });
  const cols = new Array(info.width).fill(0);
  const rows = new Array(info.height).fill(0);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] < 235) {
        cols[x]++;
        rows[y]++;
      }
    }
  }
  return { cols: cols.map((v) => v / info.height), rows: rows.map((v) => v / info.width), info };
}

/** 비율이 threshold 를 넘는 구간 중 가장 긴 곳 (최소 길이 minLen) */
function widestRun(profile, threshold, minLen) {
  let best = null;
  let start = -1;
  for (let i = 0; i <= profile.length; i++) {
    const on = i < profile.length && profile[i] >= threshold;
    if (on && start < 0) start = i;
    if (!on && start >= 0) {
      const len = i - start;
      if (len >= minLen && (!best || len > best.len)) best = { start, len };
      start = -1;
    }
  }
  return best;
}

const sizes = JSON.parse(fs.readFileSync(SIZES, 'utf8'));
for (const [key, [file, [l, r], maxW]] of Object.entries(JOBS)) {
  const src = path.join(JOB, file);
  const meta = await sharp(src).metadata();
  const box = { left: Math.round(meta.width * l), top: 0, width: Math.round(meta.width * (r - l)), height: meta.height };
  if (MANUAL[key]) {
    const [ml, mt, mr, mb] = MANUAL[key];
    const man = { left: Math.round(meta.width * ml), top: Math.round(meta.height * mt), width: Math.round(meta.width * (mr - ml)), height: Math.round(meta.height * (mb - mt)) };
    console.log(key, file, '(손으로 지정)', `${man.left},${man.top} ${man.width}x${man.height}`);
    if (!dry) {
      const info = await sharp(src).extract(man).resize({ width: Math.min(maxW, man.width) }).webp({ quality: 84 }).toFile(path.join(OUT, `${key}.webp`));
      sizes[key] = { w: info.width, h: info.height };
    }
    continue;
  }
  const { cols } = await inkProfile(src, box);
  const cRun = widestRun(cols, 0.45, Math.round(box.width * 0.12));
  if (!cRun) {
    console.log('SKIP(가로 못 찾음)', key);
    continue;
  }
  const inner = { left: box.left + cRun.start, top: 0, width: cRun.len, height: meta.height };
  const { rows } = await inkProfile(src, inner);
  const rRun = widestRun(rows, 0.5, Math.round(meta.height * 0.1));
  if (!rRun) {
    console.log('SKIP(세로 못 찾음)', key);
    continue;
  }
  const final = { left: inner.left, top: rRun.start, width: inner.width, height: rRun.len };
  console.log(key, file, `${final.left},${final.top} ${final.width}x${final.height}`);
  if (dry) continue;
  const out = path.join(OUT, `${key}.webp`);
  const info = await sharp(src).extract(final).resize({ width: Math.min(maxW, final.width) }).webp({ quality: 84 }).toFile(out);
  sizes[key] = { w: info.width, h: info.height };
}
if (!dry) {
  fs.writeFileSync(SIZES, JSON.stringify(sizes, null, 1));
  console.log('sizes 갱신');
}
