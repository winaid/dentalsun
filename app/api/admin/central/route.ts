import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { tokenFrom } from '@/lib/github';
import { readHidden, writeHidden } from '@/lib/centralHidden';
import { CENTRAL_BASE, CENTRAL_HOSPITAL } from '@/lib/insightFeed';

export const runtime = 'nodejs';

/**
 * 중앙(winaid) 글 관리 API.
 *
 * GET                     중앙 글 전체(캐시 없이 지금 값) + 숨김 여부.
 * POST { slug, hidden }   숨기기 / 다시 보이기 — content/central-hidden.json 에 커밋.
 *
 * ⚠️ 여기서 할 수 있는 건 숨김뿐이다. 글 내용·사진·발행 취소는 중앙 관리자에서.
 * ⚠️ 세션 쿠키 필수(401). GitHub 토큰 필수(428) — 글 발행과 같은 조건.
 */
type Item = { slug: string; title: string; post_type: string; published_at: string; cover_image: string | null };

const noAuth = () => NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
const noToken = () => NextResponse.json({ error: 'GitHub 토큰이 없습니다.' }, { status: 428 });

async function centralList(): Promise<Item[]> {
  const out: Item[] = [];
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`${CENTRAL_BASE}/api/public/insights?hospital=${encodeURIComponent(CENTRAL_HOSPITAL)}&page=${page}&limit=100`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`중앙 API ${r.status}`);
    const j = (await r.json()) as { ok: boolean; items: Item[]; hasMore: boolean };
    if (!j.ok) throw new Error('중앙 API 응답 오류');
    out.push(...j.items);
    if (!j.hasMore) break;
  }
  return out;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  try {
    const [items, hidden] = await Promise.all([centralList(), readHidden(token)]);
    return NextResponse.json({
      ok: true,
      hospital: CENTRAL_HOSPITAL,
      hidden,
      items: items.map((it) => ({
        slug: it.slug,
        title: it.title,
        post_type: it.post_type,
        published_at: it.published_at,
        hasCover: !!it.cover_image,
        hidden: hidden.includes(it.slug),
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  const body = (await req.json().catch(() => ({}))) as { slug?: string; hidden?: boolean };
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  if (!/^[a-z0-9][a-z0-9-]{0,120}$/i.test(slug) || typeof body.hidden !== 'boolean') {
    return NextResponse.json({ error: 'slug 와 hidden(true/false) 이 필요합니다.' }, { status: 400 });
  }
  try {
    const cur = await readHidden(token);
    const next = body.hidden ? [...new Set([...cur, slug])] : cur.filter((s) => s !== slug);
    if (next.length !== cur.length || next.some((s, i) => s !== cur[i])) {
      await writeHidden(token, next, `${body.hidden ? '숨김' : '다시 보임'}(중앙 글): ${slug}`);
    }
    return NextResponse.json({ ok: true, hidden: next });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
