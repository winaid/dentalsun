/**
 * 콘텐츠 날짜 — 발행일과 최종 수정일.
 *
 * ★ 지어내지 않기 위해 상수로 둔다. 실제로 글을 쓰거나 고친 날만 적는다.
 *   사이트맵 lastmod 와 JSON-LD dateModified 가 **같은 출처**(이 파일)에서 나온다.
 * ★ 쪽별 수정일은 scripts/contentDates.mjs 가 git 이력(한글이 바뀐 커밋만)에서 뽑아
 *   lib/contentModified.generated.json 에 적는다. 손으로 고치지 말 것.
 */
export const SITE_PUBLISHED = '2026-09-08';
export const SITE_MODIFIED = '2026-09-08';

const OVERRIDES: Record<string, { published?: string; modified?: string }> = {};

import GENERATED from './contentModified.generated.json';
const FROM_GIT: Record<string, string> = GENERATED;

export function contentDates(path: string) {
  const o = OVERRIDES[path] ?? {};
  const fromGit = FROM_GIT[path];
  const modified = o.modified ?? (fromGit && fromGit > SITE_MODIFIED ? fromGit : SITE_MODIFIED);
  return { published: o.published ?? SITE_PUBLISHED, modified };
}

export function formatKoreanDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
