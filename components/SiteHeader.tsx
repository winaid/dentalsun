'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/nav';
import { CLINIC } from '@/lib/clinic';

/**
 * 머리말 — 화면 양끝까지 쓰는 한 줄(오너: "양끝까지 간격 넓혀도 돼").
 * 첫 화면 위에서는 투명(흰 글자), 스크롤하면 흰 바탕. 밝은 쪽은 처음부터 흰 바탕(dark=false).
 */
export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    setOpen(false);
    setPanel(null);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || !dark || open;
  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    return pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? 'bg-white/92 shadow-[0_1px_0_rgba(20,26,46,0.06)] backdrop-blur-md' : 'bg-transparent'}`}
      onMouseLeave={() => setPanel(null)}
    >
      <div className={`flex items-center gap-5 px-5 transition-[height] duration-300 sm:px-8 lg:px-10 ${scrolled ? 'h-[64px] md:h-[72px]' : 'h-[72px] md:h-[88px]'}`}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" aria-label={`${CLINIC.shortName} 홈`}>
          <Image src="/img/brand/mark.png" alt="" width={44} height={44} priority className="h-10 w-10 md:h-11 md:w-11" />
          <span className={`text-[1.2rem] font-extrabold tracking-[-0.02em] md:text-[1.4rem] lg:text-[1.25rem] 2xl:text-[1.4rem] ${solid ? 'text-brand-800' : 'text-white'}`}>광화문 선치과</span>
        </Link>

        <span className={`hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-semibold min-[1700px]:inline-flex ${solid ? 'border-hairline text-ink-soft' : 'border-white/25 text-white/85'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-sun-500" />
          광화문역 6번 출구 도보 2분
        </span>

        <nav className="mx-auto hidden lg:block" aria-label="주요 메뉴">
          <ul className="flex items-center gap-0 2xl:gap-1">
            {NAV.map((item, i) => (
              <li key={item.href} className="relative" onMouseEnter={() => setPanel(i)}>
                <Link
                  href={item.href}
                  className={`block whitespace-nowrap rounded-full px-1.5 py-2 text-[13px] font-bold transition-colors xl:px-2 xl:text-[14px] 2xl:px-3.5 2xl:text-[15px] ${solid ? 'text-ink hover:bg-brand-50 hover:text-brand-700' : 'text-white/90 hover:bg-white/15 hover:text-white'} ${isActive(item.href) ? (solid ? '!text-brand-700' : '!text-sun-300') : ''}`}
                  aria-haspopup={item.children ? 'true' : undefined}
                  aria-expanded={panel === i}
                >
                  {item.label}
                </Link>
                {item.children && panel === i && (
                  <div className="absolute left-1/2 top-full z-50 w-[300px] -translate-x-1/2 pt-3 hero-in">
                    <ul className="card p-2.5">
                      {item.children.map((c) =>
                        c.external ? (
                          <li key={c.href}>
                            <a href={c.href} target="_blank" rel="noopener" className="block rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-brand-50 hover:text-brand-700">
                              {c.label} <span className="text-ink-muted">↗</span>
                            </a>
                          </li>
                        ) : (
                          <li key={c.href}>
                            <Link href={c.href} className="block rounded-xl px-3.5 py-2.5 hover:bg-brand-50">
                              <span className="block text-[14.5px] font-semibold text-ink">{c.label}</span>
                              {c.desc && <span className="mt-0.5 block text-[12.5px] text-ink-muted">{c.desc}</span>}
                            </Link>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <a href={CLINIC.phoneHref} className={`hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[14px] font-extrabold xl:inline-flex ${solid ? 'border-hairline bg-white text-brand-800 hover:border-brand-300' : 'border-white/30 bg-white/10 text-white'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          {CLINIC.phone}
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          className={`ml-auto flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${solid ? 'text-ink' : 'text-white'}`}
        >
          <span className="relative block h-4 w-6">
            <span className={`absolute left-0 h-0.5 w-6 rounded bg-current transition-all ${open ? 'top-[7px] rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-6 rounded bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 h-0.5 w-6 rounded bg-current transition-all ${open ? 'top-[7px] -rotate-45' : 'top-[14px]'}`} />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          /* ★ 머리말의 backdrop-filter 가 fixed 의 기준을 머리말로 바꿔 'bottom-0' 이 높이 0 이 된다 → 높이를 직접 준다 */
          className="absolute inset-x-0 top-full h-[calc(100dvh-72px)] overflow-y-auto bg-white lg:hidden hero-in"
        >
          <div className="px-5 py-4 sm:px-8">
            {NAV.map((item) => (
              <details key={item.href} className="border-b border-hairline">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[1.05rem] font-bold text-ink">
                  {item.label}
                  <span className="text-ink-muted">+</span>
                </summary>
                <ul className="pb-3">
                  {!item.href.startsWith('http') && !item.href.includes('#') && (
                    <li>
                      <Link href={item.href} className="block px-2 py-2 text-[15px] font-semibold text-brand-700">{item.label} 전체 보기</Link>
                    </li>
                  )}
                  {item.children?.map((c) => (
                    <li key={c.href}>
                      {c.external ? (
                        <a href={c.href} target="_blank" rel="noopener" className="block px-2 py-2 text-[15px] text-ink-soft">{c.label} ↗</a>
                      ) : (
                        <Link href={c.href} className="block px-2 py-2 text-[15px] text-ink-soft">{c.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <a href={CLINIC.phoneHref} className="btn-sun">전화 {CLINIC.phone}</a>
              <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-brand">네이버 예약</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
