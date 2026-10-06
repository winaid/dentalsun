/**
 * 의료진 — 기존 홈페이지 치과소개 > 의료진 소개 배너에서 그대로 옮겼다 (VERIFIED).
 *
 * ★ 경력·학회는 **한 글자도 더하지 않는다.** 의료인 경력 오표기는 의료광고 처분 최다 유형이다.
 * ★ 2026-09-09 현재 홈페이지 캡처 기준 양대일 대표원장 한 분이다(홍진기 원장 항목은 오너 확인 후 제거). DOCTORS[0] 이 모든 의료 문서의 검토자로 나간다.
 */
export interface Doctor {
  slug: string;
  name: string;
  role: string;
  /** 자격 한 줄 — 배너의 상단 표기 그대로 */
  specialty: string;
  photo: string;
  /** 배경을 지운 사진(누끼) — 홈 의료진 구역처럼 액자 없이 쓰는 자리. AI 재생성이 아니라 배경만 걷어 낸 원본이다 */
  cutout?: string;
  /** 주요 약력 — 배너 원문 순서 */
  career: string[];
  /** 진료 초점 — 기존 홈페이지 메뉴에서 이 원장이 다루는 것으로 표시된 영역 */
  focus: string[];
  /**
   * 원장 소개 — 2026-09-29 원장 피드백 6번으로 신설: 약력 외에 소개 글 한 단락.
   * headline 은 병원이 고른 문구, intro 는 병원이 보내 준 예시 문구 그대로(띄어쓰기만 다듬음).
   * 쓰는 곳 = 홈 의료진 구역뿐(headline = 가운데 머리말 제목, intro = 이름 아래). 의료진 쪽은 원래 짜임 유지(2026-09-29 오너).
   */
  headline: [string, string];
  intro: string;
}

export const DOCTORS: Doctor[] = [
  {
    slug: 'yang-daeil',
    name: '양대일',
    role: '대표원장',
    specialty: '통합치의학과 전문의',
    photo: '/img/doctors/yang.webp',
    cutout: '/img/doctors/yang-cut.webp',
    /* 2026-10-06 원장 PPT 49쪽 — 앞 여섯 줄 순서를 병원이 정했다(NYU 과정은 병원이 새로 준 약력). AAID 부터는 기존 순서 그대로 */
    career: [
      '보건복지부 인증 통합치의학과 전문의',
      '강남성심병원 통합치의학과 레지던트 수련',
      '강남성심병원 치과 외래교수',
      '서울대학교 치의학 대학원 고급치의학 연수과정',
      '서울대학교 치의학 대학원 치의학 교육 연수원',
      '뉴욕대학교(NYU) Digital Meister Course',
      'AAID (미국 임플란트 학회) 정회원',
      'AACD (미국 심미치과 학회) 정회원',
      '대한 구강악안면 임플란트 학회 정회원',
      '대한 치과보존학회 정회원',
      '대한 치과보철학회 정회원',
      '대한 턱관절교합학회 정회원',
      '아시아 턱관절 학회 TMJ 포럼 수료',
      'ATC 임플란트 course 수료',
      'ATC 심미보철 course 수료',
    ],
    focus: ['디지털 임플란트', '턱관절 치료', '자연치아 살리기', '심미치료'],
    headline: ['경험과 시간이 만든 차이,', '치료 결과로 증명합니다'],
    intro:
      '찾아주시는 한 분 한 분께 더욱 세심하고 정확한 진료를 드리기 위해 끊임없이 노력하고 있습니다. 한 번 치료하면 오래 유지될 수 있도록, 기본에 충실한 진료를 약속드립니다.',
  },
];

export const doctorBySlug = (slug: string) => DOCTORS.find((d) => d.slug === slug);
