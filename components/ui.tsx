import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { figSize, figSrc, type Fig, type QA } from '@/lib/docs';
import { CLINIC, MEDICAL_DISCLAIMER } from '@/lib/clinic';

/**
 * 문장·마디 줄바꿈 — 마침표에서 줄을 바꾸고, 문장 안에서는 쉼표 마디가 통째로 내려간다.
 * ★ split 은 경계에서만 자르므로 글자를 잃지 않는다(소수점·약어 뒤엔 공백이 없어 안 잘린다).
 * ⚠️ 마디는 md 이상에서만 inline-block 이다(globals.css) — 좁은 칸에서 두 글자씩 꺾이는 사고 방지.
 */
export function Sentences({ text, className = '', clauses: useClauses = true }: { text: string; className?: string; /** 좁은 카드에서는 쉼표 마디를 풀어 자연스럽게 흐르게 한다 */ clauses?: boolean }) {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const clauses = (s: string) => (useClauses ? s.split(/(?<=,)\s+(?=\S)/).filter(Boolean) : [s]);
  if (sentences.length <= 1) {
    return (
      <span className={className}>
        {clauses(text).map((c, i) => (
          <span key={i} className="clause">
            {c}{' '}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className={className}>
      {sentences.map((s, i) => (
        <span key={i} className="sent">
          {clauses(s).map((c, j) => (
            <span key={j} className="clause">
              {c}{' '}
            </span>
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
    <nav aria-label="현재 위치" className={`text-[13px] ${dark ? 'text-white/60' : 'text-ink-muted'}`}>
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
  return (
    <figure className={className}>
      {ratio ? (
        <div className={`${fx} relative ${ratio} overflow-hidden ${rounded} bg-canvas-2`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      ) : (
        <div className={`${fx} overflow-hidden ${rounded} bg-canvas-2`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="h-auto w-full object-cover" />
        </div>
      )}
      {caption && fig.caption && <figcaption className="mt-2.5 text-[13px] text-ink-muted">{fig.caption}</figcaption>}
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
export function ContactBand({ title = '궁금한 점은 편하게 문의해 주세요', text, bg = 'ai/visit' }: { title?: string; text?: string; bg?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc(bg)} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/50" />
      </div>
      <div className="wrap py-20 md:py-28">
        <div className="reveal grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow on-dark">CONTACT</p>
            <h2 className="display-sm mt-4 !text-white">{title}</h2>
            <p className="mt-3 text-white/70">{text ?? `${CLINIC.transit[0].line} ${CLINIC.transit[0].station} ${CLINIC.transit[0].exit} ${CLINIC.transit[0].walk} · 화·목 야간진료 21:00 · ${CLINIC.parking.place} ${CLINIC.parking.fee}`}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.phoneHref} className="btn-sun">전화 {CLINIC.phone}</a>
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-ghost-dark">네이버 예약</a>
            <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="btn-ghost-dark">톡톡 상담</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MedicalNotice() {
  return (
    <div className="wrap">
      <p className="rounded-xl bg-canvas px-5 py-4 text-[13px] leading-relaxed text-ink-muted">{MEDICAL_DISCLAIMER}</p>
    </div>
  );
}

/** 링크 카드 — 격자 안에서 높이가 같다(h-full + flex). 사진이 있으면 4:3 상자. */
export function CardLink({ href, label, desc, external = false, fig, num }: { href: string; label: string; desc?: string; external?: boolean; fig?: Fig; num?: string }) {
  const inner = (
    <>
      {fig && (
        <span className="card-img block">
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
        </span>
      )}
      <span className="flex flex-1 flex-col p-6">
        {num && <span className="num mb-3">{num}</span>}
        <span className="block text-[1.08rem] font-bold leading-snug text-ink group-hover:text-brand-700">{label}</span>
        {desc && (
          <span className="mt-2 block text-[14px] leading-relaxed text-ink-soft">
            <Sentences text={desc} clauses={false} />
          </span>
        )}
        <span aria-hidden className="mt-auto inline-flex pt-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all group-hover:translate-x-1 group-hover:bg-sun-500 group-hover:text-white">→</span>
        </span>
      </span>
    </>
  );
  const cls = 'card card-hover group flex h-full flex-col overflow-hidden';
  return external ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

/** 흐르는 키워드 띠 — 구역 사이의 숨 고르기. */
export function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y ${dark ? 'border-white/10 bg-night text-white/70' : 'border-hairline bg-white text-ink-soft'} py-4`} aria-hidden>
      <div className="marquee">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-[14px] font-bold tracking-wide whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-sun-500" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
