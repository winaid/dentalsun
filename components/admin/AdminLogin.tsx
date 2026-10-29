'use client';

import { useState } from 'react';

/** 관리자 로그인 칸 — 첫 화면·팝업 화면이 같이 쓴다(블로그 화면은 자기 것을 그대로 둠). 쿠키는 세 화면이 공유한다. */
export function AdminLogin({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (!r.ok) { setErr('비밀번호가 맞지 않습니다.'); return; }
    setPw('');
    onDone();
  };
  return (
    <main className="mx-auto max-w-[420px] px-6 py-24">
      <p className="text-[13px] font-black tracking-[0.14em] text-sun-600">광화문 선치과 · 관리</p>
      <h1 className="display-sm mt-3 text-[28px] text-ink">로그인</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15.5px] text-ink outline-none focus:border-sun-500"
        />
        <button
          type="submit"
          disabled={busy || !pw}
          className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-[15px] font-bold text-white hover:opacity-90 disabled:opacity-40"
        >
          들어가기
        </button>
      </form>
      {err && <p className="mt-4 text-[14.5px] text-red-700">{err}</p>}
    </main>
  );
}
