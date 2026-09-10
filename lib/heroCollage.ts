import type { CollageCard, CollageItem } from '@/components/HeroCollage';

/**
 * 진료·인사이트 문서의 첫 화면 콜라주 표 — 쪽마다 사진 세 장(세로·가로·4:3)과 제목 두 줄.
 *  · 사진은 옛 홈페이지(dentalsun.co.kr)의 해당 쪽에 실제로 쓰인 사진을 우선 고른다(scripts/crops 의 원본 조각).
 *    원본에 사진이 없는 인사이트 글만 연출 사진(ai/*)을 섞는다.
 *  · lines: 제목을 두 줄로 나눈 것. {중괄호} 안은 주황 강조. 둘째 줄이 없으면 한 줄.
 *  · items: 카드 세 장의 글. 없으면 DocPage 가 문서의 첫 'points' 블록에서 세 개를 가져온다.
 * ★ 생성 스크립트: C:/tmp/gen-hero.mjs (사진 설명은 scripts/crops/*.json 의 alt 를 그대로 씀).
 */
export interface HeroCollageSpec {
  lines: [string, string?];
  /** 제목 위 작은 줄 — 옛 홈페이지 배너의 윗줄 문구를 살리는 자리. 없으면 문서의 eyebrow */
  kicker?: string;
  /** 첫 화면 설명 한 줄 — 없으면 문서 요약 앞부분. 제목이 짧은 쪽이 허전하지 않게 옛 배너 문구를 쓴다 */
  lead?: string;
  cards: [CollageCard, CollageCard, CollageCard];
  items?: CollageItem[];
}

