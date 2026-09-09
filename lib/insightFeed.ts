/**
 * 중앙(winaid) 인사이트 글 — 공개 API 에서 받아 우리 블로그에 **섞어** 싣는다.
 *
 * ★ 왜 (2026-09-08 오너: "중앙 시스템에서 발행하는 글을 우리 블로그에 연동")
 *   중앙이 매일 오전 11시(KST)에 한 편씩 발행한다. 그 글을 사람이 옮겨 적지 않고, 목록·상세·
 *   사이트맵·구조화 데이터가 content/blog 글과 똑같이 따라오게 한다. 저장하지 않는다 —
 *   요청 때 API 로 받고(300초 캐시) 페이지 ISR(3600초)이 다시 그린다.
 *
 * ★ 규칙 (HANDOFF-insights-api.md)
 *   · 인증 없음, 키 없음. hospital=slug 하나면 된다. Supabase 키를 여기 넣지 말 것.
 *   · 본문을 손대지 않는다 — 의료법 검사를 중앙이 발행 전에 했다. 여기서 문장을 고치거나
 *     옆에 광고 문구를 붙이면 그 검사가 무의미해진다. 우리가 하는 건 위생 처리(sanitizeBody)와
 *     표를 넘치지 않게 감싸는 것뿐이다.
 *   · 실패해도 페이지를 죽이지 않는다 — 목록은 우리 글만 남고, 상세는 404 로 넘긴다.
 *   · 표지 사진은 정해진 호스트(CENTRAL_IMAGE_HOSTS)만 그린다. next.config.ts remotePatterns 와 짝.
 *
 * ⚠️ 관리자 화면(/admin)은 이 글을 모른다 — 고치거나 내리려면 중앙에서 발행 취소한다.
 * ⚠️ 시험할 때는 INSIGHTS_HOSPITAL_SLUG=winaid 로 바꿔 winaid 글로 화면을 본다(중앙에 광화문선치과 글이
 *    0편일 때). 그 값이 배포 환경변수에 들어가면 남의 글이 실린다 — 로컬에서만.
 */
import { allPosts, publishKey, sanitizeBody, type BlogPost } from './blog';
import hiddenCfg from '../content/central-hidden.json';

export const CENTRAL_BASE = (process.env.INSIGHTS_API_BASE ?? 'https://winaid-request.vercel.app').replace(/\/+$/, '');
export const CENTRAL_HOSPITAL = process.env.INSIGHTS_HOSPITAL_SLUG ?? 'sun-dental';
const BASE = CENTRAL_BASE;
const HOSPITAL = CENTRAL_HOSPITAL;
/**
 * 관리자가 숨긴 중앙 글(lib/centralHidden.ts, /admin '중앙에서 오는 글'). 빌드 때 읽는다 —
 * 관리자가 파일을 커밋하면 Vercel 이 다시 빌드하므로 1~2분 뒤 목록·상세·사이트맵에서 함께 빠진다.
 */
const HIDDEN = new Set<string>(((hiddenCfg as { hidden?: string[] }).hidden ?? []).filter((s) => typeof s === 'string'));
/** 표지 사진을 믿고 그릴 호스트. next.config.ts images.remotePatterns 와 같이 고친다. */
export const CENTRAL_IMAGE_HOSTS = ['xmbyxlimqvyvijcpzsal.supabase.co'];

interface ApiItem {
  slug: string;
  post_type: 'column' | 'blog';
  title: string;
  excerpt: string;
  cover_image: string | null;
  tags: string[];
  category: string | null;
  published_at: string;
  content_html?: string;
}
interface ApiList {
  ok: boolean;
  items: ApiItem[];
  hasMore: boolean;
}
interface ApiDetail {
  ok: boolean;
  item: ApiItem;
}

/** UTC ISO → 한국 날짜·시각. 목록 정렬과 예약 게이트가 KST 문자열로 돌아가서다(lib/blog.ts). */
function kst(iso: string): { date: string; time: string } {
  const t = new Date(iso).getTime();
  const d = new Date((Number.isFinite(t) ? t : Date.now()) + 9 * 3600 * 1000).toISOString();
  return { date: d.slice(0, 10), time: d.slice(11, 16) };
}

