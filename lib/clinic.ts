/**
 * 광화문선치과의원 — 병원 정보 단일 소스(single source of truth).
 *
 * ★ 이 파일이 사이트 전체의 유일한 사실 출처다.
 *   전화번호·주소·진료시간은 화면 여러 곳(헤더, 푸터, 오시는 길, JSON-LD, llms.txt)에 나간다.
 *   두 벌로 적으면 반드시 어긋난다. 여기서만 고친다.
 *
 * ★★ 출처 원칙 ★★
 *   모든 값은 기존 홈페이지(dentalsun.co.kr, 2026-09-08 확인)에 적혀 있던 것이다.
 *   VERIFIED = 기존 홈페이지 본문·푸터·배너에서 그대로 옮긴 값.
 *   UNVERIFIED = 홈페이지에 없어서 아직 확인 못 한 값 — **추측으로 채우지 않는다.**
 *   확인 안 된 값은 화면에서 빠지고 JSON-LD 에서도 빠진다.
 */

export const CLINIC = {
  /** VERIFIED — 푸터 상호명 */
  name: '광화문선치과의원',
  shortName: '광화문 선치과',
  nameEn: 'SUN DENTAL CLINIC',

  /** VERIFIED — 기존 홈페이지 치과소개 첫 배너 문구 */
  tagline: '환자중심의 디지털 치과 진료',
  /*
   * 푸터·메타 설명에 나가는 한 줄. 앞에 지역명을 둔다 — 전 페이지 푸터에 한 번씩 실려
   * 지역 검색에 잡히는 자리다.
   */
  description:
    '서울 중구 세종대로, 광화문역 5호선 6번 출구 도보 2분 광화문선치과의원입니다. 내비게이션·풀아치 디지털 임플란트, 턱관절 치료, 무통·저자극 시스템, MTA 신경치료로 자연치아를 지키는 진료를 합니다.',

  phone: '02-734-8272',
  phoneHref: 'tel:027348272',
  /** VERIFIED — 푸터 */
  fax: '02-720-8272',

  /**
   * VERIFIED — 기존 홈페이지 퀵메뉴·상담 메뉴가 실제로 연결하던 채널.
   * ★ 네이버 예약은 지역 검색(GEO)에 직접 기여한다 — 플레이스와 연결된 예약이라
   *   여기로 들어온 예약이 플레이스 지표로 쌓인다.
   */
  booking: {
    naver: 'https://booking.naver.com/booking/13/bizes/610939',
    /** 온라인상담 메뉴 → 네이버 톡톡 */
    naverTalk: 'https://talk.naver.com/ct/w4mcd2',
    /** 치료후기 메뉴 → 네이버 플레이스 방문자 리뷰 (플레이스 ID 37932471) */
    naverReview: 'https://m.place.naver.com/hospital/37932471/review/visitor',
  },

  /**
   * 지도 서비스의 이 병원 항목 — 기존 홈페이지 오시는 길에 심어져 있던 카카오맵 ID 와
   * 치료후기 링크에 들어 있던 네이버 플레이스 ID 에서 얻었다. sameAs 로 나간다.
   */
  maps: {
    naverPlace: 'https://map.naver.com/p/entry/place/37932471',
    kakaoPlace: 'https://place.map.kakao.com/733212103',
  },

  address: {
    /** VERIFIED — 푸터 */
    full: '서울시 중구 세종대로 135-9, 3층',
    street: '세종대로 135-9',
    floor: '3층',
    /** VERIFIED — 홈 배너 "(투썸플레이스 건물 3층)" · 치과소개 "세종로 파출소 뒤편" */
    landmark: '투썸플레이스 건물 3층 · 세종로 파출소 뒤편',
    locality: '중구',
    region: '서울특별시',
    country: 'KR',
    /** UNVERIFIED — 우편번호는 홈페이지에 없다. 확인 전까지 비워 둔다. */
    postalCode: '',
  },

  /** VERIFIED — 푸터 */
  bizNo: '452-95-01400',
  /** VERIFIED — 푸터 "대표자 : 양대일" */
  director: '양대일',

  /**
   * VERIFIED — 기존 홈페이지 머리말의 역 안내 배지(그림) 그대로.
   *   5호선 광화문역 6번 출구 도보 2분 / 1호선 시청역 3번 출구 도보 5분 / 2호선 시청역 3번 출구 도보 5분
   */
  transit: [
    { line: '5호선', station: '광화문역', exit: '6번 출구', walk: '도보 2분', color: '#8b3fd9' },
    { line: '1호선', station: '시청역', exit: '3번 출구', walk: '도보 5분', color: '#1f3a93' },
    { line: '2호선', station: '시청역', exit: '3번 출구', walk: '도보 5분', color: '#2ea84d' },
  ],
  nearestStation: '5호선 광화문역 6번 출구 도보 2분',

  /** VERIFIED — 홈 하단 "주차안내 : 코리아나 호텔 야외주차장 무료주차" */
  parking: { place: '코리아나 호텔 야외주차장', fee: '무료주차' },

  /** 검색·지역 신호용 지역명 */
  serviceArea: ['광화문', '서울 중구', '종로', '시청', '세종대로'],

  /** VERIFIED — 기존 홈페이지 유튜브 임베드 4편(ID 순서 그대로) */
  videos: [
    { id: '0U9Sm-aEung', title: '광화문 선치과의 디지털 임플란트 — 치료과정 살펴보기', thumb: '/img/video/you-1.webp' },
    { id: 'm2PbHPf0xLM', title: '하루에 완성되는 디지털 임플란트 — 치료과정 살펴보기', thumb: '/img/video/you-2.webp' },
    { id: 'YpRmFDXzq6Y', title: '동영상으로 살펴보는 디지털 풀아치 임플란트 CHAPTER 01', thumb: '/img/video/you-3.webp' },
    { id: 'Et2t4Xt_RQo', title: '동영상으로 살펴보는 디지털 풀아치 임플란트 CHAPTER 02', thumb: '/img/video/you-4.webp' },
  ],

  /** 배포 주소 — Vercel 기본 도메인. 커스텀 도메인을 붙이면 여기만 바꾼다. */
  url: process.env.SITE_URL?.replace(/\/$/, '') || 'https://dentalsun.vercel.app',
} as const;

