/**
 * 카드 규격(3:2)에 안 맞는 세로 사진을 3:2 로 다시 만든다 — public/img/fit/*.webp
 *
 * 왜: 카드 사진 상자는 3:2 인데 원본이 세로(0.8~1.0)라 통째로 넣으면 옆이 절반 가까이 비고,
 *     잘라 넣으면 얼굴이나 장비가 잘렸다(오너 지적, 2026-09-10).
 *
 * 두 가지 방식
 *  · crop  — 사람이 나오는 진료 장면. sharp 의 attention 전략이 가장 '볼거리' 있는 자리를 골라 3:2 로 자른다
 *            (얼굴·손이 잘려 나가지 않는다). 사진이 상자를 꽉 채운다.
 *  · pad   — 배경이 있는 제품 사진. 원본을 그대로 가운데 놓고, 뒤에는 같은 사진을 흐리게 깔아 3:2 를 채운다.
 *            장비가 잘리지 않으면서도 흰(또는 회색) 여백이 생기지 않는다.
 *
 * 실행: node scripts/fit-3x2.mjs  (사이즈 표 lib/imageSizes.generated.json 도 함께 갱신)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BASE_W = 1100; /* 1200 미만 — 이 값을 넘으면 DocPage 가 첫 화면 배경으로도 쓴다(카드만 바꾸려는 것) */
const BASE_H = 733;

/**
 * [원본 키, 방식, 자를 위치, 가로세로, 새 이름] — 결과는 fit/<이름>.webp.
 * 위치를 안 주면 attention(볼거리 우선), 가로세로를 안 주면 3:2.
 */
const JOBS = [
  ['orig/airflow-device', 'pad'],
  ['orig/sleep-hero', 'crop'],
  /* 원장이 서서 진료하는 사진은 머리가 위에 있어 위쪽 기준으로 자른다 — attention 은 손만 남기고 얼굴을 잘랐다 */
  ['orig/tmj-hero', 'crop', 'north'],
  ['orig/pain-hero', 'crop', 'north'],
  /* 턱관절 장비 두 대 — 원본이 아주 긴 세로(0.43·0.52)라 회색 상자에 작게 떠 있었다. 3:4 로 배경을 이어 붙인다 */
  ['equip/laser', 'pad', null, 3 / 4, 'tmj-laser'],
  ['equip/ct-3d', 'pad', null, 3 / 4, 'tmj-ct3d'],
];

const outDir = 'public/img/fit';
fs.mkdirSync(outDir, { recursive: true });

const sizes = JSON.parse(fs.readFileSync('lib/imageSizes.generated.json', 'utf8'));

/** 사진 네 귀퉁이 평균색 — 배경이 한 가지 색인 제품 사진이면 그 색으로 채워야 이어 붙인 자국이 안 남는다 */
async function edgeColor(src) {
  const { data } = await sharp(src).resize(24, 24, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => [data[(y * 24 + x) * 3], data[(y * 24 + x) * 3 + 1], data[(y * 24 + x) * 3 + 2]];
  const corners = [px(0, 0), px(23, 0), px(0, 23), px(23, 23)];
  const avg = [0, 1, 2].map((c) => Math.round(corners.reduce((s, p) => s + p[c], 0) / corners.length));
  /* 네 귀퉁이가 서로 비슷하면 '한 가지 색 배경' 으로 본다 */
  const spread = Math.max(...[0, 1, 2].map((c) => Math.max(...corners.map((p) => p[c])) - Math.min(...corners.map((p) => p[c]))));
  return { rgb: { r: avg[0], g: avg[1], b: avg[2] }, flat: spread < 26 };
}

for (const [key, mode, position, ratio, rename] of JOBS) {
  const src = `public/img/${key}.webp`;
  const name = rename ?? path.basename(key);
  const out = `${outDir}/${name}.webp`;
  /* 세로로 긴 상자는 폭을 기준으로 잡는다 — 1200 을 넘으면 DocPage 가 첫 화면 배경으로도 쓴다 */
  const [W, H] = ratio ? [900, Math.round(900 / ratio)] : [BASE_W, BASE_H];

  if (mode === 'crop') {
    await sharp(src)
      .resize(W, H, { fit: 'cover', position: position ?? sharp.strategy.attention })
      .webp({ quality: 86 })
      .toFile(out);
  } else {
    /* 옛 배너에서 잘라 온 제품 사진은 '흰 종이 위에 어두운 판' 처럼 테두리가 한 겹 더 있다.
       그대로 넓히면 흰 여백이 생기므로 테두리를 먼저 걷어 낸다(너무 많이 깎이면 원본 그대로). */
    const meta0 = await sharp(src).metadata();
    const trimmed = await sharp(src)
      .trim({ threshold: 18 })
      .toBuffer({ resolveWithObject: true })
      .catch(() => null);
    const base =
      trimmed && trimmed.info.width * trimmed.info.height > 0.3 * (meta0.width * meta0.height) ? trimmed.data : src;
    if (trimmed) console.log(`  테두리 정리: ${meta0.width}x${meta0.height} → ${trimmed.info.width}x${trimmed.info.height}${base === src ? ' (되돌림)' : ''}`);
    const { rgb, flat } = await edgeColor(base);
    if (flat) {
      /* 배경이 한 가지 색 — 그 색으로 옆을 넓힌다(이어 붙인 자국 0) */
      await sharp(base).resize(W, H, { fit: "contain", background: rgb }).webp({ quality: 88 }).toFile(out);
    } else {
      /* 배경이 복잡하면 같은 사진을 흐리게 깔고 원본을 가운데 얹는다 */
      const bg = await sharp(base).resize(W, H, { fit: "cover" }).blur(30).toBuffer();
      const fg = await sharp(base).resize(Math.round(W * 0.86), Math.round(H * 0.86), { fit: "inside" }).toBuffer();
      await sharp(bg).composite([{ input: fg, gravity: 'center' }]).webp({ quality: 88 }).toFile(out);
    }
  }

  const m = await sharp(out).metadata();
  sizes[`fit/${name}`] = { w: m.width, h: m.height };
  console.log(`${key} (${mode}) → fit/${name} ${m.width}x${m.height}`);
}

fs.writeFileSync('lib/imageSizes.generated.json', JSON.stringify(sizes, null, 1) + '\n');
console.log('사이즈 표 갱신 완료');
