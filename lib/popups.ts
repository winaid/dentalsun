/**
 * 홈 공지 팝업 목록 — 저장소 content/popups.json (2026-10-29 오너 "admin 에서 이미지만 넣으면 팝업 생기게,
 * 사라지는 기간도 정할 수 있게").
 *
 * ★ 블로그 글과 같은 방식이다 — 관리자 화면에서 저장하면 커밋 하나, Vercel 이 다시 빌드해 1~2분 뒤 사이트에 뜬다.
 *   그림은 public/img/popup/{id}.webp 로 같은 커밋에 들어간다.
 * ★ 기간은 한국 날짜 기준 '시작일 0시 ~ 종료일 끝(24시)'. 방문자 브라우저가 매번 오늘 날짜로 다시 거르므로
 *   종료일이 지나면 재빌드 없이도 저절로 안 뜬다.
 * ⚠️ content/blog/ 안에 두지 않는다 — lib/blog.ts 가 그 폴더의 *.json 을 전부 글로 읽는다.
 */
export const POPUPS_PATH = 'content/popups.json';
export const POPUP_IMG_DIR = 'public/img/popup';

export type Popup = {
  id: string;
  /** 사이트 경로 — /img/popup/{id}.webp */
  image: string;
  width: number;
  height: number;
  /** 그림 설명(화면 낭독기·검색). 비우면 '광화문 선치과 공지'. */
  alt: string;
  /** 'YYYY-MM-DD' 한국 날짜. 이날 0시부터 뜬다. */
  start: string;
  /** 'YYYY-MM-DD' 한국 날짜. 이날 24시에 사라진다. */
  end: string;
  /** 그림을 누르면 갈 주소(비우면 누를 수 없음). */
  link?: string;
  /** 끄면 기간 안이어도 안 뜬다. */
  enabled: boolean;
};

export const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export function isLive(p: Popup, today = todayKst()) {
  return p.enabled && p.start <= today && today <= p.end;
}

export function parsePopups(text: string): Popup[] {
  try {
    const j = JSON.parse(text) as { popups?: Popup[] };
    return Array.isArray(j.popups) ? j.popups : [];
  } catch {
    return [];
  }
}

export const serializePopups = (popups: Popup[]) => JSON.stringify({ popups }, null, 2) + '\n';
