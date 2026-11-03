import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { generateImage, composeImagePrompt } from '@/lib/adminImage';
import { tokenFrom } from '@/lib/github';
import { readClinicPrompt } from '@/lib/clinicPrompt';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST { prompt, name } → gpt-image-2 로 그림을 만들어 **webp 미리보기(data URL)** 로 돌려준다 (lib/adminImage.ts).
 *
 * ★ 두 단계다 (2026-09-14): 병원의 사진 규칙(담당자 프롬프트)을 저장소에서 읽어, Gemini 가 장면과 합쳐
 *   영어 프롬프트 한 단락으로 옮긴 뒤 gpt-image-2 에 보낸다. 규칙 칸이 비어 있으면 Gemini 를 건너뛴다.
 * ★ 규칙을 못 반영했으면 ruleApplied:false 로 알린다 — 화면이 "규칙은 못 반영했습니다" 라고 말할 수 있게.
 *   조용히 예전 결로 돌아가면 마케터는 칸이 안 먹는다고 느낀다.
 * ★ 여기서 커밋하지 않는다 (2026-09-08). 마케터가 '다시 만들기' 를 여러 번 누르는데, 그때마다 저장소에
 *   커밋하면 Vercel 이 매번 다시 빌드하고 안 쓰는 사진이 쌓인다. 사진 파일은 **발행할 때** /api/admin/publish 가
 *   글과 함께 커밋한다(imageData).
 * ⚠️ 키는 서버 환경변수(OPENAI_API_KEY · GEMINI_API_KEY)가 우선, 없으면 헤더(x-openai-key · x-gemini-key).
 */
export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const key = process.env.OPENAI_API_KEY || req.headers.get('x-openai-key');
  if (!key) return NextResponse.json({ error: 'OpenAI 키가 없습니다. Vercel 환경변수 OPENAI_API_KEY 를 설정하거나 화면에서 붙여 넣으세요.' }, { status: 428 });

  const { prompt, name } = (await req.json().catch(() => ({}))) as { prompt?: string; name?: string };
  const safe = (name || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!prompt || !safe) return NextResponse.json({ error: '설명과 파일 이름이 필요합니다.' }, { status: 400 });

  try {
    const clinic = await readClinicPrompt(tokenFrom(req));
    const gemini = process.env.GEMINI_API_KEY || req.headers.get('x-gemini-key');
    const composed = await composeImagePrompt(gemini, prompt, clinic.image);
    const webp = await generateImage(key, composed.prompt);
    return NextResponse.json({
      ok: true,
      image: `/img/blog/${safe}.webp`,
      bytes: webp.length,
      preview: `data:image/webp;base64,${webp.toString('base64')}`,
      ruleApplied: composed.applied,
      hasRule: !!clinic.image.trim(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
