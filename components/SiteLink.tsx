import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * 사이트 안 링크 — next/link 에 rel="nosublink" 만 덧붙인다 (2026-11-04 오너 "이제 여기에 카드가 붙어야돼").
 *
 * ★ 왜: '광화문치과' 통합 1위에 홈 카드(ItemList 6장, app/page.tsx HOME_CARDS) 대신 **메뉴 글자 링크 6개**
 *   (치과소개·턱관절·임플란트·심미치료·보험 틀니&임플란트·매복사랑니)가 붙었다.
 *   카드가 붙는 우리 사이트(circle-dental.shop·store·baon-dental.shop)는 홈 안쪽 링크가 9~17개뿐이고 메뉴가 없다.
 *   이 사이트는 122개 · 메뉴 있음 → 네이버가 메뉴를 서브링크로 고른다.
 *   메뉴가 큰데도 카드가 뜨는 숙면치과 계열은 사이트 안 링크 120~180개에 전부 rel="nosublink" 를 단다.
 * ★ 근거: 네이버 서치어드바이저 FAQ '서브링크 노출' — "서브링크 노출을 원하지 않는 경우에는 <a> 태그에
 *   rel="nosublink" 속성 값을 추가해 주세요." 반영은 다시 읽은 뒤 평균 7일 이내.
 * ★ 화면·동작은 그대로다 — rel 값만 하나 늘어난다. 원래 rel(noopener 등)이 있으면 뒤에 붙인다.
 * ⚠️ 카드가 끝내 안 오면 글자 링크도 없는 맨 결과가 된다. 되돌리려면 각 파일의 import 를 다시 'next/link' 로.
 *    (동그라미 co.kr 도 11-03 같은 처리 — circle-dental-redesign components/SiteLink.tsx)
 */
export default function Link({ rel, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} rel={rel ? `${rel} nosublink` : 'nosublink'} />;
}
