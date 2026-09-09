import { readFile, listDir, fileSha, commitFiles } from '@/lib/github';

/**
 * 무인 발행 설정 — 저장소의 content/auto-blog.json 한 파일이 전부다 (DB 없음).
 *
 * ★ 왜 저장소인가 — 이 사이트는 DB 가 없다. 설정을 저장소에 두면 관리자 화면(토글)과 크론이 같은 것을 본다.
 *   토글 한 번 = 커밋 한 번 = 빌드 한 번. 하루에 몇 번 누를 일이 아니라 괜찮다.
 * ⚠️ content/blog/ 안에 두지 않는다 — lib/blog.ts 가 그 폴더의 *.json 을 전부 글로 읽는다(제목이 없어 건너뛰긴 하지만).
 */
export const AUTO_PATH = 'content/auto-blog.json';

export type AutoConfig = {
  enabled: boolean;
  /** 며칠에 한 편. 기본 3. */
  everyDays: number;
  /** 발행 시각 HH:mm (한국 시간). 기본 09:00. */
  time: string;
  /** 마지막으로 크론이 무엇을 했는지 — 관리자 화면에 보여 준다. */
  last?: { at: string; result: string };
};

export const AUTO_DEFAULT: AutoConfig = { enabled: false, everyDays: 3, time: '09:00' };

export async function readAutoConfig(token: string): Promise<AutoConfig> {
  try {
    const { text } = await readFile(token, AUTO_PATH);
    const j = JSON.parse(text) as Partial<AutoConfig>;
    return {
      enabled: !!j.enabled,
      everyDays: Math.min(14, Math.max(1, Math.round(Number(j.everyDays) || 3))),
      time: /^\d{2}:\d{2}$/.test(j.time || '') ? (j.time as string) : '09:00',
      last: j.last,
    };
  } catch {
    return { ...AUTO_DEFAULT };
  }
}

export async function writeAutoConfig(token: string, cfg: AutoConfig, message: string, extraFiles: Array<{ path: string; content: Buffer | string }> = []) {
  await fileSha(token, AUTO_PATH); /* 존재 여부와 무관하게 commitFiles 가 만들거나 덮어쓴다 */
  return commitFiles(token, [{ path: AUTO_PATH, content: JSON.stringify(cfg, null, 2) + '\n' }, ...extraFiles], message);
}

/** 저장소에 있는 글의 (date, title, summary, slug) — 크론이 다음 날짜와 겹침 검사에 쓴다. */
export async function listPostsMeta(token: string): Promise<Array<{ date: string; time?: string; title: string; summary?: string; slug: string }>> {
  const files = (await listDir(token, 'content/blog')).filter((f) => f.name.endsWith('.json'));
  const out: Array<{ date: string; time?: string; title: string; summary?: string; slug: string }> = [];
  for (const f of files) {
    try {
      const { text } = await readFile(token, f.path);
      const j = JSON.parse(text) as { date?: string; time?: string; title?: string; summary?: string; slug?: string };
      if (!j.title) continue;
      out.push({ date: j.date || f.name.slice(0, 10), time: j.time, title: j.title, summary: j.summary, slug: j.slug || f.name.replace(/\.json$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '') });
    } catch { /* 깨진 파일은 건너뛴다 */ }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const todayKST = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => new Date(new Date(`${iso}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);

/**
 * 다음 글 날짜 — 예약된 마지막 글에서 everyDays 뒤. 그 날이 이미 지났으면(꺼 뒀다가 켠 경우) 오늘.
 * ★ 크론은 **미래 글이 하나도 없을 때만** 만든다. 그래서 늘 '다음 한 편' 만 예약돼 있고, 마케터가 실리기 전 며칠 동안 읽어 볼 수 있다.
 */
export function nextAutoDate(posts: Array<{ date: string }>, everyDays: number): { due: boolean; date: string } {
  const today = todayKST();
  const latest = posts.reduce((m, p) => (p.date > m ? p.date : m), '0000-00-00');
  if (latest > today) return { due: false, date: latest };
  const next = addDays(latest === '0000-00-00' ? today : latest, everyDays);
  return { due: true, date: next < today ? today : next };
}
