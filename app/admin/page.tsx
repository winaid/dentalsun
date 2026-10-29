'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { isLive, type Popup } from '@/lib/popups';

/**
 * 관리 첫 화면 — 블로그 / 팝업 두 갈래 (2026-10-29 오너 "admin 딱 들어가면 블로그 버튼이랑 팝업 버튼 나눠줘").
 * 블로그 관리는 /admin/blog, 팝업 관리는 /admin/popup.
 */
export default function AdminHome() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/popup', { cache: 'no-store' });
    if (r.status === 401) { setAuthed(false); return; }
    const j = await r.json().catch(() => ({}));
    setPopups(j.popups || []);
    setAuthed(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (authed === false) return <AdminLogin onDone={load} />;
  if (authed === null) return <main className="px-6 py-24 text-center text-ink-soft">불러오는 중…</main>;

  const live = popups.filter((p) => isLive(p)).length;
  const card = 'group flex flex-col justify-between rounded-2xl border-[1.5px] border-hairline bg-white p-8 transition-colors hover:border-ink/50';

  return (
    <main className="mx-auto max-w-[880px] px-6 py-20">
      <p className="text-[13px] font-black tracking-[0.14em] text-sun-600">광화문 선치과 · 관리</p>
      <h1 className="display-sm mt-3 text-[28px] text-ink">무엇을 관리할까요?</h1>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Link href="/admin/blog" className={card}>
          <div>
            <p className="text-[22px] font-black text-ink">블로그</p>
            <p className="mt-2 text-[15px] leading-[1.7] text-ink-soft">글 목록·예약 발행·자동 예약 발행·담당자 프롬프트</p>
          </div>
          <p className="mt-8 text-[15px] font-bold text-sun-700">블로그 관리 →</p>
        </Link>
        <Link href="/admin/popup" className={card}>
          <div>
            <p className="text-[22px] font-black text-ink">팝업</p>
            <p className="mt-2 text-[15px] leading-[1.7] text-ink-soft">홈 첫 화면에 뜨는 공지 그림과 보이는 기간</p>
          </div>
          <p className="mt-8 text-[15px] font-bold text-sun-700">
            팝업 관리 → <span className="ml-1 font-medium text-ink-muted">지금 {live}개 게시 중</span>
          </p>
        </Link>
      </div>
    </main>
  );
}
