'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CLINIC } from '@/lib/clinic';

/**
 * 퀵메뉴 — 기존 홈페이지 오른쪽 세로 퀵메뉴(네이버톡톡·진료시간·온라인예약·오시는길·대표전화)를
 * 레퍼런스 결(둥근 떠 있는 버튼)로 옮겼다. 데스크톱은 오른쪽 아래 세로, 모바일은 아래 띠.
 */
const ITEMS = [
  { label: '톡톡 상담', href: CLINIC.booking.naverTalk, external: true, icon: 'M4 5h16v11H9l-5 4V5z' },
  { label: '네이버 예약', href: CLINIC.booking.naver, external: true, icon: 'M5 4h14v16H5zM8 9h8M8 13h5' },
  { label: '진료시간', href: '/visit#hours', external: false, icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 2' },
  { label: '오시는 길', href: '/visit', external: false, icon: 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
];

export function QuickMenu() {
  const [top, setTop] = useState(false);
  /* 홈 첫 화면([data-hero-full])이 화면을 다 쓰는 동안은 숨긴다 — 떠 있는 정보 칩과 겹치지 않게. 다른 쪽은 처음부터 보인다. */
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero-full]');
    const on = () => {
      setTop(window.scrollY > 600);
      setShown(!hero || window.scrollY > hero.offsetHeight - 160);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      {/* 데스크톱 — 오른쪽 세로 */}
      <div className={`fixed right-5 bottom-6 z-40 hidden flex-col items-end gap-2.5 transition-all duration-500 md:flex ${shown ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'}`}>
        {top && (
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로" className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-[var(--shadow-soft)] hover:text-brand-700">
            ↑
          </button>
        )}
        <div className="card flex flex-col p-1.5">
          {ITEMS.map((it) => {
            const cls = 'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-ink hover:bg-brand-50 hover:text-brand-700';
            const icon = (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-brand-600"><path d={it.icon} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>
            );
            return it.external ? (
              <a key={it.label} href={it.href} target="_blank" rel="noopener" className={cls}>{icon}{it.label}</a>
            ) : (
              <Link key={it.label} href={it.href} className={cls}>{icon}{it.label}</Link>
            );
          })}
        </div>
        <a href={CLINIC.phoneHref} className="btn-sun !px-5 !py-3 text-[14px]">
          {CLINIC.phone}
        </a>
      </div>

      {/* 모바일 — 아래 띠 */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-hairline bg-white/95 backdrop-blur md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <a href={CLINIC.phoneHref} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold text-sun-600">
          <span className="text-[16px]">☎</span>전화
        </a>
        <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold text-ink">
          <span className="text-[16px]">N</span>예약
        </a>
        <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold text-ink">
          <span className="text-[16px]">💬</span>상담
        </a>
        <Link href="/visit" className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold text-ink">
          <span className="text-[16px]">📍</span>오시는 길
        </Link>
      </div>
    </>
  );
}
