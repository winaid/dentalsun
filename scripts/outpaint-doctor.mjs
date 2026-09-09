/**
 * 원장 사진 배경 이어 붙이기(아웃페인트) — 오른쪽으로 치우친 인물이 가운데 오도록 오른쪽 배경만 생성한다.
 *
 * ★ 원장님 픽셀은 원본을 그대로 덮어쓴다 — AI 는 마스크로 지정한 오른쪽 빈 영역(유리벽 배경)만 채운다.
 *   얼굴·몸이 바뀔 여지를 없애기 위해서다(의료광고: 인물 변형 금지).
 * 흐름: 원본(1952×2497)을 2497×2497 정사각 캔버스 왼쪽에 놓고 오른쪽 545px 을 투명으로 → images/edits(마스크=투명 부분) →
 *      결과를 원래 크기로 되돌린 뒤 원본을 다시 덮음 → 인물 중심(x≈1175)에 맞춰 4:5 로 자름 → public/img/doctors/yang.webp
 * 사용: node scripts/outpaint-doctor.mjs [--dry]  (dry 면 캔버스·마스크만 C:/tmp/outpaint 에 만든다)
 */
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const envFile = 'C:/Users/FORYOUCOM/Downloads/Winaid-AI/public-app/.env.local';
const env = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
const KEY = process.env.OPENAI_API_KEY ?? env.match(/^OPENAI_API_KEY=(\S+)/m)?.[1];
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2';
const DRY = process.argv.includes('--dry');
const OUT = 'C:/tmp/outpaint';
mkdirSync(OUT, { recursive: true });

const SRC = 'public/img/orig/doctor-yang.webp';
const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height; // 1952 × 2497
const S = H; // 정사각 캔버스 한 변
const EXT = S - W; // 오른쪽에 생성할 폭 (545)

// 캔버스: 원본 + 오른쪽 투명
const canvas = await sharp({ create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await sharp(SRC).ensureAlpha().toBuffer(), left: 0, top: 0 }])
  .png()
  .toBuffer();
// 마스크: 투명 = 생성할 곳. 경계 60px 도 투명으로 넣어 이음새를 자연스럽게(그 부분은 나중에 원본으로 되덮인다)
const FE = 60;
const mask = await sharp({ create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } } })
  .composite([{ input: await sharp({ create: { width: EXT + FE, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer(), left: W - FE, top: 0, blend: 'dest-out' }])
  .png()
  .toBuffer();
writeFileSync(`${OUT}/canvas.png`, canvas);
writeFileSync(`${OUT}/mask.png`, mask);
console.log('canvas', S, 'ext', EXT);
if (DRY) process.exit(0);
if (!KEY) { console.error('OPENAI_API_KEY 없음'); process.exit(1); }

const form = new FormData();
form.append('model', MODEL);
form.append('image', new Blob([canvas], { type: 'image/png' }), 'canvas.png');
form.append('mask', new Blob([mask], { type: 'image/png' }), 'mask.png');
form.append('prompt', 'Extend the photo to the right by continuing the same background only: a frosted glass partition wall of a modern dental clinic with soft grey-green tones, subtle reflections and the same lighting. Keep everything that already exists exactly as it is. Do not add any people, objects, text or logos. Photorealistic, seamless continuation.');
form.append('size', '1024x1024');
form.append('quality', 'high');
form.append('n', '1');

const r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { authorization: `Bearer ${KEY}` }, body: form });
if (!r.ok) { console.error(r.status, (await r.text()).slice(0, 400)); process.exit(1); }
const j = await r.json();
const b64 = j.data?.[0]?.b64_json;
if (!b64) { console.error('no image'); process.exit(1); }
const gen = Buffer.from(b64, 'base64');
writeFileSync(`${OUT}/generated-1024.png`, gen);

// 원래 크기로 되돌리고 원본을 다시 덮는다 (경계 40px 은 부드럽게 섞기 위해 원본 가장자리를 살짝 페더)
const big = await sharp(gen).resize(S, S).png().toBuffer();
const feather = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 255 } } })
  .composite([{ input: await sharp({ create: { width: 40, height: H, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } } }).png().toBuffer(), left: W - 40, top: 0, blend: 'dest-out' }])
  .blur(12)
  .png()
  .toBuffer();
const origFeathered = await sharp(SRC).ensureAlpha().joinChannel(await sharp(feather).extractChannel(3).toBuffer()).png().toBuffer();
const merged = await sharp(big).composite([{ input: origFeathered, left: 0, top: 0 }]).png().toBuffer();
writeFileSync(`${OUT}/merged.png`, merged);

// 인물 중심 x≈0.60W 에 맞춰 4:5 로 자르기
const CENTER = Math.round(W * 0.6);
const cw = Math.round(H * 0.8), ch = H;
const left = Math.max(0, Math.min(S - cw, CENTER - Math.round(cw / 2)));
const finalBuf = await sharp(merged).extract({ left, top: 0, width: cw, height: ch }).resize(1200, 1500).webp({ quality: 86 }).toBuffer();
writeFileSync(`${OUT}/yang-centered.webp`, finalBuf);
copyFileSync('public/img/doctors/yang.webp', `${OUT}/yang-backup.webp`);
console.log('done → C:/tmp/outpaint/yang-centered.webp (crop left', left, 'width', cw, ')');
