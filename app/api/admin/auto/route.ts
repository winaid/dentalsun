import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { tokenFrom } from '@/lib/github';
import { readAutoConfig, writeAutoConfig, listPostsMeta, nextAutoDate } from '@/lib/autoBlog';

export const runtime = 'nodejs';

/**
 * 무인 발행 설정 — GET 은 현재 상태와 다음 글 날짜, POST { enabled, everyDays?, time? } 는 저장(커밋).
 * ⚠️ 크론이 실제로 도는지는 Vercel 쪽(vercel.json crons + CRON_SECRET)에 달려 있다. 여기서는 '켜짐' 만 기록한다.
 */
export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const token = tokenFrom(req);
  if (!token) return NextResponse.json({ error: 'GitHub 토큰이 없습니다.' }, { status: 428 });
  try {
    const cfg = await readAutoConfig(token);
    const posts = await listPostsMeta(token);
    const next = nextAutoDate(posts, cfg.everyDays);
    return NextResponse.json({ ok: true, config: cfg, next, cronReady: !!process.env.CRON_SECRET });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const token = tokenFrom(req);
  if (!token) return NextResponse.json({ error: 'GitHub 토큰이 없습니다.' }, { status: 428 });
  const body = (await req.json().catch(() => ({}))) as { enabled?: boolean; everyDays?: number; time?: string };
  try {
    const cur = await readAutoConfig(token);
    const cfg = {
      ...cur,
      enabled: typeof body.enabled === 'boolean' ? body.enabled : cur.enabled,
      everyDays: body.everyDays ? Math.min(14, Math.max(1, Math.round(Number(body.everyDays)))) : cur.everyDays,
      time: body.time && /^\d{2}:\d{2}$/.test(body.time) ? body.time : cur.time,
    };
    await writeAutoConfig(token, cfg, `자동 발행 ${cfg.enabled ? '켬' : '끔'} (${cfg.everyDays}일에 1편, ${cfg.time})`);
    return NextResponse.json({ ok: true, config: cfg });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
