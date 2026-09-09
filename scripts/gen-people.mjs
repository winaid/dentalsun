/**
 * 사람·상황이 들어간 설명 사진 — gpt-image-2. (gen-images.mjs 의 '정물만' 규칙과 다른 두 번째 결)
 *
 * ★ 오너 지적(2026-09-09): 정물 57장이 전부 같은 흰 카운터 사진처럼 보인다. 내용이 드러나게 사람·손·상황을 넣는다.
 * ★ 눈이 보이는 얼굴은 만들지 않는다 — 코 아래·손·옆모습·뒷모습만. 만든 얼굴이 '우리 원장' 이나 실존 인물로 읽히는 것을 막는다.
 * ★ 글자·로고 없음. 인물은 동아시아인. 색은 사이트 결(흰·회색 + 남색·주황 포인트).
 * ★ 결과는 C:/tmp/ai-new/<key>.webp 에 먼저 만들고(검토용 시트 포함), 괜찮은 것만 public/img/ai 로 복사한다.
 *
 * 사용: node scripts/gen-people.mjs --only tmj-hub,wisdom [--concurrency 3]
 */
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const envFile = 'C:/Users/FORYOUCOM/Downloads/Winaid-AI/public-app/.env.local';
const env = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
const KEY = process.env.OPENAI_API_KEY ?? env.match(/^OPENAI_API_KEY=(\S+)/m)?.[1];
if (!KEY) { console.error('OPENAI_API_KEY 가 없습니다.'); process.exit(1); }
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const ONLY = opt('--only', '').split(',').filter(Boolean);
const CONCURRENCY = Number(opt('--concurrency', 3));
const OUT = opt('--out', 'C:/tmp/ai-new');

const LOOK =
  'Natural editorial photograph for a modern Korean dental clinic website. Photorealistic, not illustration. ' +
  'Soft daylight, shallow depth of field, calm warm mood, muted white and light-grey palette with one subtle deep-navy or warm-orange accent. ' +
  'The person is East Asian. Frame so that the eyes are NEVER visible: show only from the nose down, or hands, or a back or side view with the face turned away. ' +
  'No text, no logos, no readable lettering, no watermarks.';

