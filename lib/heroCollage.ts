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
  /** 제목 아래 굵은 부제 한두 줄 — 병원이 준 부제를 그대로(풀아치 PPT 50쪽). {중괄호}=주황, [대괄호]=굵게. 주면 lead 는 '' 로 비워도 된다 */
  sub?: [string, string?];
  /** 첫 화면 동그라미 배지 — 줄바꿈은 글 속 줄바꿈 문자로(풀아치 PPT 50쪽에 붙인 예시 배지 네 개) */
  badges?: string[];
}

export const HERO_COLLAGE: Record<string, HeroCollageSpec> = {
  '/treatment/implant': {
    lines: ['진단부터 보철까지 대표원장이 직접 하는', '{디지털 임플란트}'],
    lead: '통합치의학과 전문의인 대표원장이 CBCT 판독부터 식립, 보철, 정기검진까지 직접 맡습니다. 치조골을 계측해 식립 위치를 먼저 정하고, 골이식은 필요한 경우에만 계획합니다.',
    cardsLead: '광화문 선치과 임플란트는 이렇게 진료합니다.',
    cards: [
      { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형' }, shape: 'std' },
    ],
  },
  /* 2026-10-07 카톡 '0.1mm 오차없이 진행한다'(짧게 쓸 말의 예로 든 문장, PPT 1쪽 더서울치과 캡처의 표현) + 46쪽 '어렵다' — 쉬운 말로.
     ⚠️ '0.1mm 오차 없이' 는 결과를 보장하는 표현이라 의료법 소지 — 오너에게 알림(2026-10-06), 병원 문구라 그대로 넣는다.
     예전: '식립 위치를 수술 전에 정하는' / 'CBCT와 구강스캔 데이터로 모의 식립… 신경관과 상악동까지의 거리를 계측… 무절개' */
  '/treatment/implant/navigation': {
    lines: ['수술 전에 위치를 정하는', '{내비게이션} 임플란트'],
    lead: '3D CT로 컴퓨터에서 미리 수술해 보고, 그 계획대로 만든 수술 가이드로 0.1mm 오차 없이 진행합니다. 잇몸뼈가 충분하면 잇몸을 절개하지 않고 심습니다.',
    cardsLead: '가이드 식립은 이렇게 진행합니다.',
    cards: [
      { fig: { key: 'scene/surgery', alt: '확대경을 끼고 임플란트를 식립하는 양대일 대표원장' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-nav-plan', alt: 'CT 위에 임플란트 식립 경로를 잡는 계획 소프트웨어 화면' }, shape: 'wide' },
      { fig: { key: 'equip/guide', alt: '하악 모형에 얹은 수술 가이드와 임플란트' }, shape: 'std' },
    ],
  },
  /* 2026-10-07 원장 PPT 50쪽 — 첫 화면 위에 병원이 직접 쓴 세 줄을 글자 그대로(굵게 '단 4~6개'·'수술 당일 식사', 주황 '풀아치'도 PPT 그대로).
     배지 네 개는 같은 쪽에 붙인 예시(디오나비 배지) 문구 그대로 — 카톡 '빠르게·비용·임시치아 바로'와 같은 내용.
     ⚠️ '수술 당일 식사까지 가능' · '수술당일 식사가능' · '가격은 합리적' 은 조건·가격 표현이라 의료법 소지 — 오너에게 알림(2026-10-07), 글자는 손대지 않는다.
     예전: '4~6개의 임플란트로 한 턱 전체를 복원하는 풀아치 임플란트' + CBCT·골량·무치악 설명 */
  '/treatment/implant/full-arch': {
    /* '불편하지 않으신가요?' 는 붙여 둔다(줄 바꿈 없는 띄어쓰기) — 폰에서 쉼표 뒤에서만 끊기게 */
    lines: ['틀니, 불편하지 않으신가요?'],
    sub: ['전체 치아에 필요한 임플란트, [단 4~6개]', '[수술 당일 식사]까지 가능한 {풀아치} 임플란트'],
    badges: ['수술당일\n식사가능', '내원은\n최소한', '치료기간\n최소한', '가격은\n합리적'],
    lead: '',
    cardsLead: '이런 경우 풀아치 임플란트를 검토합니다.',
    cards: [
      { fig: { key: 'orig/main-fa-surgeon-right', alt: '진료실에서 환자를 진료하는 양대일 대표원장' }, shape: 'portrait' },
      { fig: { key: 'place2/surgery-color', alt: '수술실에서 확대경을 끼고 임플란트 수술 중인 대표원장, 뒤편 모니터에 파노라마 영상' }, shape: 'wide' },
      { fig: { key: 'place2/doctor-scan', alt: '대표원장이 구강스캐너로 환자의 치아를 스캔하고 벽 모니터에 3D 스캔 화면이 떠 있는 진료실' }, shape: 'std' },
    ],
  },
  '/treatment/implant/uv': {
    lines: ['골질이 약할 때 골유착을 돕는', '{UV} 임플란트'],
    lead: '식립 직전 픽스처 표면에 자외선을 조사해, 표면에 쌓인 유기물을 제거합니다. 골질이 약하거나 연세가 많아 골유착이 걱정되는 경우에 검토합니다.',
    cardsLead: 'UV 표면 처리에서 기대하는 점입니다.',
    cards: [
      { fig: { key: 'implant/uv', alt: 'UV 임플란트 표면 처리 개념도' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-uv', alt: 'UV 활성화 장비에 임플란트 픽스처를 넣는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'std' },
    ],
  },
  '/treatment/implant/prf': {
    lines: ['골이식 부위의 회복을 돕는', '{자가혈(PRF)} 임플란트'],
    lead: '환자의 혈액을 소량 채취해 분리한 PRF를 골이식재와 함께 넣습니다. 골이식 부위의 회복을 돕는 방법으로, CBCT로 골량이 부족한 경우에만 계획합니다.',
    cardsLead: '자가혈(PRF)에서 기대하는 점입니다.',
    cards: [
      { fig: { key: 'implant/prf', alt: '자가혈(PRF) 추출 개념도' }, shape: 'portrait' },
      { fig: { key: 'ai/implant-prf', alt: '원심분리기에서 혈액 튜브를 꺼내는 장갑 낀 손' }, shape: 'wide' },
      { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'std' },
    ],
  },
  /* 2026-10-07 원장 PPT 58쪽 "설명이 너무 어려움" — 붙여 온 예시('나에게 꼭 맞는 임플란트', '내 잇몸 형태에 꼭 맞도록 어버트먼트를 1:1 맞춤 제작')
     길이와 말투로 다시 씀. 예전: '잇몸 라인과 교합에 맞춰 설계하는 맞춤 임플란트' / 'CAD/CAM·잇몸 경계의 틈·고른 두께' 설명 */
  '/treatment/implant/custom': {
    lines: ['나에게 꼭 맞는', '{맞춤} 임플란트'],
    lead: '임플란트와 크라운을 잇는 기둥인 지대주를, 내 잇몸 형태에 꼭 맞도록 1:1로 맞춤 제작합니다. 설계는 대표원장이 직접 확인합니다.',
    cardsLead: '맞춤 지대주는 이렇게 설계합니다.',
    cards: [
      { fig: { key: 'implant/custom', alt: '맞춤 어버트먼트 개념도' }, shape: 'portrait' },
      { fig: { key: 'orig/implant-custom-fit', alt: '잇몸 선에 맞춘 맞춤 어버트먼트 단면 일러스트' }, shape: 'wide' },
      { fig: { key: 'orig/implant-custom-stock', alt: '기성품 어버트먼트 단면 일러스트' }, shape: 'std' },
    ],
  },
  /* 2026-10-07 새 쪽(원장 PPT 46쪽 '상악동, 뼈이식 내용 추가') — 제목은 참고 17쪽 '뼈가 부족하다고 들었다면'의 짜임 */
  '/treatment/implant/bone-graft': {
    lines: ['잇몸뼈가 부족하다고 들었다면,', '{뼈이식}으로 자리를 만듭니다'],
    lead: '어느 부위에 얼마나 부족한지 3D CT로 먼저 확인하고, 모자란 만큼만 채웁니다. 위턱 어금니 쪽 높이가 모자라면 상악동거상술을 합니다.',
    cardsLead: '이런 경우 뼈이식을 검토합니다.',
    cards: [
      { fig: { key: 'illust/bone-graft', alt: '골이식 단면 도해' }, shape: 'portrait' },
      { fig: { key: 'illust/sinus-lift', alt: '상악동거상술 단면 도해' }, shape: 'wide' },
      { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'std' },
    ],
  },
  '/treatment/implant/warranty': {
    lines: ['치료 후의 점검과 관리까지', '광화문 선치과 {보증제도}'],
    lead: '임플란트 수술관련은 장착일부터 최대 10년, 보철관련은 5년까지 기간별로 보증합니다. 보증 기준과 정기검진 주기는 치료 전에 먼저 안내합니다.',
    cardsLead: '보증은 이런 조건에서 유지됩니다.',
    cards: [
      { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'portrait' },
      { fig: { key: 'scene/intro-1', alt: '광화문선치과 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-review-note', alt: '노트에 Review 라고 쓰는 손' }, shape: 'std' },
    ],
  },
  '/treatment/tmj': {
    lines: ['관절잡음·개구장애·저작근 통증,', '원인부터 가려내는 {턱관절 진료}'],
    lead: '턱에서 딸깍 소리가 나거나 입이 끝까지 벌어지지 않고, 아침마다 턱이 뻐근하다면 턱관절 장애를 의심해 볼 수 있습니다. 대표원장이 촉진과 개구량 측정, 필요하면 3D CT로 원인을 확인한 뒤 가역적인 치료부터 시작합니다.',
    cardsLead: '광화문 선치과 턱관절 진료는 이렇게 합니다.',
    cards: [
      { fig: { key: 'fit/tmj-hero', alt: '확대경을 쓰고 환자를 진료하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/misc-tmj-skull', alt: '두개골 모형의 턱관절을 펜으로 가리키는 모습' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-laser', alt: '물리치료 — 관절 팔이 달린 레이저 장비' }, shape: 'std' },
    ],
  },
  /* ── 2026-09-29 신설 쪽 세 개 — 문구는 재작성 단계에서 다시 다듬는다 ── */
  '/treatment/tmj/bruxism': {
    lines: ['수면 이갈이와 주간 이악물기,', '치아와 {턱관절}을 함께 살핍니다'],
    lead: '이갈이와 이악물기는 교합면 마모와 치아 균열, 저작근 통증과 턱관절 증상으로 이어질 수 있습니다. 대표원장이 마모 양상과 저작근·턱관절 상태를 확인한 뒤, 맞춤 교합안정장치와 근육 치료를 계획합니다.',
    cardsLead: '이갈이·이악물기는 이런 흔적을 남깁니다.',
    cards: [
      { fig: { key: 'illust/bruxism-wear', alt: '이갈이로 교합면이 닳고 금이 간 어금니 도해' }, shape: 'portrait' },
      { fig: { key: 'illust/bruxism-muscle', alt: '과긴장한 교근과 측두근 도해' }, shape: 'wide' },
      { fig: { key: 'illust/bruxism-splint', alt: '위턱 치열에 끼운 교합안정장치 도해' }, shape: 'std' },
    ],
  },
  '/treatment/re-root-canal': {
    lines: ['신경치료한 치아가 다시 아플 때', '{재근관치료}'],
    lead: '근관치료 후 치근단 병소가 재발했다고 해서 바로 발치해야 하는 것은 아닙니다. 3D CT 로 놓친 근관과 병소의 범위를 확인하고, 다시 치료해 보존할 수 있는지부터 판단합니다.',
    cardsLead: '이런 증상이라면 재근관치료를 검토합니다.',
    cards: [
      { fig: { key: 'illust/reendo-causes', alt: '재근관치료가 필요한 원인 — 놓친 근관과 치근단 병소 도해' }, shape: 'portrait' },
      { fig: { key: 'illust/reendo-steps', alt: '재근관치료 과정 도해' }, shape: 'wide' },
      { fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shape: 'std' },
    ],
  },
  '/treatment/periodontal': {
    lines: ['치주낭 깊이부터 재고 시작하는', '{치주치료}'],
    lead: '잇몸 출혈과 부기는 치은염의 신호이고, 치아가 흔들린다면 치조골 흡수까지 진행했을 수 있습니다. 치주낭 측정과 방사선 사진으로 단계를 확인한 뒤, 스케일링과 치근활택술로 치료합니다.',
    cardsLead: '이런 증상이라면 잇몸 상태를 확인합니다.',
    cards: [
      { fig: { key: 'illust/perio-stages', alt: '건강한 잇몸에서 치주염까지 진행 단계 도해' }, shape: 'wide' },
      { fig: { key: 'illust/perio-pocket', alt: '치주낭 깊이를 재는 탐침 도해' }, shape: 'portrait' },
      { fig: { key: 'illust/perio-srp', alt: '치석제거와 치근활택술 도해' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/symptoms': {
    lines: ['관절잡음과 통증, 개구장애까지', '{턱관절 장애}의 증상과 자가진단'],
    lead: '딸깍하는 관절잡음과 씹을 때의 통증, 입이 충분히 벌어지지 않는 개구장애는 턱관절 장애의 대표 증상입니다. 근육과 관절원판, 관절 뼈 가운데 어디에 문제가 있는지 확인하면 치료 방향이 정해집니다.',
    cardsLead: '턱관절 장애는 이런 증상으로 나타납니다.',
    cards: [
      { fig: { key: 'scene/tmj-sym-1', alt: '턱관절에서 소리가 나는 증상' }, shape: 'portrait' },
      { fig: { key: 'scene/tmj-1', alt: '턱관절 통증을 호소하는 모습' }, shape: 'wide' },
      { fig: { key: 'scene/tmj-sym-2', alt: '턱관절 통증과 두통 증상' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/anatomy': {
    lines: ['귀 바로 앞, 가장 복잡한 관절', '{턱관절}의 구조와 기능'],
    lead: '측두골과 하악과두 사이에서 디스크가 함께 움직이며 돌아가고 미끄러지는 관절입니다. 구조를 알면 왜 소리가 나고 왜 귀·머리까지 아픈지가 읽힙니다.',
    cardsLead: '턱관절은 이렇게 생겼습니다.',
    cards: [
      { fig: { key: 'sun/tmj-explain-skull-2', alt: '두개골 모형으로 턱관절을 설명하는 양대일 원장' }, shape: 'portrait' },
      { fig: { key: 'sun/tmj-explain-monitor', alt: '모니터의 턱관절 도해를 짚어 가며 설명하는 모습' }, shape: 'wide' },
      { fig: { key: 'orig/misc-tmj-skull', alt: '두개골 모형의 턱관절을 펜으로 가리키는 모습' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/causes': {
    lines: ['원인을 알아야 근본 치료가 됩니다', '{턱관절 장애}의 원인'],
    lead: '부정교합, 외상, 그리고 매일 쌓이는 습관과 스트레스. 한 가지보다 겹쳐서 생기는 경우가 많아 진단에서 주된 원인을 가려냅니다.',
    cardsLead: '이런 것이 턱관절을 망가뜨립니다.',
    cards: [
      { fig: { key: 'ai/tmj-cause-habit', alt: '책상에 턱을 괴고 있는 모습' }, shape: 'portrait' },
      { fig: { key: 'ai/tmj-cause-stress', alt: '책상 앞에서 머리를 감싸 쥔 모습' }, shape: 'wide' },
      { fig: { key: 'ai/tmj-cause-grind', alt: '옆으로 누워 자는 모습' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/self-check': {
    lines: ['병원 가기 전, 거울 앞에서', '{턱관절} 자가진단법'],
    lead: '입을 벌릴 때 턱이 한쪽으로 돌아가거나, 소리가 나거나, 세 손가락이 세로로 안 들어갈 만큼 안 벌어지면 턱관절 장애를 의심해 볼 수 있습니다.',
    cardsLead: '다섯 가지만 확인해 보세요.',
    cards: [
      { fig: { key: 'ai/tmj-check-open', alt: '입을 크게 벌려 세 손가락으로 개구량을 확인하는 동작' }, shape: 'portrait' },
      { fig: { key: 'ai/tmj-check-midline', alt: '앞니 정중선과 개구 상태를 확인하는 동작' }, shape: 'wide' },
      { fig: { key: 'ai/tmj-check-joint', alt: '양쪽 턱관절 부위에 손가락을 대고 확인하는 동작' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/whole-body': {
    lines: ['턱에만 머물지 않습니다', '{턱관절}과 전신증상'],
    lead: '턱관절이 틀어지면 얼굴의 좌우 균형과 목뼈의 위치가 바뀌고, 도미노처럼 척추와 골반까지 이어지기도 합니다.',
    cardsLead: '턱에서 몸으로 이어지는 네 갈래.',
    cards: [
      { fig: { key: 'scene/tmj-sym-2', alt: '턱관절 통증과 두통 증상' }, shape: 'portrait' },
      { fig: { key: 'sun/tmj-explain-skull', alt: '두개골 모형을 들고 턱관절 구조를 설명하는 양대일 원장' }, shape: 'wide' },
      { fig: { key: 'scene/tmj-2', alt: '턱을 만지며 불편해하는 모습' }, shape: 'std' },
    ],
  },
  '/treatment/tmj/treatment': {
    lines: ['가역적인 치료부터 단계적으로', '{턱관절 장애}의 치료'],
    lead: '약물·물리치료부터 교합안정장치, 보툴리눔 톡신 주사, 관절강 세척술까지 원내에서 이어서 진행합니다. 부담이 적은 치료부터 시작해, 반응을 확인하며 필요한 단계만 진행합니다.',
    cardsLead: '턱관절 장애는 이런 순서로 치료합니다.',
    cards: [
      { fig: { key: 'orig/tmj-tx-botox', alt: '보톡스 치료 — 바이알에서 주사기로 약을 뽑는 장갑 낀 손' }, shape: 'portrait' },
      { fig: { key: 'orig/tmj-tx-laser', alt: '물리치료 — 관절 팔이 달린 레이저 장비' }, shape: 'wide' },
      { fig: { key: 'orig/tmj-tx-splint', alt: '스플린트 장치 — 검은 배경 위 석고 모형과 투명 스플린트' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic': {
    lines: ['치아의 모양·색과 교합을 함께 보는', '{심미치료}'],
    lead: '앞니의 모양과 색은 물론, 잇몸선과 위아래 치아의 교합까지 확인한 뒤 계획합니다. 치아를 적게 깎는 방법부터 검토해, 라미네이트·올세라믹·지르코니아·미백 가운데 필요한 방법을 권합니다.',
    cardsLead: '치아 상태에 따라 방법을 고릅니다.',
    cards: [
      { fig: { key: 'orig/misc-whitening-model', alt: '하얀 치아를 드러내며 웃는 여성 모델' }, shape: 'portrait' },
      { fig: { key: 'orig/misc-veneer-teeth', alt: '라미네이트를 붙이는 앞니 일러스트' }, shape: 'wide' },
      { fig: { key: 'aesthetic/laminate', alt: '라미네이트' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic/prosthetics': {
    lines: ['남은 치아 구조부터 확인하는', '{심미보철}'],
    lead: '보철의 수명은 경계가 얼마나 잘 맞는지, 그 아래 치아 구조가 얼마나 남았는지에 달려 있습니다. 충치와 균열, 교합을 먼저 확인하고 라미네이트·올세라믹·지르코니아 가운데 재료를 정합니다.',
    cardsLead: '이런 경우, 심미보철을 고려합니다.',
    cards: [
      { fig: { key: 'aesthetic/zirconia', alt: '지르코니아 크라운' }, shape: 'portrait' },
      { fig: { key: 'aesthetic/laminate', alt: '라미네이트' }, shape: 'wide' },
      { fig: { key: 'aesthetic/allceramic', alt: '올세라믹 크라운' }, shape: 'std' },
    ],
  },
  '/treatment/aesthetic/whitening': {
    lines: ['치아를 깎지 않고 색만 밝히는', '{전문가 치아미백}'],
    lead: '전문가용 미백제를 바르고 광선으로 활성화해, 변색된 치아 색을 밝힙니다. 보철물과 레진은 색이 변하지 않아 미백 전에 앞니 상태를 먼저 확인합니다.',
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
    lines: ['하치조신경관과의 거리를 확인하고 빼는', '{매복사랑니} 발치'],
    lead: '누운 사랑니, 뿌리가 신경관에 가까운 사랑니도 3D CT 로 방향과 깊이, 신경관까지의 거리를 먼저 확인합니다. 대표원장이 영상을 직접 판독하고 절개부터 봉합까지 진행합니다.',
    cardsLead: '이런 문제가 있다면 발치를 검토합니다.',
    cards: [
      { fig: { key: 'orig/wisdom-doctor', alt: '확대경을 쓰고 사랑니를 발치하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/wisdom-ct-screen', alt: '3D CT 판독 화면 — 사랑니와 하치조신경 위치 확인' }, shape: 'wide' },
      { fig: { key: 'orig/misc-wisdom-tooth', alt: '누워서 난 매복 사랑니 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth': {
    lines: ['발치 전에 보존 가능성을 먼저 확인하는', '{자연치아 살리기}'],
    lead: '치수까지 번진 충치도 뿌리와 치조골이 건강하면 근관치료로 치아를 남길 수 있습니다. 3D CT 로 근관과 치근단 병소를 확인하고, 엔도소닉 세척과 MTA 밀폐로 치료합니다.',
    cardsLead: '이런 증상이 있다면 치수 상태를 확인합니다.',
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/endo-hero', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치아 속 치수가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth/mta': {
    lines: ['바이오 세라믹으로 근관을 밀폐하는', '{MTA} 근관치료'],
    lead: '근관치료의 결과는 근관을 얼마나 깨끗이 비우고, 얼마나 빈틈없이 막느냐에 달려 있습니다. 수분 속에서도 굳는 MTA 로 근관을 밀폐해 재감염의 여지를 줄입니다.',
    cardsLead: 'MTA 는 이런 성질을 가진 재료입니다.',
    cards: [
      { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/case-mta1-after', alt: 'MTA 로 신경을 덮고 보철로 마무리한 어금니 — 치료 후' }, shape: 'wide' },
      { fig: { key: 'orig/misc-mta-tooth', alt: '치아 속 치수가 비치는 투명 치아 일러스트' }, shape: 'std' },
    ],
  },
  '/treatment/natural-tooth/endosonic': {
    lines: ['기구가 닿지 않는 근관까지 씻어 내는', '{엔도소닉} 초음파 세척'],
    lead: '근관은 가늘고 휘어 있어 파일만으로는 닿지 않는 벽이 남습니다. 초음파로 세척액을 진동시켜 곁가지와 좁은 통로까지 세척합니다.',
    cardsLead: '엔도소닉 세척은 이런 점이 다릅니다.',
    cards: [
      { fig: { key: 'scene/endosonic', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 장면' }, shape: 'portrait' },
      { fig: { key: 'orig/endo-hero', alt: '엔도소닉 초음파 세척기로 근관을 세척하는 진료 장면' }, shape: 'wide' },
      { fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shape: 'std' },
    ],
  },
  '/treatment/painless': {
    lines: ['통증의 원인마다 방법을 달리하는', '{무통 & 저자극} 시스템'],
    lead: '바늘이 들어갈 때의 통증, 마취액이 퍼질 때의 압박, 스케일링의 시림은 원인이 서로 다릅니다. 무통마취기 NO-PAIN III, 도포·가글마취, 에어플로우로 각각 줄입니다.',
    cardsLead: '통증의 원인에 따라 방법을 나눕니다.',
    cards: [
      { fig: { key: 'fit/pain-hero', alt: '파노라마 모니터 앞에서 무통마취기(NO PAIN III)로 마취하는 원장' }, shape: 'portrait' },
      { fig: { key: 'equip/painless-set', alt: '무통 & 저자극 시스템 장비' }, shape: 'wide' },
      { fig: { key: 'orig/pain-nopain', alt: '컴퓨터 제어 무통마취기 NO PAIN III 장비' }, shape: 'std' },
    ],
  },
  '/treatment/painless/anesthesia': {
    lines: ['주입 속도와 압력을 컴퓨터가 조절하는', '{무통마취} NO-PAIN III'],
    lead: '마취 주사의 통증은 바늘이 들어갈 때와 마취액이 퍼질 때 생깁니다. 리도카겔 도포마취와 무통마취기의 일정한 자동 주입으로 두 순간의 통증을 줄입니다.',
    cardsLead: '마취가 아픈 두 순간을 이렇게 줄입니다.',
    cards: [
      { fig: { key: 'fit/pain-hero', alt: '파노라마 모니터 앞에서 무통마취기(NO PAIN III)로 마취하는 원장' }, shape: 'portrait' },
      { fig: { key: 'orig/add-lidoca-gel', alt: '잇몸 도포마취제 리도카겔 상자·통과 딸기' }, shape: 'wide' },
      { fig: { key: 'orig/add-lidoca-gargle', alt: '가글마취제 리도카글액 2% 병(파란 치아 아이콘 포함)' }, shape: 'std' },
    ],
  },
  '/treatment/painless/airflow': {
    lines: ['세균막을 먼저 씻어 내는', '{에어플로우} · GBT'],
    lead: '공기와 물, 미세 파우더로 치아와 잇몸 경계의 세균막을 씻어 내고, 남은 치석만 초음파로 제거합니다. 10단계 강도와 물 온도를 조절해 시림과 자극을 줄입니다.',
    cardsLead: '에어플로우는 이런 기능으로 자극을 줄입니다.',
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
      { fig: { key: 'orig/misc-mta-tooth', alt: '치아 속 치수가 비치는 투명 치아 일러스트' }, shape: 'std' },
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
