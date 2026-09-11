'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 가로 캐러셀 — scroll-snap 띠 + 양옆 큰 화살표 + 아래 점 표시.
 *  · 자바스크립트가 없어도 그냥 가로 스크롤 띠로 동작한다.
 *  · 넘길 수 있다는 것이 한눈에 보이게(오너 2026-09-11 "넘기는 거 너무 티 안 나"):
 *    양옆 끝을 흐리게 깔아 더 있다는 신호, 줄 가운데 높이에 큰 둥근 화살표, 아래에 현재 위치 점.
 *    끝에 닿으면 그쪽 화살표와 흐림이 사라진다. 폰에서는 화살표 대신 손으로 밀고 점으로 위치를 본다.
 *  · 조작 안내 문구("좌우로 드래그")는 쓰지 않는다(오너 지시).
 */
export function Carousel({
  children,
  label = '',
  itemClass = 'w-[280px] md:w-[320px]',
  fade = 'from-white',
}: {
  children: ReactNode[];
  /** 왼쪽 위 작은 글(예: "8편"). 비우면 자리도 없다 */
  label?: string;
  itemClass?: string;
  /** 양옆 흐림 색 — 구역 배경과 맞춘다 (from-white | from-canvas) */
  fade?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ canPrev: false, canNext: true, idx: 0, perView: 1 });
  const n = children.length;

  const step = () => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 320;
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || '20') || 20;
    return first.getBoundingClientRect().width + gap;
  };
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const s = step();
    const max = el.scrollWidth - el.clientWidth;
    setPos({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < max - 4,
      idx: Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / s))),
      perView: Math.max(1, Math.floor((el.clientWidth + 20) / s)),
    });
  }, [n]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * step() * Math.max(1, pos.perView - 1 || 1), behavior: 'smooth' });
  const goTo = (i: number) => ref.current?.scrollTo({ left: i * step(), behavior: 'smooth' });
  const arrowCls =
    'absolute top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-[20px] text-ink shadow-[0_10px_30px_-10px_rgba(19,24,41,.45)] transition-all hover:border-brand-300 hover:text-brand-700 lg:flex disabled:pointer-events-none disabled:opacity-0';

  return (
    <div className="relative">
      {label && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[12px] font-bold tracking-[0.16em] text-ink-muted uppercase">{label}</p>
          <p className="text-[12.5px] font-semibold tabular-nums text-ink-muted" aria-live="polite">
            {pos.idx + 1}–{Math.min(n, pos.idx + pos.perView)} / {n}
          </p>
        </div>
      )}
      <div className="relative">
        <div ref={ref} className="hscroll reveal-stack scroll-smooth">
          {children.map((c, i) => (
            <div key={i} className={itemClass}>
              {c}
            </div>
          ))}
        </div>
        {/* 양옆 흐림 — 그쪽으로 더 있다는 신호. 끝에 닿으면 사라진다 */}
        <div aria-hidden className={`pointer-events-none absolute inset-y-0 -left-1 w-16 bg-gradient-to-r ${fade} to-transparent transition-opacity duration-300 ${pos.canPrev ? 'opacity-100' : 'opacity-0'}`} />
        <div aria-hidden className={`pointer-events-none absolute inset-y-0 -right-1 w-24 bg-gradient-to-l ${fade} to-transparent transition-opacity duration-300 ${pos.canNext ? 'opacity-100' : 'opacity-0'}`} />
        <button type="button" onClick={() => go(-1)} aria-label="이전" disabled={!pos.canPrev} className={`${arrowCls} -left-6`}>
          ←
        </button>
        <button type="button" onClick={() => go(1)} aria-label="다음" disabled={!pos.canNext} className={`${arrowCls} -right-6`}>
          →
        </button>
      </div>
      {/* 위치 점 — 현재 자리는 길고 주황 */}
      {n > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1.5" role="tablist" aria-label="위치">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === pos.idx}
              aria-label={`${i + 1}번째`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === pos.idx ? 'w-7 bg-sun-500' : 'w-1.5 bg-ink/15 hover:bg-ink/35'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
