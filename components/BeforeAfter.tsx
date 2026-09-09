'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { figSrc } from '@/lib/docs';
import type { CaseGroup } from '@/lib/cases';

/**
 * 치료 전후 비교 — 레퍼런스(one-dental)의 '실제 치료 전후사례' 와 같은 짜임새.
 *  · 가운데 손잡이를 끌면(마우스·터치·키보드) 전/후가 갈라져 보인다.
 *  · 오른쪽 CASE 목록에서 사례를 고르고, 위 알약 탭에서 진료 갈래를 고른다.
 *  · 사진은 옛 홈페이지의 실제 환자 사진만 쓴다. 고지문은 화면과 같은 배열(note)을 쓴다.
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
    <div>
      {showTabs && groups.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-hairline bg-white p-1 shadow-[var(--shadow-soft)]" role="tablist" aria-label="진료 갈래">
            {groups.map((g, k) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={k === gi}
                onClick={() => pick(k, 0)}
                className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-colors ${k === gi ? 'bg-brand-700 text-white shadow-[var(--shadow-btn)]' : 'text-ink-soft hover:text-brand-700'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <Link href={group.href} className="text-[14px] font-bold text-brand-700 hover:underline">
            {group.label} 자세히 보기 →
          </Link>
        </div>
      )}

      {/* ★ 원본 사진이 폭 590~820px 뿐이라 무대를 그 이상으로 키우지 않는다(늘리면 흐려진다). 원본 파일을 받으면 상한을 풀 것. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,630px)_170px]">
        {/* 무대 */}
        <div
          ref={stage}
          className="relative aspect-[12/5] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-3xl bg-night shadow-[var(--shadow-lift)]"
          onPointerDown={(e) => {
            setDragging(true);
            moveTo(e.clientX);
          }}
        >
          <Image key={pair.after.key} src={figSrc(pair.after.key)} alt={pair.after.alt} fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" priority={false} />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image key={pair.before.key} src={figSrc(pair.before.key)} alt={pair.before.alt} fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
          </div>

          {/* 갈림선 + 손잡이 */}
          <div className="pointer-events-none absolute inset-y-0 w-[2px] bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.45)]" style={{ left: `calc(${pos}% - 1px)` }} />
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
            className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-700 text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-sun-500"
            style={{ left: `${pos}%` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold tracking-[0.14em] text-ink">BEFORE</span>
          <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-extrabold tracking-[0.14em] text-white">AFTER</span>
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-night/60 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">
            {group.label} · CASE {String(ci + 1).padStart(2, '0')}
          </span>
        </div>

        {/* 사례 목록 */}
        <ul className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="사례 목록">
          {group.pairs.map((p, k) => (
            <li key={p.after.key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => pick(gi, k)}
                aria-pressed={k === ci}
                className={`group relative block aspect-[12/5] w-[150px] overflow-hidden rounded-xl bg-canvas-2 ring-2 transition-all lg:w-full ${k === ci ? 'ring-brand-600 shadow-[var(--shadow-soft)]' : 'ring-transparent opacity-80 hover:opacity-100'}`}
              >
                <Image src={figSrc(p.after.key)} alt="" fill sizes="180px" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent px-2.5 pb-1.5 pt-5 text-left text-[11px] font-bold tracking-[0.1em] text-white">CASE {String(k + 1).padStart(2, '0')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">※ {note}</p>
    </div>
  );
}
