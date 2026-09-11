'use client';

import { useRef, type ReactNode } from 'react';

/**
 * 가로 캐러셀 — scroll-snap 띠 + 좌우 화살표. 레퍼런스의 "좌우로 드래그" 카드 줄.
 * 자바스크립트가 없어도 그냥 가로 스크롤 띠로 동작한다.
 */
export function Carousel({ children, label = '좌우로 드래그', itemClass = 'w-[280px] md:w-[320px]' }: { children: ReactNode[]; label?: string; itemClass?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? 320;
    el.scrollBy({ left: dir * (step + 20) * 2, behavior: 'smooth' });
  };
  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        {/* 라벨이 비면 자리만 — "좌우로 드래그" 같은 조작 안내 문구는 오너 지시로 쓰지 않는다 */}
        <p className="text-[12px] font-bold tracking-[0.16em] text-ink-muted uppercase">{label}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="이전" className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-white text-ink transition-colors hover:border-brand-300 hover:text-brand-700">←</button>
          <button type="button" onClick={() => go(1)} aria-label="다음" className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-white text-ink transition-colors hover:border-brand-300 hover:text-brand-700">→</button>
        </div>
      </div>
      <div ref={ref} className="hscroll reveal-stack">
        {children.map((c, i) => (
          <div key={i} className={itemClass}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
