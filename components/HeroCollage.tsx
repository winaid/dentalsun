import Image from 'next/image';
import type { ReactNode } from 'react';
import { Breadcrumb, Sentences } from '@/components/ui';
import { figSize, figSrc, type Fig } from '@/lib/docs';

/**
 * 콜라주 첫 화면 — 레퍼런스(one-dental 'SMILE BY DESIGN')의 짜임새.
 *  · 화면을 가로지르는 큰 제목 두 줄(둘째 줄은 오른쪽으로 밀어 어긋나게).
 *  · 사진 카드 세 장을 흩뿌리고, 아래에 번호 항목 세 개를 높이를 달리해 놓는다.
 *  · 페이지가 열리면 글 → 카드 1·2·3 → 항목 1·2·3 순서로 하나씩 떠오른다(스크롤 없이, hero-in 지연).
 *  · 좁은 화면은 위에서 아래로 흐른다(글 → 카드 세 장 → 항목).
 *  ★ 유리 카드 줄은 절대 배치가 아니라 흐름(flex 끝)에 둔다 — 요약이 길어도 글과 겹치지 않는다.
 */
export interface CollageCard {
  fig: Fig;
  /** 4:5 세로 | 16:10 가로 | 4:3 */
  shape: 'portrait' | 'wide' | 'std';
}
export interface CollageItem {
  title: string;
  desc: string;
}

/*
 * 사진 묶음 — 오른쪽에 두 줄로 세운다. 자리·크기를 **사진의 원본 비율에서 계산**해 서로 겹치지 않게 한다.
 *
 * ★ 예전에는 슬롯마다 고정 폭·고정 위치라 세로로 긴 사진이 오면 아래 사진과 겹쳤다(오너 화면에서 확인).
 * ★ 계산 근거: 16:9 화면에서 폭 p(%) 인 사진의 높이는 178·p/비율 (svh). 이 값으로 아래 사진의 시작점을 민다.
 */
const svhHeight = (widthPct: number, ratio: number) => (178 * widthPct) / 100 / ratio;

/** 폭을 줄여서라도 높이를 maxH 안에 넣는다 — 세로 사진이 화면을 뚫지 않게 */
const fitWidth = (basePct: number, ratio: number, maxH: number) => Math.min(basePct, (maxH * ratio * 100) / 178);

