import { readFile, commitFiles } from './github';

/**
 * 중앙(winaid) 글 숨김 목록 — 저장소 content/central-hidden.json 한 파일.
 *
 * ★ 왜 (2026-09-08 오너: "중앙에서 올린 거 admin 에서 삭제 못 해?")
 *   중앙 글은 우리 저장소에 없다(lib/insightFeed.ts 가 요청 때 API 로 받는다). 지울 파일이 없으니
 *   '지우기' 대신 **우리 사이트에서만 안 보이게 하는 목록**을 둔다. 중앙 데이터는 그대로라
 *   다시 보이게도 할 수 있고, 중앙에서 고친 글은 그대로 따라온다.
 * ★ 사이트 쪽은 이 파일을 빌드 때 읽는다(insightFeed 의 정적 import). 관리자가 여기 커밋하면
 *   Vercel 이 다시 빌드하므로 1~2분 뒤 반영된다 — 글 발행과 같은 흐름이다.
 * ⚠️ 이 파일은 '숨김' 이지 '삭제' 가 아니다. 중앙 미리보기(/h/circle-dental/insight)에는 계속 보인다.
 */
export const HIDDEN_PATH = 'content/central-hidden.json';

export async function readHidden(token: string): Promise<string[]> {
  try {
    const { text } = await readFile(token, HIDDEN_PATH);
    const j = JSON.parse(text) as { hidden?: unknown };
    return Array.isArray(j.hidden) ? j.hidden.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    /* 파일이 없거나 깨졌으면 아무것도 안 숨긴 상태 — 다음 쓰기가 새로 만든다. */
    return [];
  }
}

export async function writeHidden(token: string, hidden: string[], message: string) {
  return commitFiles(token, [{ path: HIDDEN_PATH, content: JSON.stringify({ hidden }, null, 2) + '\n' }], message);
}
