/**
 * 진료 문서 모델 — 진료 안내 페이지 전부가 이 모양의 데이터 한 덩어리다.
 *
 * ★ 왜 데이터로 두나
 *   페이지가 서른 쪽이다. 쪽마다 JSX 를 손으로 짜면 제목 구조·FAQ 스키마·빵부스러기·메타가
 *   쪽마다 조금씩 어긋난다. 데이터 → 렌더러 하나(components/DocPage.tsx)로 통일하면
 *   구조화 데이터와 화면이 **같은 배열**에서 나와 어긋날 수 없다.
 *
 * ★★ 내용 원칙 ★★
 *   본문은 기존 홈페이지(dentalsun.co.kr) 배너·본문 원문이 바탕이다. 숫자·장비명·자격·금액은
 *   원문 그대로. 원문에 없는 것은 일반적인 치과 상식 수준에서만 보탠다. 병원 고유의 주장
 *   (경력·성공률·수치)은 원문에 없으면 쓰지 않는다.
 */
import SIZES from './imageSizes.generated.json';

export interface Fig {
  /** public/img 아래 키. 예: 'implant/uv' → /img/implant/uv.webp */
  key: string;
  alt: string;
  caption?: string;
}
export interface QA {
  q: string;
  a: string;
}

export type Block =
  /** 소제목 + 줄글 단락(들). 그림은 오른쪽(기본) 또는 왼쪽. */
  | { type: 'text'; id?: string; title?: string; paragraphs: string[]; figure?: Fig; figureSide?: 'left' | 'right' }
  /** 항목 카드 격자 — "이런 경우", "특징", "효과" 같은 나열 */
  | { type: 'points'; id?: string; title?: string; lead?: string; items: Array<{ title: string; desc?: string }>; figure?: Fig; columns?: 2 | 3 | 4; numbered?: boolean }
  /** 번호 매긴 순서 — 치료 과정 */
  | { type: 'steps'; id?: string; title?: string; lead?: string; steps: Array<{ title: string; desc?: string; figure?: Fig }> }
  /** 두 열 비교표 (A vs B). highlight 는 강조할 열. */
  | { type: 'compare'; id?: string; title?: string; lead?: string; columns: [string, string]; rows: Array<{ label: string; a: string; b: string }>; note?: string; highlight?: 'a' | 'b' }
  /** 일반 표 */
  | { type: 'table'; id?: string; title?: string; lead?: string; head: string[]; rows: string[][]; note?: string }
  /** 사진 여러 장 */
  | { type: 'gallery'; id?: string; title?: string; lead?: string; figures: Fig[]; columns?: 2 | 3 | 4 }
  /** 치료 전후 등 사례 사진 한 장 + 고지문(필수) */
  | { type: 'cases'; id?: string; title?: string; lead?: string; figure: Fig; note: string; /** lib/cases.ts 의 묶음 id — 있으면 전후 비교 슬라이더로 보여 준다 */ caseGroup?: string }
  /** 강조 한 줄 */
  | { type: 'quote'; text: string; by?: string }
  /** 다른 문서로 가는 카드 */
  | { type: 'links'; id?: string; title?: string; lead?: string; items: Array<{ label: string; href: string; desc?: string }> }
  /** 주의·안내 상자 */
  | { type: 'notice'; title?: string; paragraphs: string[] };

export interface Doc {
  /** 사이트 안 절대 경로. 예: '/treatment/implant/uv' */
  path: string;
  /** 어느 대메뉴 아래인가 — 빵부스러기·관련 문서에 쓴다. NAV 의 대메뉴 href 와 같아야 한다. */
  hub: string;
  /** 대메뉴 이름 (빵부스러기) */
  hubLabel: string;
  /** H1 */
  title: string;
  /** 작은 윗줄 라벨. 예: 'IMPLANT · UV' */
  eyebrow: string;
  /** 한 줄 답 — H1 바로 아래 첫 단락. 이 문서가 답하는 질문에 대한 요약(2~3문장). speakable 대상. */
  summary: string;
  /** 메타 설명 — 155자 이내, 지역어 포함 권장 */
  description: string;
  keywords: string[];
  /** 대표 사진 */
  hero?: Fig;
  /** 구조화 데이터 about — 시술명. 허브(목록) 문서는 생략. */
  procedure?: string;
  /** 허브 문서 여부 — true 면 Article 을 내지 않고 하위 문서 카드를 자동으로 붙인다 */
  isHub?: boolean;
  blocks: Block[];
  /** 화면에 그대로 렌더되고 FAQPage 스키마로도 나간다 — 반드시 같은 배열 */
  faq?: QA[];
  /** 관련 문서 경로 — 마무리 카드 */
  related?: string[];
}

/**
 * 상자 비율과 사진 비율이 많이 다르면(1.4배 이상) 잘라 채우지 않고 통째로 넣는다(오너: 사진 규격 맞추기).
 * 예: 가로로 긴 배너 조각을 4:3 카드에 넣으면 절반이 잘려 나갔다. → 옅은 바탕 위에 contain.
 */
export function fitsBox(key: string, boxW: number, boxH: number) {
  const s = figSize(key);
  const a = s.w / s.h;
  const b = boxW / boxH;
  return Math.max(a / b, b / a) <= 1.4;
}

export function figSize(key: string) {
  const s = (SIZES as Record<string, { w: number; h: number }>)[key];
  return s ?? { w: 1200, h: 800 };
}
export const figSrc = (key: string) => `/img/${key}.webp`;

/** 본문 글자수(공백 제외) — Article.wordCount 용 */
export function docCharCount(d: Doc) {
  const parts: string[] = [d.summary];
  for (const b of d.blocks) {
    if ('title' in b && b.title) parts.push(b.title);
    if ('lead' in b && b.lead) parts.push(b.lead);
    if (b.type === 'text' || b.type === 'notice') parts.push(...b.paragraphs);
    if (b.type === 'points') parts.push(...b.items.flatMap((i) => [i.title, i.desc ?? '']));
    if (b.type === 'steps') parts.push(...b.steps.flatMap((s) => [s.title, s.desc ?? '']));
    if (b.type === 'compare') parts.push(...b.rows.flatMap((r) => [r.label, r.a, r.b]), b.note ?? '');
    if (b.type === 'table') parts.push(...b.head, ...b.rows.flat(), b.note ?? '');
    if (b.type === 'quote') parts.push(b.text);
    if (b.type === 'cases') parts.push(b.note);
  }
  for (const f of d.faq ?? []) parts.push(f.q, f.a);
  return parts.join('').replace(/\s+/g, '').length;
}

/** 목차 — 제목이 있는 블록만 */
export function docToc(d: Doc) {
  const items: Array<{ id: string; label: string }> = [];
  d.blocks.forEach((b, i) => {
    if ('title' in b && b.title) items.push({ id: ('id' in b && b.id) || `sec-${i + 1}`, label: b.title });
  });
  if (d.faq?.length) items.push({ id: 'faq', label: '자주 묻는 질문' });
  return items;
}
