import Image from 'next/image';
import type { ReactNode } from 'react';
import { Breadcrumb, Sentences } from '@/components/ui';
import { figSrc, type Fig } from '@/lib/docs';

/**
 * 콜라주 첫 화면 — 레퍼런스(one-dental 'SMILE BY DESIGN')의 짜임새.
 *  · 화면을 가로지르는 큰 제목 두 줄(둘째 줄은 오른쪽으로 밀어 어긋나게).
 *  · 사진 카드 세 장을 흩뿌리고, 아래에 번호 항목 세 개를 높이를 달리해 놓는다.
 *  · 구역을 180svh 로 길게 잡고 안쪽 무대를 고정(sticky). 스크롤하면 카드·항목이 [data-seq] 순서로 하나씩 떠오른다.
 *    첫 카드는 처음부터 보이고, 나머지 둘 + 항목 셋이 차례로 켜진다(RevealScript 의 data-seq).
 *  · 좁은 화면은 고정 없이 위에서 아래로 흐른다(글 → 카드 세 장 → 항목).
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

const SHAPE = {
  portrait: 'aspect-[4/5] lg:left-[44%] lg:top-[12svh] lg:w-[19%]',
  wide: 'aspect-[16/10] lg:right-0 lg:top-[11svh] lg:w-[27%]',
  std: 'aspect-[4/3] lg:right-[5%] lg:bottom-[9svh] lg:w-[20%]',
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
}: {
  trail: Array<{ name: string; path: string }>;
  eyebrow: string;
  lines: [ReactNode, ReactNode];
  lead: string;
  bg: string;
  cards: [CollageCard, CollageCard, CollageCard];
  items: CollageItem[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate bg-night text-white lg:h-[180svh]" data-seq data-hero-full>
      <div className="relative min-h-[100svh] overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
        {/* 배경 — 사진은 오른쪽이 또렷, 글 자리는 남색 */}
        <div className="absolute inset-0 -z-10">
          <Image src={figSrc(bg)} alt="" fill priority sizes="100vw" className="kenburns object-cover object-[60%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/80 to-night/40 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-night via-night/85 to-night/35 lg:block" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
        </div>

        <div className="wrap h-full">
        {/* 절대 배치 기준 — wrap 의 안쪽 여백을 무시하지 않도록 상자를 하나 더 둔다 */}
        <div className="relative flex min-h-[100svh] flex-col pt-[110px] pb-16 lg:block lg:h-full lg:pt-0 lg:pb-0">
          {/* 글 — 큰 제목은 사진 카드 위로 지나간다 */}
          <div className="relative z-20 lg:absolute lg:left-0 lg:top-[14svh] lg:w-full">
            <Breadcrumb trail={trail} dark />
            <p className="eyebrow on-dark mt-6 hero-in">{eyebrow}</p>
            <h1 className="display-xl mt-4 on-photo">
              <span className="block hero-in hero-in-2">{lines[0]}</span>
              <span className="block hero-in hero-in-3 lg:pl-[14vw]">{lines[1]}</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[1rem] leading-[1.8] text-white/80 hero-in hero-in-4 md:text-[1.08rem]">
              <Sentences text={lead} />
            </p>
            {children && <div className="mt-7 hero-in hero-in-4">{children}</div>}
          </div>

          {/* 사진 카드 — 넓은 화면은 흩뿌리고, 좁은 화면은 한 줄 */}
          <div className="relative z-10 mt-10 grid grid-cols-3 gap-3 lg:static lg:mt-0 lg:block">
            {cards.map((c, i) => (
              <div
                key={c.fig.key}
                className={`relative overflow-hidden rounded-2xl bg-night-2 shadow-[var(--shadow-lift)] lg:absolute lg:rounded-3xl ${SHAPE[c.shape]} ${i === 0 ? 'hero-in hero-in-3' : ''}`}
                {...(i === 0 ? {} : { 'data-seq-item': '' })}
              >
                <Image src={figSrc(c.fig.key)} alt={c.fig.alt} fill sizes="(max-width: 1024px) 33vw, 28vw" className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>

          {/* 번호 항목 — 높이를 달리해 흩어 놓는다 */}
          <ol className="relative z-20 mt-10 grid gap-6 sm:grid-cols-3 lg:absolute lg:bottom-[9svh] lg:left-0 lg:mt-0 lg:w-[60%] lg:gap-8">
            {items.slice(0, 3).map((it, i) => (
              <li key={it.title} className={i === 1 ? 'lg:translate-y-7' : i === 2 ? 'lg:-translate-y-3' : ''} data-seq-item>
                <span className="text-[11px] tracking-[0.2em] text-sun-300">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 flex items-start gap-2 text-[15px] font-bold leading-snug text-white">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                  {it.title}
                </p>
                <p className="mt-2 max-w-[300px] text-[13px] leading-[1.7] text-white/70">{it.desc}</p>
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