function safeImage(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && CENTRAL_IMAGE_HOSTS.includes(u.hostname) ? url : undefined;
  } catch {
    return undefined;
  }
}

/** 표는 좁은 화면에서 넘친다(문서 권고) — 감싸서 가로 스크롤을 준다. globals.css .table-wrap */
const wrapTables = (html: string) =>
  html.replace(/<table\b/gi, '<div class="table-wrap"><table').replace(/<\/table>/gi, '</table></div>');

function toPost(it: ApiItem): BlogPost {
  const { date, time } = kst(it.published_at);
  return {
    slug: it.slug,
    title: it.title,
    date,
    time: time === '00:00' ? undefined : time,
    summary: it.excerpt ?? '',
    /* 분류는 대개 null 로 온다. 칼럼은 성격이 달라 표시라도 해 둔다(문서: 섞어 보이면 둘 다 안 읽힌다). */
    category: it.category ?? (it.post_type === 'column' ? '칼럼' : undefined),
    image: safeImage(it.cover_image),
    html: it.content_html ? wrapTables(sanitizeBody(it.content_html)) : '',
    source: 'central',
  };
}

async function api<T extends { ok: boolean }>(qs: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/api/public/insights?hospital=${encodeURIComponent(HOSPITAL)}&${qs}`, {
      next: { revalidate: 300 },
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as T;
    return j && j.ok ? j : null;
  } catch {
    return null;
  }
}

/** 중앙 글 전부(발행된 것만 온다). 하루 한 편이라 100편씩 다섯 장이면 1년이 넘는다. */
export async function centralPosts(): Promise<BlogPost[]> {
  const out: BlogPost[] = [];
  for (let page = 1; page <= 5; page++) {
    const j = await api<ApiList>(`page=${page}&limit=100`);
    if (!j) break;
    for (const it of j.items ?? []) if (it.slug && it.title && !HIDDEN.has(it.slug)) out.push(toPost(it));
    if (!j.hasMore) break;
  }
  return out;
}

export async function centralPost(slug: string): Promise<BlogPost | undefined> {
  if (!/^[a-z0-9][a-z0-9-]{0,120}$/i.test(slug) || HIDDEN.has(slug)) return undefined;
  const j = await api<ApiDetail>(`slug=${encodeURIComponent(slug)}`);
  return j?.item?.slug ? toPost(j.item) : undefined;
}

/** 우리 글 + 중앙 글, 최신순. 같은 slug 면 우리 글이 이긴다. */
export async function allPostsMerged(): Promise<BlogPost[]> {
  const local = allPosts();
  const seen = new Set(local.map((p) => p.slug));
  const central = (await centralPosts()).filter((p) => !seen.has(p.slug));
  return [...local, ...central].sort((a, b) =>
    publishKey(a) < publishKey(b) ? 1 : publishKey(a) > publishKey(b) ? -1 : 0,
  );
}

/** 상세 — 우리 글이 먼저, 없으면 중앙에 물어본다(상세 요청 한 번). */
export async function postBySlugMerged(slug: string): Promise<BlogPost | undefined> {
  return allPosts().find((p) => p.slug === slug) ?? (await centralPost(slug));
}

/**
 * 본문 끝 '자주 묻는 질문' 아래 h3/p 쌍 → FAQPage 구조화 데이터 재료(문서: AI 검색이 그대로 읽어 간다).
 * 그 구획이 없으면 빈 배열 — 우리 글에 걸어도 해가 없다.
 */
export function extractFaq(html: string): Array<{ q: string; a: string }> {
  const i = html.search(/<h2[^>]*>\s*자주 묻는 질문\s*<\/h2>/);
  if (i < 0) return [];
  const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return [...html.slice(i).matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => ({ q: strip(m[1]), a: strip(m[2]) }))
    .filter((f) => f.q && f.a);
}
