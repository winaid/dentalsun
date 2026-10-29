'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { todayKst, type Popup } from '@/lib/popups';

/**
 * 팝업 관리 (2026-10-29 오너 "이미지만 넣으면 팝업 생길 수 있게, 사라지는 기간도 정할 수 있게").
 *
 * ★ 그림 하나 + 기간만 고르면 끝이다. 설명·연결 주소는 접어 둔 '더 정하기' 안에 있다.
 * ★ 저장 = 저장소 커밋 하나 → Vercel 재빌드 → 1~2분 뒤 홈에 뜬다(블로그 발행과 같은 길, lib/popups.ts).
 * ⚠️ 기간이 끝나면 방문자 화면에서 저절로 사라진다. 목록에서 지우는 것은 정리일 뿐이다.
 */
const inputCls = 'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15.5px] text-ink outline-none focus:border-sun-500';
const labelCls = 'text-[13px] font-black text-sun-700';
const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-bold transition-opacity disabled:opacity-40';
const btnDark = `${btn} bg-ink text-white hover:opacity-90`;
const btnLine = `${btn} border-[1.5px] border-ink/40 text-ink hover:bg-ink hover:text-white`;
const chip = 'rounded-full border border-hairline bg-white px-3 py-1 text-[13px] font-bold text-ink-soft hover:border-ink/40 hover:text-ink';

const addDays = (iso: string, n: number) => new Date(new Date(`${iso}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
const monthEnd = (iso: string, plus = 0) => {
  const [y, m] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m + plus, 0)).toISOString().slice(0, 10);
};
const koDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${y}. ${Number(m)}. ${Number(d)}.`;
};

/** 브라우저에서 먼저 줄인다 — 서버 본문 한도(4.5MB). 글자가 많은 공지 그림이라 화질은 높게. */
async function shrink(file: File): Promise<string> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) throw new Error('이 형식은 브라우저가 읽지 못합니다. JPG·PNG 로 올려 주세요.');
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.92);
}

function status(p: Popup, today: string) {
  if (!p.enabled) return { text: '꺼짐', cls: 'bg-canvas text-ink-muted' };
  if (today < p.start) return { text: '예정', cls: 'bg-amber-50 text-amber-800' };
  if (today > p.end) return { text: '끝남', cls: 'bg-canvas text-ink-muted' };
  return { text: '게시 중', cls: 'bg-green-50 text-green-800' };
}

