import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { figSize, figSrc, fitsBox, type Fig, type QA } from '@/lib/docs';
import { CLINIC, MEDICAL_DISCLAIMER } from '@/lib/clinic';

/**
 * 문장·마디·쉼 줄바꿈 (오너 규칙, 2026-09-09)
 *  1) 마침표에서 줄을 바꾼다(.sent = block).
 *  2) 문장 안에서는 쉼표 마디(.clause)가 통째로 내려간다.
 *  3) 쉼표가 없는 긴 마디는 **말하다 쉬는 구간**(조사·연결어미 뒤)에서만 끊기도록 쉼 덩어리(.chunk)로 묶는다.
 *     덩어리 사이에서만 줄이 바뀌고, .sent 의 text-wrap: balance 가 줄 길이를 고르게 맞춘다.
 *     → "…치료 방법을 제시해 / 드리고 있습니다." 같은 꼬리 고아 줄이 안 생긴다.
 * ★ split 은 경계에서만 자르므로 글자를 잃지 않는다. 좁은 화면에서는 덩어리를 풀어(inline) 자연스럽게 흐르게 둔다(globals.css).
 */
/** 말하다 쉬는 자리 — 조사·연결어미로 끝나는 낱말 뒤 */
const PAUSE_END = /(은|는|이|가|을|를|에|에서|으로|로|과|와|도|의|고|며|면|서|까지|부터|처럼|보다|에게|한테|마다|조차|이나|나|든|라서|해서|하면|해도|지만|는데|은데|더라도|으며|이며|하고|이고|라면|이라|다가|자마자)$/;
/** 앞말과 한 덩어리로 읽히는 낱말 — 이 앞에서는 끊지 않는다("오차로 | 인해" 방지) */
const NO_BREAK_BEFORE = /^(인해|인한|통해|통한|위해|위한|위해서|의해|의한|대해|대한|대해서|따라|따른|따라서|비해|비하면|걸쳐|관해|관한|함께|같이|더불어|이상|이하|이내|정도|만큼|때문|때문에|덕분|덕분에|이후|이전|동안|사이|뒤|후|전|중|안|밖|없이|없는|없어|있는|있어|있을|있습니다|없습니다|것|수|줄|지|등|및|또는|혹은|그리고|그래서|하지만|다른|같은|위|아래|옆)$/;
/** 한 덩어리는 이 길이를 넘긴 뒤 처음 만나는 쉼 자리에서 닫는다 */
const CHUNK_MIN = 13;
/** 마지막 덩어리가 이보다 짧으면 앞 덩어리에 붙인다(꼬리 고아 방지) */
const TAIL_MIN = 7;
/** 이 길이 이하의 마디는 덩어리로 나누지 않는다 */
const NO_SPLIT_MAX = 22;