/** key → 장면 (key 는 public/img/ai/<key>.webp 를 대체한다) */
const SCENES = {
  'tmj-hub': 'Close-up of a young woman from the nose down, one hand gently pressing the side of her jaw just in front of the ear as if it aches, head slightly turned, plain light background.',
  'tmj-symptoms': 'Lower face of a man from the nose down, jaw slightly open and tense, two fingers touching the jaw joint in front of the ear, soft side light, blurred clinic behind.',
  'wide-tmj': 'Ultra-wide cinematic scene in a bright treatment room: a patient reclined in a dental chair seen from behind and to the side, a clinician in gloves gently palpating the patient\'s jaw joint in front of the ear, both faces hidden, large window daylight.',
  'aesthetic-hub': 'Close-up of a bright natural smile: only the lips and even white teeth of a young woman from the nose down, clean pale background, soft daylight, subtle warm tone.',
  'wisdom': 'A young adult from the nose down holding a swollen cheek with one hand, slight discomfort, plain light background, cool soft light, navy sweater.',
  'insight-hub': 'Top-down view of hands holding a smartphone while reading, over a light wooden table with a cup of tea and a small plant; the screen shows only soft abstract blue shapes, no text.',
  /* 턱관절 허브(레퍼런스 tmjdoctor 구조) — '원인 3가지' 카드. 2026-09-09 */
  'tmj-cause-habit': 'A young East Asian woman seen from the nose down, resting her chin heavily on one hand at a white desk by a bright window, relaxed posture, plain light background, soft daylight.',
  'tmj-cause-grind': 'A person sleeping on their side on a white pillow seen from behind and above, face hidden, jaw area slightly tense, soft morning light, white bedding, calm muted tones.',
  'tmj-cause-stress': 'A person seen from behind at a desk, both hands pressing the temples and back of the head in a stressed posture, laptop and papers blurred in front, soft window light, muted navy sweater.',
  /* 2026-09-09 오너 GO: 흰 카운터 정물로 비슷비슷하던 설명 사진 교체 — 사람·손·상황 (문자열에 따옴표 금지: 셸 경유 시 백슬래시 유실) */
  "implant-uv": "Close-up of gloved clinician hands placing a small implant fixture into a compact tabletop UV activation device that glows faint violet, modern dental clinic counter, shallow depth of field.",
  "implant-prf": "Gloved hands lifting a small blood collection tube out of a tabletop centrifuge in a dental clinic, soft daylight, clean white counter, no faces.",
  "implant-warranty": "Patient hands receiving a small folded warranty card from receptionist hands across a bright clinic reception counter, both faces out of frame, warm light.",
  "implant-custom": "Gloved hands holding a tiny custom implant abutment with tweezers over a plaster dental model on a white lab bench, soft daylight, shallow focus.",
  "aesthetic-prosthetics": "Close-up of a natural smile of a woman from the nose down, even white ceramic teeth, a gloved clinician hand holding a shade guide beside the lips, bright clean background.",
  "aesthetic-whitening": "Close-up from the nose down of a young woman smiling while a gloved hand holds a tooth shade guide next to her teeth, soft daylight, white background.",
  "insurance-hub": "An elderly East Asian woman seen from the nose down, smiling warmly, gently holding hands with a younger family member across a light table in a bright clinic waiting area, no eyes visible.",
  "insurance-denture": "Close-up of elderly hands holding a partial denture on a soft cloth at a bright table, warm daylight, calm mood, face not visible.",
  "insurance-implant": "An elderly patient reclined in a dental chair seen from behind and above, a gloved clinician hand resting reassuringly on the chair, bright treatment room, no faces.",
  "natural-hub": "Close-up of gloved clinician hands examining a single natural tooth model held between fingers under a bright dental light, magnifying loupe blurred in background, no faces.",
  "faq": "Two people at a bright clinic reception desk seen from the side and from the neck down, one hand pointing at a printed sheet, a tablet and a small plant on the counter, soft daylight.",
  "insight-journey": "A young adult seen from behind walking through a glass door into a bright, calm dental clinic lobby, morning light, plants and a light wood counter ahead.",
  "insight-cost": "Top-down view of hands over a light wooden desk with a printed treatment plan, a pen and a cup of tea, the sheet shows only soft blurred lines and no readable text.",
  "insight-glossary": "Close-up of hands turning the pages of an open dental reference book beside a small tooth model on a light desk, soft window light, no readable text.",
  "insight-denture": "An elderly person seen from the nose down smiling gently at a bright table, hands folded, a small glass of water nearby, warm daylight.",
  'painless-hub': 'A patient reclined in a dental chair seen from the nose down, relaxed and calm with lips gently closed, a clinician\'s gloved hand resting reassuringly on the chair, soft light.',
};

mkdirSync(OUT, { recursive: true });

async function gen(key) {
  const out = `${OUT}/${key}.webp`;
  const wide = key.startsWith('wide-') || key.startsWith('hero-wide');
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ model: MODEL, prompt: `${SCENES[key]} ${LOOK}`, size: '1536x1024', quality: 'medium', n: 1 }),
    });
    if (r.ok) {
      const j = await r.json();
      const b64 = j.data?.[0]?.b64_json;
      if (!b64) throw new Error('no image');
      await sharp(Buffer.from(b64, 'base64')).resize(wide ? 1920 : 1200, wide ? 1080 : 800, { fit: 'cover' }).webp({ quality: wide ? 78 : 80 }).toFile(out);
      return 'ok';
    }
    const text = await r.text();
    if ((r.status === 429 || r.status >= 500) && attempt < 2) { await new Promise((res) => setTimeout(res, 4000 * (attempt + 1))); continue; }
    throw new Error(`${r.status} ${text.slice(0, 200)}`);
  }
}

const keys = Object.keys(SCENES).filter((k) => !ONLY.length || ONLY.includes(k));
let done = 0, fail = 0;
const queue = [...keys];
const t0 = Date.now();
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const k = queue.shift();
    try { const s = await gen(k); done++; console.log(`${s} ${k} (${done + fail}/${keys.length})`); }
    catch (e) { fail++; console.error(`FAIL ${k}: ${e.message}`); }
  }
}));
console.log(`끝 — 성공 ${done} 실패 ${fail}, ${((Date.now() - t0) / 1000).toFixed(0)}s, 출력 ${OUT}`);
