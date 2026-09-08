import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { figSize, figSrc, type Fig, type QA } from '@/lib/docs';
import { CLINIC, MEDICAL_DISCLAIMER } from '@/lib/clinic';

/** 구역 머리 — 윗줄 라벨 + 제목 + 설명. 레퍼런스의 "— CASE STUDY / 큰 제목 / 한 줄" 리듬. */
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
  lead?: ReactNode;
  align?: 'left' | 'center';
  dark?: boolean;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={`reveal max-w-[760px] ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${dark ? 'on-dark' : ''} ${align === 'center' ? 'justify-center' : ''}`}>{eyebrow}</p>}
      <Tag className={`display-sm mt-4 ${dark ? '!text-white' : ''}`}>{title}</Tag>
      {lead && <p className={`lead mt-4 ${dark ? '!text-white/75' : ''}`}>{lead}</p>}
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

/** 그림 — 크기는 빌드 때 잰 값(lib/imageSizes.generated.json)이라 레이아웃이 튀지 않는다. */
export function Figure({ fig, sizes = '(max-width: 768px) 100vw, 50vw', priority = false, className = '', rounded = 'rounded-2xl' }: { fig: Fig; sizes?: string; priority?: boolean; className?: string; rounded?: string }) {
  const s = figSize(fig.key);
  return (
    <figure className={className}>
      <div className={`img-in overflow-hidden ${rounded} bg-canvas-2`}>
        <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="h-auto w-full object-cover" />
      </div>
      {fig.caption && <figcaption className="mt-2.5 text-[13px] text-ink-muted">{fig.caption}</figcaption>}
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
          <p className="a">{it.a}</p>
        </details>
      ))}
    </div>
  );
}

/** 마무리 상담 띠 — 페이지당 하나. */
export function ContactBand({ title = '궁금한 점은 편하게 문의해 주세요', text }: { title?: string; text?: string }) {
  return (
    <section className="section bg-night text-white">
      <div className="wrap">
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

/** 링크 카드 */
export function CardLink({ href, label, desc, external = false }: { href: string; label: string; desc?: string; external?: boolean }) {
  const inner = (
    <>
      <span className="block text-[1.05rem] font-bold text-ink group-hover:text-brand-700">{label}</span>
      {desc && <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-soft">{desc}</span>}
      <span aria-hidden className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-sun-500 group-hover:text-white">→</span>
    </>
  );
  const cls = 'card card-hover group block p-6';
  return external ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}
