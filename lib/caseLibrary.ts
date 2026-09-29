/**
 * 치료 전후 사례 모음 — 2026-09-29 병원이 보내 준 실제 환자 사진(홈페이지.zip)에서 만든 것.
 *
 * ★ 원장 요청: "구내 사진 전후, 파노라마 전후 **두 영역**으로 넣고, **위아래로 비교**할 수 있게. 마음에 안 드는 것은 뺄 것."
 *   → 사례 하나 = 이 배열의 한 줄. 빼려면 그 줄만 지우면 화면·홈·진료 쪽에서 함께 빠진다.
 * ★ 파일 이름·설명에 환자 이름·차트번호·날짜를 넣지 않는다(원본 폴더명에 환자 이름이 있다).
 * ★ 사진 손질 기록은 edits — 치료한 치아 표면은 고치지 않았다(치료 결과 보정 = 거짓 광고 소지).
 */
export type CaseCategory = 'implant' | 'fullarch' | 'endo' | 'reendo' | 'wisdom' | 'anterior' | 'fracture' | 'resin' | 'tmj';

export interface CaseImg {
  key: string;
  w: number;
  h: number;
}
export interface CaseItem {
  id: string;
  category: CaseCategory;
  /** intraoral = 구내 사진, xray = 방사선 사진(파노라마·치근단·CT) */
  type: 'intraoral' | 'xray';
  xrayKind?: 'panorama' | 'periapical' | 'ct';
  caption: string;
  before: CaseImg;
  after: CaseImg;
  /** 경과가 셋 이상인 사례(턱관절 CT) — before·after 사이 사진 */
  middle?: CaseImg[];
  edits?: string;
}

export const CASE_CATEGORY_LABEL: Record<CaseCategory, string> = {
  implant: '임플란트',
  fullarch: '풀아치 임플란트',
  endo: '근관치료',
  reendo: '재근관치료',
  wisdom: '매복 사랑니',
  anterior: '전치부 보철',
  fracture: '전치부 파절',
  resin: '레진 충치치료',
  tmj: '턱관절',
};

export const CASE_NOTE =
  '광화문 선치과에서 진료받은 환자분의 실제 사진입니다. 위가 치료 전, 아래가 치료 후입니다. 치료 결과와 경과는 구강 상태와 치료 방법에 따라 개인마다 다르며, 모든 의료 행위에는 부작용이 따를 수 있습니다.';

/** 사례 목록 — scripts 가 만든 manifest 에서 옮긴다(C:/tmp/sun-fb-0929/cases-work/manifest.json) */
export const CASES: CaseItem[] = [];

export const casesOf = (cats?: CaseCategory[]) => (cats?.length ? CASES.filter((c) => cats.includes(c.category)) : CASES);
