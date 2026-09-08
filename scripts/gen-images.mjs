/**
 * 사진이 부족한 자리에 쓸 설명용 이미지 — gpt-image-2.
 *
 * ★ 원본 홈페이지 사진은 24장뿐이라 서른 쪽에 나눠 쓰면 같은 사진이 계속 반복된다(오너 지적).
 *   부족한 자리는 **사람·손·얼굴·글자 없는 정물**로 채운다 — 실제 인물이 아닌 얼굴은 '우리 원장' 으로
 *   읽히고, 만들어진 글자는 없는 브랜드를 만든다.
 * ★ 사이트 전체가 한 결로 보이도록 LOOK 프롬프트를 공통으로 붙인다.
 * ⚠️ 이미 있는 파일은 건너뛴다(비용 보호). 다시 만들려면 파일을 지우고 실행.
 *
 * 사용: node scripts/gen-images.mjs [--only key1,key2] [--concurrency 3]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
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

const LOOK =
  'Bright, tidy modern dental clinic. Clean white surface, clinical daylight from a large window, soft shadows. ' +
  'White and pale grey palette with one quiet deep-navy accent object and a subtle warm orange highlight somewhere small. ' +
  'Macro photographic, shallow depth of field, calm and professional, editorial product-photo feel. ' +
  'No linen cloth, no dried flowers, no rustic pottery. ' +
  'Absolutely no people, no hands, no faces, no body parts. No logos, no brand marks, no readable lettering or numbers anywhere.';

/** key → 장면. key 는 public/img/ai/<key>.webp 가 되고 Fig.key 는 'ai/<key>'. */
const SCENES = {
  'hero-clinic': 'Wide view of a modern dental treatment room: white dental chair, overhead light, large window with soft city daylight, monitor on the wall showing an abstract blue 3D jaw render.',
  'hero-digital': 'Intraoral 3D scanner wand resting on a white counter next to a monitor showing a colorful 3D dental arch scan, navy accent.',
  'implant-hub': 'Titanium dental implant fixture and abutment standing on a white acrylic block beside a translucent 3D-printed jaw model.',
  'implant-navigation': 'Clear surgical guide seated on a lower jaw model next to a tablet displaying an implant planning cross-section in blue.',
  'implant-fullarch': 'Full-arch fixed prosthesis mounted on four implants in a jaw model, viewed from the front on a white counter.',
  'implant-uv': 'Single titanium implant fixture inside a small glass chamber glowing with violet ultraviolet light on a white surface.',
  'implant-prf': 'Small benchtop centrifuge with two blood-sample tubes showing a yellow plasma layer, on a clinic counter.',
  'implant-custom': 'Custom milled titanium abutment and a white zirconia crown placed on a gum-colored dental model, macro.',
  'implant-warranty': 'A ceramic crown on a small display stand next to a closed navy folder and a tiny hourglass, minimal.',
  'tmj-hub': 'Transparent occlusal splint resting on a stone dental cast on a white counter, navy tray in the background.',
  'tmj-symptoms': 'Anatomical model of the human temporomandibular joint (skull side view with jaw) on a white surface, soft light.',
  'tmj-treatments': 'Low-level laser therapy handpiece on a white stand next to a clear splint and a jaw joint model.',
  'aesthetic-hub': 'Thin porcelain veneer shells on a mirror tray beside a tooth shade guide, macro.',
  'aesthetic-prosthetics': 'All-ceramic crowns and a white zirconia milling block on a white surface, macro.',
  'aesthetic-whitening': 'Whitening tray and a blue LED whitening lamp head on a counter beside a shade guide.',
  'insurance-hub': 'A partial denture and a single implant crown on a stainless tray, clean clinic counter.',
  'insurance-denture': 'A complete upper denture on a white acrylic stand, soft daylight.',
  'insurance-implant': 'A single porcelain-fused-to-metal crown on an implant analog in a dental model, macro.',
  'wisdom': 'A resin lower jaw model showing an impacted wisdom tooth angle, next to a panoramic X-ray on a light box (no text).',
  'natural-hub': 'Cross-section molar tooth model showing the pulp chamber in red, with fine endodontic files in a stand.',
  'natural-mta': 'Small mixing pad with white bioceramic cement paste and a spatula next to a root canal tooth model.',
  'natural-endosonic': 'Ultrasonic endodontic handpiece with a slim tip on a white tray, blue accent light.',
  'painless-hub': 'Computer-controlled local anesthesia unit with a pen-style handpiece on a clinic cart.',
  'painless-anesthesia': 'Topical anesthetic gel jar and a cotton applicator on a stainless tray, macro.',
  'painless-sedation': 'Calm dim treatment room for sedation: reclined chair, monitor with a soft waveform, warm side light.',
  'painless-airflow': 'Airflow powder polishing device with two handpieces on a white counter, a small cloud of fine powder.',
  'visit': 'Bright dental clinic reception counter with a navy accent wall, empty waiting sofa, daylight.',
  'faq': 'Consultation desk with a tablet showing a tooth chart, a tooth model and a pen, clean and bright.',
  'insight-hub': 'Row of tooth models arranged on a white shelf with a magnifying loupe, clean editorial.',
  'insight-sensitive': 'A tooth model next to a glass of ice water with condensation on a white counter.',
  'insight-gum': 'Dental model with pink gums and a periodontal probe resting beside it, macro.',
  'insight-jaw': 'Side-view skull model highlighting the jaw joint, on a white surface with soft shadow.',
  'insight-wisdom': 'Lower jaw model with a tilted wisdom tooth and a dental mirror, macro.',
  'insight-implant-care': 'Interdental brushes and floss next to an implant crown model on a white counter.',
  'insight-denture': 'A partial denture in a clear cleaning cup with a soft brush, clean clinic counter.',
  'insight-cost': 'Dental crown, implant fixture and a small calculator-shaped blank white box on a tray (no digits).',
  'insight-journey': 'Four small tooth models in a row on a white surface, each on its own tile, suggesting steps.',
  'insight-fear': 'Soft grey blanket folded on a dental chair armrest with a small navy pillow, calm light.',
  'insight-glossary': 'Open blank white notebook pages beside dental tools and a tooth model (no writing).',
  'insight-crack': 'Molar tooth model with a fine crack line, under a magnifying loupe, macro.',
  'insight-endo-pain': 'Cross-section tooth model with red pulp next to a small ice pack on a white counter.',
  'insight-whitening': 'Tooth shade guide fanned out on a white counter, macro, soft light.',
  'about-philosophy': 'Dental mirror and probe laid neatly on a white tray beside a small green plant, calm daylight.',
};

const OUT = 'public/img/ai';
mkdirSync(OUT, { recursive: true });
const SIZES = 'lib/imageSizes.generated.json';
const sizes = JSON.parse(readFileSync(SIZES, 'utf8'));

async function gen(key) {
  const out = `${OUT}/${key}.webp`;
  if (existsSync(out)) { if (!sizes[`ai/${key}`]) sizes[`ai/${key}`] = { w: 1200, h: 800 }; return 'skip'; }
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
      await sharp(Buffer.from(b64, 'base64')).resize(1200, 800, { fit: 'cover' }).webp({ quality: 80 }).toFile(out);
      sizes[`ai/${key}`] = { w: 1200, h: 800 };
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
    try { const s = await gen(k); done++; console.log(`[${done}/${keys.length}] ${s} ${k} ${Math.round((Date.now() - t0) / 1000)}s`); }
    catch (e) { fail++; console.log('FAIL', k, e.message); }
    writeFileSync(SIZES, JSON.stringify(sizes, null, 1));
  }
}));
writeFileSync(SIZES, JSON.stringify(sizes, null, 1));
console.log('done', done, 'fail', fail);
