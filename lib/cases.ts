import type { Fig } from './docs';

/**
 * 치료 전후 사례 — 옛 홈페이지에 있던 환자 사진(심미보철 3쌍 · 치아미백 3쌍)만 쓴다. 지어내지 않는다.
 * 사진에 박혀 있던 '전/후' 라벨 띠는 잘라 냈고(cases/*.webp), 화면에서 BEFORE/AFTER 를 따로 붙인다.
 * ★ 원본 해상도가 낮다(약 590px) — 오너에게 원본 파일을 요청한 상태. 받으면 같은 키로 교체만 하면 된다.
 */
export interface CasePair {
  before: Fig;
  after: Fig;
}
export interface CaseGroup {
  id: string;
  label: string;
  /** 이 사례가 설명하는 진료 문서 */
  href: string;
  pairs: CasePair[];
}

export const CASE_NOTE =
  '본 사진은 광화문선치과에서 진료받은 환자의 사례이며, 개인의 구강 상태와 시술 종류에 따라 결과는 다를 수 있습니다. 모든 의료 행위에는 부작용이 따를 수 있습니다.';

const pair = (prefix: string, n: number, what: string): CasePair => ({
  before: { key: `cases/${prefix}-${n}-before`, alt: `${what} 전 ${n}번째 사례` },
  after: { key: `cases/${prefix}-${n}-after`, alt: `${what} 후 ${n}번째 사례` },
});

export const CASE_GROUPS: CaseGroup[] = [
  { id: 'prosthetics', label: '심미보철', href: '/treatment/aesthetic/prosthetics', pairs: [1, 2, 3].map((n) => pair('prosth', n, '심미보철')) },
  { id: 'whitening', label: '치아미백', href: '/treatment/aesthetic/whitening', pairs: [1, 2, 3].map((n) => pair('whitening', n, '치아미백')) },
  {
    id: 'mta',
    label: 'MTA 신경치료',
    href: '/treatment/natural-tooth/mta',
    pairs: [
      { before: { key: 'orig/case-mta1-before', alt: '신경이 노출된 어금니의 MTA 치료 전' }, after: { key: 'orig/case-mta1-after', alt: 'MTA 로 신경관을 밀폐한 치료 후' } },
      { before: { key: 'orig/case-mta2-before', alt: '신경 속 깊이 충치가 진행된 치아의 치료 전 엑스레이' }, after: { key: 'orig/case-mta2-after', alt: 'MTA 로 근관을 채운 치료 후 엑스레이' } },
      { before: { key: 'orig/case-mta3-before', alt: '신경치료 후 뿌리 끝 염증이 재발한 치료 전 엑스레이' }, after: { key: 'orig/case-mta3-after', alt: 'MTA 재신경치료 후 엑스레이' } },
    ],
  },
  {
    id: 'wisdom',
    label: '매복 사랑니',
    href: '/treatment/wisdom-tooth',
    pairs: [{ before: { key: 'orig/case-wisdom-before', alt: '옆 치아에 닿아 있던 매복 사랑니의 발치 전 파노라마' }, after: { key: 'orig/case-wisdom-after', alt: '발치 후 임플란트를 식립한 파노라마' } }],
  },
];

export const caseGroup = (id: string) => CASE_GROUPS.find((g) => g.id === id);
