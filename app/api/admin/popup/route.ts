import { NextResponse } from 'next/server';
import { readFile as readLocal } from 'node:fs/promises';
import path from 'node:path';
import { isAuthed } from '@/lib/adminAuth';
import { tokenFrom, readFile, commitFiles } from '@/lib/github';
import { POPUPS_PATH, POPUP_IMG_DIR, parsePopups, serializePopups, type Popup } from '@/lib/popups';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * 홈 공지 팝업 관리 (lib/popups.ts 머리말 참고).
 *
 * GET                               목록 — 저장소가 진실이라 방금 저장한 것도 바로 보인다.
 * POST   { data, alt, start, end, link }   새 팝업(그림 data URL → webp, 그림+목록 커밋 하나)
 * PATCH  { id, alt?, start?, end?, link?, enabled? }   기간·설명·켜고 끄기
 * DELETE { id }                     팝업과 그림을 함께 지운다(커밋 하나)
 */
const noAuth = () => NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
const noToken = () => NextResponse.json({ error: 'GitHub 토큰이 없습니다. Vercel 환경변수 GITHUB_TOKEN 을 확인해 주세요.' }, { status: 428 });
const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const cleanLink = (v: unknown) => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  return /^(\/[^\s]*|https?:\/\/[^\s]+)$/.test(s) ? s : null;
};

async function current(token: string | null): Promise<Popup[]> {
  if (token) {
    try {
      return parsePopups((await readFile(token, POPUPS_PATH)).text);
    } catch {
      return [];
    }
  }
  return parsePopups(await readLocal(path.join(process.cwd(), POPUPS_PATH), 'utf8').catch(() => ''));
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  return NextResponse.json({ ok: true, popups: await current(token), hasToken: !!token });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const b64 = String(b.data || '').replace(/^data:image\/[a-z+]+;base64,/, '');
  const start = String(b.start || '');
  const end = String(b.end || '');
  const link = cleanLink(b.link);
  if (!b64) return bad('그림을 넣어 주세요.');
  if (b64.length > 3_000_000) return bad('그림이 너무 큽니다. JPG·PNG 로 다시 올려 주세요.');
  if (!DATE.test(start) || !DATE.test(end)) return bad('시작일과 종료일을 골라 주세요.');
  if (start > end) return bad('종료일이 시작일보다 빠릅니다.');
  if (link === null) return bad('연결 주소는 / 로 시작하거나 https:// 로 시작해야 합니다.');

  let webp: Buffer;
  let width = 0;
  let height = 0;
  try {
    const sharp = (await import('sharp')).default;
    // 팝업은 PC 에서 480px 로 보인다 → 두 배(960)면 고해상도 화면에서도 글자가 또렷하다.
    const out = await sharp(Buffer.from(b64, 'base64'))
      .rotate()
      .resize({ width: 960, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer({ resolveWithObject: true });
    webp = out.data;
    width = out.info.width;
    height = out.info.height;
  } catch (e) {
    return NextResponse.json({ error: `그림을 읽지 못했습니다. JPG·PNG·WebP 만 됩니다. (${String(e).slice(0, 120)})` }, { status: 415 });
  }

  const id = `${start}-${Date.now().toString(36).slice(-5)}`;
  const popup: Popup = {
    id,
    image: `/img/popup/${id}.webp`,
    width,
    height,
    alt: String(b.alt || '').trim().slice(0, 300) || '광화문 선치과 공지',
    start,
    end,
    ...(link ? { link } : {}),
    enabled: true,
  };
  try {
    const list = [...(await current(token)), popup];
    await commitFiles(
      token,
      [
        { path: `${POPUP_IMG_DIR}/${id}.webp`, content: webp },
        { path: POPUPS_PATH, content: serializePopups(list) },
      ],
      `팝업 추가 (${start} ~ ${end})`,
    );
    return NextResponse.json({ ok: true, popups: list });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}

export async function PATCH(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const list = await current(token);
  const i = list.findIndex((p) => p.id === b.id);
  if (i < 0) return bad('그 팝업을 찾지 못했습니다. 새로고침해 주세요.');
  const p = { ...list[i] };
  if (b.start !== undefined) p.start = String(b.start);
  if (b.end !== undefined) p.end = String(b.end);
  if (b.alt !== undefined) p.alt = String(b.alt).trim().slice(0, 300) || '광화문 선치과 공지';
  if (b.enabled !== undefined) p.enabled = !!b.enabled;
  if (b.link !== undefined) {
    const link = cleanLink(b.link);
    if (link === null) return bad('연결 주소는 / 로 시작하거나 https:// 로 시작해야 합니다.');
    if (link) p.link = link;
    else delete p.link;
  }
  if (!DATE.test(p.start) || !DATE.test(p.end)) return bad('날짜 형식이 맞지 않습니다.');
  if (p.start > p.end) return bad('종료일이 시작일보다 빠릅니다.');
  list[i] = p;
  try {
    await commitFiles(token, [{ path: POPUPS_PATH, content: serializePopups(list) }], `팝업 수정 (${p.start} ~ ${p.end}${p.enabled ? '' : ', 꺼짐'})`);
    return NextResponse.json({ ok: true, popups: list });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthed(req)) return noAuth();
  const token = tokenFrom(req);
  if (!token) return noToken();
  const b = (await req.json().catch(() => ({}))) as { id?: string };
  const list = await current(token);
  const gone = list.find((p) => p.id === b.id);
  if (!gone) return bad('그 팝업을 찾지 못했습니다. 새로고침해 주세요.');
  const rest = list.filter((p) => p.id !== b.id);
  const img = gone.image.startsWith('/img/popup/') ? [`public${gone.image}`] : [];
  try {
    await commitFiles(token, [{ path: POPUPS_PATH, content: serializePopups(rest) }], `팝업 삭제 (${gone.start} ~ ${gone.end})`, img);
    return NextResponse.json({ ok: true, popups: rest });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300) }, { status: 502 });
  }
}
