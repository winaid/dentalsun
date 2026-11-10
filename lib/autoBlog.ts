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
  /**
   * 자동 글 제목 앞에 붙이는 검색어 (2026-11-10 오너: "광화문선치과도 광화문치과로 블로그 매일 1개" — 동그라미 co.kr 과 같은 꼴).
   * 비우면 붙이지 않는다. 겹침 검사는 이 앞머리를 떼고 본다 — 안 그러면 모든 제목이 서로 비슷하다고 걸린다.
   */
  titlePrefix?: string;
  /** 자동 글에 사진(OpenAI)을 만들지. false 면 만들지 않고 lib/blogCovers.ts 의 기존 사진을 쓴다. 없으면 만든다(예전 동작). */
  image?: boolean;
  /** 마지막으로 크론이 무엇을 했는지 — 관리자 화면에 보여 준다. */
  last?: { at: string; result: string };
};

export const AUTO_DEFAULT: AutoConfig = { enabled: false, everyDays: 3, time: '09:00' };

/* ⚠️ 칸을 늘리면 여기서도 읽어야 한다 — 관리자 토글과 크론 기록이 이 결과를 펼쳐 다시 저장하므로,
   여기서 빠진 칸은 토글 한 번에 파일에서 지워진다. */
export async function readAutoConfig(token: string): Promise<AutoConfig> {
  try {
    const { text } = await readFile(token, AUTO_PATH);
    const j = JSON.parse(text) as Partial<AutoConfig>;
    return {
      enabled: !!j.enabled,
      everyDays: Math.min(14, Math.max(1, Math.round(Number(j.everyDays) || 3))),
      time: /^\d{2}:\d{2}$/.test(j.time || '') ? (j.time as string) : '09:00',
      ...(typeof j.titlePrefix === 'string' && j.titlePrefix.trim() ? { titlePrefix: j.titlePrefix.trim() } : {}),
      ...(typeof j.image === 'boolean' ? { image: j.image } : {}),
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

/** 제목 앞머리 떼기 — 겹침 검사용. */
export function stripTitlePrefix(title: string, prefix?: string): string {
  return prefix && title.startsWith(prefix) ? title.slice(prefix.length).trim() : title;
}

/** 제목 앞머리 붙이기 — 이미 그 말로 시작하면 그대로. */
export function withTitlePrefix(title: string, prefix?: string): string {
  if (!prefix) return title;
  const t = stripTitlePrefix(title.trim(), prefix);
  return `${prefix} ${t}`;
}

/** 저장소에 있는 글의 (date, title, summary, slug, image) — 크론이 다음 날짜·겹침 검사·대표 사진 고르기에 쓴다. */
export async function listPostsMeta(token: string): Promise<Array<{ date: string; time?: string; title: string; summary?: string; slug: string; image?: string }>> {
  const files = (await listDir(token, 'content/blog')).filter((f) => f.name.endsWith('.json'));
  const out: Array<{ date: string; time?: string; title: string; summary?: string; slug: string; image?: string }> = [];
  for (const f of files) {
    try {
      const { text } = await readFile(token, f.path);
      const j = JSON.parse(text) as { date?: string; time?: string; title?: string; summary?: string; slug?: string; image?: string };
      if (!j.title) continue;
      out.push({ date: j.date || f.name.slice(0, 10), time: j.time, title: j.title, summary: j.summary, slug: j.slug || f.name.replace(/\.json$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''), image: j.image });
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
