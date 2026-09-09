import { NextResponse } from 'next/server';
import { checkPassword, sessionToken, COOKIE } from '@/lib/adminAuth';

export const runtime = 'nodejs';

/**
 * POST { password } → 맞으면 세션 쿠키. 틀리면 401 (짧게 기다리게 해서 무작위 대입을 늦춘다).
 * DELETE → 로그아웃.
 */
export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, error: '비밀번호가 맞지 않습니다.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
