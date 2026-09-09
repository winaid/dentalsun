/**
 * 턱관절 허브(/treatment/tmj) 전용 화면 데이터 — 레퍼런스(tmjdoctor.co.kr/html/sub/chin.html)의 짜임새를 따르되
 * 글과 사진은 옛 홈페이지(dentalsun.co.kr 턱관절 페이지, 오너 캡처 2026-09-08) 것을 쓴다.
 *
 * ★ 병원 고유 문구(노하우 3가지·치료 5가지·PHL-15·CT)는 원문 그대로. 원인 3가지만 교과서 수준 일반 지식.
 * ★ 사진: 노하우 3장(scene/tmj-1~3)·증상 3장(scene/tmj-sym-1~3)·치료 5장(orig/tmj-tx-*)은 원본 캡처에서 잘라 낸 것. (orig/misc-tmj-skull 은 두개골이 아니라 잘못 잘린 조각이라 쓰지 않는다)
 *   원인 3장(ai/tmj-cause-*)만 원본에 사진이 없어 AI 로 만들었다(눈 안 보이는 인물, 글자 없음).
 * ★ 오너 제공 실사(Desktop/sega8074 → public/img/sun/): 첫 화면·노하우 띠·관절강 세척술·사이드바 배너에 쓴다.
 * ★ 관절강 세척술 원본 사진(consent-tmj-tx-arthro)은 환자 임상 사진이라 동의 확인 전까지 쓰지 않는다.
 */
import type { Fig } from '../docs';

export interface TmjSymptom { num: string; label: string; desc: string; fig: Fig; tone: 'night' | 'sun' }
export interface TmjCard { title: string; desc: string; fig: Fig }
export interface TmjStep { title: string; desc: string; fig: Fig }

/** 첫 화면 — 원본 첫 배너 문구 그대로 */
export const TMJ_HERO = {
  letters: 'TMJ',
  line1: '근본적인 원인을 찾아',
  line2: '개인별 맞춤 진료',
  desc: '재발율을 낮춘 턱관절 진료 시스템. 풍부한 경험과 노하우, 정확한 진단, 근본적인 치료로 환자마다 다른 턱관절 상태에 맞는 방법을 찾아 드립니다.',
  /** 대표 사진(구조화 데이터) */
  fig: { key: 'sun/tmj-explain-skull-2', alt: '두개골 모형과 턱관절 도해 화면으로 환자에게 설명하는 양대일 원장' } as Fig,
  /** 히어로 배경 — 넓은 실사(1920) */
  bg: { key: 'sun/tmj-explain-skull', alt: '두개골 모형을 들고 턱관절 구조를 설명하는 양대일 원장' } as Fig,
  tags: ['풍부한 경험과 노하우', '정확한 진단', '근본적인 치료'],
};

/** 턱관절 질환을 의심해 볼 수 있는 주요 증상 — 원본 3가지 + 사진 */
export const TMJ_SYMPTOMS: TmjSymptom[] = [
  { num: '01', label: '소리', desc: '음식을 씹거나 입을 벌릴 때마다 “딱딱”거리는 소리가 납니다.', fig: { key: 'scene/tmj-sym-1', alt: '턱관절 디스크의 위치를 나타낸 도해' }, tone: 'night' },
  { num: '02', label: '통증', desc: '턱관절 주변이 아프거나 원인을 알 수 없는 두통이 생깁니다.', fig: { key: 'scene/tmj-sym-2', alt: '통증으로 턱을 만지는 손' }, tone: 'sun' },
  { num: '03', label: '입 벌리기 힘듦', desc: '갑자기 입이 벌어지지 않거나 통증 때문에 크게 벌리기 어렵습니다.', fig: { key: 'scene/tmj-sym-3', alt: '입이 벌어지는 정도를 자로 재는 모습' }, tone: 'night' },
  { num: '04', label: '연관통', desc: '이유 없는 두통, 귀 주변의 먹먹함, 목과 어깨 결림이 턱 증상과 함께 반복됩니다.', fig: { key: 'ai/tmj-symptoms', alt: '귀 앞 턱관절 부위를 손가락으로 짚어 보는 모습' }, tone: 'sun' },
];

