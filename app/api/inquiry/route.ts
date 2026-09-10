import { NextResponse } from 'next/server';
import { CLINIC } from '@/lib/clinic';
import { formatPhone, validateInquiry, type InquiryBody } from '@/lib/inquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/inquiry — 간편 상담예약(팝업)에서 받은 연락처를 병원이 보는 곳으로 넘긴다.
 *
 * ★ 이 사이트에는 DB 가 없다. 받은 값을 서버에 쌓지 않고 **바로 전달만 한다** —
 *   환자 연락처를 저장소·깃허브에 남기지 않기 위해서다(PIPA: 최소 수집·보관 최소화).
 * ★ 보내는 곳은 환경변수 하나로 정한다:
 *     INQUIRY_WEBHOOK_URL   구글 앱스스크립트(시트+메일) · 슬랙 · 카카오워크 등 어떤 주소든 가능
 *     (슬랙 주소면 슬랙이 읽는 형식으로 바꿔 보낸다)
 *   설정 전에는 503 을 돌려주고, 화면은 전화·톡톡으로 안내한다 — 접수된 척하지 않는다.
 * ⚠️ 로그에 연락처를 남기지 않는다.
 */
const MINUTE = 60_000;
const PER_MINUTE = 3;
const PER_HOUR = 10;

type Hit = { at: number };
const hits = new Map<string, Hit[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((h) => now - h.at < 60 * MINUTE);
  const lastMinute = list.filter((h) => now - h.at < MINUTE).length;
  list.push({ at: now });
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return lastMinute >= PER_MINUTE || list.length > PER_HOUR;
}

const ipOf = (req: Request) => (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

export async function POST(req: Request) {
  let body: Partial<InquiryBody>;
  try {
    body = (await req.json()) as Partial<InquiryBody>;
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  // 봇이 채우는 빈 칸 — 조용히 성공으로 돌려보낸다
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

  const bad = validateInquiry(body);
  if (bad) return NextResponse.json({ error: bad.message, field: bad.field }, { status: 400 });

  if (tooMany(ipOf(req))) {
    return NextResponse.json({ error: '잠시 후 다시 시도해 주세요. 급하시면 전화 주시면 바로 도와드립니다.' }, { status: 429 });
  }

  const url = process.env.INQUIRY_WEBHOOK_URL;
  if (!url) {
    return NextResponse.json(
      { error: '지금은 온라인 접수가 준비 중입니다. 전화나 네이버 톡톡으로 연락 주세요.', fallback: true },
      { status: 503 },
    );
  }

  const at = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const name = (body.name ?? '').trim();
  const phone = formatPhone((body.phone ?? '').trim());
  const topic = (body.topic ?? '').trim();
  const page = (body.page ?? '').slice(0, 200);
  const line = `[${CLINIC.shortName} 상담예약] ${at}\n· 항목: ${topic}\n· 성함: ${name}\n· 연락처: ${phone}\n· 들어온 곳: ${page || '/'}`;
  const payload = url.includes('hooks.slack.com') ? { text: line } : { at, topic, name, phone, page, site: CLINIC.url, text: line };

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!r.ok) throw new Error(String(r.status));
  } catch {
    return NextResponse.json(
      { error: '접수 중 문제가 생겼습니다. 전화나 네이버 톡톡으로 연락 주세요.', fallback: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
