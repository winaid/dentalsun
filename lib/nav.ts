/**
 * 사이트 구조 — 헤더 메뉴·푸터·사이트맵·빵부스러기가 전부 여기서 파생된다.
 *
 * ★ 기존 홈페이지의 9개 대메뉴를 2026-09-21 오너 지시로 **다섯**으로 줄였다.
 *   - 임플란트: 내비게이션 + 맞춤 → '디지털 맞춤 임플란트' 한 쪽. 보험 틀니·임플란트는 대메뉴에서 빼고 여기 하위로.
 *   - 턱관절: 하위 7 → 3 (장애란?·구조·원인 / 증상·자가진단·전신증상 / 치료법).
 *   - 심미치료·매복사랑니·자연치아살리기·무통&저자극 → '일반진료' 한 대메뉴 아래 네 갈래(각 허브 쪽은 그대로).
 *   - 인사이트 + 상담 및 후기 → '인사이트 · 후기'. 네이버 톡톡 상담은 사이트 전체에서 뺐다(오너 "이제 안 한대").
 *   각 하위 항목은 **자기 주소를 가진 페이지**다(옛 사이트의 #앵커는 검색엔진·AI 가 별개 문서로 보지 않았다).
 *   없어진 주소는 next.config.ts 가 301 로 잇는다.
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
      { label: '디지털치과 장비소개', href: '/about/equipment', desc: '3D 구강스캐너 · CT · 수술 가이드 · 캐드캠' },
      { label: '둘러보기', href: '/about#tour', desc: '진료실 · 수술실 · 대기실' },
      { label: '오시는 길 · 진료시간', href: '/visit', desc: '광화문역 6번 출구 도보 2분' },
    ],
  },
  {
    label: '임플란트',
    href: '/treatment/implant',
    children: [
      { label: '내비게이션 임플란트', href: '/treatment/implant/navigation', desc: 'CBCT 모의 식립 · 수술 가이드 · 최소 절개' },
      { label: '맞춤 임플란트', href: '/treatment/implant/custom', desc: '잇몸 라인에 맞춘 맞춤 지대주(커스텀 어버트먼트)' },
      { label: '풀아치 임플란트', href: '/treatment/implant/full-arch', desc: '무치악 · 다수 치아 상실 시 4~6개 식립 고정성 보철' },
      { label: 'UV 임플란트', href: '/treatment/implant/uv', desc: '픽스처 표면 UV 광활성화 · 골유착 환경 개선' },
      { label: '자가혈 임플란트', href: '/treatment/implant/prf', desc: '골이식 시 자가혈 농축 성분(PRF) 활용' },
      { label: '뼈이식 · 상악동거상술', href: '/treatment/implant/bone-graft', desc: '잇몸뼈가 부족할 때 · 3D CT로 확인 후 필요한 만큼 채움' },
      { label: '보험 틀니 · 임플란트', href: '/treatment/insurance', desc: '만 65세 이상 건강보험 적용 · 본인부담 30%' },
      { label: '보증제도', href: '/treatment/implant/warranty', desc: '치료 후 사후 관리 보증표' },
    ],
  },
  {
    label: '턱관절',
    href: '/treatment/tmj',
    /* 2026-09-21 오너 — 7쪽은 너무 많아 3쪽으로. 구조·원인은 허브에, 자가진단·전신증상은 증상 쪽에 합쳤다 */
    children: [
      { label: '턱관절 장애란?', href: '/treatment/tmj', desc: '정의 · 3대 증상 · 관절의 구조 · 원인 · 진료 노하우' },
      { label: '증상과 자가진단', href: '/treatment/tmj/symptoms', desc: '관절잡음 · 저작근 통증 · 개구장애 · 자가진단' },
      { label: '이갈이 · 이악물기', href: '/treatment/tmj/bruxism', desc: '수면 이갈이 · 주간 이악물기 · 치아 마모 · 교근 비대' },
      { label: '치료법', href: '/treatment/tmj/treatment', desc: '약물 · 물리치료 · 보톡스 · 교합안정장치 · 관절강 세척술' },
    ],
  },
  {
    label: '일반진료',
    href: '/treatment/general',
    children: [
      { label: '심미치료', href: '/treatment/aesthetic', desc: '라미네이트 · 올세라믹 · 지르코니아 · 치아미백' },
      { label: '매복사랑니', href: '/treatment/wisdom-tooth', desc: '3D CT 로 신경 위치를 확인한 뒤 발치' },
      { label: '자연치아 살리기', href: '/treatment/natural-tooth', desc: 'MTA 근관치료 · 엔도소닉 초음파 세척' },
      { label: '재근관치료', href: '/treatment/re-root-canal', desc: '근관치료 후 재발한 치근단 염증 · 재치료' },
      { label: '치주치료', href: '/treatment/periodontal', desc: '치은염 · 치주염 · 치석제거 · 치근활택술' },
      { label: '무통 & 저자극 시스템', href: '/treatment/painless', desc: '무통마취 · 도포 · 가글마취 · 에어플로우' },
    ],
  },
  {
    label: '인사이트 · 후기',
    href: '/insight',
    children: [
      { label: '블로그', href: '/insight/blog', desc: '진료실에서 자주 받는 질문을 글로 — 새 글 예약 발행' },
      { label: '임상 사례', href: '/insight/clinical', desc: '실제 치료 과정을 사진과 함께 — 상악동거상술 · 풀아치 · 치근단절제술 …' },
      { label: '증상별 안내', href: '/insight#symptoms', desc: '턱 소리 · 시린 이 · 잇몸 출혈 · 사랑니 통증 …' },
      { label: '치료 가이드', href: '/insight#guides', desc: '임플란트 과정 · 비용 요인 · 건강보험 · 턱관절 순서' },
      { label: '치과 용어 풀이', href: '/insight/guide/glossary', desc: '픽스처 · 골유착 · 스플린트 · MTA …' },
      { label: '치과가 무서운 분들께', href: '/insight/guide/dental-anxiety', desc: '무통마취 · 도포마취 · 첫 방문 준비' },
      { label: '치료후기 (네이버 플레이스)', href: 'https://m.place.naver.com/hospital/37932471/review/visitor', external: true },
      { label: '자주 묻는 질문', href: '/faq', desc: '진료시간 · 예약 · 비용과 보험 · 마취' },
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

/** 진료 허브(/treatment)에 카드로 나열하는 갈래 — 대메뉴 순서(임플란트 · 턱관절 · 일반진료) */
export const TREATMENT_HUBS = NAV.filter((n) => n.href.startsWith('/treatment'));