/** 원인 3가지 — 일반 지식. 사진은 AI(원본에 없음) */
export const TMJ_CAUSES: TmjCard[] = [
  { title: '나쁜 생활 습관', desc: '한쪽으로만 씹기, 턱 괴기, 손톱 깨물기, 딱딱하고 질긴 음식을 즐기는 습관', fig: { key: 'ai/tmj-cause-habit', alt: '책상에 턱을 괴고 있는 모습' } },
  { title: '무의식적 구강 습관', desc: '잠자는 동안 치아에 과도한 힘을 싣는 이갈이와 낮에 자기도 모르게 하는 이악물기', fig: { key: 'ai/tmj-cause-grind', alt: '옆으로 누워 자는 모습' } },
  { title: '심리적·구조적 요인', desc: '과도한 스트레스로 인한 근육 긴장, 고르지 않은 교합과 잘못된 자세로 인한 관절 부담', fig: { key: 'ai/tmj-cause-stress', alt: '책상 앞에서 머리를 감싸 쥔 모습' } },
];

/** 광화문선치과 턱관절 진료 노하우 3가지 — 원본 배너(jaw-join-treatment02) 문구 그대로.
 *  원 사진은 원본 조각(scene/tmj-1~3, 538×340)이 원을 못 채워 오너 실사를 정사각으로 미리 잘라 쓴다(sun/circle-*). */
export const TMJ_KNOWHOW = {
  title: '기본진료부터 장치치료까지 가능한 턱관절 치과',
  lead: '광화문선치과는 환자 개개인마다 다른 턱관절 상태에 맞춰 알맞은 치료 방법을 제시해 드리고 있습니다. 정확한 검사와 이해하기 쉬운 설명을 통해 최상의 방법을 제공해 드립니다.',
  band: { key: 'sun/tmj-explain-skull', alt: '두개골 모형을 들고 턱관절 구조를 설명하는 양대일 원장' } as Fig,
  bandTitle: '재발율을 낮춘 턱관절 진료 시스템',
  items: [
    { title: '정확한 진단', desc: '재발하지 않기 위한 근본적인 치료를 위해서는 약간의 오차로 인해 만족스럽지 못한 결과가 나올 수 있기에, 최신 장비를 통한 정확한 진단이 이루어집니다.', fig: { key: 'sun/circle-diagnosis', alt: '파노라마 영상을 띄운 모니터 앞에서 진료하는 양대일 원장' } },
    { title: '전반적인 턱관절 치료 진행', desc: '간단한 약물치료, 물리치료뿐만이 아니라 보톡스, 스플린트 장치치료 등의 전반적인 치료를 진행합니다. 턱관절은 장기적 치료가 필요한 경우가 많아 전반적인 치료를 할 수 있는 치과를 방문하셔야 합니다.', fig: { key: 'sun/circle-treatment', alt: '확대경을 쓰고 치료하는 양대일 원장' } },
    { title: '오랜 기간 다수의 턱관절 환자 진료', desc: '턱관절 치료의 경우 환자분마다 각기 다른 증상을 보여 원인을 찾기가 어려운 경우가 있습니다. 오랜 기간 다수의 환자분들을 진료하며 얻은 노하우로 정확한 원인을 찾아 근본적인 치료를 하고 있습니다.', fig: { key: 'sun/circle-experience', alt: '모니터 앞에서 환자에게 설명하는 양대일 원장' } },
  ] as TmjCard[],
};