/**
 * 진료시간 — VERIFIED (홈 하단 안내 + 치과소개 진료시간 표).
 *
 *   월·수·금 10:00–19:00 / 화·목 10:00–21:00(야간) / 토 10:00–14:00
 *   점심시간 13:30–14:30 (토요일은 점심시간 없이 진료)
 *   격주 토요일 진료 · 일요일/공휴일 휴진 · 대체공휴일 정상진료
 *
 * ⚠️ 토요일은 **격주** 진료라 어느 토요일이 진료일인지는 그 달 일정으로만 알 수 있다.
 *    (치과소개 페이지는 "2, 4째주 토요일" 이라 적혀 있으나 2026년 9월 일정표에는 12일(둘째 토요일)이
 *    휴진으로 표시돼 있어 두 표기가 어긋난다 — 홈페이지 문구인 '격주' 만 쓴다.)
 *    그래서 구조화 데이터(openingHoursSpecification)에는 토요일을 **넣지 않는다** — 지도가
 *    휴진 토요일에 '진료 중' 이라고 답하면 환자가 헛걸음한다.
 */
export interface HourRow { day: string; ko: string; open: string; close: string; note?: string; biweekly?: boolean }
export interface HourDisplay { label: string; time: string; note?: string }
export const HOURS: { lunch: { start: string; end: string }; rows: HourRow[]; display: HourDisplay[]; closed: string } = {
  lunch: { start: '13:30', end: '14:30' },
  rows: [
    { day: 'Monday', ko: '월요일', open: '10:00', close: '19:00' },
    { day: 'Tuesday', ko: '화요일', open: '10:00', close: '21:00', note: '야간진료' },
    { day: 'Wednesday', ko: '수요일', open: '10:00', close: '19:00' },
    { day: 'Thursday', ko: '목요일', open: '10:00', close: '21:00', note: '야간진료' },
    { day: 'Friday', ko: '금요일', open: '10:00', close: '19:00' },
    { day: 'Saturday', ko: '토요일', open: '10:00', close: '14:00', note: '격주 진료 · 점심시간 없음', biweekly: true },
  ],
  /** 화면에 보여 주는 묶음 표기 — 기존 홈페이지 표기 순서 그대로 */
  display: [
    { label: '월 · 수 · 금', time: '10:00 – 19:00' },
    { label: '화 · 목', time: '10:00 – 21:00', note: '야간진료' },
    { label: '토요일', time: '10:00 – 14:00', note: '격주 진료 · 점심시간 없음' },
    { label: '점심시간', time: '13:30 – 14:30' },
  ],
  closed: '일요일 · 공휴일 휴진 (대체공휴일 정상진료)',
};

