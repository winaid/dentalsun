import { CATEGORIES, siteContext, allowedPaths, clinicLine, callGeminiJson } from '@/lib/adminGemini';

/**
 * 글 한 편을 만드는 파이프라인 — 관리자 화면(/api/admin/draft, /api/admin/topics)과
 * 무인 발행 크론(/api/cron/blog)이 **같은 함수**를 쓴다. 두 길이 다른 글을 만들면 안 된다.
 *
 *   pickTopics  → 겹치지 않는 주제 N개
 *   generateDraft → 초안 (형식 교정 + 의료법 낱말 두 층)
 *   reviewDraft → 두 번째 모델 호출로 감수 (의료법·사실·형식). 무인 흐름의 안전장치.
 *   tooSimilar  → 제목이 기존 글과 너무 비슷하면 거른다 (결정론)
 *
 * ⚠️ 절대 자동 치환하지 않는다 — 문맥을 모른 채 낱말을 바꾸면 비문이 된다. 고치는 일은 모델이 다시 쓰게 시킨다.
 */
export type Draft = { title: string; slug: string; summary: string; category: string; imageAlt: string; imagePrompt: string; html: string };
export type DraftResult = { draft: Draft; notes: string[]; warnings: string[]; cautions: string[]; chars: number };

const EXEMPLAR = {
  title: '스케일링을 하면 이가 벌어진다는 말은 사실인가요?',
  summary:
    '스케일링 뒤에 치아 사이가 벌어져 보이고 시린 것은 사실입니다. 다만 스케일링이 치아를 깎거나 벌린 것이 아니라, 그 자리를 메우고 있던 치석이 빠지면서 원래 있던 공간이 드러난 것입니다.',
  html:
    "<p>스케일링을 받고 나서 거울을 보면 치아 사이에 전에 없던 틈이 보이고, 찬물이 닿으면 시립니다. 그래서 \"스케일링이 이를 깎아서 벌어졌다\" 는 말이 오래전부터 돌았고, 그 말 때문에 스케일링을 미루는 분이 지금도 계십니다. 결론부터 말씀드리면 느끼신 변화는 실제이고, 다만 원인이 다릅니다.</p><h2>틈은 새로 생긴 것이 아니라 드러난 것입니다</h2><p>치석은 치아와 잇몸 사이, 그리고 치아와 치아 사이에 단단하게 붙어 자랍니다. 오래된 치석은 그 자리를 꽉 채우고 있어서, 그동안 잇몸이 내려앉아 생긴 공간을 치석이 대신 메우고 있던 셈입니다. 스케일링은 그 치석을 떼어 내는 시술이라 치석이 빠진 자리가 그대로 빈 공간으로 보입니다.</p><h2>얼마나 자주 받는 것이 좋을까요</h2><p>만 19세 이상은 1년에 한 번 건강보험이 적용되고, 그 기준은 매년 1월 1일에 새로 시작됩니다. 스케일링과 잇몸치료가 어떻게 다른지는 <a href='/treatment/periodontal'>잇몸치료 안내</a>에 정리해 두었습니다.</p><p>스케일링 뒤의 틈과 시림은 치료가 잘못됐다는 신호가 아니라 그동안 가려져 있던 상태가 보이기 시작했다는 신호입니다.</p>",
};

/*
 * 의료법 제56조 낱말 — 두 층 (2026-09-08 실주행: '평생 관리' '가장 좋은 방법은 내원' 같은 멀쩡한 문장이 걸려 3편 중 2편이 버려졌다).
 * ★ HARD — 문맥과 무관하게 광고 심의에 걸리는 말. 자동 흐름은 한 번 다시 쓰게 하고, 그래도 남으면 그 글을 버린다.
 * ★ SOFT — 문맥에 따라 괜찮은 말("통증이 없어도 오세요" 는 괜찮고 "통증이 없는 시술" 은 안 된다).
 *   자동 흐름은 한 번 다시 쓰게 하고, 그래도 남으면 **예약하되 사유를 남긴다**. 사람 흐름은 노란 '확인해 보세요' 로 보여 준다.
 */
export const MEDLAW_HARD = [
  '최고', '최상', '최고급', '최첨단', '유일', '완벽', '100%', '1위', '최초', '국내 최대', '보장', '확실히 낫', '반드시 낫',
  '부작용이 없', '부작용 없', '무통', '후기', '경험담', '치료 전후', '비포', '애프터', '만족도', '할인', '이벤트', '무료 ',
];
export const MEDLAW_SOFT = ['통증이 없', '평생', '영구적', '영구 ', '가장 좋은', '가장 안전', '가장 효과', '전혀 아프지', '하나도 안 아'];

