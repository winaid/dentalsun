import { CLINIC } from '@/lib/clinic';
import { ALL_DOCS } from '@/lib/content';

/**
 * 관리자 글쓰기가 쓰는 Gemini 공용 조각 — /api/admin/draft(글 한 편) 와 /api/admin/topics(주제 N개) 가 함께 쓴다.
 *
 * ★ 사이트 페이지 목록(siteContext)은 두 라우트 모두에 들어간다. 이유 —
 *   1) 같은 주제를 다시 쓰면 기존 페이지와 검색에서 서로 다툰다(자기 잠식).
 *   2) 본문 링크는 여기 적힌 주소만 쓰게 한다. 지어낸 주소는 404 다.
 * ⚠️ 모델은 GEMINI_MODEL 로 바꿀 수 있다. 기본은 이 프로젝트가 블로그에 쓰는 것과 같은 pro.
 */
export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';

export const CATEGORIES = ['임플란트', '턱관절', '심미치료', '보험 틀니·임플란트', '사랑니', '자연치아 살리기', '무통·수면치료', '잇몸·예방', '치과 선택'];

export function siteContext(): string {
  const lines: string[] = [];
  lines.push('## 이미 사이트에 있는 페이지 (이 주제를 통째로 다시 쓰지 말 것. 링크는 아래 주소만 쓸 것)');
  for (const d of ALL_DOCS) lines.push(`- ${d.path} — ${d.title}: ${d.summary.split(/(?<=다\.)\s/)[0]}`);
  lines.push('- /about — 치과소개 · /about/doctors — 의료진 · /about/equipment — 디지털 장비 · /visit — 오시는 길·진료시간 · /faq — 자주 묻는 질문');
  lines.push('- /insight/blog — 블로그 목록');
  lines.push('- /about/doctors — 의료진');
  return lines.join('\n');
}

export function allowedPaths(): Set<string> {
  const s = new Set<string>(['/insight/blog', '/about', '/about/doctors', '/about/equipment', '/visit', '/faq', '/treatment', '/insight']);
  for (const d of ALL_DOCS) s.add(d.path);
  return s;
}

export function clinicLine(): string {
  return `${CLINIC.shortName}(${CLINIC.address.region} ${CLINIC.address.locality} 광화문역 6번 출구)`;
}

/** JSON 응답을 강제해서 부른다. schema 는 Gemini responseSchema 형식. */
export async function callGeminiJson<T>(key: string, text: string, schema: Record<string, unknown>, temperature = 0.65): Promise<T> {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: { temperature, responseMimeType: 'application/json', responseSchema: schema },
    }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!raw) throw new Error('Gemini 가 빈 응답을 보냈습니다.');
  return JSON.parse(raw.replace(/^```json\s*|```\s*$/g, '')) as T;
}
