import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { autoDraft } from '@/lib/adminDraft';
import { generateImage, composeImagePrompt } from '@/lib/adminImage';
import { readClinicPrompt } from '@/lib/clinicPrompt';
import { pickCover } from '@/lib/blogCovers';
import { readAutoConfig, writeAutoConfig, listPostsMeta, nextAutoDate, todayKST, stripTitlePrefix, withTitlePrefix } from '@/lib/autoBlog';

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
    /* ★ 사람이 쓰든 크론이 쓰든 같은 병원 규칙을 본다 — 담당자 프롬프트를 저장소에 둔 이유가 이것이다. */
    const clinic = await readClinicPrompt(token);
    /* 겹침 검사·주제 고르기는 앞머리(광화문치과)를 뗀 제목으로 — 모든 제목이 같은 말로 시작하면 서로 비슷하다고 걸린다. */
    const r = await autoDraft(gemini, posts.map((p) => ({ title: stripTitlePrefix(p.title, cfg.titlePrefix), summary: p.summary })), undefined, clinic);
    if (!r.ok) {
      await record(`건너뜀 — ${r.reason}${r.topic ? ` (${r.topic})` : ''}`);
      return NextResponse.json({ ok: true, skipped: r.reason, topic: r.topic });
    }
    const d = { ...r.draft, title: withTitlePrefix(r.draft.title, cfg.titlePrefix) };
    let slug = d.slug || `post-${todayKST()}`;
    const used = new Set(posts.map((p) => p.slug));
    while (used.has(slug)) slug = `${slug}-2`;

    let image: string | undefined;
    const images: Array<{ src: string; alt: string; w: number; h: number }> = [];
    const files: Array<{ path: string; content: Buffer | string }> = [];
    if (openai && cfg.image !== false) {
      /* 대표 사진 + 본문 사진(담당자 프롬프트의 사진 장수 - 1)을 **한꺼번에** 만든다 — 차례로 만들면 크론 300초를 넘는다(글까지 실측 211초). */
      const one = async (scene: string) => {
        const composed = await composeImagePrompt(gemini, scene, clinic.image);
        if (!composed.applied) r.fixes.push('사진 규칙을 못 반영해 기본 장면으로 만들었습니다');
        return generateImage(openai, composed.prompt);
      };
      const body = d.bodyScenes || [];
      const made = await Promise.allSettled([one(d.imagePrompt || d.title), ...body.map((b) => one(b.scene))]);
      made.forEach((m, i) => {
        if (m.status === 'rejected') {
          /* 사진이 안 되면 사진 없이 올린다 — 목록 카드가 제목 카드로 대신한다. 사유는 기록. */
          r.fixes.push(`사진${i ? ` ${i + 1}` : ''} 실패: ${String(m.reason).slice(0, 80)}`);
          return;
        }
        if (i === 0) {
          image = `/img/blog/${slug}.webp`;
          files.push({ path: `public${image}`, content: m.value });
        } else {
          const src = `/img/blog/${slug}-${i + 1}.webp`;
          images.push({ src, alt: body[i - 1].alt || d.title, w: 1536, h: 1024 });
          files.push({ path: `public${src}`, content: m.value });
        }
      });
    }
    /*
     * ★ 사진 없는 글을 두지 않는다 (2026-11-10, co.kr 11-09 오너 "애만 없으니깐 이상하다. 사진 한장씩은 나오게"와 같은 처리).
     *   사진 만들기가 꺼져 있거나(image:false) 실패하면 lib/blogCovers.ts 의 기존 사물 사진에서
     *   분류에 맞고 최근 여덟 편이 안 쓴 것을 고른다. 새 파일을 만들지 않으므로 커밋에 그림이 늘지 않는다.
     */
    let imageAlt = d.imageAlt || '';
    if (!image) {
      const c = pickCover(d.category, posts.slice(0, 8).map((p) => p.image), slug);
      image = c.src;
      imageAlt = c.alt;
    }
    const json = {
      title: d.title,
      date,
      ...(cfg.time && cfg.time !== '00:00' ? { time: cfg.time } : {}),
      summary: d.summary,
      ...(d.category ? { category: d.category } : {}),
      image,
      imageAlt,
      ...(images.length ? { images } : {}),
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