/* 자주 나오는 비문 — 문맥과 무관하게 안전한 것만 (CLAUDE.md 룰과 같은 목록). */
const GRAMMAR_FIX: Array<[RegExp, string]> = [
  [/(필요|중요|안전|건강|가능|충분|정확|확실|깨끗|복잡|단순|편안|신선|소중|특별)하는/g, '$1한'],
  [/되어진다/g, '된다'], [/되어지는/g, '되는'], [/되어진/g, '된'], [/되어질/g, '될'], [/되어졌/g, '됐'],
  [/어떻해/g, '어떡해'],
];

const DRAFT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' }, slug: { type: 'STRING' }, summary: { type: 'STRING' }, category: { type: 'STRING' },
    imageAlt: { type: 'STRING' }, imagePrompt: { type: 'STRING' }, html: { type: 'STRING' },
  },
  required: ['title', 'slug', 'summary', 'category', 'imageAlt', 'imagePrompt', 'html'],
};

function draftPrompt(topic: string, existingTitles: string[], avoid: string[]) {
  return [
    `당신은 ${clinicLine()}의 대표원장이 환자에게 설명하듯 쓰는 치과 블로그 글을 씁니다.`,
    '',
    `주제: ${topic}`,
    '',
    '## 글의 목적',
    '사람이 검색창이나 AI 에 실제로 묻는 문장에 정확히 답하는 글입니다. 검색과 답변 엔진이 첫 문단만 떼어 인용해도 답이 되게 씁니다.',
    '',
    '## 반드시 지킬 형식',
    '- 제목은 환자가 실제로 묻는 **질문 문장** 하나 (예: "임플란트를 심고 며칠 뒤부터 씹어도 되나요?"). 낚시·과장 없이.',
    '- 첫 문단에서 결론을 먼저 말합니다. 그다음 h2 셋에서 다섯으로 이유·상황·주의를 풀고, 마지막 문단은 짧게 정리합니다.',
    '- 본문은 HTML 이고 <p> <h2> <h3> <strong> <a> 만 씁니다. <ul> <ol> <li> <table> <img> <h1> 과 마크다운(**, ##, -) 은 절대 쓰지 않습니다.',
    '- 항목을 나열하고 싶으면 문장으로 잇습니다 ("또한 / 한편 / 특히 / 다만").',
    '- 본문 길이는 공백 포함 1,400~2,200자. 한 문단은 서너 문장.',
    '- 본문 안에 위 목록의 주소로 가는 <a href=\'/...\'> 링크를 하나에서 둘 넣습니다. 목록에 없는 주소는 만들지 않습니다. 외부 링크 없음.',
    '- 말투: "~합니다 / ~입니다". 환자를 "분" 으로 부릅니다. 첫 문단에 "결론부터 말씀드리면" 같은 직답 신호를 둡니다.',
    '- 숫자·기간은 "대개 / 보통 / 경우가 많습니다" 로 폭을 두고, 개인차가 있음을 자연스럽게 담습니다.',
    '- 건강보험·법·제도 같은 사실은 확신이 없으면 "치과에서 확인해 드립니다" 로 두고 숫자를 지어내지 않습니다.',
    '',
    '## 의료법 제56조 — 절대 금지',
    '최고·최상·유일·완벽·1위·최초 같은 최상급, 효과·결과 보장, "부작용이 없다", "통증이 없다", 치료 후기·경험담·만족도, 치료 전후 비교, 다른 병원 비교·비방, 가격 할인·이벤트·무료. 위반 낱말이 하나라도 있으면 글 전체가 광고 심의에 걸립니다.',
    ...(avoid.length ? ['', `## 이 낱말은 어떤 문맥에서도 쓰지 마세요 (지난 응답에서 걸렸습니다): ${avoid.map((w) => `"${w.trim()}"`).join(', ')} — 다른 표현으로 바꾸세요.`] : []),
    '',
    '## 이미 있는 블로그 글 제목 (같은 질문을 다시 쓰지 말 것. 겹치면 다른 각도로)',
    existingTitles.length ? existingTitles.map((t) => `- ${t}`).join('\n') : '- (없음)',
    '',
    siteContext(),
    '',
    '## 결의 예시 (이 글과 같은 호흡·어조로. 내용은 베끼지 말 것)',
    `제목: ${EXEMPLAR.title}`,
    `요약: ${EXEMPLAR.summary}`,
    `본문: ${EXEMPLAR.html}`,
    '',
    '## 출력',
    'JSON 하나만. 키: title, slug(영문 소문자·숫자·하이픈 3~5단어), summary(검색 결과용 70~160자, 결론이 담긴 한두 문장), ' +
      `category(${CATEGORIES.join(' / ')} 중 하나), imageAlt(대표 사진에 무엇이 찍혔는지 한 문장, 한국어), ` +
      'imagePrompt(대표 사진 장면 한 문장, 영어, 사람·손·얼굴·글자 없이 치과 기구·모형·재료만), html(본문).',
  ].join('\n');
}

