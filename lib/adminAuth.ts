import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * 관리자 로그인 — 비밀번호 하나, 쿠키 하나.
 *
 * ★ 비밀번호는 평문으로 저장하지 않는다. SHA-256 해시를 비교한다.
 *   기본값은 "sundental!" 의 해시다(2026-09-09, 광화문선치과). 환경변수로 바꾸는 것을 권한다.
 *   환경변수 BLOG_ADMIN_PASSWORD 가 있으면 그것이 이긴다 — 바꾸고 싶을 때 코드를 안 고쳐도 된다.
 * ⚠️ 이 화면의 진짜 권한은 비밀번호가 아니라 **GitHub 토큰**이다. 비밀번호는 화면을 여는 문이고,
 *    저장소에 글을 쓰는 힘은 토큰에서 나온다. 둘 다 있어야 발행이 된다.
 * ⚠️ 쿠키 값은 해시에서 파생한 값이라 비밀번호를 바꾸면 기존 세션이 전부 끊긴다 — 의도한 것이다.
 */
const DEFAULT_HASH = '6f22bb0c9cb3a71d215115768b18140618c1896623017a6e18c378a3e5eecd89';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

function passwordHash(): string {
  const env = process.env.BLOG_ADMIN_PASSWORD;
  return env ? sha(env) : DEFAULT_HASH;
}

export function checkPassword(input: string): boolean {
  const a = Buffer.from(sha(input));
  const b = Buffer.from(passwordHash());
  return a.length === b.length && timingSafeEqual(a, b);
}

export const COOKIE = 'sd_admin';

/** 세션 토큰 — 비밀번호 해시에서 한 번 더 파생. 쿠키에 비밀번호 해시 자체를 넣지 않는다. */
export function sessionToken(): string {
  return sha('session:' + passwordHash());
}

export function isAuthed(req: Request): boolean {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
  if (!m) return false;
  const a = Buffer.from(m[1]);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && timingSafeEqual(a, b);
}
