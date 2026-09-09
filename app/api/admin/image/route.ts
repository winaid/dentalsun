import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { generateImage } from '@/lib/adminImage';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST { prompt, name } → gpt-image-2 로 그림을 만들어 **webp 미리보기(data URL)** 로 돌려준다 (lib/adminImage.ts).
 *
 * ★ 여기서 커밋하지 않는다 (2026-09-08). 마케터가 '다시 만들기' 를 여러 번 누르는데, 그때마다 저장소에
 *   커밋하면 Vercel 이 매번 다시 빌드하고 안 쓰는 사진이 쌓인다. 사진 파일은 **발행할 때** /api/admin/publish 가
 *   글과 함께 커밋한다(imageData). 그래서 이 라우트는 GitHub 토큰이 필요 없다.
 * ⚠️ OpenAI 키는 서버 환경변수(OPENAI_API_KEY)가 우선, 없으면 헤더(x-openai-key).
 */
export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const key = process.env.OPENAI_API_KEY || req.headers.get('x-openai-key');
  if (!key) return NextResponse.json({ error: 'OpenAI 키가 없습니다. Vercel 환경변수 OPENAI_API_KEY 를 설정하거나 화면에서 붙여 넣으세요.' }, { status: 428 });

  const { prompt, name } = (await req.json().catch(() => ({}))) as { prompt?: string; name?: string };
  const safe = (name || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!prompt || !safe) return NextResponse.json({ error: '설명과 파일 이름이 필요합니다.' }, { status: 400 });

  try {
    const webp = await generateImage(key, prompt);
    return NextResponse.json({ ok: true, image: `/img/blog/${safe}.webp`, bytes: webp.length, preview: `data:image/webp;base64,${webp.toString('base64')}` });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