export function HeroCollage({
  trail,
  eyebrow,
  lines,
  lead,
  bg,
  cards,
  items,
  children,
  long = false,
  bgSoft = false,
}: {
  trail: Array<{ name: string; path: string }>;
  eyebrow: string;
  lines: [ReactNode, ReactNode?];
  /** 제목이 길면(대략 14자 초과) 한 단계 작게 */
  long?: boolean;
  /** 배경 사진이 작은 원본 조각이면 살짝 흐리게(hero-soft) */
  bgSoft?: boolean;
  lead: string;
  bg: string;
  cards: [CollageCard, CollageCard, CollageCard];
  items: CollageItem[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate bg-night text-white" data-hero-full>
      <div className="relative min-h-[100svh] overflow-hidden">
        {/* 배경 — 사진은 오른쪽이 또렷, 글 자리는 남색 */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute inset-0 ${bgSoft ? 'hero-soft' : ''}`}>
            <Image src={figSrc(bg)} alt="" fill priority sizes="100vw" className="kenburns object-cover object-[60%_50%]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/80 to-night/40 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-night via-night/85 to-night/35 lg:block" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
        </div>

        <div className="wrap h-full">
        {/* 절대 배치 기준 — wrap 의 안쪽 여백을 무시하지 않도록 상자를 하나 더 둔다 */}
        <div className="relative flex min-h-[100svh] flex-col pt-[110px] pb-16 lg:pt-[13svh] lg:pb-[7svh]">
          {/* 글 — 큰 제목은 사진 카드 위로 지나간다 */}
          <div className="relative z-20 lg:flex-1">
            <Breadcrumb trail={trail} dark />
            <p className="eyebrow on-dark mt-6 hero-in">{eyebrow}</p>
            <h1 className={`display-xl mt-4 on-photo ${long ? 'is-long' : ''}`}>
              <span className="block hero-in hero-in-2">{lines[0]}</span>
              {lines[1] && <span className="block hero-in hero-in-3 lg:pl-[14vw]">{lines[1]}</span>}
            </h1>
            <p className="mt-6 max-w-[560px] text-[1.08rem] leading-[1.8] text-white/80 hero-in hero-in-4 md:text-[1.16rem] lg:max-w-[660px]">
              <Sentences text={lead} clauses={false} />
            </p>
            {children && <div className="mt-7 hero-in hero-in-4">{children}</div>}
          </div>

          {/* 사진 카드 — 넓은 화면에만(좁은 화면은 뺀다, 오너 지시). 원본 비율 그대로, 잘리지 않고 서로 겹치지 않는다. */}
          <div className="hidden lg:block">
            {(() => {
              /* 같은 사진이 두 번 들어오면 하나만 남긴다 — orig/X-hero 와 scene/X 는 같은 사진의 다른 조각이다.
                 ⚠️ -1 · -2 처럼 번호가 붙은 것은 서로 다른 사진이라 묶지 않는다 */
              const seen = new Set<string>();
              const uniq = cards.filter((c) => {
                const base = c.fig.key.replace(/^[a-z]+\//, '').replace(/-hero$/, '');
                if (seen.has(base)) return false;
                seen.add(base);
                return true;
              });
              /* 오른쪽 줄(위·아래) + 왼쪽 줄(가운데). 높이를 계산해 시작점을 밀어 둔다 */
              const right = uniq.slice(0, 2);
              const left = uniq[2];
              let top = 9;
              const placed = right.map((c, i) => {
                const sz = figSize(c.fig.key);
                const ratio = sz.w / sz.h;
                const w = fitWidth(20, ratio, 27);
                const spec = { c, ratio, w, top, right: 0, rot: i === 0 ? 3 : -3 };
                top += svhHeight(w, ratio) + 3.5;
                return spec;
              });
              if (left) {
                const sz = figSize(left.fig.key);
                const ratio = sz.w / sz.h;
                const w = fitWidth(17, ratio, 30);
                placed.push({ c: left, ratio, w, top: 20, right: Math.max(22, 22), rot: -4 });
              }
              return placed.map((p, i) => (
                <div
                  key={p.c.fig.key}
                  className="hero-in absolute overflow-hidden rounded-3xl bg-night-2 shadow-[var(--shadow-lift)]"
                  style={{
                    animationDelay: `${420 + i * 320}ms`,
                    aspectRatio: `${p.ratio}`,
                    top: `${p.top}svh`,
                    right: `${p.right}%`,
                    width: `${p.w}%`,
                    transform: `rotate(${p.rot}deg)`,
                  }}
                >
                  <Image src={figSrc(p.c.fig.key)} alt={p.c.fig.alt} fill sizes="28vw" className="object-contain" priority={i === 0} />
                </div>
              ));
            })()}
          </div>

          {/* 유리 카드 세 장 — 왼쪽은 왼쪽에서, 가운데는 아래에서, 오른쪽은 오른쪽에서 튀어오른다 */}
          <ol className="relative z-20 mt-10 grid gap-4 sm:grid-cols-3 lg:mt-8 lg:gap-5">
            {items.slice(0, 3).map((it, i) => (
              <li
                key={it.title}
                className={`hero-card ${['hero-card-l', 'hero-card-c', 'hero-card-r'][i]} rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-md shadow-[var(--shadow-lift)] lg:p-6`}
                style={{ animationDelay: `${1300 + i * 240}ms` }}
              >
                <span className="num-xl">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-3 text-[16.5px] font-bold leading-snug text-white">{it.title}</p>
                <p className="mt-2 text-[14px] leading-[1.7] text-white/70">{it.desc}</p>
              </li>
            ))}
          </ol>

          <div aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/60 lg:block">
            <span className="scroll-hint block text-[11px] tracking-[0.3em]">SCROLL</span>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
