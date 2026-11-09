import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * 사이트 안 링크 — next/link 에 rel="nosublink" 을 덧붙인다. 단 아래 SUBLINK_KEEP 여섯 쪽은 빼고.
 *
 * ★ 2026-11-09 오너 "광화문치과에 캐러셀 카드 안 생기니 다시 밑에 버튼(글자 링크)이라도. 업체 원하는 대로"
 *   업체(본부장 전달) 요청 = 검색 결과 글자 링크 중 '보험 틀니 → 풀아치 임플란트', '심미치료 → 자연치아 살리기'.
 *   11-04 까지 네이버가 고른 글자 링크: 치과소개·턱관절·임플란트·심미치료·보험 틀니&임플란트·매복사랑니.
 *   → 네이버는 글자 링크를 직접 지정하게 해 주지 않는다(서치어드바이저 FAQ '서브링크 노출': 자동 분석,
 *     빼고 싶은 링크에만 rel="nosublink"). 그래서 **원하는 여섯 쪽만 nosublink 를 떼고** 나머지는 그대로 단다.
 *   순서·개수(폰은 4개)는 네이버가 정한다. 반영은 다시 읽은 뒤 평균 7일 이내(11-04 넣은 nosublink 는 11-05 13시에 빠졌다).
 *
 * 이전(2026-11-04 ~ 11-09): 사이트 안 링크 전부 nosublink — 글자 링크 대신 홈 카드(ItemList)가 뜨게 하려던 것.
 *   11-05 13시 글자 링크는 빠졌지만 카드는 끝내 안 붙어 맨 결과가 됐다.
 * ★ 화면·동작은 그대로다 — rel 값만 달라진다. 원래 rel(noopener 등)이 있으면 뒤에 붙인다.
 */
const SUBLINK_KEEP = new Set([
  '/about', // 치과소개
  '/treatment/tmj', // 턱관절
  '/treatment/implant', // 임플란트
  '/treatment/natural-tooth', // 자연치아 살리기 (심미치료 자리)
  '/treatment/implant/full-arch', // 풀아치 임플란트 (보험 틀니 자리)
  '/treatment/wisdom-tooth', // 매복사랑니
]);

/** '#'·'?' 붙은 주소는 별개 쪽이 아니므로 그대로 막는다(FAQ: fragment URL 쓰지 말 것) */
function keepsSublink(href: ComponentProps<typeof NextLink>['href']) {
  if (typeof href !== 'string') return false;
  if (/[#?]/.test(href)) return false;
  return SUBLINK_KEEP.has(href.replace(/\/$/, '') || '/');
}

export default function Link({ rel, ...props }: ComponentProps<typeof NextLink>) {
  const nosub = keepsSublink(props.href) ? undefined : 'nosublink';
  const merged = [rel, nosub].filter(Boolean).join(' ') || undefined;
  return <NextLink {...props} rel={merged} />;
}
