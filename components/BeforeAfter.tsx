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
  /** 처음 이 구역에 닿았을 때 한 번만 좌우로 흔들어 '끌 수 있다'를 알린다(오너) */
  const [hintDone, setHintDone] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
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

  /* 화면에 들어오면 갈림선이 한 번 좌우로 지나간다 — 끌 수 있다는 걸 알아채게 */
  useEffect(() => {
    const el = stage.current;
    if (!el || hintDone) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHintDone(true);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const DUR = 1700;
        const step = (now: number) => {
          if (touched.current) {
            setHintDone(true);
            return;
          }
          const t = Math.min(1, (now - t0) / DUR);
          setPos(50 + Math.sin(t * Math.PI * 2) * 17);
          if (t < 1) raf = requestAnimationFrame(step);
          else {
            setPos(50);
            setHintDone(true);
          }
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [hintDone]);

  const pick = (g: number, c: number) => {
    setGi(g);
    setCi(c);
    setPos(50);
  };

  return (
    /* 사례 원본이 540px 라 1000px 로 늘리면 흐렸다(×1.85) — 800px 까지만 */
    <div className="mx-auto max-w-[800px]">
      {showTabs && groups.length > 1 && (
        <div className="mb-8 flex justify-center">
          {/* 폰에서는 2×2 격자(한 줄에 안 들어가 한 알약이 혼자 떨어지던 것) — 넓은 화면은 한 줄 알약 */}
          <div className="grid w-full grid-cols-2 gap-1 rounded-3xl border border-hairline bg-white p-1.5 shadow-[var(--shadow-soft)] sm:inline-flex sm:w-auto sm:flex-wrap sm:justify-center sm:rounded-full" role="tablist" aria-label="진료 갈래">
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
        className="relative aspect-[12/5] cursor-ew-resize touch-none select-none overflow-hidden rounded-[28px] bg-night shadow-[var(--shadow-lift)]"
        onPointerDown={(e) => {
          /* 손가락으로 사진을 끌 때는 화면이 따라 스크롤되지 않게 붙잡는다(오너) */
          e.currentTarget.setPointerCapture?.(e.pointerId);
          touched.current = true;
          setHintDone(true);
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
        {/* 손잡이 — 손가락으로 잡기 쉽게 크게(48×80), 둘레에 보이지 않는 여유 칸까지.
            touch-action:none 이라 손잡이를 끌면 화면이 스크롤되지 않는다 */}
        <button
          type="button"
          role="slider"
          aria-label="전후 비교 손잡이 — 좌우로 끌어 보세요"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            touched.current = true;
            setHintDone(true);
            setDragging(true);
          }}
          onKeyDown={(e) => {
            touched.current = true;
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(3, p - 3));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(97, p + 3));
          }}
          className="absolute top-1/2 flex h-20 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center rounded-full bg-sun-500 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-2 ring-white/70 before:absolute before:-inset-4 before:content-[''] focus-visible:outline-2 focus-visible:outline-white"
          style={{ left: `${pos}%` }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M10 6l-6 6 6 6M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 처음 한 번만 보이는 안내 — 손을 대면 사라진다 */}
        {!hintDone && (
          <span className="pointer-events-none absolute left-1/2 top-[calc(50%+62px)] -translate-x-1/2 rounded-full bg-night/70 px-3.5 py-1.5 text-[12.5px] font-bold text-white backdrop-blur">
            좌우로 끌어 보세요
          </span>
        )}

        {/* 아래 모서리의 큰 낱말 + 위 왼쪽의 사례 표시 */}
        <span className="pointer-events-none absolute bottom-4 left-5 text-[15px] font-extrabold tracking-[0.22em] text-white drop-shadow md:text-[18px]">BEFORE</span>
        <span className="pointer-events-none absolute bottom-4 right-5 text-[15px] font-extrabold tracking-[0.22em] text-sun-300 drop-shadow md:text-[18px]">AFTER</span>
        <span className="pointer-events-none absolute left-5 top-4 rounded-full bg-white/92 px-3.5 py-1.5 text-[12.5px] font-bold text-ink">
          {group.label} · CASE {String(ci + 1).padStart(2, '0')} / {String(group.pairs.length).padStart(2, '0')}
        </span>
      </div>

      {/* 사례 선택 — 무대 아래 한 줄, 가운데.
          w-max + mx-auto: 다 들어오면 가운데, 넘치면 왼쪽부터 밀어 본다(justify-center 로 넘치면 첫 장이 잘려 못 보던 사고) */}
      {group.pairs.length > 1 && (
        <ul className="mx-auto mt-5 flex w-max max-w-full gap-2.5 overflow-x-auto pb-1 sm:gap-3" aria-label="사례 목록">
          {group.pairs.map((p, k) => (
            <li key={p.after.key} className="shrink-0">
              <button
                type="button"
                onClick={() => pick(gi, k)}
                aria-pressed={k === ci}
                className={`group block w-[104px] overflow-hidden rounded-xl bg-white p-1.5 ring-2 transition-all sm:w-[150px] md:w-[180px] ${k === ci ? 'ring-sun-500 shadow-[var(--shadow-soft)]' : 'ring-hairline opacity-75 hover:opacity-100'}`}
              >
                <span className="relative block aspect-[12/5] overflow-hidden rounded-lg bg-canvas-2">
                  <Image src={figSrc(p.after.key)} alt={p.after.alt} fill sizes="180px" className="object-cover" />
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
