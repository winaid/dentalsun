import type { MetadataRoute } from 'next';
import { CLINIC } from '@/lib/clinic';
import { contentDates } from '@/lib/contentMeta';
import { flatNavPaths } from '@/lib/nav';
import { ALL_DOCS } from '@/lib/content';

/**
 * sitemap.xml — 데이터에서 자동 생성. lastmod 는 빌드 시각이 아니라 contentDates(그 쪽을 고친 날).
 * ⚠️ `new Date()` 로 되돌리지 말 것 — 전 항목이 같은 시각이면 구글이 lastmod 를 통째로 무시한다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
  const seen = new Set<string>();
  return pages.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