export function pauseChunks(clause: string): string[] {
  if (clause.length <= NO_SPLIT_MAX) return [clause];
  const words = clause.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let cur: string[] = [];
  let len = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1];
    cur.push(w);
    len += w.length + 1;
    const bare = w.replace(/[,.!?…)”’"']+$/, '');
    if (len >= CHUNK_MIN && next && PAUSE_END.test(bare) && !NO_BREAK_BEFORE.test(next.replace(/[,.!?…)”’"']+$/, ''))) {
      chunks.push(cur.join(' '));
      cur = [];
      len = 0;
    }
  }
  if (cur.length) chunks.push(cur.join(' '));
  if (chunks.length >= 2 && chunks[chunks.length - 1].length < TAIL_MIN) {
    const tail = chunks.pop()!;
    chunks[chunks.length - 1] += ' ' + tail;
  }
  return chunks;
}

function Clause({ text }: { text: string }) {
  const parts = pauseChunks(text);
  if (parts.length === 1) return <span className="clause">{text}</span>;
  return (
    <span className="clause clause-open">
      {parts.map((c, i) => (
        <Fragment key={i}><span className="chunk">{c}</span>{i < parts.length - 1 ? ' ' : ''}</Fragment>
      ))}
    </span>
  );
}

export function Sentences({ text, className = '', clauses: useClauses = true }: { text: string; className?: string; /** 좁은 카드에서는 쉼표 마디를 풀어 자연스럽게 흐르게 한다 */ clauses?: boolean }) {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const clauses = (s: string) => (useClauses ? s.split(/(?<=,)\s+(?=\S)/).filter(Boolean) : [s]);
  if (sentences.length <= 1) {
    return (
      <span className={`sent-one ${className}`}>
        {clauses(text).map((c, i) => (
          <Fragment key={i}><Clause text={c} />{' '}</Fragment>
        ))}
      </span>
    );
  }
  return (
    <span className={className}>
      {sentences.map((s, i) => (
        <span key={i} className="sent">
          {clauses(s).map((c, j) => (
            <Fragment key={j}><Clause text={c} />{' '}</Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}

/** 구역 머리 — 윗줄 라벨 + 제목 + 설명. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  dark = false,
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={`reveal max-w-[820px] ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${dark ? 'on-dark' : ''} ${align === 'center' ? 'justify-center' : ''}`}>{eyebrow}</p>}
      <Tag className={`display-sm mt-4 ${dark ? '!text-white' : ''}`}>{title}</Tag>
      {lead && (
        <p className={`lead mt-4 ${dark ? '!text-white/75' : ''}`}>
          <Sentences text={lead} />
        </p>
      )}
    </div>
  );
}

export function Breadcrumb({ trail, dark = false }: { trail: Array<{ name: string; path: string }>; dark?: boolean }) {
  return (
    <nav aria-label="현재 위치" className={`text-[14px] ${dark ? 'text-white/60' : 'text-ink-muted'}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:underline">홈</Link>
        </li>
        {trail.map((t, i) => (
          <li key={t.path} className="flex items-center gap-1.5">
            <span aria-hidden>›</span>
            {i === trail.length - 1 ? (
              <span aria-current="page" className={dark ? 'text-white/90' : 'text-ink-soft'}>{t.name}</span>
            ) : (
              <Link href={t.path} className="hover:underline">{t.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * 그림. ratio 를 주면 그 비율 상자에 채워 넣는다(격자 안 사진은 전부 같은 비율이어야 줄이 맞는다).
 * 크기는 빌드 때 잰 값(lib/imageSizes.generated.json)이라 레이아웃이 튀지 않는다.
 */
export function Figure({
  fig,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className = '',
  rounded = 'rounded-2xl',
  ratio,
  effect = 'wipe',
  caption = true,
}: {
  fig: Fig;
  sizes?: string;
  priority?: boolean;
  className?: string;
  rounded?: string;
  /** 예: 'aspect-[4/3]' — 주면 object-cover 로 채운다 */
  ratio?: string;
  effect?: 'wipe' | 'img-in' | 'none';
  caption?: boolean;
}) {
  const s = figSize(fig.key);
  const fx = effect === 'none' ? '' : effect;
  /*
   * ★ 작은 원본(폭 600px 미만 — 옛 배너에서 잘라 낸 도해)은 상자에 늘려 채우지 않는다 (오너: "사진 막 확대돼서").
   *   같은 비율 상자 안에 **원래 크기 그대로** 가운데 놓고 옅은 바탕을 깐다 — 흐려지지 않고, 격자 줄은 그대로 맞는다.
   */
  /*
   * ★ 글자가 박힌 도해·장비 배너(equip/·illust/ 원본)도 상자에 잘라 넣지 않는다 — 상자 안에 통째로(contain) 놓는다.
   *   사진(scene/·place/·ai/)만 상자에 꽉 채워 자른다. 회귀 사례: GBT 도해의 바깥 라벨이 잘려 나갔다.
   */
  const diagram = /^(equip|illust)\//.test(fig.key);
  /* 상자 비율과 1.4배 넘게 다른 사진도 통째로 — 세로 사진이 4:3 에서 머리가 잘리거나, 긴 배너가 반 토막 나지 않게 */
  const ar = ratio?.match(/\[(\d+)\/(\d+)\]/);
  const mismatch = ar ? !fitsBox(fig.key, Number(ar[1]), Number(ar[2])) : false;
  const framed = !!ratio && (s.w < 600 || diagram || mismatch);
  return (
    <figure className={className}>
      {ratio && framed ? (
        <div className={`${fx} relative ${ratio} flex items-center justify-center overflow-hidden ${rounded} bg-canvas-2 p-6`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="max-h-full w-auto max-w-full rounded-xl object-contain" />
        </div>
      ) : ratio ? (
        <div className={`${fx} relative ${ratio} overflow-hidden ${rounded} bg-canvas-2`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      ) : (
        <div className={`${fx} overflow-hidden ${rounded} bg-canvas-2`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="h-auto w-full object-cover" />
        </div>
      )}
      {caption && fig.caption && <figcaption className="mt-2.5 text-[14px] text-ink-muted">{fig.caption}</figcaption>}
    </figure>
  );
}

/** 문답 목록 — 화면과 FAQPage 스키마가 **같은 배열**을 쓴다. */
export function FaqList({ items, id = 'faq' }: { items: QA[]; id?: string }) {
  return (
    <div id={id} className="border-t border-hairline">
      {items.map((it, i) => (
        <details key={i} className="faq" open={i === 0}>
          <summary>
            <span className="q" aria-hidden>Q</span>
            <span>{it.q}</span>
            <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <p className="a">
            <Sentences text={it.a} />
          </p>
        </details>
      ))}
    </div>
  );
}

/** 마무리 상담 띠 — 페이지당 하나. AI 정물 사진을 배경으로 깐다. */
export function ContactBand({ title = '궁금한 점은 편하게 문의해 주세요', text, bg = 'ai/wide-visit' }: { title?: string; text?: string; bg?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc(bg)} alt="" fill sizes="100vw" className="object-cover opacity-30" data-parallax="0.18" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/50" />
      </div>
      <div className="wrap py-20 md:py-28">
        <div className="reveal mx-auto grid max-w-[1320px] items-center gap-10 md:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <p className="eyebrow on-dark">CONTACT</p>
            <h2 className="display-sm mt-4 !text-white">{title}</h2>
            <p className="mt-3 text-white/70">{text ?? `화·목 야간진료 21:00 · ${CLINIC.parking.place} ${CLINIC.parking.fee}`}</p>
            {/* 빈 자리에 지하철 안내 — 기존 홈페이지 오시는 길 표기 그대로, 호선 색 동그라미 */}
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {CLINIC.transit.map((t) => (
                <li
                  key={`${t.line}-${t.station}`}
                  className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 py-1.5 pr-4 pl-1.5 backdrop-blur"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold text-white" style={{ background: t.color }}>
                    {t.line.replace('호선', '')}
                  </span>
                  <span className="text-[14px] leading-tight">
                    <span className="font-bold text-white">{t.station}</span>{' '}
                    <span className="text-white/60">
                      {t.exit} · {t.walk}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* 문의 카드 넷 — 가운데가 휑해 보여 버튼을 카드로 키웠다(오너). 이름 아래 한 줄로 무엇인지 알려 준다 */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:min-w-[560px]">
            <a
              href={CLINIC.phoneHref}
              className="group flex items-center gap-4 rounded-2xl bg-sun-500 px-5 py-4 shadow-[var(--shadow-btn)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-600"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold text-white">전화 상담</span>
                <span className="block text-[13.5px] tabular-nums text-white/80">{CLINIC.phone}</span>
              </span>
            </a>

            <a
              href={CLINIC.booking.naver}
              target="_blank"
              rel="noopener"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#03C75A] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 3h5.2l5.6 8.4V3H20v18h-5.2L9.2 12.6V21H4z" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold">네이버 예약</span>
                <span className="block text-[13.5px] text-white/60">원하는 날짜·시간 고르기</span>
              </span>
            </a>

            <a
              href={CLINIC.booking.naverTalk}
              target="_blank"
              rel="noopener"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#03C75A] text-white">
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 4c-4.7 0-8.5 3-8.5 6.8 0 2.4 1.6 4.5 4 5.7L6.8 20l4-2.4c.4 0 .8.1 1.2.1 4.7 0 8.5-3 8.5-6.8S16.7 4 12 4z" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold">톡톡 상담</span>
                <span className="block text-[13.5px] text-white/60">메시지로 물어보기</span>
              </span>
            </a>

            <Link
              href="/visit"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.2" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold">오시는 길</span>
                <span className="block text-[13.5px] text-white/60">
                  {CLINIC.transit[0].station} {CLINIC.transit[0].exit} {CLINIC.transit[0].walk}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 의료 고지 — 상담 띠(남색) 아래에 그대로 이어 붙인다. 흰 띠를 끼우지 않아 꼬리말까지 남색이 이어진다(오너).
 * ⚠️ 문구 자체는 지우지 않는다 — 치료 효과를 말하는 광고에는 부작용·개인차 고지가 함께 있어야 한다(의료법 제56조).
 */
export function MedicalNotice() {
  return (
    <div className="bg-night pb-14">
      <div className="wrap">
        <p className="border-t border-white/10 pt-7 text-[13.5px] leading-relaxed text-white/45">{MEDICAL_DISCLAIMER}</p>
      </div>
    </div>
  );
}

/** 링크 카드 — 격자 안에서 높이가 같다(h-full + flex). 사진이 있으면 4:3 상자. */
export function CardLink({ href, label, desc, external = false, fig, num }: { href: string; label: string; desc?: string; external?: boolean; fig?: Fig; num?: string }) {
  const inner = (
    <>
      {fig && (
        <span className="card-img block">
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className={fitsBox(fig.key, 3, 2) ? 'object-cover' : '!object-contain p-3'} />
        </span>
      )}
      <span className="flex flex-1 flex-col p-6">
        {num && <span className="num mb-3">{num}</span>}
        <span className="block text-[1.08rem] font-bold leading-snug text-ink group-hover:text-brand-700">{label}</span>
        {desc && (
          <span className="mt-2 block text-[15px] leading-relaxed text-ink-soft">
            <Sentences text={desc} clauses={false} />
          </span>
        )}
        <span aria-hidden className="mt-auto inline-flex pt-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all group-hover:translate-x-1 group-hover:bg-sun-500 group-hover:text-white">→</span>
        </span>
      </span>
    </>
  );
  /* 사진이 있는 카드는 3D 기울기 없이 살짝 떠오르기만(오너: 3D 는 사진 없이 글만 나열된 카드에만) */
  const cls = 'card card-hover group flex h-full flex-col overflow-hidden';
  return external ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

/** 흐르는 키워드 띠 — 구역 사이의 숨 고르기. */
export function Marquee({ items, dark = false, overlap = false }: { items: string[]; dark?: boolean; overlap?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y ${dark ? 'border-white/10 bg-night text-white/70' : 'border-hairline bg-white text-ink-soft'} py-4 ${overlap ? 'relative z-10 -mt-8 rounded-t-[32px] border-t-0 shadow-[0_-24px_48px_rgba(13,20,51,0.35)]' : ''}`} aria-hidden>
      <div className="marquee">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-[15px] font-bold tracking-wide whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-sun-500" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * 스크롤 따라 낱말이 차례로 밝아지는 글(레퍼런스의 문단 강조) — RevealScript 가 [data-scrub] 안의 .w 에 .on 을 붙인다.
 * 문장 단위 줄바꿈은 Sentences 와 같다. 어두운 배경이 기본, 밝은 배경은 light.
 */
export function ScrubText({ text, className = '', light = false }: { text: string; className?: string; light?: boolean }) {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <span className={`scrub ${light ? 'scrub-light' : ''} ${className}`} data-scrub>
      {sentences.map((s, i) => (
        <span key={i} className="sent">
          {s.split(/\s+/).map((w, j) => (
            <span key={j} className="w">
              {w}{' '}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
