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

/** 보는 법(끄는 비교·위아래 경과)은 CaseGallery 가 보여 주는 방식에 맞춰 뒤에 붙인다 */
export const CASE_NOTE =
  '광화문 선치과에서 진료받은 환자분의 실제 사진입니다. 치료 결과와 경과는 구강 상태와 치료 방법에 따라 개인마다 다르며, 모든 의료 행위에는 부작용이 따를 수 있습니다.';

/** 사례 목록 — scripts 가 만든 manifest 에서 옮긴다(C:/tmp/sun-fb-0929/cases-work/manifest.json) */
export const CASES: CaseItem[] = [
  { id: 'endo-01-xray', category: 'endo', type: 'xray', xrayKind: 'periapical', caption: '하악 대구치 근관치료 — 근관 충전', before: { key: 'cases2/endo-01-xray-before', w: 1100, h: 803 }, after: { key: 'cases2/endo-01-xray-after', w: 1100, h: 803 } },
  { id: 'endo-02-xray', category: 'endo', type: 'xray', xrayKind: 'periapical', caption: '하악 대구치 근관치료 — 기존 보철 치아의 근관 충전', before: { key: 'cases2/endo-02-xray-before', w: 1100, h: 803 }, after: { key: 'cases2/endo-02-xray-after', w: 1100, h: 803 } },
  { id: 'endo-03-xray', category: 'endo', type: 'xray', xrayKind: 'periapical', caption: '상악 구치부 근관치료 — 우식 치아의 근관 충전', before: { key: 'cases2/endo-03-xray-before', w: 1100, h: 803 }, after: { key: 'cases2/endo-03-xray-after', w: 1100, h: 803 } },
  { id: 'endo-04-xray', category: 'endo', type: 'xray', xrayKind: 'periapical', caption: '상악 구치부 근관치료 — 근관 충전 후 보철 수복', before: { key: 'cases2/endo-04-xray-before', w: 1100, h: 803 }, after: { key: 'cases2/endo-04-xray-after', w: 1100, h: 803 } },
  { id: 'reendo-01-xray', category: 'reendo', type: 'xray', xrayKind: 'periapical', caption: '하악 대구치 재근관치료 — 기존 근관 충전 재처치', before: { key: 'cases2/reendo-01-xray-before', w: 1100, h: 803 }, after: { key: 'cases2/reendo-01-xray-after', w: 1100, h: 803 } },
  { id: 'reendo-02-xray-pa', category: 'reendo', type: 'xray', xrayKind: 'periapical', caption: '하악 대구치 재근관치료 — 재충전 후 보철 수복', before: { key: 'cases2/reendo-02-xray-pa-before', w: 1100, h: 803 }, after: { key: 'cases2/reendo-02-xray-pa-after', w: 1100, h: 803 } },
  { id: 'reendo-02-xray-pano', category: 'reendo', type: 'xray', xrayKind: 'panorama', caption: '하악 대구치 재근관치료', before: { key: 'cases2/reendo-02-xray-pano-before', w: 1600, h: 673 }, after: { key: 'cases2/reendo-02-xray-pano-after', w: 1600, h: 673 } },
  { id: 'reendo-03-xray-pa', category: 'reendo', type: 'xray', xrayKind: 'periapical', caption: '하악 전치 재근관치료 — 재충전 후 보철 수복', before: { key: 'cases2/reendo-03-xray-pa-before', w: 803, h: 1100 }, after: { key: 'cases2/reendo-03-xray-pa-after', w: 803, h: 1100 } },
  { id: 'reendo-03-xray-pano', category: 'reendo', type: 'xray', xrayKind: 'panorama', caption: '하악 전치 재근관치료', before: { key: 'cases2/reendo-03-xray-pano-before', w: 1600, h: 673 }, after: { key: 'cases2/reendo-03-xray-pano-after', w: 1600, h: 673 } },
  { id: 'wisdom-01-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '하악 좌측 매복 사랑니 발치', before: { key: 'cases2/wisdom-01-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-01-xray-after', w: 1600, h: 673 } },
  { id: 'wisdom-02-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '하악 양측 매복 사랑니 발치', before: { key: 'cases2/wisdom-02-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-02-xray-after', w: 1600, h: 673 } },
  { id: 'wisdom-03-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '하악 우측 수평 매복 사랑니 발치', before: { key: 'cases2/wisdom-03-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-03-xray-after', w: 1600, h: 673 } },
  { id: 'wisdom-04-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '하악 좌측 매복 사랑니 발치', before: { key: 'cases2/wisdom-04-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-04-xray-after', w: 1600, h: 673 } },
  { id: 'wisdom-05-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '하악 좌측 수평 매복 사랑니 발치', before: { key: 'cases2/wisdom-05-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-05-xray-after', w: 1600, h: 673 } },
  { id: 'wisdom-06-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '상악 사랑니 발치', before: { key: 'cases2/wisdom-06-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-06-xray-after', w: 1600, h: 673 } },
  { id: 'wisdom-07-xray', category: 'wisdom', type: 'xray', xrayKind: 'panorama', caption: '우측 상·하악 사랑니 발치', before: { key: 'cases2/wisdom-07-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/wisdom-07-xray-after', w: 1600, h: 673 } },
  { id: 'implant-01-intraoral', category: 'implant', type: 'intraoral', caption: '전치부 임플란트 — 손상 치아 부위 보철 수복', before: { key: 'cases2/implant-01-intraoral-before', w: 1316, h: 822 }, after: { key: 'cases2/implant-01-intraoral-after', w: 1316, h: 822 } },
  { id: 'implant-02-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '좌측 상·하악 구치부 임플란트', before: { key: 'cases2/implant-02-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-02-xray-after', w: 1600, h: 673 } },
  { id: 'implant-03-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '상악 다수 부위 임플란트', before: { key: 'cases2/implant-03-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-03-xray-after', w: 1600, h: 673 } },
  { id: 'implant-03-intraoral', category: 'implant', type: 'intraoral', caption: '상악 좌측 측절치 부위 임플란트 — 결손 부위 보철 회복', before: { key: 'cases2/implant-03-intraoral-before', w: 1308, h: 818 }, after: { key: 'cases2/implant-03-intraoral-after', w: 1308, h: 818 }, edits: '후 사진: 임플란트 옆 자연치의 작은 우식 반점 제거(병원 요청)' },
  { id: 'implant-04-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '좌측 상·하악 구치부 임플란트', before: { key: 'cases2/implant-04-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-04-xray-after', w: 1600, h: 673 } },
  { id: 'implant-05-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '상악 양측·하악 우측 구치부 임플란트', before: { key: 'cases2/implant-05-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-05-xray-after', w: 1600, h: 673 } },
  { id: 'implant-06-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '상악 우측 중절치 임플란트', before: { key: 'cases2/implant-06-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-06-xray-after', w: 1600, h: 673 } },
  { id: 'implant-06-intraoral', category: 'implant', type: 'intraoral', caption: '상악 우측 중절치 임플란트 — 파절 치아 부위 보철 회복', before: { key: 'cases2/implant-06-intraoral-before', w: 796, h: 531 }, after: { key: 'cases2/implant-06-intraoral-after', w: 796, h: 531 }, edits: '후 사진: 치은 변연의 출혈 흔적 제거(병원 요청)' },
  { id: 'implant-07-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '상·하악 다수 부위 임플란트 보철', before: { key: 'cases2/implant-07-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-07-xray-after', w: 1600, h: 673 } },
  { id: 'implant-08-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '상악 우측 중절치 임플란트', before: { key: 'cases2/implant-08-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-08-xray-after', w: 1600, h: 673 } },
  { id: 'implant-08-intraoral', category: 'implant', type: 'intraoral', caption: '상악 우측 중절치 임플란트 — 돌출·변색 치아 부위 보철 회복', before: { key: 'cases2/implant-08-intraoral-before', w: 1400, h: 933 }, after: { key: 'cases2/implant-08-intraoral-after', w: 1400, h: 933 } },
  { id: 'implant-09-xray', category: 'implant', type: 'xray', xrayKind: 'panorama', caption: '상악 좌측 측절치 임플란트', before: { key: 'cases2/implant-09-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/implant-09-xray-after', w: 1600, h: 673 } },
  { id: 'implant-09-intraoral', category: 'implant', type: 'intraoral', caption: '상악 좌측 측절치 임플란트 — 결손 부위 보철 회복', before: { key: 'cases2/implant-09-intraoral-before', w: 1378, h: 861 }, after: { key: 'cases2/implant-09-intraoral-after', w: 1378, h: 861 } },
  { id: 'fullarch-01-xray', category: 'fullarch', type: 'xray', xrayKind: 'panorama', caption: '상·하악 풀아치 임플란트', before: { key: 'cases2/fullarch-01-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/fullarch-01-xray-after', w: 1600, h: 673 } },
  { id: 'fullarch-01-intraoral', category: 'fullarch', type: 'intraoral', caption: '상·하악 풀아치 임플란트 — 전: 상악 교합면, 후: 정면', before: { key: 'cases2/fullarch-01-intraoral-before', w: 1134, h: 850 }, after: { key: 'cases2/fullarch-01-intraoral-after', w: 1134, h: 850 } },
  { id: 'fullarch-02-xray', category: 'fullarch', type: 'xray', xrayKind: 'panorama', caption: '상악 풀아치 임플란트 및 하악 우측 구치부 임플란트', before: { key: 'cases2/fullarch-02-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/fullarch-02-xray-after', w: 1600, h: 673 } },
  { id: 'fullarch-02-intraoral', category: 'fullarch', type: 'intraoral', caption: '상악 풀아치 임플란트 — 상악 전치부 결손 상태에서 보철 회복', before: { key: 'cases2/fullarch-02-intraoral-before', w: 1239, h: 697 }, after: { key: 'cases2/fullarch-02-intraoral-after', w: 1239, h: 697 } },
  { id: 'fullarch-03-xray', category: 'fullarch', type: 'xray', xrayKind: 'panorama', caption: '하악 풀아치 임플란트 — 무치악 부위 보철 회복', before: { key: 'cases2/fullarch-03-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/fullarch-03-xray-after', w: 1600, h: 673 } },
  { id: 'fullarch-03-intraoral', category: 'fullarch', type: 'intraoral', caption: '무치악 상태에서 보철 회복 — 전: 상악 구개면, 후: 정면', before: { key: 'cases2/fullarch-03-intraoral-before', w: 1178, h: 785 }, after: { key: 'cases2/fullarch-03-intraoral-after', w: 1178, h: 785 } },
  { id: 'fullarch-04-xray', category: 'fullarch', type: 'xray', xrayKind: 'panorama', caption: '상·하악 풀아치 임플란트 — 기존 보철 부위', before: { key: 'cases2/fullarch-04-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/fullarch-04-xray-after', w: 1600, h: 673 } },
  { id: 'fullarch-04-intraoral', category: 'fullarch', type: 'intraoral', caption: '상·하악 풀아치 임플란트 — 기존 보철 치아에서 보철 회복', before: { key: 'cases2/fullarch-04-intraoral-before', w: 1156, h: 650 }, after: { key: 'cases2/fullarch-04-intraoral-after', w: 1156, h: 650 } },
  { id: 'fullarch-05-xray', category: 'fullarch', type: 'xray', xrayKind: 'panorama', caption: '상·하악 풀아치 임플란트 — 잔존 치아 2개 상태에서 보철 회복', before: { key: 'cases2/fullarch-05-xray-before', w: 1600, h: 673 }, after: { key: 'cases2/fullarch-05-xray-after', w: 1600, h: 673 } },
  { id: 'fullarch-05-intraoral', category: 'fullarch', type: 'intraoral', caption: '상·하악 풀아치 임플란트 — 전: 하악 잔존 치아, 후: 정면', before: { key: 'cases2/fullarch-05-intraoral-before', w: 1400, h: 933 }, after: { key: 'cases2/fullarch-05-intraoral-after', w: 1400, h: 933 } },
  { id: 'anterior-redo-01-intraoral', category: 'anterior', type: 'intraoral', caption: '상악 중절치 보철 교체 — 색조가 다른 기존 보철 재제작', before: { key: 'cases2/anterior-redo-01-intraoral-before', w: 1148, h: 574 }, after: { key: 'cases2/anterior-redo-01-intraoral-after', w: 1148, h: 574 } },
  { id: 'anterior-redo-02-intraoral', category: 'anterior', type: 'intraoral', caption: '상악 전치부 보철 교체', before: { key: 'cases2/anterior-redo-02-intraoral-before', w: 1400, h: 700 }, after: { key: 'cases2/anterior-redo-02-intraoral-after', w: 1400, h: 700 } },
  { id: 'anterior-esthetic-01-intraoral', category: 'anterior', type: 'intraoral', caption: '상악 전치부 심미보철 — 변색·손상 치아 부위', before: { key: 'cases2/anterior-esthetic-01-intraoral-before', w: 791, h: 396 }, after: { key: 'cases2/anterior-esthetic-01-intraoral-after', w: 791, h: 396 } },
  { id: 'anterior-esthetic-02-intraoral', category: 'anterior', type: 'intraoral', caption: '상악 전치부 심미보철', before: { key: 'cases2/anterior-esthetic-02-intraoral-before', w: 1183, h: 710 }, after: { key: 'cases2/anterior-esthetic-02-intraoral-after', w: 1183, h: 710 } },
  { id: 'fracture-01-intraoral', category: 'fracture', type: 'intraoral', caption: '상악 중절치 파절 — 신경치료 후 보철 수복', before: { key: 'cases2/fracture-01-intraoral-before', w: 1394, h: 784 }, after: { key: 'cases2/fracture-01-intraoral-after', w: 1394, h: 784 } },
  { id: 'resin-01-intraoral', category: 'resin', type: 'intraoral', caption: '상악 구치부 레진 충전 — 교합면 우식', before: { key: 'cases2/resin-01-intraoral-before', w: 873, h: 546 }, after: { key: 'cases2/resin-01-intraoral-after', w: 873, h: 546 }, edits: '후 사진: 치아를 가로지른 타액 줄 제거(병원 요청)' },
  { id: 'resin-02-intraoral', category: 'resin', type: 'intraoral', caption: '하악 구치부 레진 충전 — 교합면 우식', before: { key: 'cases2/resin-02-intraoral-before', w: 818, h: 409 }, after: { key: 'cases2/resin-02-intraoral-after', w: 818, h: 409 } },
  { id: 'resin-03-intraoral', category: 'resin', type: 'intraoral', caption: '상악 전치부 레진 수복 — 절단연 결손 부위', before: { key: 'cases2/resin-03-intraoral-before', w: 1100, h: 550 }, after: { key: 'cases2/resin-03-intraoral-after', w: 1100, h: 550 }, edits: '후 사진: 치간부 혈흔 제거(병원 요청)' },
  { id: 'resin-04-intraoral', category: 'resin', type: 'intraoral', caption: '상악 중절치 인접면 우식 레진 충전', before: { key: 'cases2/resin-04-intraoral-before', w: 1092, h: 728 }, after: { key: 'cases2/resin-04-intraoral-after', w: 1092, h: 728 } },
  { id: 'resin-05-intraoral', category: 'resin', type: 'intraoral', caption: '상악 전치부 레진 수복', before: { key: 'cases2/resin-05-intraoral-before', w: 1400, h: 700 }, after: { key: 'cases2/resin-05-intraoral-after', w: 1400, h: 700 } },
  { id: 'resin-06-intraoral-close', category: 'resin', type: 'intraoral', caption: '상악 전치부 인접면 우식 레진 충전 — 근접 사진', before: { key: 'cases2/resin-06-intraoral-close-before', w: 1081, h: 676 }, after: { key: 'cases2/resin-06-intraoral-close-after', w: 1081, h: 676 } },
  { id: 'resin-06-intraoral-wide', category: 'resin', type: 'intraoral', caption: '상악 전치부 인접면 우식 레진 충전 — 전체 사진', before: { key: 'cases2/resin-06-intraoral-wide-before', w: 1400, h: 700 }, after: { key: 'cases2/resin-06-intraoral-wide-after', w: 1400, h: 700 } },
  { id: 'resin-07-intraoral-close', category: 'resin', type: 'intraoral', caption: '상악 중절치 절단연 파절 레진 수복 — 근접 사진', before: { key: 'cases2/resin-07-intraoral-close-before', w: 1400, h: 700 }, after: { key: 'cases2/resin-07-intraoral-close-after', w: 1400, h: 700 }, edits: '전·후 모두: 견인기 얼룩·타액 기포만 제거, 치아 표면은 손대지 않음' },
  { id: 'resin-07-intraoral-wide', category: 'resin', type: 'intraoral', caption: '상악 중절치 절단연 파절 레진 수복 — 전체 사진', before: { key: 'cases2/resin-07-intraoral-wide-before', w: 1400, h: 933 }, after: { key: 'cases2/resin-07-intraoral-wide-after', w: 1400, h: 933 }, edits: '전·후 모두: 견인기 얼룩·타액 기포만 제거, 치아 표면은 손대지 않음' },
  { id: 'resin-08-intraoral', category: 'resin', type: 'intraoral', caption: '상악 전치부 치경부 레진 수복', before: { key: 'cases2/resin-08-intraoral-before', w: 1250, h: 625 }, after: { key: 'cases2/resin-08-intraoral-after', w: 1250, h: 625 } },
  { id: 'tmj-01-xray', category: 'tmj', type: 'xray', xrayKind: 'ct', caption: '턱관절 CT 측면 단면 — 세 시점 경과', before: { key: 'cases2/tmj-01-xray-1', w: 578, h: 304 }, middle: [{ key: 'cases2/tmj-01-xray-2', w: 578, h: 304 }], after: { key: 'cases2/tmj-01-xray-3', w: 578, h: 304 } },
];

export const casesOf = (cats?: CaseCategory[]) => (cats?.length ? CASES.filter((c) => cats.includes(c.category)) : CASES);
