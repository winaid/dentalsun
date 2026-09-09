import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST { name, data } → 관리자가 고른 사진을 webp 로 바꿔 **미리보기(data URL)** 로 돌려준다.
 * 커밋은 발행 때 posts PUT 이 한다(imageData) — 이유는 image/route.ts 머리 주석과 같다.
 * (2026-09-08 오너: "사진을 AI 이미지 말고 직접 넣고 싶을 수도 있으니 … 에러 없이 잘 들어가도록")
 *
 * ★ data 는 브라우저가 **먼저 줄인** JPEG 의 base64 다 (app/admin/page.tsx shrink()).
 *   휴대폰 원본(3~8MB)을 그대로 보내면 Vercel 함수 본문 한도(4.5MB)에 걸려 "에러 없이" 가 깨진다.
 *   그래서 줄이는 일은 브라우저가, 형식 맞추는 일(회전·webp)은 여기서 한다.
 * ⚠️ sharp 의 rotate() 는 EXIF 방향을 픽셀에 굳힌다 — 안 하면 세로로 찍은 사진이 누워서 나온다.
 * ⚠️ 폭 1536 상한은 AI 사진(1536×1024)과 같은 규격. 더 크게 올릴 이유가 없다(목록 카드 420px, 상세 900px).
 */
export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  const { name, data } = (await req.json().catch(() => ({}))) as { name?: string; data?: string };
  const safe = (name || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const b64 = (data || '').replace(/^data:image\/[a-z+]+;base64,/, '');
  if (!safe || !b64) return NextResponse.json({ error: '사진과 파일 이름이 필요합니다.' }, { status: 400 });
  if (b64.length > 3_000_000) return NextResponse.json({ error: '사진이 너무 큽니다. 브라우저가 줄이지 못한 형식일 수 있습니다 — JPG 나 PNG 로 다시 올려 주세요.' }, { status: 413 });

  try {
    const sharp = (await import('sharp')).default;
    const webp = await sharp(Buffer.from(b64, 'base64'))
      .rotate()
      .resize({ width: 1536, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return NextResponse.json({ ok: true, image: `/img/blog/${safe}.webp`, bytes: webp.length, preview: `data:image/webp;base64,${webp.toString('base64')}` });
  } catch (e) {
    return NextResponse.json({ error: `사진을 읽지 못했습니다. JPG·PNG·WebP 만 됩니다. (${String(e).slice(0, 120)})` }, { status: 415 });
  }
}
