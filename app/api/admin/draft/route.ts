import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { MODEL } from '@/lib/adminGemini';
import { generateDraft, reviewDraft, medlaw } from '@/lib/adminDraft';

export const runtime = 'nodejs';
export const maxDuration = 180;

/**
 * POST { topic, existingTitles?, avoid?, review? } → Gemini 가 블로그 글 **초안**을 만든다 (lib/adminDraft.ts).
 *
 * ★ 여기서는 발행하지 않는다. 사람 흐름은 편집칸에 채워지고, '자동으로 쓰고 예약' 은 관리자 화면이
 *   이 초안을 받아 사진을 만든 뒤 /api/admin/publish 로 보낸다.
 * ★ review: true 면 두 번째 모델 호출로 감수까지 한다(의료법·사실·형식). 자동 흐름이 켠다. 사람 흐름은 사람이 읽으니 끈다.
 * ⚠️ 키는 서버 환경변수(GEMINI_API_KEY)가 우선, 없으면 헤더(x-gemini-key).
 */
export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const key = process.env.GEMINI_API_KEY || req.headers.get('x-gemini-key');
  if (!key) return NextResponse.json({ error: 'Gemini 키가 없습니다. Vercel 환경변수 GEMINI_API_KEY 를 설정하거나 화면에서 붙여 넣으세요.' }, { status: 428 });

  const body = (await req.json().catch(() => ({}))) as { topic?: string; existingTitles?: string[]; avoid?: string[]; review?: boolean };
  const topic = (body.topic || '').trim().slice(0, 300);
  if (topic.length < 2) return NextResponse.json({ error: '주제를 한 줄 적어 주세요. 예: 임플란트 심고 며칠 뒤부터 씹어도 되나' }, { status: 400 });
  const existing = Array.isArray(body.existingTitles) ? body.existingTitles.slice(0, 300).map(String) : [];
  const avoid = Array.isArray(body.avoid) ? body.avoid.slice(0, 20).map(String) : [];

  try {
    const r = await generateDraft(key, topic, existing, avoid);
    let fixes: string[] = [];
    let draft = r.draft;
    let warnings = r.warnings;
    let cautions = r.cautions;
    if (body.review && !warnings.length) {
      const rv = await reviewDraft(key, draft);
      draft = rv.draft;
      fixes = rv.fixes;
      const m = medlaw(draft);
      warnings = m.warnings;
      cautions = m.cautions;
    }
    return NextResponse.json({ ok: true, draft, notes: r.notes, warnings, cautions, fixes, chars: draft.html.replace(/<[^>]+>/g, '').length, model: MODEL });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
