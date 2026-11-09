import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { put } from '@vercel/blob';

/**
 * 수집 기록 — 검색·AI 봇이 가져간 요청을 Vercel Blob(비공개 저장소 dentalsun-crawl-log)에 한 건씩 남긴다.
 *   (2026-11-09 오너 GO — "네이버가 홈을 다시 읽었는데 아직 이름 줄이 안 바뀐 건지, 아직 안 읽은 건지" 가르려고.
 *    동그라미 co.kr·룩엣미와 같은 장치.)
 * ★ 하는 일은 기록뿐이다 — 응답·화면·주소 이동은 건드리지 않는다(NextResponse.next()).
 *   BLOB_READ_WRITE_TOKEN 이 있을 때만(Vercel 에서 저장소 연결로 들어옴). 사람 방문은 남기지 않는다.
 * 파일 이름에 시각·봇·주소를 넣어 두어 목록만으로 읽힌다(내용에는 user-agent·IP·국가·referer).
 * 읽기: node scripts/crawl-log.mjs [--since 2026-11-09T17:00] [--bot yeti] [--full]   (.env.local 의 BLOB_READ_WRITE_TOKEN)
 * ★ SEO 도구 봇(Ahrefs·Semrush 등)·우리 점검 도구는 빼서 저장 횟수를 아낀다.
 */
const BOTS: [RegExp, string][] = [
  [/yeti/i, 'yeti'],
  [/naver/i, 'naver'],
  [/googlebot|google-inspectiontool|googleother|google-extended|adsbot-google|mediapartners-google/i, 'google'],
  [/bingbot|bingpreview|msnbot/i, 'bing'],
  [/daum|daumoa/i, 'daum'],
  [/gptbot|oai-searchbot|chatgpt-user/i, 'openai'],
  [/claudebot|claude-user|claude-searchbot|anthropic/i, 'claude'],
  [/perplexity/i, 'perplexity'],
  [/applebot/i, 'apple'],
  [/kakaotalk|kakao/i, 'kakao'],
  [/facebookexternalhit|meta-externalagent/i, 'meta'],
  [/bytespider/i, 'bytedance'],
  [/duckduckbot|yandex|baiduspider|petalbot|slurp|seznam/i, 'other-se'],
  [/bot\b|crawler|spider|scrapy|preview|fetch/i, 'bot'],
];
const SKIP = /ahrefs|semrush|mj12|dotbot|blexbot|dataforseo|serpstat|zoominfo|barkrowler|seokicks|megaindex|winaid-verify|winaid-check|^node$/i;
/** 앱 안 브라우저 = 사람 — 네이버 앱 'NAVER(inapp; …)', 카카오톡 'KAKAOTALK 10.x', 다음 앱 'DaumApps'. 미리보기 봇 'kakaotalk-scrap' 은 봇으로 남긴다. */
const IN_APP_HUMAN = /NAVER\(inapp|KAKAOTALK\s|DaumApps/i;
/** 알려진 주소 — 브라우저가 아닌 낯선 도구(curl·python 등)는 이 주소들일 때만 남긴다(취약점 훑기 소음 제외). */
const KNOWN = /^\/($|about|treatment|insight|visit|faq|img\/|robots\.txt|sitemap\.xml|rss\.xml|feed|[0-9a-f]{32}\.txt)/;

function whoIs(ua: string, path: string): string | null {
  if (!ua) return KNOWN.test(path) && !path.startsWith('/img/') ? 'no-ua' : null;
  if (SKIP.test(ua) || IN_APP_HUMAN.test(ua)) return null;
  for (const [re, name] of BOTS) if (re.test(ua)) return name;
  if (!/mozilla/i.test(ua) && KNOWN.test(path)) return 'tool';
  return null;
}

const b64url = (s: string) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function record(req: NextRequest, bot: string) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600e3).toISOString(); // 파일 이름은 한국 시각
  const path = req.nextUrl.pathname + req.nextUrl.search;
  const h = req.headers;
  const body = {
    t: now.toISOString(),
    bot,
    m: req.method,
    host: h.get('host'),
    path,
    ua: h.get('user-agent'),
    ip: (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip'),
    country: h.get('x-vercel-ip-country'),
    ref: h.get('referer'),
    accept: h.get('accept'),
    lang: h.get('accept-language'),
    ims: h.get('if-modified-since'),
    inm: h.get('if-none-match'),
    edge: h.get('x-vercel-id'),
  };
  const name = `crawl/${kst.slice(0, 10)}/${kst.slice(11, 23).replace(/[:.]/g, '')}_${bot}_${b64url(path).slice(0, 160)}_${Math.random().toString(36).slice(2, 8)}.json`;
  return put(name, JSON.stringify(body), { access: 'private', contentType: 'application/json', addRandomSuffix: false }).catch(() => undefined);
}

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const local = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  // host 가 비면 서버 안에서 스스로 부른 요청(이미지 최적화 등) — 남기지 않는다
  if (host && !local && process.env.BLOB_READ_WRITE_TOKEN) {
    const bot = whoIs(req.headers.get('user-agent') || '', req.nextUrl.pathname);
    if (bot) event.waitUntil(record(req, bot));
  }
  return NextResponse.next();
}

// _next/static 만 뺀다 — 카드 사진(/img/cards)·/_next/image 도 봇이 가져가면 남겨야 한다.
export const config = { matcher: ['/((?!_next/static|favicon.ico).*)'] };
