import type { MetadataRoute } from 'next';
import { CLINIC } from '@/lib/clinic';
import { contentDates } from '@/lib/contentMeta';
import { flatNavPaths } from '@/lib/nav';
import { ALL_DOCS } from '@/lib/content';
import { allPostsMerged } from '@/lib/insightFeed';

/* ★ 한 시간마다 — 예약 글(lib/blog.ts)이 날짜가 되면 사이트맵에도 실려야 한다. */
export const revalidate = 3600;

/**
 * sitemap.xml — 데이터에서 자동 생성. lastmod 는 빌드 시각이 아니라 contentDates(그 쪽을 고친 날).
 * ⚠️ `new Date()` 로 되돌리지 말 것 — 전 항목이 같은 시각이면 구글이 lastmod 를 통째로 무시한다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (p: string) => (p === '/' ? CLINIC.url : `${CLINIC.url}${p}`);
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly'): MetadataRoute.Sitemap[number] => ({
    url: url(path),
    lastModified: contentDates(path).modified,
    changeFrequency,
    priority,
  });
  const pages = [
    ...flatNavPaths().map((p) => entry(p, p === '/' ? 1 : 0.8, p === '/' ? 'weekly' : 'monthly')),
    entry('/treatment', 0.9),
    entry('/faq', 0.7),
    entry('/privacy', 0.3, 'yearly'),
    ...ALL_DOCS.map((d) => entry(d.path, d.isHub ? 0.9 : 0.85)),
    /* 블로그 — content/blog 글 + 중앙(winaid) 글. 손으로 적지 말 것(lib/insightFeed). lastmod 는 글의 날짜. */
    { ...entry('/insight/blog', 0.7, 'weekly'), lastModified: new Date() },
    ...(await allPostsMerged()).map((p) => ({ ...entry(`/insight/blog/${p.slug}`, 0.6), lastModified: new Date(p.updated ?? p.date) })),
  ];
  const seen = new Set<string>();
  return pages.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