/**
 * 이달의 진료 일정 — 기존 홈페이지 팝업(9월 진료일정 이미지)에서 옮김. VERIFIED.
 * ⚠️ 달이 바뀌면 이 표를 바꾼다. 지난 달 일정이 그대로 남으면 틀린 안내가 된다.
 */
export const MONTHLY_NOTICE = {
  month: '2026-09',
  title: '2026년 9월 진료일정',
  image: '/img/notice/2026-09.webp',
  items: [
    { dates: '9월 12일(토)', label: '휴진' },
    { dates: '9월 24일(목) ~ 26일(토)', label: '추석 연휴 휴진' },
    { dates: '매주 일요일', label: '정기휴진' },
    { dates: '매주 화 · 목', label: '야간진료 (21:00까지)' },
  ],
} as const;

/**
 * 확인 안 된 값. 화면에도 스키마에도 나가지 않는다.
 * geo: 기존 홈페이지에 좌표가 없다. 주소 문자열로 지도 검색 링크만 건다.
 */
export const UNVERIFIED = {
  geo: { verified: false, lat: 0, lng: 0 },
  email: { verified: false, value: '' },
} as const;

/**
 * 기존 홈페이지에 있던 병원 강점 문구 — 홈 첫 화면과 소개에 쓴다. 전부 원문.
 */
export const STRENGTHS = [
  { title: '강남성심병원 외래교수 출신 전문의 진료', desc: '다년간의 임상경험으로 믿을 수 있는 진료, 환자분이 이해하기 쉬운 친절한 설명' },
  { title: '첨단 디지털 장비로 진료하는 3D 디지털치과', desc: '진단부터 치료까지 치과 진료에 디지털을 더해 보다 빠르고 정확한 진료를 약속 드립니다' },
  { title: '철저한 위생관리 멸균 소독 시스템', desc: '교차감염을 차단하여 환자의 안전을 최우선으로 생각합니다' },
  { title: '전원 치과위생사', desc: '치과위생사 면허를 보유한 전문 진료스텝이 편안하고 안전한 진료를 도와드립니다' },
] as const;

/** 위생관리 항목 — 홈 배너 원문 */
export const HYGIENE = [
  '모든 진료 기구 멸균 소독 진행',
  '개별 포장된 1인 1기구 사용',
  '의료용 장갑, 마스크 착용',
  '정수 및 살균 처리 된 위생수 사용',
  '공기살균기 에어로사이드 사용',
] as const;

/** 의료 정보 고지 — 모든 진료 페이지 하단 */
export const MEDICAL_DISCLAIMER =
  '이 페이지의 내용은 일반적인 치과 진료 정보이며 개별 환자의 진단과 치료를 대신하지 않습니다. 치료 방법·기간·결과는 구강 상태에 따라 달라질 수 있으며, 모든 의료 행위에는 부작용이 따를 수 있습니다. 정확한 진단은 내원 후 검사로 가능합니다.';
