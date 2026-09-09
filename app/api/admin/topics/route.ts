import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { pickTopics } from '@/lib/adminDraft';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST { count, existing: [{title, summary}] } → 아직 안 쓴 블로그 주제 N개 (lib/adminDraft.pickTopics).
 * '자동으로 쓰고 예약' 의 첫 단계 (2026-09-08 오너: "이전 블로그랑 다른 내용이어야 해").
 */
export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const key = process.env.GEMINI_API_KEY || req.headers.get('x-gemini-key');
  if (!key) return NextResponse.json({ error: 'Gemini 키가 없습니다.' }, { status: 428 });

  const body = (await req.json().catch(() => ({}))) as { count?: number; existing?: Array<{ title: string; summary?: string }> };
  const count = Math.min(30, Math.max(1, Math.round(Number(body.count) || 10)));
  const existing = Array.isArray(body.existing) ? body.existing.slice(0, 300) : [];
  try {
    const topics = await pickTopics(key, count, existing);
    if (!topics.length) return NextResponse.json({ error: '주제를 못 골랐습니다. 다시 눌러 보세요.' }, { status: 502 });
    return NextResponse.json({ ok: true, topics });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
