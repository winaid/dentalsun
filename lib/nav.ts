/**
 * 사이트 구조 — 헤더 메뉴·푸터·사이트맵·빵부스러기가 전부 여기서 파생된다.
 *
 * ★ 기존 홈페이지의 9개 대메뉴 구조를 그대로 잇되, 각 하위 항목을 **자기 주소를 가진 페이지**로
 *   만들었다. 옛 사이트는 한 쪽 안의 #앵커였다(implant.html#3 처럼) — 검색엔진과 AI 는
 *   앵커를 별개 문서로 보지 않아 "UV 임플란트" 같은 질의에 답할 문서가 없었다.
 */
export interface NavChild {
  label: string;
  href: string;
  desc?: string;
  external?: boolean;
}
export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  {
    label: '치과소개',
    href: '/about',
    children: [
      { label: '광화문선치과 소개', href: '/about', desc: '환자중심의 디지털 치과 진료' },
      { label: '의료진 소개', href: '/about/doctors', desc: '통합치의학과 전문의 · 강남성심병원 외래교수' },
      { label: '디지털치과 장비소개', href: '/about/equipment', desc: '3D 구강스캐너 · CT · 수술 가이드 · 당일 보철' },
      { label: '둘러보기', href: '/about#tour', desc: '진료실 · 수술실 · 대기실' },
      { label: '오시는 길 · 진료시간', href: '/visit', desc: '광화문역 6번 출구 도보 2분' },
    ],
  },
  {
    label: '임플란트',
    href: '/treatment/implant',
    children: [
      { label: '내비게이션 임플란트', href: '/treatment/implant/navigation', desc: '컴퓨터 모의수술로 오차를 줄인 무절개 수술' },
      { label: '풀아치 임플란트', href: '/treatment/implant/full-arch', desc: '4~6개 최소식립으로 전체 치아 기능 회복' },
      { label: 'UV 임플란트', href: '/treatment/implant/uv', desc: '잇몸뼈가 부족해도 빠른 골유착' },
      { label: '자가혈 임플란트', href: '/treatment/implant/prf', desc: '뼈이식이 필요하다면 PRF' },
      { label: '맞춤 임플란트', href: '/treatment/implant/custom', desc: '내 잇몸에 꼭 맞게 제작' },
      { label: '보증제도', href: '/treatment/implant/warranty', desc: '치료 후 사후 관리 보증표' },
    ],
  },
  {
    label: '턱관절',
    href: '/treatment/tmj',
    children: [
      { label: '턱관절치료 노하우', href: '/treatment/tmj', desc: '근본적인 원인을 찾는 개인별 맞춤 진료' },
      { label: '주요증상', href: '/treatment/tmj/symptoms', desc: '소리 · 통증 · 입 벌리기 힘듦' },
      { label: '치료방법', href: '/treatment/tmj/treatments', desc: '약물 · 물리치료 · 보톡스 · 스플린트 · 관절강 세척' },
    ],
  },
  {
    label: '심미치료',
    href: '/treatment/aesthetic',
    children: [
      { label: '심미보철', href: '/treatment/aesthetic/prosthetics', desc: '라미네이트 · 올세라믹 · 지르코니아' },
      { label: '치아미백', href: '/treatment/aesthetic/whitening', desc: '전문가 미백' },
    ],
  },
  {
    label: '보험 틀니&임플란트',
    href: '/treatment/insurance',
    children: [
      { label: '보험틀니', href: '/treatment/insurance/denture', desc: '만 65세 이상 건강보험 적용' },
      { label: '보험임플란트', href: '/treatment/insurance/implant', desc: '1인당 평생 2개 · 본인부담 30%' },
    ],
  },
  {
    label: '매복사랑니',
    href: '/treatment/wisdom-tooth',
    children: [
      { label: '사랑니발치 노하우', href: '/treatment/wisdom-tooth', desc: '3D CT 로 신경 위치를 확인한 뒤 발치' },
      { label: '발생되는 문제', href: '/treatment/wisdom-tooth#problems', desc: '충치 · 잇몸질환 · 구취 · 부정교합' },
      { label: '발치과정', href: '/treatment/wisdom-tooth#process', desc: '절개 → 분할 → 발치 → 봉합' },
    ],
  },
  {
    label: '자연치아살리기',
    href: '/treatment/natural-tooth',
    children: [
      { label: 'MTA 신경치료', href: '/treatment/natural-tooth/mta', desc: '생체 친화적 재료로 재발 확률을 낮춘 신경치료' },
      { label: '엔도소닉 초음파 세척기', href: '/treatment/natural-tooth/endosonic', desc: '효과적인 근관 세척' },
    ],
  },
  {
    label: '무통&저자극시스템',
    href: '/treatment/painless',
    children: [
      { label: '무통마취', href: '/treatment/painless/anesthesia', desc: 'NO-PAIN III 무통마취기' },
      { label: '도포 & 가글마취', href: '/treatment/painless/anesthesia#topical', desc: '주사 바늘 · 스케일링 민감 환자' },
      { label: '수면마취', href: '/treatment/painless/sedation', desc: '의식하 진정요법' },
      { label: '에어 플로우', href: '/treatment/painless/airflow', desc: '저자극 스케일링 · GBT' },
    ],
  },
  {
    label: '인사이트',
    href: '/insight',
    children: [
      { label: '증상별 안내', href: '/insight#symptoms', desc: '턱 소리 · 시린 이 · 잇몸 출혈 · 사랑니 통증 …' },
      { label: '치료 가이드', href: '/insight#guides', desc: '임플란트 과정 · 비용 요인 · 건강보험 · 턱관절 순서' },
      { label: '치과 용어 풀이', href: '/insight/guide/glossary', desc: '픽스처 · 골유착 · 스플린트 · MTA …' },
      { label: '치과가 무서운 분들께', href: '/insight/guide/dental-anxiety', desc: '무통마취 · 수면치료 · 첫 방문 준비' },
    ],
  },
  {
    label: '상담 및 후기',
    href: '/visit#contact',
    children: [
      { label: '온라인상담 (네이버 톡톡)', href: 'https://talk.naver.com/ct/w4mcd2', external: true },
      { label: '네이버 예약', href: 'https://booking.naver.com/booking/13/bizes/610939', external: true },
      { label: '치료후기 (네이버 플레이스)', href: 'https://m.place.naver.com/hospital/37932471/review/visitor', external: true },
      { label: '자주 묻는 질문', href: '/faq' },
    ],
  },
];

/** 사이트맵·내부 링크 점검용 — 사이트 안 주소만, # 조각 제거, 중복 제거 */
export function flatNavPaths(): string[] {
  const out = new Set<string>(['/']);
  for (const item of NAV) {
    if (!item.href.startsWith('http')) out.add(item.href.split('#')[0]);
    for (const c of item.children ?? []) {
      if (c.external || c.href.startsWith('http')) continue;
      out.add(c.href.split('#')[0]);
    }
  }
  return [...out];
}

/** 진료 허브(/treatment)에 카드로 나열하는 9 갈래 — 기존 홈페이지 대메뉴 순서 */
export const TREATMENT_HUBS = NAV.filter((n) => n.href.startsWith('/treatment'));
