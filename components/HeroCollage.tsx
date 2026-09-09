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

/* 사진 묶음 — 오른쪽에 살짝 기울여 겹쳐 놓는다(레퍼런스처럼 흩뿌리지 않는다) */
/* ★ 사진은 자르지 않는다 — 칸의 비율을 사진의 원본 비율로 맞춘다(aspectRatio 인라인). 자리·너비만 슬롯이 정한다. */
const SHAPE = {
  portrait: 'lg:right-[27%] lg:top-[15svh] lg:w-[17%] lg:-rotate-[5deg]',
  wide: 'lg:right-0 lg:top-[10svh] lg:w-[26%] lg:rotate-[3deg]',
  std: 'lg:right-[9%] lg:top-[43svh] lg:w-[18%] lg:-rotate-[2deg]',
} as const;

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
            <p className="mt-6 max-w-[520px] text-[1.08rem] leading-[1.8] text-white/80 hero-in hero-in-4 md:text-[1.16rem]">
              <Sentences text={lead} clauses={false} />
            </p>
            {children && <div className="mt-7 hero-in hero-in-4">{children}</div>}
          </div>

          {/* 사진 카드 — 넓은 화면에만(좁은 화면은 뺀다, 오너 지시). 원본 비율 그대로, 잘리지 않는다. */}
          <div className="hidden lg:block">
            {cards.map((c, i) => {
              const sz = figSize(c.fig.key);
              const ratio = sz.w / sz.h;
              /* 가로 슬롯에 세로 사진이 오면 폭을 줄여 아래 사진과 겹치지 않게 */
              const narrow = c.shape === 'wide' && ratio < 1.3 ? 'lg:!w-[18%]' : '';
              return (
                <div
                  key={c.fig.key}
                  className={`relative overflow-hidden rounded-2xl bg-night-2 shadow-[var(--shadow-lift)] lg:absolute lg:rounded-3xl ${SHAPE[c.shape]} ${narrow} hero-in`}
                  style={{ animationDelay: `${420 + i * 320}ms`, aspectRatio: `${ratio}` }}
                >
                  <Image src={figSrc(c.fig.key)} alt={c.fig.alt} fill sizes="28vw" className="object-contain" priority={i === 0} />
                </div>
              );
            })}
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
