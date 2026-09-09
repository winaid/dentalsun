/**
 * 대표 사진 만들기 — gpt-image-2. 관리자 화면(/api/admin/image)과 무인 크론(/api/cron/blog)이 같이 쓴다.
 *
 * ★ 결은 사이트의 다른 AI 사진과 같아야 한다 — LOOK 을 프롬프트 뒤에 항상 붙인다 (scripts/gen-people.mjs 와 같은 문장).
 * ⚠️ 사람·손·얼굴·글자·로고 금지도 LOOK 이 강제한다. 앞 문장에 사람을 적어도 뒤 문장이 막는다.
 * ⚠️ webp 변환은 sharp — 원본 PNG(1536×1024, 2~3MB)를 그대로 올리면 목록이 무거워진다.
 */
const LOOK =
  'Natural editorial photograph for a modern Korean dental clinic website. Photorealistic, not illustration. ' +
  'Soft daylight, shallow depth of field, calm warm mood, muted white and light-grey palette with one subtle deep-navy or warm-orange accent. ' +
  'If a person appears they are East Asian and framed so that the eyes are never visible: from the nose down, or hands, or a back or side view. ' +
  'No text, no logos, no readable lettering, no watermarks.';

export async function generateImage(key: string, prompt: string): Promise<Buffer> {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-image-2', prompt: `${prompt} ${LOOK}`, size: '1536x1024', quality: 'medium', n: 1 }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI 가 빈 응답을 보냈습니다.');
  const sharp = (await import('sharp')).default;
  return sharp(Buffer.from(b64, 'base64')).webp({ quality: 82 }).toBuffer();
}