/** 형식 교정 — 마크다운 흔적·허용 밖 태그·지어낸 링크. 고친 것은 notes 로 알린다. */
function normalize(d: Draft): { draft: Draft; notes: string[]; hardFail?: string } {
  const allowed = allowedPaths();
  const notes: string[] = [];
  let html = (d.html || '').trim();
  if (/<(ul|ol|li|table|img|script|iframe|h1)\b/i.test(html)) return { draft: d, notes, hardFail: '목록·표·그림 태그가 들어왔습니다' };
  const before = html;
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/<(\/?)(h4|h5|h6)\b/gi, '<$1h3')
    .replace(/<\/?(div|span|section|article|br)\b[^>]*>/gi, '')
    .replace(/\s(class|style|id|target|rel)="[^"]*"/gi, '');
  if (html !== before) notes.push('형식을 손봤습니다 (마크다운·허용 밖 태그)');
  html = html.replace(/<a\s+href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, text: string) => {
    const path = href.split('#')[0];
    if (allowed.has(path)) return `<a href='${href}'>${text}</a>`;
    notes.push(`없는 주소 링크를 뺐습니다: ${href}`);
    return text;
  });
  for (const [re, to] of GRAMMAR_FIX) html = html.replace(re, to);
  const slug = (d.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const category = CATEGORIES.includes(d.category) ? d.category : '';
  const title = (d.title || '').trim();
  return { draft: { ...d, title, html, slug, category }, notes };
}

export function medlaw(d: Draft): { warnings: string[]; cautions: string[] } {
  const text = `${d.title} ${d.summary} ${d.html.replace(/<[^>]+>/g, ' ')}`;
  return { warnings: MEDLAW_HARD.filter((w) => text.includes(w)), cautions: MEDLAW_SOFT.filter((w) => text.includes(w)) };
}

export async function generateDraft(key: string, topic: string, existingTitles: string[], avoid: string[] = []): Promise<DraftResult> {
  let d = await callGeminiJson<Draft>(key, draftPrompt(topic, existingTitles, avoid), DRAFT_SCHEMA);
  let out = normalize(d);
  if (out.hardFail) {
    /* 한 번 더 — 목록을 만든 것은 형식 규칙을 놓친 것이라 다시 말하면 대개 고쳐 온다. */
    d = await callGeminiJson<Draft>(key, `${draftPrompt(topic, existingTitles, avoid)}\n\n⚠️ 방금 응답에 ${out.hardFail}. <ul> <ol> <li> 표 그림 없이, 문장으로만 다시 쓰세요.`, DRAFT_SCHEMA);
    out = normalize(d);
    if (out.hardFail) throw new Error(`두 번 모두 ${out.hardFail}. 주제를 조금 바꿔 다시 시도해 주세요.`);
  }
  const m = medlaw(out.draft);
  return { draft: out.draft, notes: out.notes, warnings: m.warnings, cautions: m.cautions, chars: out.draft.html.replace(/<[^>]+>/g, '').length };
}

/**
 * 감수 — 두 번째 호출. 초안을 **심의 담당자의 눈**으로 읽고 고칠 것만 고쳐서 돌려준다.
 * ★ 무인 발행의 핵심 안전장치다. 낱말 목록은 문맥을 모르지만, 이 단계는 문맥을 본다
 *   ("통증이 없는 시술" 은 고치고 "통증이 없어도 오세요" 는 둔다). 사실 관계(보험·기간·수치)가 단정적이면 폭을 두게 한다.
 * ⚠️ 고치는 범위는 문장 단위다. 글의 구조·주제·길이를 바꾸지 못하게 한다 — 감수가 다시 쓰기가 되면 형식 규칙이 새로 깨진다.
 */
