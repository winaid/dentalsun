import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { listDir, readFile, deleteFile, fileSha, tokenFrom, repoInfo } from '@/lib/github';

export const runtime = 'nodejs';

/**
 * 관리자 글 API — 저장소의 content/blog/ 를 그대로 읽고 쓴다.
 *
 * GET            글 전체(예약 글 포함). 저장소가 진실이라 방금 발행한 글도 바로 보인다.
 * PUT  { post }  발행(새로 만들거나 덮어쓰기). 파일 이름 = {date}-{slug}.json
 * DELETE { file } 삭제.
 *
 * ⚠️ 세 요청 모두 세션 쿠키가 있어야 한다. 없으면 401.
 * ⚠️ 여기서 받은 HTML 은 lib/blog.ts 가 그릴 때 script·iframe·on* 을 걷어 낸다. 그래도 관리자만
 *    쓰는 화면이지 방문자 입력을 받는 자리가 아니다.
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
};

const DIR = 'content/blog';

const noAuth = () => NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
const noToken = () =>
  NextResponse.json(
    { error: 'GitHub 토큰이 없습니다. Vercel 환경변수 GITHUB_TOKEN 을 설정하거나 화면에서 토큰을 붙여 넣으세요.' },
    { status: 428 },
  );

export async function GET(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  try {
    const files = (await listDir(token, DIR)).filter((f) => f.name.endsWith('.json'));
    const posts = await Promise.all(
      files.map(async (f) => {
        const { text, sha } = await readFile(token, f.path);
        let j: Partial<PostIn> = {};
        try {
          j = JSON.parse(text);
        } catch {
          /* 깨진 파일도 목록에는 보이게 — 관리자가 고칠 수 있어야 한다. */
        }
        return {
          file: f.name,
          sha,
          slug: j.slug || f.name.replace(/\.json$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
          title: j.title || '(제목 없음)',
          date: j.date || f.name.slice(0, 10),
          time: j.time,
          updated: j.updated,
          summary: j.summary || '',
          category: j.category,
          image: j.image,
          imageAlt: j.imageAlt,
          html: j.html || '',
        };
      }),
    );
    const key = (p: { date: string; time?: string }) => `${p.date}T${p.time || '00:00'}`;
    posts.sort((a, b) => (key(a) < key(b) ? 1 : key(a) > key(b) ? -1 : 0));
    return NextResponse.json({ posts, repo: repoInfo().repo, branch: repoInfo().branch, hasServerToken: !!process.env.GITHUB_TOKEN, hasOpenAI: !!process.env.OPENAI_API_KEY, hasGemini: !!process.env.GEMINI_API_KEY });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}

/* 발행·수정은 /api/admin/publish (여러 파일 = 커밋 하나). 여기는 목록과 삭제만 남긴다. */

export async function DELETE(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  const { file } = (await req.json().catch(() => ({}))) as { file?: string };
  if (!file || !/^[\w.-]+\.json$/.test(file)) return NextResponse.json({ error: '파일 이름이 이상합니다.' }, { status: 400 });
  const path = `${DIR}/${file}`;
  try {
    const sha = await fileSha(token, path);
    if (!sha) return NextResponse.json({ error: '그 글이 저장소에 없습니다.' }, { status: 404 });
    await deleteFile(token, path, sha, `삭제(블로그): ${file}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