export default function PopupAdmin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const today = todayKst();

  /* 새 팝업 칸 */
  const [data, setData] = useState<string | null>(null);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(monthEnd(today));
  const [alt, setAlt] = useState('');
  const [link, setLink] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  /* 목록에서 기간 고치는 중인 값 */
  const [edits, setEdits] = useState<Record<string, { start: string; end: string }>>({});

  const headers = useCallback(() => {
    const h: Record<string, string> = { 'content-type': 'application/json' };
    const t = typeof window !== 'undefined' ? localStorage.getItem('cd_gh_token') : '';
    if (t) h['x-github-token'] = t;
    return h;
  }, []);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/popup', { headers: headers(), cache: 'no-store' });
    if (r.status === 401) { setAuthed(false); return; }
    const j = await r.json().catch(() => ({}));
    setPopups(j.popups || []);
    setAuthed(true);
    if (j.hasToken === false) setMsg({ kind: 'err', text: 'GitHub 토큰이 없어 저장할 수 없습니다. Vercel 환경변수 GITHUB_TOKEN 을 확인해 주세요.' });
  }, [headers]);
  useEffect(() => { load(); }, [load]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      setData(await shrink(file));
      setMsg(null);
    } catch (e) {
      setMsg({ kind: 'err', text: String((e as Error).message) });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const send = async (method: 'POST' | 'PATCH' | 'DELETE', body: object, ok: string) => {
    setBusy(true);
    setMsg({ kind: 'info', text: '저장하는 중입니다…' });
    const r = await fetch('/api/admin/popup', { method, headers: headers(), body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: j.error || '저장하지 못했습니다.' }); return false; }
    setPopups(j.popups || []);
    setMsg({ kind: 'ok', text: ok });
    return true;
  };

  const add = async () => {
    if (!data) { setMsg({ kind: 'err', text: '그림을 먼저 넣어 주세요.' }); return; }
    if (start > end) { setMsg({ kind: 'err', text: '종료일이 시작일보다 빠릅니다.' }); return; }
    const done = await send('POST', { data, start, end, alt, link }, `올렸습니다. 1~2분 뒤 홈에 뜨고, ${koDate(end)} 이 지나면 저절로 사라집니다.`);
    if (done) { setData(null); setAlt(''); setLink(''); }
  };

  const saveDates = (p: Popup) => {
    const e = edits[p.id];
    if (!e) return;
    send('PATCH', { id: p.id, ...e }, `기간을 ${koDate(e.start)} ~ ${koDate(e.end)} 로 바꿨습니다. 1~2분 뒤 반영됩니다.`).then((ok) => {
      if (ok) setEdits(({ [p.id]: _, ...rest }) => rest);
    });
  };

  const toggle = (p: Popup) => send('PATCH', { id: p.id, enabled: !p.enabled }, p.enabled ? '껐습니다. 1~2분 뒤 홈에서 빠집니다.' : '켰습니다. 기간 안이면 1~2분 뒤 홈에 뜹니다.');

  const remove = (p: Popup) => {
    if (!confirm('이 팝업을 지울까요? 그림도 함께 지워집니다.')) return;
    send('DELETE', { id: p.id }, '지웠습니다. 1~2분 뒤 홈에서 빠집니다.');
  };

  if (authed === false) return <AdminLogin onDone={load} />;
  if (authed === null) return <main className="px-6 py-24 text-center text-ink-soft">불러오는 중…</main>;

  const sorted = [...popups].sort((a, b) => (a.end < b.end ? 1 : -1));

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-14">
      <a href="/admin" className="text-[14.5px] font-bold text-sun-700">← 관리 첫 화면</a>
      <p className="mt-6 text-[13px] font-black tracking-[0.14em] text-sun-600">광화문 선치과 · 팝업 관리</p>
      <h1 className="display-sm mt-3 text-[28px] text-ink">홈 첫 화면 팝업</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">그림을 넣고 기간만 고르면 됩니다. 기간이 끝나면 저절로 사라집니다.</p>

      {msg && (
        <p className={`mt-6 rounded-xl px-4 py-3 text-[14.5px] leading-[1.7] ${msg.kind === 'ok' ? 'bg-green-50 text-green-900' : msg.kind === 'err' ? 'bg-red-50 text-red-800' : 'bg-canvas text-ink'}`}>
          {msg.text}
        </p>
      )}

      {/* ── 새 팝업 ── */}
      <section className="mt-8 grid gap-8 rounded-2xl border-[1.5px] border-hairline bg-white p-6 md:grid-cols-[300px_1fr]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-dashed border-brand-200 bg-canvas text-[15px] text-ink-muted hover:border-ink/40"
        >
          {data ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-6 text-center leading-[1.7]">
              <b className="text-ink">그림 넣기</b>
              <br />
              눌러서 고르거나 여기로 끌어다 놓으세요
              <br />
              <span className="text-[13px]">JPG·PNG · 정사각형이 가장 보기 좋습니다</span>
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>보이기 시작하는 날</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={`${inputCls} mt-2`} />
            </label>
            <label className="block">
              <span className={labelCls}>사라지는 날 (이날까지 보임)</span>
              <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={`${inputCls} mt-2`} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip} onClick={() => setEnd(addDays(start, 6))}>1주</button>
            <button type="button" className={chip} onClick={() => setEnd(addDays(start, 13))}>2주</button>
            <button type="button" className={chip} onClick={() => setEnd(monthEnd(start))}>이번 달 말</button>
            <button type="button" className={chip} onClick={() => setEnd(monthEnd(start, 1))}>다음 달 말</button>
          </div>
          <details className="rounded-xl bg-canvas px-4 py-3">
            <summary className="cursor-pointer text-[14px] font-bold text-ink-soft">더 정하기 (선택)</summary>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className={labelCls}>그림 설명 · 화면 낭독기와 검색이 읽는 글</span>
                <input value={alt} onChange={(e) => setAlt(e.target.value)} className={`${inputCls} mt-2`} placeholder="예: 12월 진료일정 — 25일 성탄절 휴진" />
              </label>
              <label className="block">
                <span className={labelCls}>그림을 누르면 갈 주소</span>
                <input value={link} onChange={(e) => setLink(e.target.value)} className={`${inputCls} mt-2`} placeholder="예: /visit 또는 https://booking.naver.com/…" />
              </label>
            </div>
          </details>
          <button type="button" onClick={add} disabled={busy || !data} className={btnDark}>팝업 올리기</button>
        </div>
      </section>

      {/* ── 목록 ── */}
      <h2 className="mt-14 text-[18px] font-black text-ink">팝업 {popups.length}개</h2>
      {sorted.length === 0 && <p className="mt-4 text-[15px] text-ink-muted">아직 팝업이 없습니다.</p>}
      <ul className="mt-4 space-y-4">
        {sorted.map((p) => {
          const s = status(p, today);
          const e = edits[p.id] || { start: p.start, end: p.end };
          const dirty = !!edits[p.id] && (e.start !== p.start || e.end !== p.end);
          const setE = (k: 'start' | 'end', v: string) => setEdits((all) => ({ ...all, [p.id]: { ...e, [k]: v } }));
          return (
            <li key={p.id} className="grid gap-5 rounded-2xl border border-hairline bg-white p-5 sm:grid-cols-[140px_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="aspect-square w-full rounded-lg border border-hairline object-contain" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-black ${s.cls}`}>{s.text}</span>
                  <span className="text-[14.5px] text-ink">{koDate(p.start)} ~ {koDate(p.end)}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-[13px] text-ink-muted">{p.alt}{p.link ? ` · 누르면 ${p.link}` : ''}</p>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="block">
                    <span className={labelCls}>시작</span>
                    <input type="date" value={e.start} onChange={(ev) => setE('start', ev.target.value)} className={`${inputCls} mt-1 py-2`} />
                  </label>
                  <label className="block">
                    <span className={labelCls}>사라지는 날</span>
                    <input type="date" value={e.end} min={e.start} onChange={(ev) => setE('end', ev.target.value)} className={`${inputCls} mt-1 py-2`} />
                  </label>
                  {dirty && <button type="button" onClick={() => saveDates(p)} disabled={busy} className={btnDark}>기간 저장</button>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggle(p)} disabled={busy} className={btnLine}>{p.enabled ? '끄기' : '켜기'}</button>
                  <button type="button" onClick={() => remove(p)} disabled={busy} className={`${btn} text-red-700 hover:bg-red-50`}>지우기</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