export async function reviewDraft(key: string, d: Draft): Promise<{ draft: Draft; fixes: string[] }> {
  const text = [
    `당신은 치과 의료광고 심의 담당자이자 치과의사입니다. 아래 블로그 글을 읽고 **문제가 있는 문장만** 고칩니다.`,
    '',
    '## 반드시 고칠 것',
    '- 의료법 제56조: 최상급(최고·유일·완벽·1위·최초), 효과·결과 보장, "부작용/통증이 없다" 는 단정, 후기·경험담·만족도, 치료 전후 비교, 타 병원 비교·비방, 할인·이벤트·무료.',
    '- 사실이 틀렸거나 단정이 지나친 문장: 건강보험 기준·기간·수치·확률. 확신할 수 없으면 "대개 / 경우가 많습니다 / 치과에서 확인해 드립니다" 로 폭을 둡니다. 지어낸 숫자는 지웁니다.',
    '- 시술 본질과 어긋나는 표현(예: 신경치료 뒤 "신경 관리").',
    '- 어색한 한국어·비문(필요하는 → 필요한, 되어진다 → 된다).',
    '',
    '## 절대 하지 말 것',
    '- 글의 구조·소제목 수·주제·길이를 바꾸지 않습니다. 문제 없는 문장은 글자 하나도 바꾸지 않습니다.',
    '- 새 태그를 넣지 않습니다. <p> <h2> <h3> <strong> <a> 외에는 쓰지 않고, 링크 주소를 바꾸거나 새로 만들지 않습니다.',
    '- 마크다운을 쓰지 않습니다.',
    '',
    '## 글',
    `제목: ${d.title}`,
    `요약: ${d.summary}`,
    `본문: ${d.html}`,
    '',
    '## 출력',
    'JSON: { title, summary, html, fixes: ["무엇을 왜 고쳤는지 한 줄씩"] }. 고칠 것이 없으면 원문 그대로 돌려주고 fixes 는 빈 배열.',
  ].join('\n');
  const schema = {
    type: 'OBJECT',
    properties: { title: { type: 'STRING' }, summary: { type: 'STRING' }, html: { type: 'STRING' }, fixes: { type: 'ARRAY', items: { type: 'STRING' } } },
    required: ['title', 'summary', 'html', 'fixes'],
  };
  const r = await callGeminiJson<{ title: string; summary: string; html: string; fixes: string[] }>(key, text, schema, 0.2);
  const out = normalize({ ...d, title: r.title || d.title, summary: r.summary || d.summary, html: r.html || d.html });
  /* 감수가 오히려 형식을 깨뜨리면(목록을 넣는 등) 감수 결과를 버리고 원문을 쓴다. */
  if (out.hardFail) return { draft: d, fixes: ['감수 결과에 목록·표가 들어와 원문을 유지했습니다'] };
  /* 길이가 크게 줄었으면 다시 쓴 것이다 — 원문 유지. */
  const before = d.html.replace(/<[^>]+>/g, '').length;
  const after = out.draft.html.replace(/<[^>]+>/g, '').length;
  if (after < before * 0.7) return { draft: d, fixes: ['감수가 글을 크게 줄여 원문을 유지했습니다'] };
  return { draft: out.draft, fixes: Array.isArray(r.fixes) ? r.fixes.slice(0, 10) : [] };
}

