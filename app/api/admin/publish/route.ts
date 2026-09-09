import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { commitFiles, tokenFrom } from '@/lib/github';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST { posts: [...] } → 글 여러 편(과 각자의 새 사진)을 **커밋 하나**로 저장소에 올린다.
 *
 * ★ 왜 한 커밋인가 — Vercel 은 커밋마다 빌드한다. '자동 10편' 을 파일마다 커밋하면 빌드 20번이 줄을 선다.
 *   Git Data API(blob → tree → commit → ref) 로 묶으면 빌드 한 번이다. 한 편 발행도 같은 길을 쓴다(글+사진 = 커밋 하나).
 * ★ 파일 이름이 곧 주소다. 이미 있는 글(post.file)은 **그 이름 그대로** 덮어쓴다 — 날짜를 바꿨다고 새 파일을 만들면 옛 주소가 404.
 * ⚠️ 사진 경로는 /img/blog/{이름}.webp 형식만. imageData 가 있으면 그 경로로 함께 커밋한다.
 * ⚠️ 검증은 편마다 하고, 하나라도 틀리면 **아무것도 커밋하지 않는다** — 절반만 올라간 상태를 만들지 않기 위해.
 */
type PostIn = {
  file?: string;
  slug: string;
  title: string;
  date: string;
  time?: string;
  updated?: string;
  summary: string;
  category?: string;
  image?: string;
  imageAlt?: string;
  html: string;
  imageData?: string;
};

const DIR = 'content/blog';

function validate(post: PostIn, i: number): { error?: string; slug: string } {
  const slug = (post.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const at = `${i + 1}번째 글`;
  if (!slug) return { error: `${at}: 주소(slug)는 영문 소문자·숫자·하이픈만 됩니다.`, slug };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) return { error: `${at}: 날짜는 YYYY-MM-DD 로 적어 주세요.`, slug };
  if (post.time && !/^\d{2}:\d{2}$/.test(post.time)) return { error: `${at}: 시각은 HH:mm 로 적어 주세요.`, slug };
  for (const k of ['title', 'summary', 'html'] as const) {
    if (!post[k] || !String(post[k]).trim()) return { error: `${at}: ${k} 가 비어 있습니다.`, slug };
  }
  if (post.image && !/^\/img\/blog\/[a-z0-9-]+\.webp$/.test(post.image)) return { error: `${at}: 사진 경로 형식이 이상합니다.`, slug };
  if (post.file && !/^[\w.-]+\.json$/.test(post.file)) return { error: `${at}: 파일 이름이 이상합니다.`, slug };
  if (post.imageData && post.imageData.length > 3_000_000) return { error: `${at}: 사진이 너무 큽니다.`, slug };
  return { slug };
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const token = tokenFrom(req);
  if (!token) return NextResponse.json({ error: 'GitHub 토큰이 없습니다. Vercel 환경변수 GITHUB_TOKEN 을 설정하거나 화면에서 붙여 넣으세요.' }, { status: 428 });

  const body = (await req.json().catch(() => ({}))) as { posts?: PostIn[] };
  const posts = Array.isArray(body.posts) ? body.posts : [];
  if (!posts.length || posts.length > 30) return NextResponse.json({ error: '글이 없거나 너무 많습니다(최대 30편).' }, { status: 400 });

  const files: Array<{ path: string; content: Buffer | string }> = [];
  const out: Array<{ file: string; slug: string }> = [];
  const seenFiles = new Set<string>();
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const v = validate(p, i);
    if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });
    const file = p.file || `${p.date}-${v.slug}.json`;
    if (seenFiles.has(file)) return NextResponse.json({ error: `${i + 1}번째 글: 같은 날짜·주소의 글이 두 번 들어 있습니다.` }, { status: 400 });
    seenFiles.add(file);
    const json = {
      title: p.title.trim(),
      date: p.date,
      ...(p.time && p.time !== '00:00' ? { time: p.time } : {}),
      ...(p.updated ? { updated: p.updated } : {}),
      summary: p.summary.trim(),
      ...(p.category ? { category: p.category.trim() } : {}),
      ...(p.image ? { image: p.image, imageAlt: p.imageAlt || '' } : {}),
      slug: v.slug,
      html: p.html,
    };
    files.push({ path: `${DIR}/${file}`, content: JSON.stringify(json, null, 2) + '\n' });
    if (p.image && p.imageData) {
      files.push({ path: `public${p.image}`, content: Buffer.from(p.imageData.replace(/^data:image\/webp;base64,/, ''), 'base64') });
    }
    out.push({ file, slug: v.slug });
  }

  const message =
    posts.length === 1
      ? `${posts[0].file ? '수정' : '발행'}(블로그): ${posts[0].title.trim()}`
      : `발행(블로그) ${posts.length}편 예약: ${posts.map((p) => p.date).sort()[0]} ~ ${posts.map((p) => p.date).sort().at(-1)}`;

  try {
    const sha = await commitFiles(token, files, message);
    return NextResponse.json({ ok: true, posts: out, commit: sha });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
