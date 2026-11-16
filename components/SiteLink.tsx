import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * 사이트 안 링크 — next/link 에 rel="nosublink" 을 덧붙인다. 단 아래 SUBLINK_KEEP 다섯 쪽은 빼고(11-16 기준).
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
  /* 2026-11-12 본부장 "매복사랑니 → 심미보철" → 11-16 본부장 "심미보철 → 심미치료(상위 개념) + 맨 앞에 치과소개, 총 5개".
     네이버 글자 링크 이름은 쪽 제목이 아니라 홈 링크 글자를 따른다('광화문 선치과 디지털 임플란트' 쪽이 '임플란트'로 떴다) —
     홈 진료과목·일반진료 카드 모두 '심미치료'로 이 쪽을 가리킨다(app/page.tsx). 11-04 전에도 이 쪽이 '심미치료'로 떴다.
     심미보철(/treatment/aesthetic/prosthetics)은 다시 nosublink.
     풀아치 임플란트(/treatment/implant/full-arch, 11-09 보험 틀니 자리)는 열어 둔 동안 한 번도 안 떴고 이번 '총 5개'에 없어 뺐다 —
     치과소개는 11-09 부터 열려 있었는데 네이버가 여섯 후보 중 넷만 골랐다. 후보를 원하는 다섯으로 줄인다(고르는 건 여전히 네이버). */
  '/treatment/aesthetic', // 심미치료
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
