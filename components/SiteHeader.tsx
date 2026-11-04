'use client';

import Link from '@/components/SiteLink';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/nav';
import { CLINIC, STATIONS } from '@/lib/clinic';

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
      <div className={`flex items-center gap-5 px-5 transition-[height] duration-300 sm:px-8 lg:px-10 ${scrolled ? 'h-[68px] md:h-[80px]' : 'h-[76px] md:h-[96px]'}`}>
        {/* 병원 로고 원본 그대로 — 마크만 잘라 쓰면 비율이 눌린다(오너 지적).
            어두운 첫 화면 위에서는 글자만 흰색으로 바꾼 판(logo-white)을 겹쳐 두고 서로 바꾼다. */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${CLINIC.shortName} 홈`}>
          <span className="relative block h-10 w-[144px] md:h-11 md:w-[158px]">
            <Image
              src="/img/brand/logo.png"
              alt={CLINIC.name}
              fill
              priority
              sizes="144px"
              className={`object-contain transition-opacity duration-300 ${solid ? 'opacity-100' : 'opacity-0'}`}
            />
            <Image
              src="/img/brand/logo-white.png"
              alt=""
              fill
              priority
              sizes="144px"
              className={`object-contain transition-opacity duration-300 ${solid ? 'opacity-0' : 'opacity-100'}`}
            />
          </span>
        </Link>

        {/* 2026-11-02 원장 PPT(261030) 10쪽 '광화문역 옆에 시청역 1,2호선 도보 5분도 추가'
            → 11-03 병원(김희동 본부장 카톡) '양옆으로, 동그라미 광화문역 1개·시청역 1개 해서 2개로' + 오너 '역 색깔에 맞춰서' — 역마다 알약 하나, 노선 번호는 공식 노선색 동그라미 */}
        <span className="hidden shrink-0 items-center gap-2 min-[1700px]:inline-flex">
          {STATIONS.map((s) => (
            <span key={s.station} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border py-[3px] pl-[4px] pr-3 text-[12px] font-semibold ${solid ? 'border-hairline bg-white text-ink-soft' : 'border-white/25 text-white/85'}`}>
              <span className="flex gap-[3px]">
                {s.lines.map((l) => (
                  <span key={l.n} className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10.5px] font-extrabold text-white" style={{ background: l.color }}>
                    {l.n}
                  </span>
                ))}
              </span>
              <span className={`font-bold ${solid ? 'text-ink' : 'text-white'}`}>{s.station}</span>
              {s.exit} 도보 {s.walk.replace('도보 ', '')}
            </span>
          ))}
        </span>

        <nav className="mx-auto hidden lg:block" aria-label="주요 메뉴">
          <ul className="flex items-center gap-0 2xl:gap-1">
            {NAV.map((item, i) => (
              <li key={item.href} className="relative" onMouseEnter={() => setPanel(i)}>
                <Link
                  href={item.href}
                  className={`block whitespace-nowrap rounded-full px-1.5 py-2 text-[14px] font-bold transition-colors xl:px-2 xl:text-[15px] 2xl:px-3.5 2xl:text-[16px] ${solid ? 'text-ink hover:bg-brand-50 hover:text-brand-700' : 'text-white/90 hover:bg-white/15 hover:text-white'} ${isActive(item.href) ? (solid ? '!text-brand-700' : '!text-sun-300') : ''}`}
                  aria-haspopup={item.children ? 'true' : undefined}
                  aria-expanded={panel === i}
                >
                  {item.label}
                </Link>
                {item.children && panel === i && (
                  <div className="absolute left-1/2 top-full z-50 w-[300px] -translate-x-1/2 pt-3 menu-in">
                    <ul className="card p-2.5">
                      {item.children.map((c) =>
                        c.external ? (
                          <li key={c.href}>
                            <a href={c.href} target="_blank" rel="noopener" className="block rounded-xl px-3.5 py-2.5 text-[15.5px] font-semibold text-ink hover:bg-brand-50 hover:text-brand-700">
                              {c.label} <span className="text-ink-muted">↗</span>
                            </a>
                          </li>
                        ) : (
                          <li key={c.href}>
                            <Link href={c.href} className="block rounded-xl px-3.5 py-2.5 hover:bg-brand-50">
                              <span className="block text-[15.5px] font-semibold text-ink">{c.label}</span>
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

        <a href={CLINIC.phoneHref} className={`hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[15px] font-extrabold xl:inline-flex ${solid ? 'border-hairline bg-white text-brand-800 hover:border-brand-300' : 'border-white/30 bg-white/10 text-white'}`}>
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
          className="absolute inset-x-0 top-full h-[calc(100dvh-76px)] overflow-y-auto bg-white lg:hidden hero-in"
        >
          <div className="px-5 py-4 sm:px-8">
            {NAV.map((item) => (
              <details key={item.href} className="border-b border-hairline">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[1.05rem] font-bold text-ink">
                  {item.label}
                  <span className="text-ink-muted">+</span>
                </summary>
                <ul className="pb-3">
                  {/* 2026-10-26 원장 PPT(261026) 2쪽 '모바일: 턱관절 전체보기, 턱관절 장애랑 같은 화면' — 하위에 같은 주소가 있으면 '전체 보기'를 빼 PC 메뉴와 같게 */}
                  {!item.href.startsWith('http') && !item.href.includes('#') && !item.children?.some((c) => c.href === item.href) && (
                    <li>
                      <Link href={item.href} className="block px-2 py-2 text-[16px] font-semibold text-brand-700">{item.label} 전체 보기</Link>
                    </li>
                  )}
                  {item.children?.map((c) => (
                    <li key={c.href}>
                      {c.external ? (
                        <a href={c.href} target="_blank" rel="noopener" className="block px-2 py-2 text-[16px] text-ink-soft">{c.label} ↗</a>
                      ) : (
                        <Link href={c.href} className="block px-2 py-2 text-[16px] text-ink-soft">{c.label}</Link>
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