/** 주제 N개 — 기존 글·사이트 페이지와 겹치지 않게, 분류 골고루. */
export async function pickTopics(key: string, count: number, existing: Array<{ title: string; summary?: string }>): Promise<Array<{ topic: string; category: string }>> {
  const month = new Date(Date.now() + 9 * 3600 * 1000).getUTCMonth() + 1;
  const text = [
    `${clinicLine()} 블로그의 다음 글 주제를 ${count}개 고릅니다.`,
    '',
    '## 조건',
    '- 각 주제는 환자가 검색창이나 AI 에 실제로 묻는 **질문 문장** 그대로 (예: "임플란트 심고 며칠 뒤부터 씹어도 되나요"). 15~40자.',
    '- 아래 "이미 있는 글" 과 같은 질문, 같은 답이 나오는 질문은 고르지 않습니다. 비슷한 주제라면 다른 각도(시기·비용·통증·관리·아이·어르신)로.',
    '- 아래 "사이트 페이지" 가 이미 답하는 질문(시술 소개·증상 설명)도 고르지 않습니다. 블로그는 그 페이지들이 못 담는 구체적인 상황을 다룹니다.',
    `- 분류(${CATEGORIES.join(' / ')})를 골고루 섞습니다. 한 분류가 ${Math.max(2, Math.ceil(count / 4))}개를 넘지 않게. 이미 있는 글에 많은 분류는 피합니다.`,
    `- 계절·명절·연말정산·방학처럼 시기와 맞는 질문을 섞어도 좋습니다. 지금은 ${month}월입니다.`,
    '- 최상급·후기·이벤트 냄새가 나는 주제는 뺍니다(의료광고).',
    '',
    '## 이미 있는 글',
    existing.length ? existing.map((e) => `- ${e.title}${e.summary ? ` — ${e.summary.slice(0, 80)}` : ''}`).join('\n') : '- (없음)',
    '',
    siteContext(),
    '',
    `## 출력\nJSON 배열 ${count}개. 각 원소: { topic, category }.`,
  ].join('\n');
  const schema = { type: 'ARRAY', items: { type: 'OBJECT', properties: { topic: { type: 'STRING' }, category: { type: 'STRING' } }, required: ['topic', 'category'] } };
  const raw = await callGeminiJson<Array<{ topic: string; category: string }>>(key, text, schema, 0.9);
  const seen = new Set<string>();
  return (Array.isArray(raw) ? raw : [])
    .map((t) => ({ topic: String(t.topic || '').trim().replace(/[?？]$/, ''), category: CATEGORIES.includes(t.category) ? t.category : '' }))
    .filter((t) => t.topic.length >= 6 && !seen.has(t.topic) && seen.add(t.topic) && !existing.some((e) => tooSimilar(t.topic, e.title)))
    .slice(0, count);
}

/** 제목 겹침 — 글자 2-gram 자카드. 0.55 이상이면 같은 글로 본다 (결정론, 모델과 무관한 마지막 방어선). */
export function tooSimilar(a: string, b: string): boolean {
  const grams = (s: string) => {
    const t = s.replace(/[^가-힣a-z0-9]/gi, '').toLowerCase();
    const g = new Set<string>();
    for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2));
    return g;
  };
  const A = grams(a);
  const B = grams(b);
  if (!A.size || !B.size) return false;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter) >= 0.55;
}

/**
 * 무인 흐름 한 편 — 주제가 있으면 그것으로, 없으면 골라서. 걸리면 피해서 한 번 다시 쓰고, 감수하고, 결정론 검사.
 * 돌려주는 것: 글 또는 버린 사유. 사진은 여기서 만들지 않는다(호출한 쪽이 imagePrompt 로).
 */
export async function autoDraft(
  key: string,
  existing: Array<{ title: string; summary?: string }>,
  topic?: { topic: string; category: string },
): Promise<{ ok: true; draft: Draft; cautions: string[]; fixes: string[]; topic: string } | { ok: false; reason: string; topic?: string }> {
  const t = topic || (await pickTopics(key, 3, existing))[0];
  if (!t) return { ok: false, reason: '주제를 못 골랐습니다' };
  const titles = existing.map((e) => e.title);
  let r = await generateDraft(key, t.topic, titles);
  /* HARD 낱말만 다시 쓰게 한다. SOFT 는 다음 감수 단계가 문맥을 보고 고친다 — 한 번 더 쓰면 50초가 더 들어 크론 300초가 빠듯하다(실측 211초). */
  if (r.warnings.length) r = await generateDraft(key, t.topic, titles, [...r.warnings, ...r.cautions]);
  if (r.warnings.length) return { ok: false, reason: `두 번 모두 의료법 낱말: ${r.warnings.join(', ')}`, topic: t.topic };
  if (existing.some((e) => tooSimilar(r.draft.title, e.title))) return { ok: false, reason: '기존 글과 제목이 너무 비슷합니다', topic: t.topic };
  const reviewed = await reviewDraft(key, r.draft);
  const m = medlaw(reviewed.draft);
  if (m.warnings.length) return { ok: false, reason: `감수 뒤에도 의료법 낱말: ${m.warnings.join(', ')}`, topic: t.topic };
  const draft = { ...reviewed.draft, category: reviewed.draft.category || t.category };
  return { ok: true, draft, cautions: m.cautions, fixes: reviewed.fixes, topic: t.topic };
}
