import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { autoDraft } from '@/lib/adminDraft';
import { generateImage } from '@/lib/adminImage';
import { readAutoConfig, writeAutoConfig, listPostsMeta, nextAutoDate, todayKST } from '@/lib/autoBlog';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * 무인 발행 크론 — 매일 한 번(vercel.json: 15:00 UTC = 00:00 KST) 들어와서, 켜져 있고 미래 글이 없으면 **한 편**을 만들어 예약한다.
 * (2026-09-08 오너: "마케터 손에 안 가게, 그냥 3일마다 자동으로 올라가는 기능도 토글 형태로")
 *
 * ★ 한 번에 한 편만. 다음 글은 everyDays 뒤 날짜로 예약되므로, 실리기 전 며칠 동안 관리자 목록에서 읽어 볼 수 있다.
 * ★ 검사 층: 주제 겹침(모델+2-gram) → 초안 → 의료법 낱말(걸리면 피해서 재작성) → 감수(문맥) → 낱말 재검사 → 사진.
 *   어느 층에서든 버리면 그날은 **아무것도 올리지 않고** 사유만 설정 파일(last)에 남긴다. 다음 날 다시 시도한다.
 *   "완벽" 은 약속할 수 없다 — 사람이 안 읽는 글이 절대 틀리지 않는 방법은 없다. 이 층들은 확률을 낮추는 것이다.
 * ⚠️ 인증 두 가지: Vercel 크론(Authorization: Bearer CRON_SECRET) 또는 관리자 쿠키(화면의 '지금 한 편' 시험 단추).
 * ⚠️ 이 라우트는 서버 환경변수만 쓴다 — GITHUB_TOKEN · GEMINI_API_KEY · OPENAI_API_KEY 셋 다 있어야 한다.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') || '';
  const fromCron = !!secret && auth === `Bearer ${secret}`;
  const fromAdmin = isAuthed(req);
  if (!fromCron && !fromAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const force = fromAdmin && new URL(req.url).searchParams.get('force') === '1';

  const token = process.env.GITHUB_TOKEN;
  const gemini = process.env.GEMINI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  if (!token || !gemini) return NextResponse.json({ error: 'GITHUB_TOKEN / GEMINI_API_KEY 환경변수가 없습니다.' }, { status: 428 });

  const cfg = await readAutoConfig(token);
  if (!cfg.enabled && !force) return NextResponse.json({ ok: true, skipped: '꺼져 있음' });

  const posts = await listPostsMeta(token);
  const next = nextAutoDate(posts, cfg.everyDays);
  if (!next.due && !force) return NextResponse.json({ ok: true, skipped: `다음 글(${next.date})이 이미 예약돼 있음` });
  /* force(시험) 인데 미래 글이 있으면 그 뒤에 잇는다 */
  const date = next.due ? next.date : new Date(new Date(`${next.date}T00:00:00Z`).getTime() + cfg.everyDays * 86400000).toISOString().slice(0, 10);

  const stamp = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
  const record = async (result: string, files: Array<{ path: string; content: Buffer | string }> = []) => {
    await writeAutoConfig(token, { ...cfg, last: { at: stamp, result } }, files.length ? `발행(블로그·자동): ${result}` : `자동 발행 기록: ${result}`, files);
  };

  try {
    const r = await autoDraft(gemini, posts.map((p) => ({ title: p.title, summary: p.summary })));
    if (!r.ok) {
      await record(`건너뜀 — ${r.reason}${r.topic ? ` (${r.topic})` : ''}`);
      return NextResponse.json({ ok: true, skipped: r.reason, topic: r.topic });
    }
    const d = r.draft;
    let slug = d.slug || `post-${todayKST()}`;
    const used = new Set(posts.map((p) => p.slug));
    while (used.has(slug)) slug = `${slug}-2`;

    let image: string | undefined;
    const files: Array<{ path: string; content: Buffer | string }> = [];
    if (openai) {
      try {
        const webp = await generateImage(openai, d.imagePrompt || d.title);
        image = `/img/blog/${slug}.webp`;
        files.push({ path: `public${image}`, content: webp });
      } catch (e) {
        /* 사진이 안 되면 사진 없이 올린다 — 목록 카드가 제목 카드로 대신한다. 사유는 기록. */
        r.fixes.push(`사진 실패: ${String(e).slice(0, 80)}`);
      }
    }
    const json = {
      title: d.title,
      date,
      ...(cfg.time && cfg.time !== '00:00' ? { time: cfg.time } : {}),
      summary: d.summary,
      ...(d.category ? { category: d.category } : {}),
      ...(image ? { image, imageAlt: d.imageAlt || '' } : {}),
      slug,
      html: d.html,
    };
    files.push({ path: `content/blog/${date}-${slug}.json`, content: JSON.stringify(json, null, 2) + '\n' });
    const note = [`${date} ${cfg.time} 예약 — ${d.title}`, r.cautions.length ? `확인 권장: ${r.cautions.join(', ')}` : '', r.fixes.length ? `감수: ${r.fixes.join(' / ')}` : '']
      .filter(Boolean)
      .join(' · ');
    await record(note, files);
    return NextResponse.json({ ok: true, date, slug, title: d.title, cautions: r.cautions, fixes: r.fixes, image: !!image });
  } catch (e) {
    const msg = String(e).slice(0, 200);
    try { await record(`실패 — ${msg}`); } catch { /* 기록도 실패하면 응답으로만 알린다 */ }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
