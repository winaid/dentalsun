import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { tokenFrom } from '@/lib/github';
import { readClinicPrompt, writeClinicPrompt, cleanPrompt, cleanImageCount, CLINIC_PROMPT_DEFAULT, PROMPT_MAX, IMAGE_COUNT_MAX } from '@/lib/clinicPrompt';

export const runtime = 'nodejs';

/**
 * 담당자 프롬프트 — GET 은 지금 값(저장 전이면 기본값), POST { writing, image, imageCount } 는 저장(커밋 하나).
 *
 * ★ 저장하면 **다음 글부터 바로** 적용된다. 글쓰기·사진 라우트가 요청마다 이 파일을 읽기 때문이다
 *   (빌드를 기다리는 content/central-hidden.json 과 다르다). 커밋 때문에 배포가 한 번 도는 것은 부수 효과다.
 * ⚠️ 빈 칸도 저장한다 — "마케터가 바꾸고 저장하면 그대로 반영" (2026-09-14 오너). 되돌리려면
 *    화면의 '기본값으로 되돌리기' 를 누른다(기본값 원문을 그대로 저장한다).
 * ★ imageCount(글 한 편의 사진 장수, 대표 포함 1~4) — 2026-11-03 오너 '사진 몇 장 만들지 드롭다운'.
 */
export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const token = tokenFrom(req);
  try {
    const p = await readClinicPrompt(token);
    return NextResponse.json({ ok: true, prompt: p, defaults: CLINIC_PROMPT_DEFAULT, max: PROMPT_MAX, imageCountMax: IMAGE_COUNT_MAX });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const token = tokenFrom(req);
  if (!token) return NextResponse.json({ error: 'GitHub 토큰이 없습니다.' }, { status: 428 });

  const body = (await req.json().catch(() => ({}))) as { writing?: string; image?: string; imageCount?: number };
  const writing = cleanPrompt(body.writing);
  const image = cleanPrompt(body.image);
  const imageCount = cleanImageCount(body.imageCount);
  const updatedAt = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
  try {
    await writeClinicPrompt(token, { writing, image, imageCount, updatedAt }, '담당자 프롬프트 수정 (글·사진 규칙)');
    return NextResponse.json({ ok: true, prompt: { writing, image, imageCount, updatedAt, saved: true } });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