export const HERO_COLLAGE: Record<string, HeroCollageSpec> = {
  '/treatment/implant': {
    lines: ['광화문 선치과', '{디지털} 임플란트'],
    kicker: '3D 로 계획하고 가이드로 식립합니다',
    lead: '3D CT 와 구강스캐너로 뼈·신경 위치를 확인하고, 모의수술로 정한 자리에 가이드를 대고 식립합니다.',
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형' }, shape: 'std' },
    ],
  },
  '/treatment/implant/navigation': {
    lines: ['내비게이션', '{임플란트}'],
    cards: [
      { fig: { key: 'orig/implant-nav-guide', alt: '하악 모형에 투명 수술 가이드를 얹고 드릴을 맞춘 모습' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-nav-plan', alt: 'CT 위에 임플란트 식립 경로를 잡는 계획 소프트웨어 화면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형' }, shape: 'std' },
    ],
  },
  '/treatment/implant/full-arch': {
    lines: ['풀아치', '{임플란트}'],
    kicker: '최소식립으로 무치악 해결',
    lead: '4~6개의 임플란트로 위·아래 전체 치아의 기능을 회복하는 방법입니다. 남은 뼈 상태에 따라 계획이 달라집니다.',
    cards: [
      { fig: { key: 'orig/implant-fa-surgery', alt: '수술실에서 임플란트 수술 중인 의료진' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-fa-fixed', alt: '임플란트 여섯 개로 고정한 전악 보철 렌더' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-models', alt: '상악·하악 전악 임플란트 보철 모형' }, shape: 'std' },
    ],
  },
  '/treatment/implant/uv': {
    lines: ['UV', '{임플란트}'],
    cards: [
      { fig: { key: 'implant/uv', alt: 'UV 임플란트 표면 처리 개념도' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-uv', alt: 'UV 활성화 장비에 임플란트 픽스처를 넣는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'std' },
    ],
  },
  '/treatment/implant/prf': {
    lines: ['자가혈(PRF)', '{임플란트}'],
    cards: [
      { fig: { key: 'implant/prf', alt: '자가혈(PRF) 추출 개념도' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-prf', alt: '원심분리기에서 혈액 튜브를 꺼내는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'std' },
    ],
  },
  '/treatment/implant/custom': {
    lines: ['맞춤', '{임플란트}'],
    cards: [
      { fig: { key: 'implant/custom', alt: '맞춤 어버트먼트 개념도' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-custom-fit', alt: '잇몸 선에 맞춘 맞춤 어버트먼트 단면 일러스트' }, shape: 'wide' },
      { fig: { key: 'orig/implant-custom-stock', alt: '기성품 어버트먼트 단면 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/implant/warranty': {
    lines: ['광화문 선치과', '{보증제도}'],
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'scene/intro-1', alt: '광화문선치과 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-review-note', alt: '노트에 Review 라고 쓰는 손' }, shape: 'std' },
    ],
  },
  '/treatment/tmj': {
    lines: ['턱관절', '{치료}'],
    kicker: '턱관절이 아픈 이유부터',
    lead: '턱에서 소리가 나고 아픈 이유를 검사로 먼저 확인하고, 찾은 원인에 맞춰 단계적으로 치료합니다.',
    cards: [
      { fig: { key: 'orig/tmj-hero', alt: '확대경을 쓰고 환자를 진료하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/misc-tmj-skull', alt: '두개골 모형의 턱관절을 펜으로 가리키는 모습' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-laser', alt: '물리치료 — 관절 팔이 달린 레이저 장비' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/symptoms': {
    lines: ['턱관절', '{주요 증상과 원인}'],
    cards: [
      { fig: { key: 'scene/tmj-sym-1', alt: '턱관절에서 소리가 나는 증상' }, shape: 'portrait' },
      { fig: { key: 'scene/tmj-1', alt: '턱관절 통증을 호소하는 모습' }, shape: 'wide' },
      { fig: { key: 'scene/tmj-sym-2', alt: '턱관절 통증과 두통 증상' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/treatments': {
    lines: ['턱관절', '{치료 방법}'],
    cards: [
      { fig: { key: 'orig/tmj-tx-botox', alt: '보톡스 치료 — 바이알에서 주사기로 약을 뽑는 장갑 낀 손' }, shape: 'portrait' },
      { fig: { key: 'orig/tmj-tx-laser', alt: '물리치료 — 관절 팔이 달린 레이저 장비' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-splint', alt: '스플린트 장치 — 검은 배경 위 석고 모형과 투명 스플린트' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic': {
    lines: ['{심미치료}'],
    kicker: '치아 모양 · 색 · 배열을 함께 봅니다',
    lead: '라미네이트·올세라믹·지르코니아 심미보철과 전문가 치아미백으로 앞니의 인상을 다듬습니다.',
    cards: [
      { fig: { key: 'orig/misc-whitening-model', alt: '하얀 치아를 드러내며 웃는 여성 모델' }, shape: 'portrait' },
      { fig: { key: 'orig/misc-veneer-teeth', alt: '라미네이트를 붙이는 앞니 일러스트' }, shape: 'wide' },
      { fig: { key: 'aesthetic/laminate', alt: '라미네이트' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic/prosthetics': {
    lines: ['{심미보철}'],
    kicker: '내 치아 상태에 따른 심미보철',
    lead: '손톱같이 얇은 라미네이트부터 치아 전체를 덮는 올세라믹·지르코니아까지, 남은 치아 구조에 맞는 방법을 고릅니다.',
    cards: [
      { fig: { key: 'aesthetic/zirconia', alt: '지르코니아 크라운' }, shape: 'portrait' },
      { fig: { key: 'aesthetic/laminate', alt: '라미네이트' }, shape: 'wide' },
      { fig: { key: 'aesthetic/allceramic', alt: '올세라믹 크라운' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic/whitening': {
    lines: ['{치아미백}'],
    kicker: '전문가 치아미백',
    lead: '치아 표면에 전문가용 미백제를 바르고 광선으로 활성화해 변색된 치아 색을 밝히는 진료입니다.',
    cards: [
      { fig: { key: 'orig/misc-whitening-model', alt: '하얀 치아를 드러내며 웃는 여성 모델' }, shape: 'portrait' },
      { fig: { key: 'aesthetic/whitening', alt: '전문가 치아미백' }, shape: 'wide' },
      { fig: { key: 'scene/smile', alt: '가지런하고 하얀 치아로 웃는 모습' }, shape: 'std' },
    ],
  },
  '/treatment/insurance': {
    lines: ['보험 틀니 &', '{임플란트}'],
    kicker: '만 65세 이상 건강보험 급여',
    lead: '전체틀니·부분틀니와 임플란트 2개까지 건강보험이 적용됩니다. 본인 부담금은 30% 입니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insurance-denture', alt: '부분 틀니를 두 손으로 살펴보는 어르신의 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-denture', alt: '전악 임플란트 보철물과 분홍 틀니' }, shape: 'std' },
    ],
  },
  '/treatment/insurance/denture': {
    lines: ['{보험틀니}'],
    kicker: '만 65세 이상 건강보험 급여',
    lead: '치아가 전혀 없으면 전체틀니, 일부 남아 있으면 부분틀니 — 둘 다 건강보험이 적용됩니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insurance-denture', alt: '부분 틀니를 두 손으로 살펴보는 어르신의 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-models', alt: '상악·하악 전악 임플란트 보철 모형' }, shape: 'std' },
    ],
  },
  '/treatment/insurance/implant': {
    lines: ['보험', '{임플란트}'],
    kicker: '1인당 평생 2개까지',
    lead: '만 65세 이상이면서 치아가 일부라도 남아 있으면 임플란트 2개까지 건강보험이 적용됩니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-fa-denture', alt: '전악 임플란트 보철물과 분홍 틀니' }, shape: 'wide' },
      { fig: { key: 'orig/denture-implant-render', alt: '픽스처·어버트먼트·크라운이 분해된 임플란트 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/wisdom-tooth': {
    lines: ['매복사랑니', '{발치}'],
    kicker: '3D CT 로 보고 빼는 매복사랑니',
    lead: '잇몸 안에 묻혀 있거나 신경에 가까운 사랑니를 3D CT 로 확인한 뒤, 신경과 옆 치아를 건드리지 않는 순서로 빼냅니다.',
    cards: [
      { fig: { key: 'orig/wisdom-doctor', alt: '확대경을 쓰고 사랑니를 발치하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/wisdom-ct-screen', alt: '3D CT 판독 화면 — 사랑니와 하치조신경 위치 확인' }, shape: 'wide' },
      { fig: { key: 'orig/misc-wisdom-tooth', alt: '누워서 난 매복 사랑니 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth': {
    lines: ['자연치아', '{살리기}'],
    kicker: '뺄지 살릴지 다시 봅니다',
    lead: 'MTA 신경치료와 확대경 정밀 진료로, 뽑기 전에 남길 수 있는지부터 확인합니다.',
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/endo-hero', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치수(신경)가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth/mta': {
    lines: ['MTA', '{신경치료}'],
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/case-mta1-after', alt: 'MTA 로 신경을 덮고 보철로 마무리한 어금니 — 치료 후' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치수(신경)가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth/endosonic': {
    lines: ['엔도소닉', '{초음파 세척기}'],
    cards: [
      { fig: { key: 'scene/endosonic', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 장면' }, shape: 'portrait' },
      { fig: { key: 'orig/endo-hero', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shape: 'std' },
    ],
  },
  '/treatment/painless': {
    lines: ['무통 & 저자극', '{시스템}'],
    kicker: '통증을 줄인 편안한 진료',
    lead: '무통마취기와 저자극 스케일러, 수면치료로 진료 중 느끼는 불편함을 줄입니다.',
    cards: [
      { fig: { key: 'orig/pain-hero', alt: '파노라마 모니터 앞에서 무통마취기(NO PAIN III)로 마취하는 원장' }, shape: 'portrait' },
      { fig: { key: 'equip/painless-set', alt: '무통 & 저자극 시스템 장비' }, shape: 'wide' },
      { fig: { key: 'orig/pain-nopain', alt: '컴퓨터 제어 무통마취기 NO PAIN III 장비' }, shape: 'std' },
    ],
  },
  '/treatment/painless/anesthesia': {
    lines: ['무통마취 ·', '{도포 & 가글마취}'],
    kicker: '컴퓨터 자동 마취 NO-PAIN III',
    lead: '일정한 속도와 압력으로 마취액을 넣고 극세사 바늘을 써서 마취 주사의 통증을 줄입니다.',
    cards: [
      { fig: { key: 'orig/pain-hero', alt: '파노라마 모니터 앞에서 무통마취기(NO PAIN III)로 마취하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/add-lidoca-gel', alt: '잇몸 도포마취제 리도카겔 상자·통과 딸기' }, shape: 'wide' },
      { fig: { key: 'orig/add-lidoca-gargle', alt: '가글마취제 리도카글액 2% 병(파란 치아 아이콘 포함)' }, shape: 'std' },
    ],
  },
  '/treatment/painless/sedation': {
    lines: ['{수면치료}', '(의식하 진정요법)'],
    kicker: '의식하 진정요법',
    lead: '치과가 무섭거나 오래 걸리는 수술이라면, 진정제로 긴장을 낮춘 상태에서 진료합니다.',
    cards: [
      { fig: { key: 'orig/sleep-hero', alt: '눈을 감고 편안하게 진료받는 여성 환자' }, shape: 'portrait' },
      { fig: { key: 'sun/consult-monitor', alt: '모니터로 촬영 사진을 보며 환자에게 설명하는 원장' }, shape: 'wide' },
      { fig: { key: 'orig/add-korea-map', alt: '지역별 핀이 꽂힌 한국 지도 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/painless/airflow': {
    lines: ['{에어 플로우}', '(저자극 스케일링 · GBT)'],
    kicker: '에어플로우 · GBT 스케일링',
    lead: '고운 파우더와 물을 뿌려 치석과 바이오필름을 씻어 내, 긁는 느낌과 시린 자극을 줄입니다.',
    cards: [
      { fig: { key: 'orig/airflow-device', alt: 'EMS 에어플로우 프로필락시스 마스터 장비' }, shape: 'portrait' },
      { fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 장비' }, shape: 'wide' },
      { fig: { key: 'orig/airflow-piezon', alt: '파란 LED 가 켜진 피에존 스케일러 핸드피스 팁' }, shape: 'std' },
    ],
  },
  '/insight': {
    lines: ['광화문 선치과', '{인사이트}'],
    cards: [
      { fig: { key: 'scene/consult', alt: '환자와 상담하는 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-hub', alt: '휴대폰으로 치과 안내 글을 읽는 손(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/misc-online-phone', alt: '노트북 앞에서 스마트폰을 든 손' }, shape: 'std' },
    ],
    items: [
      { title: '증상별 안내', desc: '턱관절 소리, 시린 이, 잇몸 출혈처럼 자주 겪는 증상을 환자의 말로 풀어 씁니다.' },
      { title: '치료 가이드', desc: '임플란트 진행 순서와 비용 요인, 건강보험, 턱관절 치료 순서를 정리했습니다.' },
      { title: '진료로 이어지는 길', desc: '광화문선치과가 실제로 하는 진료와 이어지는 글에는 해당 안내로 가는 길을 함께 둡니다.' },
    ],
  },
  '/insight/guide/implant-journey': {
    lines: ['임플란트, 처음부터 끝까지', '{어떻게 진행되나요}'],
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/intro-p04-guide', alt: '하악 모형 위의 투명 수술 가이드와 드릴' }, shape: 'wide' },
      { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'std' },
    ],
  },
  '/insight/guide/implant-cost-factors': {
    lines: ['임플란트 비용은', '{무엇으로 정해지나요}'],
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-cost', alt: '책상 위 치료 계획서를 함께 보는 모습' }, shape: 'wide' },
      { fig: { key: 'orig/denture-implant-render', alt: '픽스처·어버트먼트·크라운이 분해된 임플란트 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/guide/dental-insurance': {
    lines: ['건강보험이 되는 치과 치료,', '{무엇이 있나요}'],
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-denture', alt: '밝은 탁자에 두 손을 모으고 미소 짓는 어르신' }, shape: 'wide' },
      { fig: { key: 'scene/denture', alt: '틀니 모형' }, shape: 'std' },
    ],
  },
  '/insight/guide/tmj-treatment-flow': {
    lines: ['턱관절 치료는', '{어떤 순서로 하나요}'],
    cards: [
      { fig: { key: 'orig/tmj-hero', alt: '확대경을 쓰고 환자를 진료하는 원장' }, shape: 'portrait' },
      { fig: { key: 'ai/tmj-treatments', alt: '턱관절 치료 도구(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-splint', alt: '스플린트 장치 — 검은 배경 위 석고 모형과 투명 스플린트' }, shape: 'std' },
    ],
  },
  '/insight/guide/dental-anxiety': {
    lines: ['치과가 무서운 분들을', '{위한 안내}'],
    cards: [
      { fig: { key: 'orig/sleep-hero', alt: '눈을 감고 편안하게 진료받는 여성 환자' }, shape: 'portrait' },
      { fig: { key: 'ai/painless-anesthesia', alt: '무통마취기로 천천히 마취액을 넣는 장면' }, shape: 'wide' },
      { fig: { key: 'orig/pain-nopain', alt: '컴퓨터 제어 무통마취기 NO PAIN III 장비' }, shape: 'std' },
    ],
  },
  '/insight/guide/glossary': {
    lines: ['치과 용어', '{쉽게 풀이}'],
    cards: [
      { fig: { key: 'scene/consult', alt: '환자와 상담하는 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-glossary', alt: '치아 모형 옆에서 치과 참고서를 넘겨 보는 손' }, shape: 'wide' },
      { fig: { key: 'orig/misc-review-note', alt: '노트에 Review 라고 쓰는 손' }, shape: 'std' },
    ],
  },
  '/insight/symptom/jaw-clicking': {
    lines: ['턱에서', '{딱딱 소리가 나요}'],
    cards: [
      { fig: { key: 'scene/tmj-sym-1', alt: '턱관절에서 소리가 나는 증상' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-jaw', alt: '턱관절 모형(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/misc-tmj-skull', alt: '두개골 모형의 턱관절을 펜으로 가리키는 모습' }, shape: 'std' },
    ],
  },
  '/insight/symptom/mouth-wont-open': {
    lines: ['입이 잘', '{안 벌어져요}'],
    cards: [
      { fig: { key: 'scene/tmj-sym-3', alt: '입이 잘 벌어지지 않는 증상' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-jaw', alt: '턱관절 모형(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'scene/tmj-2', alt: '턱을 만지며 불편해하는 모습' }, shape: 'std' },
    ],
  },
  '/insight/symptom/morning-jaw-headache': {
    lines: ['자고 일어나면 턱이 뻐근하고', '{머리가 아파요}'],
    cards: [
      { fig: { key: 'scene/tmj-sym-2', alt: '턱관절 통증과 두통 증상' }, shape: 'portrait' },
      { fig: { key: 'tmj/splint', alt: '스플린트 장치' }, shape: 'wide' },
      { fig: { key: 'tmj/skull', alt: '두개골과 턱관절 모형' }, shape: 'std' },
    ],
  },
  '/insight/symptom/sensitive-teeth': {
    lines: ['찬물에', '{이가 시려요}'],
    cards: [
      { fig: { key: 'scene/endo', alt: '신경치료 중인 진료 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/natural-hub', alt: '자연치아 모형을 살펴보는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 장비' }, shape: 'std' },
    ],
  },
  '/insight/symptom/bleeding-gums': {
    lines: ['잇몸이 붓고', '{피가 나요}'],
    cards: [
      { fig: { key: 'scene/patient', alt: '진료실에서 진료받는 환자' }, shape: 'portrait' },
      { fig: { key: 'equip/gbt', alt: 'GBT 가이드 바이오필름 치료 장비' }, shape: 'wide' },
      { fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 장비' }, shape: 'std' },
    ],
  },
  '/insight/symptom/pain-when-chewing': {
    lines: ['씹을 때', '{이가 아파요}'],
    cards: [
      { fig: { key: 'scene/endo', alt: '신경치료 중인 진료 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/natural-hub', alt: '자연치아 모형을 살펴보는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치수(신경)가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/symptom/wisdom-tooth-pain': {
    lines: ['사랑니 자리가', '{붓고 아파요}'],
    cards: [
      { fig: { key: 'orig/wisdom-doctor', alt: '확대경을 쓰고 사랑니를 발치하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/wisdom-ct-screen', alt: '3D CT 판독 화면 — 사랑니와 하치조신경 위치 확인' }, shape: 'wide' },
      { fig: { key: 'orig/misc-wisdom-tooth', alt: '누워서 난 매복 사랑니 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/symptom/loose-or-missing-tooth': {
    lines: ['이가 흔들리거나', '{빠졌어요}'],
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-navigation', alt: '임플란트 식립 계획 화면(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/denture-implant-render', alt: '픽스처·어버트먼트·크라운이 분해된 임플란트 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/symptom/pain-after-root-canal': {
    lines: ['신경치료를 받았는데', '{계속 아파요}'],
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/case-mta3-after', alt: 'MTA 재신경치료로 발치를 피한 치아 엑스레이 — 치료 후' }, shape: 'wide' },
      { fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shape: 'std' },
    ],
  },
  '/insight/symptom/swelling-around-implant': {
    lines: ['임플란트 주변 잇몸이', '{붓고 피가 나요}'],
    cards: [
      { fig: { key: 'orig/airflow-device', alt: 'EMS 에어플로우 프로필락시스 마스터 장비' }, shape: 'portrait' },
      { fig: { key: 'equip/gbt', alt: 'GBT 가이드 바이오필름 치료 장비' }, shape: 'wide' },
      { fig: { key: 'ai/implant-custom', alt: '석고 모형 위에서 맞춤 기둥을 핀셋으로 잡은 손' }, shape: 'std' },
    ],
  },
  '/insight/symptom/loose-denture': {
    lines: ['틀니가 헐거워지고', '{잘 씹히지 않아요}'],
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insurance-denture', alt: '부분 틀니를 두 손으로 살펴보는 어르신의 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-denture', alt: '전악 임플란트 보철물과 분홍 틀니' }, shape: 'std' },
    ],
  },
  '/insight/symptom/yellow-teeth': {
    lines: ['치아가', '{누렇게 변했어요}'],
    cards: [
      { fig: { key: 'orig/misc-whitening-model', alt: '하얀 치아를 드러내며 웃는 여성 모델' }, shape: 'portrait' },
      { fig: { key: 'aesthetic/whitening', alt: '전문가 치아미백' }, shape: 'wide' },
      { fig: { key: 'scene/smile', alt: '가지런하고 하얀 치아로 웃는 모습' }, shape: 'std' },
    ],
  },
};

/** 제목 문자열의 {강조} 를 분리한다 — HeroCollage 가 주황 밑줄로 그린다. */
export function splitAccent(line: string): Array<{ text: string; accent: boolean }> {
  return line
    .split(/(\{[^}]*\})/)
    .filter(Boolean)
    .map((t) => (t.startsWith('{') ? { text: t.slice(1, -1), accent: true } : { text: t, accent: false }));
}
