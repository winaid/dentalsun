'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { figSrc } from '@/lib/docs';
import type { CaseGroup } from '@/lib/cases';

/**
 * 치료 전후 비교 — 우리 방식(오너: 레퍼런스와 다르게, 가운데에 크게).
 *  · 무대를 가운데에 넓게(최대 1000px), 그 아래 사례 선택 줄, 위에는 진료 갈래 탭을 가운데 정렬.
 *  · 손잡이는 주황 알약(세로로 긴 막대 + 양쪽 화살표), BEFORE/AFTER 는 아래 모서리의 큰 낱말.
 *  · 마우스·터치로 끌고, 키보드 ←→ 로도 움직인다. 사진은 옛 홈페이지의 실제 환자 사진만 쓴다.
 * ★ 원본이 폭 590~820px 이라 1000px 까지 키우면 살짝 부드러워진다 — 오너가 크기를 우선했다. 원본 파일을 받으면 그대로 또렷해진다.
 */
export function BeforeAfter({ groups, note, showTabs = true }: { groups: CaseGroup[]; note: string; showTabs?: boolean }) {
  const [gi, setGi] = useState(0);
  const [ci, setCi] = useState(0);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const group = groups[Math.min(gi, groups.length - 1)];
  const pair = group.pairs[Math.min(ci, group.pairs.length - 1)];

  const moveTo = useCallback((clientX: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(97, Math.max(3, ((clientX - r.left) / r.width) * 100)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => moveTo(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, moveTo]);

  const pick = (g: number, c: number) => {
    setGi(g);
    setCi(c);
    setPos(50);
  };

  return (
    <div className="mx-auto max-w-[1000px]">
      {showTabs && groups.length > 1 && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-hairline bg-white p-1.5 shadow-[var(--shadow-soft)]" role="tablist" aria-label="진료 갈래">
            {groups.map((g, k) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={k === gi}
                onClick={() => pick(k, 0)}
                className={`rounded-full px-5 py-2.5 text-[15px] font-bold transition-colors ${k === gi ? 'bg-night text-white' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 무대 */}
      <div
        ref={stage}
        className="relative aspect-[12/5] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[28px] bg-night shadow-[var(--shadow-lift)]"
        onPointerDown={(e) => {
          setDragging(true);
          moveTo(e.clientX);
        }}
      >
        <Image key={pair.after.key} src={figSrc(pair.after.key)} alt={pair.after.alt} fill sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image key={pair.before.key} src={figSrc(pair.before.key)} alt={pair.before.alt} fill sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" />
        </div>

        {/* 갈림선 + 주황 알약 손잡이 */}
        <div className="pointer-events-none absolute inset-y-0 w-[3px] bg-sun-500 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" style={{ left: `calc(${pos}% - 1.5px)` }} />
        <button
          type="button"
          role="slider"
          aria-label="전후 비교 손잡이"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(3, p - 3));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(97, p + 3));
          }}
          className="absolute top-1/2 flex h-16 w-9 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full bg-sun-500 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-white"
          style={{ left: `${pos}%` }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M10 6l-6 6 6 6M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* 아래 모서리의 큰 낱말 + 위 왼쪽의 사례 표시 */}
        <span className="pointer-events-none absolute bottom-4 left-5 text-[15px] font-extrabold tracking-[0.22em] text-white drop-shadow md:text-[18px]">BEFORE</span>
        <span className="pointer-events-none absolute bottom-4 right-5 text-[15px] font-extrabold tracking-[0.22em] text-sun-300 drop-shadow md:text-[18px]">AFTER</span>
        <span className="pointer-events-none absolute left-5 top-4 rounded-full bg-white/92 px-3.5 py-1.5 text-[12.5px] font-bold text-ink">
          {group.label} · CASE {String(ci + 1).padStart(2, '0')} / {String(group.pairs.length).padStart(2, '0')}
        </span>
      </div>

      {/* 사례 선택 — 무대 아래 한 줄, 가운데 */}
      {group.pairs.length > 1 && (
        <ul className="mt-5 flex justify-center gap-3 overflow-x-auto pb-1" aria-label="사례 목록">
          {group.pairs.map((p, k) => (
            <li key={p.after.key} className="shrink-0">
              <button
                type="button"
                onClick={() => pick(gi, k)}
                aria-pressed={k === ci}
                className={`group block w-[150px] overflow-hidden rounded-xl bg-white p-1.5 ring-2 transition-all md:w-[180px] ${k === ci ? 'ring-sun-500 shadow-[var(--shadow-soft)]' : 'ring-hairline opacity-75 hover:opacity-100'}`}
              >
                <span className="relative block aspect-[12/5] overflow-hidden rounded-lg bg-canvas-2">
                  <Image src={figSrc(p.after.key)} alt="" fill sizes="180px" className="object-cover" />
                </span>
                <span className={`mt-1.5 block text-[12px] font-bold tracking-[0.1em] ${k === ci ? 'text-sun-600' : 'text-ink-muted'}`}>CASE {String(k + 1).padStart(2, '0')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mx-auto mt-6 max-w-[760px] text-center text-[13.5px] leading-relaxed text-ink-muted">※ {note}</p>
      {showTabs && (
        <p className="mt-4 text-center">
          <Link href={group.href} className="btn-ghost">{group.label} 자세히 보기</Link>
        </p>
      )}
    </div>
  );
}
