import { allPosts, allClinicalPosts, publishedIso } from '@/lib/blog';
import { CLINIC } from '@/lib/clinic';

export const revalidate = 3600;

/**
 * RSS 2.0 — 블로그(/insight/blog)와 임상 사례·핵심 안내(/insight/clinical) 최신 50편.
 *  · 네이버 서치어드바이저 'RSS 제출' 용. 사이트맵과 달리 새 글을 피드 갱신으로 알린다 (2026-09-11 점검: RSS 없음 → 추가).
 *  · 발행 전 글(예약)은 allPosts 기본값이 걸러 준다. 화면에는 아무 영향이 없다.
 *  · <link> 는 CLINIC.url 을 그대로 쓴다 — 서치어드바이저 등록 주소와 글자까지 같아야 제출이 통과한다.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const base = CLINIC.url;
  const items = [
    ...allPosts().map((p) => ({ ...p, href: `/insight/blog/${p.slug}` })),
    ...allClinicalPosts().map((p) => ({ ...p, href: `/insight/clinical/${p.slug}` })),
  ]
    .sort((a, b) => (publishedIso(a) < publishedIso(b) ? 1 : -1))
    .slice(0, 50);
  const body = items
    .map(
      (p) =>
        `    <item>\n      <title>${esc(p.title)}</title>\n      <link>${base}${p.href}</link>\n      <guid isPermaLink="true">${base}${p.href}</guid>\n      <pubDate>${new Date(publishedIso(p)).toUTCString()}</pubDate>\n${p.category ? `      <category>${esc(p.category)}</category>\n` : ''}      <description>${esc(p.summary)}</description>\n    </item>`,
    )
    .join('\n');
  const last = items[0] ? new Date(publishedIso(items[0])).toUTCString() : new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${esc(CLINIC.name)} 인사이트</title>\n    <link>${base}</link>\n    <description>${esc(CLINIC.description)}</description>\n    <language>ko-KR</language>\n    <lastBuildDate>${last}</lastBuildDate>\n    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />\n${body}\n  </channel>\n</rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' } });
}
