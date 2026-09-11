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
  /** 카드 바로 위 한 줄 — 카드를 여는 문장(이런 경우, ~합니다.). 구역 설명처럼 카드에 붙인다(오너) */
  cardsLead?: string;
  cards: [CollageCard, CollageCard, CollageCard];
  items?: CollageItem[];
}

export const HERO_COLLAGE: Record<string, HeroCollageSpec> = {
  '/treatment/implant': {
    lines: ['3D 로 계획하고 가이드로 식립하는', '{디지털 임플란트}'],
    lead: '어디에 어떻게 심을지, 수술 전에 컴퓨터로 먼저 심어 보고 정합니다. 3D CT 와 구강스캐너 자료를 화면으로 함께 보며 천천히 설명해 드립니다.',
    cardsLead: '광화문 선치과 임플란트는 이렇게 다릅니다.',
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형' }, shape: 'std' },
    ],
  },
  '/treatment/implant/navigation': {
    lines: ['수술 전 모의수술로 자리를 정하는', '{내비게이션} 임플란트'],
    lead: '수술 전에 컴퓨터로 모의수술을 마치고, 그 계획대로 만든 유도장치를 대고 심습니다. 몇 개를 어디에 어떤 각도로 심는지, 미리 화면으로 함께 확인하고 시작합니다.',
    cardsLead: '내비게이션 임플란트는 이렇게 진행합니다.',
    cards: [
      { fig: { key: 'orig/implant-nav-guide', alt: '하악 모형에 투명 수술 가이드를 얹고 드릴을 맞춘 모습' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-nav-plan', alt: 'CT 위에 임플란트 식립 경로를 잡는 계획 소프트웨어 화면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형' }, shape: 'std' },
    ],
  },
  '/treatment/implant/full-arch': {
    lines: ['최소식립으로 전체 치아를 회복하는', '{풀아치} 임플란트'],
    lead: '치아가 거의 남지 않았어도, 임플란트 4~6개로 한 턱 전체의 씹는 기능을 되찾는 방법입니다. 남은 뼈 상태에 따라 계획이 달라지니, CT 검사 뒤 맞는 방법을 함께 정합니다.',
    cardsLead: '이런 경우, 풀아치 임플란트를 고려합니다.',
    cards: [
      { fig: { key: 'orig/implant-fa-surgery', alt: '수술실에서 임플란트 수술 중인 의료진' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-fa-fixed', alt: '임플란트 여섯 개로 고정한 전악 보철 렌더' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-models', alt: '상악·하악 전악 임플란트 보철 모형' }, shape: 'std' },
    ],
  },
  '/treatment/implant/uv': {
    lines: ['잇몸뼈가 약할 때 쓰는', '{UV} 임플란트'],
    lead: '뼈가 약해 임플란트가 어렵다는 말을 들으셨나요? 심기 직전 자외선으로 표면을 활성화해, 뼈와 붙는 과정을 돕는 임플란트입니다.',
    cardsLead: 'UV 임플란트는 이런 점이 다릅니다.',
    cards: [
      { fig: { key: 'implant/uv', alt: 'UV 임플란트 표면 처리 개념도' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-uv', alt: 'UV 활성화 장비에 임플란트 픽스처를 넣는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'std' },
    ],
  },
  '/treatment/implant/prf': {
    lines: ['내 피에서 뽑아 쓰는', '{자가혈(PRF)} 임플란트'],
    lead: '내 혈액을 소량 뽑아 원심분리한 자가혈(PRF)을 뼈이식 재료와 함께 넣습니다. 뼈이식이 필요한 자리의 회복을 돕는 방법으로, 검사 뒤 필요한 경우에만 권해 드립니다.',
    cardsLead: '자가혈 임플란트는 이런 경우에 씁니다.',
    cards: [
      { fig: { key: 'implant/prf', alt: '자가혈(PRF) 추출 개념도' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-prf', alt: '원심분리기에서 혈액 튜브를 꺼내는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'std' },
    ],
  },
  '/treatment/implant/custom': {
    lines: ['내 잇몸 선에 맞춰 만드는', '{맞춤} 임플란트'],
    lead: '기성품 기둥 대신, 내 잇몸 선과 치아 모양에 맞춰 기둥(어버트먼트)을 따로 만듭니다. 잇몸과 보철 사이 틈을 줄여, 오래 편하게 쓰도록 돕는 선택입니다.',
    cardsLead: '맞춤 기둥은 이런 점이 다릅니다.',
    cards: [
      { fig: { key: 'implant/custom', alt: '맞춤 어버트먼트 개념도' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-custom-fit', alt: '잇몸 선에 맞춘 맞춤 어버트먼트 단면 일러스트' }, shape: 'wide' },
      { fig: { key: 'orig/implant-custom-stock', alt: '기성품 어버트먼트 단면 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/implant/warranty': {
    lines: ['치료 뒤에도 이어지는', '광화문 선치과 {보증제도}'],
    lead: '임플란트는 심고 끝이 아니라, 오래 쓰는 것까지가 치료입니다. 정기 점검과 보증 기준을 치료 전에 미리 알려 드리니, 편한 마음으로 시작하세요.',
    cardsLead: '임플란트 보증은 이렇게 운영합니다.',
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'scene/intro-1', alt: '광화문선치과 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-review-note', alt: '노트에 Review 라고 쓰는 손' }, shape: 'std' },
    ],
  },
  '/treatment/tmj': {
    lines: ['원인을 먼저 찾는', '광화문 선치과 {턱관절 치료}'],
    lead: '턱에서 소리가 나고, 입 벌리기가 불편하고, 아침마다 턱이 뻐근하신가요? 원인을 먼저 찾고, 되돌릴 수 있는 치료부터 차근차근 맞춰 드립니다.',
    cardsLead: '이런 증상이 있다면 턱관절을 확인해 보세요.',
    cards: [
      { fig: { key: 'fit/tmj-hero', alt: '확대경을 쓰고 환자를 진료하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/misc-tmj-skull', alt: '두개골 모형의 턱관절을 펜으로 가리키는 모습' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-laser', alt: '물리치료 — 관절 팔이 달린 레이저 장비' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/symptoms': {
    lines: ['턱에서 나는 소리와 통증', '{턱관절} 주요 증상과 원인'],
    lead: '딱딱 소리, 씹을 때 통증, 두통과 목 결림까지 턱관절에서 시작되기도 합니다. 관절·근육·디스크 중 어디가 문제인지 확인하면 치료 방향이 정해집니다.',
    cardsLead: '이런 증상이 턱관절에서 옵니다.',
    cards: [
      { fig: { key: 'scene/tmj-sym-1', alt: '턱관절에서 소리가 나는 증상' }, shape: 'portrait' },
      { fig: { key: 'scene/tmj-1', alt: '턱관절 통증을 호소하는 모습' }, shape: 'wide' },
      { fig: { key: 'scene/tmj-sym-2', alt: '턱관절 통증과 두통 증상' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/treatments': {
    lines: ['원인에 맞춰 단계적으로', '{턱관절} 치료 방법'],
    lead: '약물·물리치료부터 스플린트, 보톡스, 관절강 세척술까지 한곳에서 이어서 진행합니다. 부담이 적은 치료부터 시작해, 반응을 보며 필요한 만큼만 단계를 올립니다.',
    cardsLead: '턱관절은 이런 순서로 치료합니다.',
    cards: [
      { fig: { key: 'orig/tmj-tx-botox', alt: '보톡스 치료 — 바이알에서 주사기로 약을 뽑는 장갑 낀 손' }, shape: 'portrait' },
      { fig: { key: 'orig/tmj-tx-laser', alt: '물리치료 — 관절 팔이 달린 레이저 장비' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-splint', alt: '스플린트 장치 — 검은 배경 위 석고 모형과 투명 스플린트' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic': {
    lines: ['치아 모양 · 색 · 배열을 함께 보는', '{심미치료}'],
    lead: '앞니 모양과 색, 잇몸선과 배열까지 함께 보고 나에게 어울리는 방법을 찾습니다. 라미네이트·올세라믹·지르코니아·전문가 미백 가운데 꼭 필요한 만큼만 권해 드립니다.',
    cardsLead: '이런 고민이라면 심미치료를 고려합니다.',
    cards: [
      { fig: { key: 'orig/misc-whitening-model', alt: '하얀 치아를 드러내며 웃는 여성 모델' }, shape: 'portrait' },
      { fig: { key: 'orig/misc-veneer-teeth', alt: '라미네이트를 붙이는 앞니 일러스트' }, shape: 'wide' },
      { fig: { key: 'aesthetic/laminate', alt: '라미네이트' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic/prosthetics': {
    lines: ['내 치아 상태에 따른 다양한', '{심미보철} 치료'],
    lead: '손톱처럼 얇은 라미네이트부터 치아 전체를 덮는 올세라믹·지르코니아까지 있습니다. 내 치아를 얼마나 남길 수 있는지 먼저 보고, 가장 적게 깎는 방법부터 고릅니다.',
    cardsLead: '이런 경우, 심미보철이 필요합니다.',
    cards: [
      { fig: { key: 'aesthetic/zirconia', alt: '지르코니아 크라운' }, shape: 'portrait' },
      { fig: { key: 'aesthetic/laminate', alt: '라미네이트' }, shape: 'wide' },
      { fig: { key: 'aesthetic/allceramic', alt: '올세라믹 크라운' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic/whitening': {
    lines: ['전문가가 직접 진행하는', '{치아미백}'],
    lead: '커피와 차로 누레진 치아, 셀프 미백으로 아쉬웠다면 치과 미백을 고려해 보세요. 전문가용 미백제를 바르고 광선으로 활성화해, 변색된 색을 자연스럽게 밝힙니다.',
    cardsLead: '이런 경우, 치아미백을 고려합니다.',
    cards: [
      { fig: { key: 'orig/misc-whitening-model', alt: '하얀 치아를 드러내며 웃는 여성 모델' }, shape: 'portrait' },
      { fig: { key: 'aesthetic/whitening', alt: '전문가 치아미백' }, shape: 'wide' },
      { fig: { key: 'scene/smile', alt: '가지런하고 하얀 치아로 웃는 모습' }, shape: 'std' },
    ],
  },
  '/treatment/insurance': {
    lines: ['만 65세 이상이면 받는', '건강보험 {틀니 · 임플란트}'],
    lead: '만 65세 이상이면 틀니와 임플란트 2개까지 건강보험으로 받으실 수 있습니다. 본인 부담은 30% 이며, 대상이 되는지는 진료 전에 함께 확인해 드립니다.',
    cardsLead: '이런 분들이 급여 대상입니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insurance-denture', alt: '부분 틀니를 두 손으로 살펴보는 어르신의 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-denture', alt: '전악 임플란트 보철물과 분홍 틀니' }, shape: 'std' },
    ],
  },
  '/treatment/insurance/denture': {
    lines: ['만 65세 이상 건강보험이 적용되는', '{보험틀니}'],
    lead: '치아가 하나도 없으면 전체틀니, 몇 개 남아 있으면 부분틀니를 건강보험으로 만듭니다. 본인 부담은 30% 이며, 끼고 나서 아프거나 헐거운 곳은 조정해 드립니다.',
    cardsLead: '이런 경우, 보험틀니를 만듭니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insurance-denture', alt: '부분 틀니를 두 손으로 살펴보는 어르신의 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-models', alt: '상악·하악 전악 임플란트 보철 모형' }, shape: 'std' },
    ],
  },
  '/treatment/insurance/implant': {
    lines: ['1인당 평생 2개까지 적용되는', '{보험임플란트}'],
    lead: '만 65세 이상이고 치아가 일부라도 남아 있다면, 평생 2개까지 보험이 적용됩니다. 보험 임플란트도 같은 CT 검사와 계획을 거쳐, 같은 과정으로 심습니다.',
    cardsLead: '이런 조건이면 보험이 적용됩니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-fa-denture', alt: '전악 임플란트 보철물과 분홍 틀니' }, shape: 'wide' },
      { fig: { key: 'orig/denture-implant-render', alt: '픽스처·어버트먼트·크라운이 분해된 임플란트 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/wisdom-tooth': {
    lines: ['3D CT 로 보고 빼는', '{매복사랑니} 발치'],
    lead: '누워서 난 사랑니, 신경 가까이 있는 사랑니도 3D CT 로 위치를 보고 계획을 세웁니다. 신경과 옆 치아를 피하는 순서로 빼내고, 빼기 전에 사진을 보며 설명해 드립니다.',
    cardsLead: '이런 경우, 사랑니를 빼는 것이 좋습니다.',
    cards: [
      { fig: { key: 'orig/wisdom-doctor', alt: '확대경을 쓰고 사랑니를 발치하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/wisdom-ct-screen', alt: '3D CT 판독 화면 — 사랑니와 하치조신경 위치 확인' }, shape: 'wide' },
      { fig: { key: 'orig/misc-wisdom-tooth', alt: '누워서 난 매복 사랑니 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth': {
    lines: ['뽑기 전에 남길 수 있는지 먼저 보는', '{자연치아 살리기}'],
    lead: '뽑는 게 답이라고 생각했던 치아도, 남길 수 있는지 한 번 더 살펴봅니다. 확대경 아래 MTA 신경치료와 초음파 세척으로, 내 치아를 지키는 길을 먼저 찾습니다.',
    cardsLead: '이런 경우, 자연치아를 살릴 수 있습니다.',
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/endo-hero', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치수(신경)가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth/mta': {
    lines: ['재신경치료까지 보는', '{MTA} 신경치료'],
    lead: '신경치료를 했는데 다시 아프거나, 뿌리 끝에 염증이 남았을 때 쓰는 방법입니다. 생체친화 재료 MTA 로 신경관을 꼼꼼히 밀봉해, 치아를 뽑지 않고 지키는 것이 목표입니다.',
    cardsLead: '이런 경우, MTA 를 씁니다.',
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/case-mta1-after', alt: 'MTA 로 신경을 덮고 보철로 마무리한 어금니 — 치료 후' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치수(신경)가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth/endosonic': {
    lines: ['초음파로 신경관을 씻어 내는', '{엔도소닉}'],
    lead: '신경관은 가늘고 굽어 있어 기구만으로는 닿지 않는 구석이 남습니다. 초음파로 세척액을 흔들어 그 구석까지 씻어 내는 것이 엔도소닉입니다.',
    cardsLead: '엔도소닉은 이런 점이 다릅니다.',
    cards: [
      { fig: { key: 'scene/endosonic', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 장면' }, shape: 'portrait' },
      { fig: { key: 'orig/endo-hero', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shape: 'std' },
    ],
  },
  '/treatment/painless': {
    lines: ['통증을 줄이는', '{무통 & 저자극} 시스템'],
    lead: '치과가 무서워 미루고 계셨나요? 마취 순간의 통증, 스케일링의 긁는 느낌, 진료 중의 긴장을 하나씩 줄여 두었습니다.',
    cardsLead: '이런 방법으로 줄입니다.',
    cards: [
      { fig: { key: 'fit/pain-hero', alt: '파노라마 모니터 앞에서 무통마취기(NO PAIN III)로 마취하는 원장' }, shape: 'portrait' },
      { fig: { key: 'equip/painless-set', alt: '무통 & 저자극 시스템 장비' }, shape: 'wide' },
      { fig: { key: 'orig/pain-nopain', alt: '컴퓨터 제어 무통마취기 NO PAIN III 장비' }, shape: 'std' },
    ],
  },
  '/treatment/painless/anesthesia': {
    lines: ['컴퓨터가 속도를 맞추는', '{무통마취} NO-PAIN III'],
    lead: '치과에서 제일 아픈 순간이 마취 주사라는 분이 많습니다. 컴퓨터가 일정한 속도로 천천히 넣고 극세사 바늘을 써서, 그 순간의 통증을 줄입니다.',
    cardsLead: '마취가 아픈 두 순간을 이렇게 줄입니다.',
    cards: [
      { fig: { key: 'fit/pain-hero', alt: '파노라마 모니터 앞에서 무통마취기(NO PAIN III)로 마취하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/add-lidoca-gel', alt: '잇몸 도포마취제 리도카겔 상자·통과 딸기' }, shape: 'wide' },
      { fig: { key: 'orig/add-lidoca-gargle', alt: '가글마취제 리도카글액 2% 병(파란 치아 아이콘 포함)' }, shape: 'std' },
    ],
  },
  '/treatment/painless/sedation': {
    lines: ['긴장을 낮춘 상태로 받는', '{수면치료} 의식하 진정요법'],
    lead: '기계 소리만 들어도 몸이 굳는다면, 긴장을 낮춘 상태로 진료받을 수 있습니다. 잠든 듯 편안하지만 의료진의 말에는 반응하는 상태에서, 필요한 만큼만 진행합니다.',
    cardsLead: '이런 분들이 수면치료를 고려합니다.',
    cards: [
      { fig: { key: 'fit/sleep-hero', alt: '눈을 감고 편안하게 진료받는 여성 환자' }, shape: 'portrait' },
      { fig: { key: 'sun/consult-monitor', alt: '모니터로 촬영 사진을 보며 환자에게 설명하는 원장' }, shape: 'wide' },
      { fig: { key: 'orig/add-korea-map', alt: '지역별 핀이 꽂힌 한국 지도 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/painless/airflow': {
    lines: ['긁지 않고 씻어 내는', '{에어플로우} · GBT'],
    lead: '스케일링의 긁는 소리와 시린 느낌 때문에 미루고 계셨나요? 고운 파우더와 물로 치석과 세균막을 씻어 내니, 치아와 잇몸에 자극이 적습니다.',
    cardsLead: '에어플로우 스케일링은 이런 점이 다릅니다.',
    cards: [
      { fig: { key: 'fit/airflow-device', alt: 'EMS 에어플로우 프로필락시스 마스터 장비' }, shape: 'portrait' },
      { fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 장비' }, shape: 'wide' },
      { fig: { key: 'orig/airflow-piezon', alt: '파란 LED 가 켜진 피에존 스케일러 핸드피스 팁' }, shape: 'std' },
    ],
  },
  '/insight': {
    lines: ['광화문 선치과', '{인사이트}'],
    lead: '턱에서 나는 소리, 시린 이, 잇몸 출혈처럼 자주 겪는 증상을 환자의 말로 풀었습니다. 내 증상이 어디쯤인지 짐작해 보시고, 확인이 필요하면 편하게 오세요.',
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
    lead: '상담과 검사부터 보철 장착, 정기검진까지 여섯 단계를 순서대로 풀었습니다. 각 단계에서 무엇을 하고 얼마나 걸리는지 알면, 처음 오셔도 덜 막막합니다.',
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/intro-p04-guide', alt: '하악 모형 위의 투명 수술 가이드와 드릴' }, shape: 'wide' },
      { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'std' },
    ],
  },
  '/insight/guide/implant-cost-factors': {
    lines: ['임플란트 비용은', '{무엇으로 정해지나요}'],
    lead: '같은 "임플란트 한 개" 라도 무엇이 포함됐는지에 따라 비용이 달라집니다. 비용을 좌우하는 여섯 가지를 알면, 상담에서 무엇을 물어야 할지 보입니다.',
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-cost', alt: '책상 위 치료 계획서를 함께 보는 모습' }, shape: 'wide' },
      { fig: { key: 'orig/denture-implant-render', alt: '픽스처·어버트먼트·크라운이 분해된 임플란트 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/guide/dental-insurance': {
    lines: ['건강보험이 되는 치과 치료,', '{무엇이 있나요}'],
    lead: '스케일링과 신경치료, 만 65세 이상 임플란트와 틀니까지 보험이 되는 치료가 생각보다 많습니다. 되는 것과 안 되는 것을 한눈에 정리했으니, 비용 걱정을 조금 덜고 오세요.',
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-denture', alt: '밝은 탁자에 두 손을 모으고 미소 짓는 어르신' }, shape: 'wide' },
      { fig: { key: 'scene/denture', alt: '틀니 모형' }, shape: 'std' },
    ],
  },
  '/insight/guide/tmj-treatment-flow': {
    lines: ['턱관절 치료는', '{어떤 순서로 하나요}'],
    lead: '턱관절 치료는 대부분 수술 없이, 되돌릴 수 있는 방법부터 시작합니다. 생활습관 교정과 약물·물리치료에서 스플린트, 보톡스, 관절강 세척술까지 순서대로 풀었습니다.',
    cards: [
      { fig: { key: 'fit/tmj-hero', alt: '확대경을 쓰고 환자를 진료하는 원장' }, shape: 'portrait' },
      { fig: { key: 'ai/tmj-treatments', alt: '턱관절 치료 도구(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-splint', alt: '스플린트 장치 — 검은 배경 위 석고 모형과 투명 스플린트' }, shape: 'std' },
    ],
  },
  '/insight/guide/dental-anxiety': {
    lines: ['치과가 무서운 분들을', '{위한 안내}'],
    lead: '치과가 무서운 것은 흔한 일이고, 부끄러운 일도 아닙니다. 무서운 이유별로 무엇이 도움이 되는지, 첫 방문을 어떻게 준비하면 좋은지 정리했습니다.',
    cards: [
      { fig: { key: 'fit/sleep-hero', alt: '눈을 감고 편안하게 진료받는 여성 환자' }, shape: 'portrait' },
      { fig: { key: 'ai/painless-anesthesia', alt: '무통마취기로 천천히 마취액을 넣는 장면' }, shape: 'wide' },
      { fig: { key: 'orig/pain-nopain', alt: '컴퓨터 제어 무통마취기 NO PAIN III 장비' }, shape: 'std' },
    ],
  },
  '/insight/guide/glossary': {
    lines: ['치과 용어', '{쉽게 풀이}'],
    lead: '픽스처, 골유착, 근관, 스플린트처럼 진료실에서 자주 듣는 말을 한 줄씩 풀었습니다. 설명 중에 모르는 말이 나오면 언제든 다시 물어보셔도 됩니다.',
    cards: [
      { fig: { key: 'scene/consult', alt: '환자와 상담하는 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-glossary', alt: '치아 모형 옆에서 치과 참고서를 넘겨 보는 손' }, shape: 'wide' },
      { fig: { key: 'orig/misc-review-note', alt: '노트에 Review 라고 쓰는 손' }, shape: 'std' },
    ],
  },
  '/insight/symptom/jaw-clicking': {
    lines: ['턱에서', '{딱딱 소리가 나요}'],
    lead: '소리만 나고 아프지 않다면 당장 치료보다 지켜보는 경우가 많습니다. 소리와 함께 통증이 있거나 턱이 걸리고 입이 잘 안 벌어지면, 그때는 확인이 필요합니다.',
    cards: [
      { fig: { key: 'scene/tmj-sym-1', alt: '턱관절에서 소리가 나는 증상' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-jaw', alt: '턱관절 모형(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/misc-tmj-skull', alt: '두개골 모형의 턱관절을 펜으로 가리키는 모습' }, shape: 'std' },
    ],
  },
  '/insight/symptom/mouth-wont-open': {
    lines: ['입이 잘', '{안 벌어져요}'],
    lead: '손가락 세 개를 세로로 포개어 넣기 어렵다면 입 벌림이 제한된 것입니다. 디스크가 걸린 것인지, 근육이 굳은 것인지, 염증인지에 따라 대처가 다릅니다.',
    cards: [
      { fig: { key: 'scene/tmj-sym-3', alt: '입이 잘 벌어지지 않는 증상' }, shape: 'portrait' },
      { fig: { key: 'ai/insight-jaw', alt: '턱관절 모형(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'scene/tmj-2', alt: '턱을 만지며 불편해하는 모습' }, shape: 'std' },
    ],
  },
  '/insight/symptom/morning-jaw-headache': {
    lines: ['자고 일어나면 턱이 뻐근하고', '{머리가 아파요}'],
    lead: '밤새 이를 갈거나 꽉 물면, 아침에 턱 근육통과 관자놀이 두통으로 나타납니다. 낮에 턱 힘을 빼는 습관으로 나아지기도 하고, 반복되면 스플린트를 상담해 볼 수 있습니다.',
    cards: [
      { fig: { key: 'scene/tmj-sym-2', alt: '턱관절 통증과 두통 증상' }, shape: 'portrait' },
      { fig: { key: 'tmj/splint', alt: '스플린트 장치' }, shape: 'wide' },
      { fig: { key: 'tmj/skull', alt: '두개골과 턱관절 모형' }, shape: 'std' },
    ],
  },
  '/insight/symptom/sensitive-teeth': {
    lines: ['찬물에', '{이가 시려요}'],
    lead: '잇몸이 내려가거나 법랑질이 닳아 상아질이 드러나면 찬물에 시립니다. 금방 가라앉는 시림과 오래 남는 시림은 원인이 다르니, 양상을 먼저 살펴보세요.',
    cards: [
      { fig: { key: 'scene/endo', alt: '신경치료 중인 진료 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/natural-hub', alt: '자연치아 모형을 살펴보는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 장비' }, shape: 'std' },
    ],
  },
  '/insight/symptom/bleeding-gums': {
    lines: ['잇몸이 붓고', '{피가 나요}'],
    lead: '양치할 때 피가 나는 것은 잇몸병이 보내는 가장 흔한 신호입니다. 피가 난다고 양치를 피하면 오히려 나빠지고, 초기라면 스케일링과 칫솔질로 대부분 좋아집니다.',
    cards: [
      { fig: { key: 'scene/patient', alt: '진료실에서 진료받는 환자' }, shape: 'portrait' },
      { fig: { key: 'equip/gbt', alt: 'GBT 가이드 바이오필름 치료 장비' }, shape: 'wide' },
      { fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 장비' }, shape: 'std' },
    ],
  },
  '/insight/symptom/pain-when-chewing': {
    lines: ['씹을 때', '{이가 아파요}'],
    lead: '씹었다가 뗄 때 찌릿하다면 치아에 금이 갔을 가능성부터 살핍니다. 이런 통증은 저절로 낫는 일이 드물어, 미루지 말고 원인을 확인하는 것이 좋습니다.',
    cards: [
      { fig: { key: 'scene/endo', alt: '신경치료 중인 진료 장면' }, shape: 'portrait' },
      { fig: { key: 'ai/natural-hub', alt: '자연치아 모형을 살펴보는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치수(신경)가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/symptom/wisdom-tooth-pain': {
    lines: ['사랑니 자리가', '{붓고 아파요}'],
    lead: '덜 나온 사랑니를 덮은 잇몸 아래에 음식과 세균이 끼면 붓고 아픕니다. 같은 자리에서 반복되거나 얼굴까지 붓는다면, 3D CT 로 위치를 보고 뺄지 정합니다.',
    cards: [
      { fig: { key: 'orig/wisdom-doctor', alt: '확대경을 쓰고 사랑니를 발치하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/wisdom-ct-screen', alt: '3D CT 판독 화면 — 사랑니와 하치조신경 위치 확인' }, shape: 'wide' },
      { fig: { key: 'orig/misc-wisdom-tooth', alt: '누워서 난 매복 사랑니 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/symptom/loose-or-missing-tooth': {
    lines: ['이가 흔들리거나', '{빠졌어요}'],
    lead: '성인의 치아가 흔들리는 가장 흔한 원인은 잇몸뼈가 녹는 치주염입니다. 빠진 자리를 오래 비워 두면 옆 치아가 기울어, 채우는 방법을 미리 정하는 것이 좋습니다.',
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-navigation', alt: '임플란트 식립 계획 화면(연출 사진)' }, shape: 'wide' },
      { fig: { key: 'orig/denture-implant-render', alt: '픽스처·어버트먼트·크라운이 분해된 임플란트 일러스트' }, shape: 'std' },
    ],
  },
  '/insight/symptom/pain-after-root-canal': {
    lines: ['신경치료를 받았는데', '{계속 아파요}'],
    lead: '치료 직후 며칠 뻐근한 것은 흔한 반응이고, 대개 시간이 지나면 가라앉습니다. 점점 심해지거나 잇몸이 붓고 고름이 난다면, 남은 감염이나 균열을 확인해야 합니다.',
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/case-mta3-after', alt: 'MTA 재신경치료로 발치를 피한 치아 엑스레이 — 치료 후' }, shape: 'wide' },
      { fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shape: 'std' },
    ],
  },
  '/insight/symptom/swelling-around-implant': {
    lines: ['임플란트 주변 잇몸이', '{붓고 피가 나요}'],
    lead: '임플란트는 신경이 없어 뼈가 꽤 녹을 때까지 아프지 않은 경우가 많습니다. 그래서 피가 나거나 붓는 초기 신호를 놓치지 않아야 오래 쓸 수 있습니다.',
    cards: [
      { fig: { key: 'fit/airflow-device', alt: 'EMS 에어플로우 프로필락시스 마스터 장비' }, shape: 'portrait' },
      { fig: { key: 'equip/gbt', alt: 'GBT 가이드 바이오필름 치료 장비' }, shape: 'wide' },
      { fig: { key: 'ai/implant-custom', alt: '석고 모형 위에서 맞춤 기둥을 핀셋으로 잡은 손' }, shape: 'std' },
    ],
  },
  '/insight/symptom/loose-denture': {
    lines: ['틀니가 헐거워지고', '{잘 씹히지 않아요}'],
    lead: '틀니가 헐거워지는 것은 잇몸뼈가 조금씩 흡수돼 틈이 생기기 때문입니다. 접착제로 버티기보다 조정·이장·재제작 중 무엇이 맞는지 확인하는 편이 잇몸에 좋습니다.',
    cards: [
      { fig: { key: 'orig/denture-hero', alt: '확대경을 쓴 원장이 초록 드레이프를 덮은 환자를 진료하는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/insurance-denture', alt: '부분 틀니를 두 손으로 살펴보는 어르신의 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-fa-denture', alt: '전악 임플란트 보철물과 분홍 틀니' }, shape: 'std' },
    ],
  },
  '/insight/symptom/yellow-teeth': {
    lines: ['치아가', '{누렇게 변했어요}'],
    lead: '커피와 차가 겉에 붙은 착색인지, 치아 속부터 변한 변색인지에 따라 방법이 다릅니다. 겉 착색은 스케일링과 미백으로 밝아지지만, 속 변색은 다른 방법이 필요합니다.',
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