/** 턱관절, 어떻게 치료해야 할까요? — 원본 배너(jaw-join-treatment05) 5가지 그대로 */
export const TMJ_STEPS: TmjStep[] = [
  { title: '약물치료', desc: '턱관절 질환의 초기 단계에는 약물을 이용해 비교적 빠르게 치료할 수 있습니다. 염증성 증상을 보일 때 규칙적으로 복용합니다.', fig: { key: 'orig/tmj-tx-pills', alt: '약물치료에 쓰는 알약' } },
  { title: '물리치료', desc: '턱관절 근육이 장시간 스트레스를 받아 문제가 생긴 경우, 레이저 및 초음파 장비로 수축된 근육을 이완시켜 통증과 증상을 완화합니다.', fig: { key: 'orig/tmj-tx-laser', alt: '관절 팔이 달린 레이저 물리치료 장비' } },
  { title: '보톡스 치료', desc: '미용 목적의 보톡스와 다르게, 과활성화된 턱관절 근육을 보톡스로 약화시켜 증상을 치료합니다. 턱관절로 인한 두통은 머리 근육에 주입해 완화합니다.', fig: { key: 'orig/tmj-tx-botox', alt: '약병에서 주사기로 약물을 뽑는 모습' } },
  { title: '스플린트 장치치료', desc: '턱관절 디스크(관절원판)가 제 위치를 벗어나면, 투명한 스플린트 장치로 머리뼈와 턱관절 사이의 공간을 확보해 원래 위치로 교정합니다.', fig: { key: 'orig/tmj-tx-splint', alt: '석고 모형 위에 올린 투명 스플린트 장치' } },
  { title: '관절강 세척술', desc: '갑자기 입이 안 벌어지거나 통증이 있을 때 주사침으로 관절 안을 세척하고 약물을 주입합니다. 염증을 없애고 입이 벌어질 공간을 확보하는 시술입니다.', fig: { key: 'sun/treat-loupe', alt: '확대경을 쓰고 시술하는 양대일 원장' } },
];

/** 장비 2가지 — 원본 배너(jaw-join-treatment06·07) 문구 그대로 */
export const TMJ_EQUIP: Array<{ eyebrow: string; title: string; lead: string; points: string[]; fig: Fig }> = [
  {
    eyebrow: 'PHL-15 LASER',
    title: '턱관절 물리치료 장비, PHL-15 레이저',
    lead: '저출력 레이저 및 저주파 전기치료기를 이용해 빠르게 턱관절 근육 통증을 완화합니다.',
    points: ['원적외선보다 5배 높은 피부 침투력', '증상에 따른 여러 가지 치료 모드', '건강보험 적용으로 부담 없이'],
    fig: { key: 'equip/laser', alt: 'PHL-15 레이저 물리치료 장비' },
  },
  {
    eyebrow: '3D DIGITAL CT',
    title: '저선량 첨단 디지털 CT',
    lead: '3D 촬영으로 보다 정확하고 안전하게 진단합니다.',
    points: ['여러 가지 영상을 제공하는 올인원 시스템', '파노라마와 CT를 함께 촬영 가능', '짧은 촬영시간과 적은 방사선 노출량'],
    fig: { key: 'equip/ct-3d', alt: '3D 디지털 CT 영상 화면' },
  },
];

/** 오른쪽 사이드바 — 진단 과정 4단계(주요 증상 페이지의 진단 과정을 요약) */
export const TMJ_PROCESS = [
  { label: '접수', title: '상담과 병력 확인', desc: '증상이 언제부터 어떻게 있었는지, 이갈이·한쪽 씹기 같은 습관을 듣습니다.' },
  { label: '검사', title: '촉진과 개구량 측정', desc: '턱관절과 씹는 근육을 눌러 보고, 입이 벌어지는 정도와 경로를 확인합니다.' },
  { label: '촬영', title: '저선량 디지털 CT', desc: '필요하면 3D 촬영으로 관절 뼈의 모양과 변화를 확인합니다.' },
  { label: '치료', title: '진단과 치료 계획', desc: '관절·디스크·근육 가운데 어디가 문제인지 설명하고 맞춤 치료를 시작합니다.' },
];
