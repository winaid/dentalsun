import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage, type CollageCard } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { TmjSelfCheck } from '@/components/TmjSelfCheck';
import { ContactBand, FaqList, MedicalNotice, Sentences } from '@/components/ui';
import { ContactCard, DoctorCard } from '@/components/SideRail';
import { figSize, figSrc, fitsBox, type Doc } from '@/lib/docs';
import { docByPath } from '@/lib/content';
import {
  TMJ_ANATOMY,
  TMJ_ARTHRO,
  TMJ_ASYMMETRY_CAUSES,
  TMJ_ASYMMETRY_SIGNS,
  TMJ_BODY_CHAIN,
  TMJ_BODY_CHECK,
  TMJ_BODY_NOTE,
  TMJ_CAUSE_DETAIL,
  TMJ_CAUSES,
  TMJ_EQUIP,
  TMJ_HABITS,
  TMJ_HERO,
  TMJ_KNOWHOW,
  TMJ_PRINCIPLE,
  TMJ_PROCESS,
  TMJ_RELATED_SYMPTOMS,
  TMJ_SELF_CHECK,
  TMJ_SELF_CTA,
  TMJ_SELF_INTRO,
  TMJ_SELF_KEY,
  TMJ_SELF_PHOTO_NOTE,
  TMJ_SELF_PHOTOS,
  TMJ_SELF_TESTS,
  TMJ_SPLINT_ROLE,
  TMJ_SPLINT_TIPS,
  TMJ_STEPS,
  TMJ_SUPPORT_CARE,
  TMJ_SYMPTOMS,
} from '@/lib/content/tmjLanding';
import { breadcrumbSchema, faqSchema, imageObjectSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC, HOURS, MONTHLY_NOTICE } from '@/lib/clinic';

/**
 * 턱관절 — 한 페이지(2026-09-09 통합). 레퍼런스(tmjdoctor.co.kr 턱관절)의 짜임새를 따르되 글·사진은 옛 홈페이지와 오너 실사.
 *  메뉴의 하위 항목은 이 페이지의 구역으로 간다: #knowhow(노하우) · #symptoms(주요증상) · #treatments(치료방법).
 *  흐름: 콜라주 히어로 → TMJ → 구조와 기능(#anatomy) → 증상 4 + 자가 점검 → 원인 3 + 3대 원인 상세
 *        → 전신 연결(#whole-body) → 노하우 3 → 치료 5 + 원칙·스플린트·세척술·보조치료 → 장비 2 → 생활습관 6 → FAQ 17.
 *  2026-09-21: 오너가 준 참고(4dortho.co.kr 턱관절 메뉴 7쪽)를 항목 단위로 대조해 빠진 쪽(구조와 기능·
 *  원인 상세·전신증상·치료 상세)을 채웠다. 옮기지 않은 것과 그 이유는 lib/content/tmjLanding.ts 주석 참조.
 *  오른쪽 사이드바: 원장 배너 · 구역 안내 · 진단 과정 · 진료시간 · 질문. 구조화 데이터·FAQ 는 Doc(lib/content/tmj.ts)에서.
 *  ★ 구역 이동 목차(점프 메뉴)는 두지 않는다(오너 지시) — 사이드바 안내는 메뉴와 같은 세 구역 링크뿐.
 */
const HERO_CARDS: [CollageCard, CollageCard, CollageCard] = [
  { fig: { key: 'sun/circle-treatment', alt: '확대경을 쓰고 치료하는 양대일 원장' }, shape: 'portrait' },
  { fig: { key: 'sun/doctor-arms', alt: '진료실에서 팔짱을 낀 양대일 원장' }, shape: 'wide' },
  { fig: { key: 'sun/tmj-explain-skull-2', alt: '두개골 모형으로 턱관절을 설명하는 양대일 원장' }, shape: 'std' },
];

/** 구역 머리 — 가운데 큰 글자(!·?·3·5·FAQ) + 제목 + 한 줄 */
function Head({ big, title, lead, id }: { big: ReactNode; title: ReactNode; lead?: string; id: string }) {
  return (
    <div className="reveal text-center">
      {big}
      <h2 id={id} className="display-sm mt-4">{title}</h2>
      {lead && (
        <p className="lead mx-auto mt-4 max-w-[640px]">
          <Sentences text={lead} clauses={false} />
        </p>
      )}
    </div>
  );
}
/** 전신 증상 체크리스트 갈래 아이콘 — 단순한 선 그림만(이모지 금지, 오너). 이름이 안 맞으면 점 세 개 */
function BodyIcon({ name }: { name: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<string, ReactNode> = {
    '입안': <><path d="M4 9c2.5-1.5 13.5-1.5 16 0-1 6-3.5 9-8 9s-7-3-8-9Z" /><path d="M7 10.5c3 1 7 1 10 0" /></>,
    '귀': <><path d="M8 18a4 4 0 0 0 4-3c.3-1.6 1.2-2.2 2.2-3.2A5 5 0 0 0 7 7.5" /><path d="M11 12a2 2 0 1 1 3-2" /></>,
    '호흡기·목': <><path d="M4 8h9a2.5 2.5 0 1 0-2.5-2.5" /><path d="M4 13h13a2.5 2.5 0 1 1-2.5 2.5" /><path d="M4 18h6" /></>,
    '눈': <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></>,
    '통증·소화': <path d="M13 3 5 13h6l-1 8 8-11h-6l1-7Z" />,
    '피부·부인과': <><path d="M12 3c2 4 6 6 6 11a6 6 0 0 1-12 0c0-5 4-7 6-11Z" /></>,
    '심리': <path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.6 12 20 12 20Z" />,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden {...p}>
      {d[name] ?? <><circle cx="6" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="18" cy="12" r="1.2" /></>}
    </svg>
  );
}

const Big = ({ children, unit }: { children: ReactNode; unit?: string }) => (
  <p className="tmj-big" aria-hidden>
    {children}
    {unit && <span className="ml-1 align-baseline text-[1.6rem] font-bold tracking-normal text-ink md:text-[2rem]">{unit}</span>}
  </p>
);

export function TmjPage({ doc }: { doc: Doc }) {
  const trail = [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }];
  const hero = TMJ_HERO.fig;
  const heroSize = figSize(hero.key);
  const first = (s: string) => s.split(/(?<=다\.)\s/)[0];

  const schema: unknown[] = [
    breadcrumbSchema(trail),
    medicalWebPageSchema({
      title: doc.title,
      description: doc.description,
      path: doc.path,
      image: { src: figSrc(hero.key), caption: hero.alt, width: heroSize.w, height: heroSize.h },
      related: doc.related ?? [],
    }),
    imageObjectSchema({ path: doc.path, src: figSrc(hero.key), caption: hero.alt, width: heroSize.w, height: heroSize.h }),
  ];
  if (doc.faq?.length) schema.push(faqSchema(doc.faq, doc.path));

  /* 사이드바 안내 — 메뉴와 같은 세 구역 + 인사이트 두 편 */
  const guides = [
    { label: '턱관절 치료 노하우', href: '#knowhow' },
    { label: '주요 증상과 자가 점검', href: '#symptoms' },
    { label: '치료 방법 5가지', href: '#treatments' },
    { label: '턱에서 딱딱 소리가 나요', href: '/insight/symptom/jaw-clicking' },
    { label: '턱관절 치료는 어떤 순서로 하나요', href: '/insight/guide/tmj-treatment-flow' },
  ].filter((g) => g.href.startsWith('#') || docByPath(g.href));

  return (
    <>
      <SiteHeader dark />
      <JsonLd data={schema} />
      <main id="main" className="bg-white">
        <HeroCollage
          trail={trail}
          eyebrow="TMJ · 턱관절"
          cardsLead="이런 증상이 있다면 턱관절을 확인해 보세요."
          lines={[TMJ_HERO.line1, <span key="l2" className="accent-sun">{TMJ_HERO.line2}</span>]}
          lead={TMJ_HERO.desc}
          long
          bg={TMJ_HERO.bg.key}
          cards={HERO_CARDS}
          items={TMJ_KNOWHOW.items.map((k) => ({ title: k.title, desc: first(k.desc) }))}
        >
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="btn-ghost-dark">톡톡 상담</a>
          </div>
        </HeroCollage>

        <div className="wrap grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:pt-24 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ───────── 본문 ───────── */}
          <div className="min-w-0">
            {/* TMJ — 레퍼런스 첫 구역. 제목·설명은 히어로가 맡았으니 글자와 특징 세 개만 */}
            <section className="text-center" aria-label="턱관절 진료 특징">
              <p className="tmj-big reveal" aria-hidden>{TMJ_HERO.letters}</p>
              <p className="lead reveal mx-auto mt-5 max-w-[640px]">
                <Sentences text={TMJ_KNOWHOW.lead} clauses={false} />
              </p>
              <ul className="reveal-stack mt-6 flex flex-wrap justify-center gap-2" aria-label="진료 특징">
                {TMJ_HERO.tags.map((t, i) => (
                  <li key={t} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[14px] font-bold text-ink">
                    <span className="text-[12px] font-extrabold text-sun-500">0{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            {/* ── #anatomy — 턱관절의 구조와 기능 (2026-09-21 보완) ──
                 증상·원인을 읽기 전에 "턱관절이 어떤 관절인가" 를 먼저 둔다. 디스크가 무엇인지 모르면
                 "디스크가 제자리를 벗어났다" 는 뒤의 설명이 읽히지 않는다. */}
            <section id="anatomy" className="scroll-mt-[96px] pt-20 md:pt-28" aria-labelledby="tmj-anatomy">
              <Head
                id="tmj-anatomy"
                big={<span className="tmj-big !text-[2.4rem] md:!text-[3.4rem]" aria-hidden>ANATOMY</span>}
                title={<>턱관절은 <span className="accent-sun">어떤 관절</span>일까요</>}
                lead={TMJ_ANATOMY.lead}
              />
              <div className="reveal-stack mt-12 grid gap-8 lg:grid-cols-[1.02fr_1fr] lg:items-center">
                <span className="img-in relative block aspect-[3/2] overflow-hidden rounded-[24px] bg-canvas-2">
                  <Image src={figSrc(TMJ_ANATOMY.fig.key)} alt={TMJ_ANATOMY.fig.alt} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
                </span>
                <ol className="grid gap-4">
                  {TMJ_ANATOMY.parts.map((p, i) => (
                    <li key={p.title} className="card flex gap-4 p-5 md:p-6">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0">
                        <span className="block text-[1.05rem] font-extrabold text-ink">{p.title}</span>
                        <span className="mt-1.5 block text-[14.5px] leading-[1.75] text-ink-soft">
                          <Sentences text={p.desc} clauses={false} />
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <ul className="reveal-stack mt-4 grid gap-4 md:grid-cols-2">
                {TMJ_ANATOMY.motions.map((m) => (
                  <li key={m.title} className="card card-3d p-6 md:p-7">
                    <h3 className="text-[1.1rem] font-extrabold text-ink">{m.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-[1.8] text-ink-soft">
                      <Sentences text={m.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ul>
              {/* 3대 증상 — 참고 사이트의 '턱관절 장애의 3대 증상' */}
              <div className="reveal mt-4 rounded-[28px] bg-night p-7 text-white md:p-10">
                <p className="text-[12px] font-bold tracking-[0.2em] text-sun-300">3 MAJOR SIGNS</p>
                <h3 className="mt-2 text-[1.3rem] font-extrabold md:text-[1.5rem]">턱관절 장애의 3대 증상</h3>
                <ol className="mt-6 grid gap-5 sm:grid-cols-3">
                  {TMJ_ANATOMY.triad.map((t) => (
                    <li key={t.n} className="border-t border-white/15 pt-4">
                      <span className="block text-[13px] font-extrabold tracking-[0.18em] text-sun-300">{t.n}</span>
                      <span className="mt-1.5 block text-[1.1rem] font-bold">{t.title}</span>
                      <span className="mt-1.5 block text-[14.5px] leading-[1.7] text-white/70">{t.desc}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="reveal card mt-4 p-7 md:p-9">
                <h3 className="text-[1.2rem] font-extrabold text-ink md:text-[1.3rem]">{TMJ_ANATOMY.pain.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.8] text-ink-soft">
                  <Sentences text={TMJ_ANATOMY.pain.lead} clauses={false} />
                </p>
                {/* 경로 3 — 긴 문단 대신 '증상 ← 이유' 한 줄씩 */}
                <ul className="mt-5 grid gap-3 md:grid-cols-3">
                  {TMJ_ANATOMY.pain.routes.map((r) => (
                    <li key={r.label} className="rounded-2xl bg-canvas p-4">
                      <span className="block text-[15px] font-extrabold text-ink">{r.label}</span>
                      <span className="mt-1 block text-[13.5px] leading-[1.65] text-ink-soft">{r.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── #symptoms — ! + 증상 4 + 함께 오는 증상 + 자가 점검 ── */}
            <section id="symptoms" className="scroll-mt-[96px] pt-20 md:pt-28" aria-labelledby="tmj-symptoms">
              <Head
                id="tmj-symptoms"
                big={<span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sun-500 text-[2.2rem] font-extrabold leading-none text-white shadow-[0_12px_30px_rgba(242,111,30,0.35)]" aria-hidden>!</span>}
                title={<>턱관절이 보내는 신호,<br /><span className="accent-sun">내 턱도 치료가 필요할까요?</span></>}
                lead="턱관절 장애는 턱에만 머물지 않습니다. 디스크가 제자리를 벗어나면 씹는 근육이 굳고, 두통이나 목·어깨 결림으로 이어지기도 합니다."
              />
              <ol className="reveal-stack mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
                {TMJ_SYMPTOMS.map((s, i) => (
                  <li key={s.num} className="relative text-center">
                    <span className={`mx-auto flex h-[128px] w-[128px] flex-col items-center justify-center rounded-full text-white shadow-[var(--shadow-lift)] md:h-[148px] md:w-[148px] ${s.tone === 'sun' ? 'bg-sun-500' : 'bg-night-2'}`}>
                      <span className="text-[1.35rem] font-extrabold leading-none tracking-[-0.02em] md:text-[1.6rem]">{s.num}</span>
                      <span className="mt-2 text-[15px] font-bold md:text-[17px]">{s.label}</span>
                    </span>
                    {i < TMJ_SYMPTOMS.length - 1 && <span aria-hidden className="absolute right-[-14px] top-[60px] hidden text-[1.4rem] text-ink-muted/60 lg:block">›</span>}
                    <span className="mx-auto mt-6 block aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-canvas-2 img-in">
                      <Image src={figSrc(s.fig.key)} alt={s.fig.alt} width={figSize(s.fig.key).w} height={figSize(s.fig.key).h} sizes="220px" className="h-full w-full object-cover" />
                    </span>
                    <p className="mx-auto mt-4 max-w-[230px] text-[15px] leading-[1.75] text-ink-soft">
                      <Sentences text={s.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ol>
              <ul className="reveal mt-10 flex flex-wrap justify-center gap-2" aria-label="함께 나타날 수 있는 증상">
                {TMJ_RELATED_SYMPTOMS.map((s) => (
                  <li key={s} className="rounded-full bg-canvas px-4 py-2 text-[14px] font-semibold text-ink-soft">{s}</li>
                ))}
              </ul>
              {/* 거울 앞 자가진단 5단계 — 참고 사이트 짜임새 그대로: 소개 → 핵심 한 줄 → 확인 사진 3장(캡션) → 5단계(방법·뜻·정상 범위) → 안내.
                  단계 카드는 한 줄에 하나(2+2+1 로 놓으면 마지막 줄만 넓어져 행이 안 맞는다). 점검표(아래)보다 먼저 두어 '해 보고 표시' 흐름 */}
              <div className="mt-16 md:mt-20" aria-labelledby="tmj-self-tests">
                <div className="reveal text-center">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-sun-600">SELF TEST · 5 STEPS</p>
                  <h3 id="tmj-self-tests" className="mt-2 text-[1.5rem] font-extrabold leading-tight text-ink md:text-[1.9rem]">
                    턱관절 장애 <span className="accent-sun">자가진단법</span>
                  </h3>
                  <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-[1.75] text-ink-soft">
                    <Sentences text={TMJ_SELF_INTRO} clauses={false} />
                  </p>
                </div>
                {/* 핵심 한 줄 — 참고 사이트의 '자가진단 핵심' */}
                <div className="reveal mt-8 grid gap-4 rounded-2xl bg-night p-6 text-white md:grid-cols-[auto_1fr] md:items-center md:gap-6 md:p-7">
                  <span className="inline-flex w-max items-center rounded-full bg-sun-500 px-3 py-1 text-[12px] font-extrabold tracking-[0.16em]">자가진단 핵심</span>
                  <p className="text-[15.5px] font-semibold leading-[1.75] text-white/90 md:text-[16.5px]">
                    <Sentences text={TMJ_SELF_KEY} clauses={false} />
                  </p>
                </div>
                {/* 확인 사진 3장 — 같은 4:3 상자, 캡션 한 줄 */}
                <ul className="reveal-stack mt-8 grid gap-4 sm:grid-cols-3">
                  {TMJ_SELF_PHOTOS.map((f) => (
                    <li key={f.key} className="card overflow-hidden">
                      <span className="relative block aspect-[4/3] overflow-hidden bg-canvas-2">
                        <Image src={figSrc(f.key)} alt={f.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      </span>
                      <p className="px-4 py-3 text-center text-[14px] font-semibold leading-snug text-ink-soft">{f.caption}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12.5px] text-ink-muted">{TMJ_SELF_PHOTO_NOTE}</p>
                <p className="reveal mt-10 text-center text-[1.2rem] font-extrabold text-ink md:text-[1.35rem]">이렇게 확인해 보세요</p>
                <ol className="reveal-stack mt-6 grid gap-4">
                  {TMJ_SELF_TESTS.map((t) => (
                    <li key={t.n} className="card grid gap-5 p-5 md:grid-cols-[112px_1fr] md:gap-7 md:p-6">
                      {/* 번호 타일 — 위 증상 사진을 또 쓰지 않는다(같은 사진 반복 금지) */}
                      <span className="flex h-[64px] w-[64px] items-center justify-center rounded-xl bg-night text-[1.5rem] font-extrabold text-white md:h-[112px] md:w-[112px] md:text-[2.4rem]" aria-hidden>{t.n}</span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-[12px] font-extrabold tracking-[0.18em] text-sun-500">
                          STEP {t.n}
                          {t.normal && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-bold tracking-normal text-brand-700">{t.normal}</span>}
                        </p>
                        <h4 className="mt-1.5 text-[1.15rem] font-extrabold leading-snug text-ink md:text-[1.25rem]">{t.title}</h4>
                        {/* '이렇게'(방법) · '이러면'(뜻) — 라벨 열 + 글 열, 두 줄의 시작선이 같게 */}
                        <dl className="mt-3 grid gap-2.5">
                          <div className="grid grid-cols-[56px_1fr] items-start gap-3">
                            <dt className="mt-[3px] inline-flex justify-center rounded-md bg-night px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em] text-white">이렇게</dt>
                            <dd className="text-[14.5px] leading-[1.75] text-ink-soft"><Sentences text={t.how} clauses={false} /></dd>
                          </div>
                          <div className="grid grid-cols-[56px_1fr] items-start gap-3">
                            <dt className="mt-[3px] inline-flex justify-center rounded-md bg-sun-500 px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em] text-white">이러면</dt>
                            <dd className="text-[14.5px] leading-[1.75] text-ink-soft"><Sentences text={t.means} clauses={false} /></dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  ))}
                </ol>
                {/* 마무리 안내 — 참고 사이트의 '이상이 느껴지면 정밀 진단' */}
                <div className="reveal mt-6 grid gap-4 rounded-2xl border border-hairline bg-canvas p-6 md:grid-cols-[1fr_auto] md:items-center md:p-7">
                  <div>
                    <p className="text-[1.15rem] font-extrabold text-ink">{TMJ_SELF_CTA.title}</p>
                    <p className="mt-1.5 text-[14.5px] leading-[1.7] text-ink-soft">{TMJ_SELF_CTA.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <a href={CLINIC.phoneHref} className="btn-ghost !px-4 !py-2.5 text-[14px]">{CLINIC.phone}</a>
                    <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun !px-4 !py-2.5 text-[14px]">네이버 예약</a>
                  </div>
                </div>
              </div>
              <div className="reveal mx-auto mt-10 max-w-[820px]">
                <TmjSelfCheck items={TMJ_SELF_CHECK} />
              </div>
            </section>

            {/* ── ? 원인 3 ── */}
            <section className="pt-24 md:pt-32" aria-labelledby="tmj-causes">
              <Head id="tmj-causes" big={<span className="tmj-big !text-[4.5rem] md:!text-[6rem]" aria-hidden>?</span>} title={<>원인을 알아야<br /><span className="accent-sun">근본 치료</span>가 가능합니다</>} lead="턱관절 장애는 한 가지 원인보다 관절에 가는 부담, 생활 습관, 심리적인 긴장이 겹쳐서 생기는 경우가 많습니다." />
              <ul className="reveal-stack mt-12 grid gap-6 sm:grid-cols-3">
                {TMJ_CAUSES.map((c) => (
                  <li key={c.title} className="card card-hover flex flex-col overflow-hidden text-center">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-canvas-2">
                      <Image src={figSrc(c.fig.key)} alt={c.fig.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    </span>
                    <span className="block p-6">
                      <h3 className="text-[1.15rem] font-extrabold text-ink">{c.title}</h3>
                      <p className="mx-auto mt-2 max-w-[280px] text-[14.5px] leading-[1.75] text-ink-soft">
                        <Sentences text={c.desc} clauses={false} />
                      </p>
                    </span>
                  </li>
                ))}
              </ul>
              {/* 3대 원인 상세 (2026-09-21 보완) — 위 카드 셋이 '무엇' 이라면 여기는 '왜 그것이 턱관절을 망가뜨리나' */}
              {/* 좌우 짜임 (오너 지적 2026-09-21 "디자인 다듬자") — 왼쪽 남색 패널에 번호·제목·핵심 한 줄, 오른쪽에 설명과 항목 목록.
                  항목은 알약 나열 대신 체크 목록 2열 — 알약이 줄바꿈되며 어수선했다 */}
              <ol className="reveal-stack mt-6 grid gap-4">
                {TMJ_CAUSE_DETAIL.map((c) => (
                  <li key={c.n} className="card grid overflow-hidden md:grid-cols-[250px_1fr]">
                    <div className="relative bg-night p-6 text-white md:p-7">
                      <span aria-hidden className="absolute -right-2 -top-4 text-[6rem] font-extrabold leading-none text-white/[0.06] md:text-[7rem]">{c.n}</span>
                      <span className="relative inline-block rounded-full bg-sun-500 px-3 py-1 text-[12px] font-bold text-white">{c.tag}</span>
                      <h3 className="relative mt-3 text-[1.35rem] font-extrabold leading-tight md:text-[1.5rem]">{c.title}</h3>
                      <p className="relative mt-3 text-[13.5px] leading-[1.65] text-white/70" style={{ wordBreak: 'keep-all' }}>{c.key}</p>
                    </div>
                    <div className="p-6 md:p-7">
                      {c.paragraphs.map((p) => (
                        <p key={p} className="mt-0 text-[14.5px] leading-[1.8] text-ink-soft [&:not(:first-child)]:mt-2.5">
                          <Sentences text={p} clauses={false} />
                        </p>
                      ))}
                      {c.items && (
                        <ul className="mt-4 grid gap-x-6 gap-y-2 border-t border-hairline pt-4 sm:grid-cols-2">
                          {c.items.map((it) => (
                            <li key={it} className="flex gap-2.5 text-[14px] leading-[1.6] text-ink">
                              <svg aria-hidden viewBox="0 0 20 20" className="mt-[3px] h-4 w-4 shrink-0 text-sun-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="10" cy="10" r="8.5" className="opacity-30" />
                                <path d="m6.5 10.3 2.4 2.4 4.8-5" />
                              </svg>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── #whole-body — 턱관절과 전신 (2026-09-21 보완) ── */}
            <section id="whole-body" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="tmj-body">
              <Head
                id="tmj-body"
                big={<Big unit="갈래">4</Big>}
                title={<>턱관절 장애는 <span className="accent-sun">턱에만 머물지 않습니다</span></>}
                lead="턱관절이 한쪽으로 틀어지면 얼굴의 좌우 균형과 목뼈의 위치가 바뀌고, 도미노처럼 척추와 골반까지 이어지기도 합니다."
              />
              <ol className="reveal-stack mt-12 grid gap-4 md:grid-cols-2">
                {TMJ_BODY_CHAIN.map((b) => (
                  <li key={b.n} className="card p-6 md:p-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="text-[13px] font-extrabold tracking-[0.18em] text-sun-500">{b.n}</span>
                      <h3 className="text-[1.15rem] font-extrabold text-ink md:text-[1.25rem]">{b.title}</h3>
                    </div>
                    {/* 이어지는 순서를 한 줄로 — 긴 설명을 읽기 전에 흐름부터 보이게 */}
                    <p className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-[12.5px] font-bold text-brand-700">{b.chain}</p>
                    <p className="mt-3 text-[14.5px] leading-[1.8] text-ink-soft">
                      <Sentences text={b.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ol>
              <div className="reveal-stack mt-4 grid gap-4 md:grid-cols-2">
                <div className="card p-6 md:p-7">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-brand-700">WHY</p>
                  <h3 className="mt-2 text-[1.1rem] font-extrabold text-ink">이런 경로로 얼굴이 틀어집니다</h3>
                  <ul className="mt-3 space-y-2.5">
                    {TMJ_ASYMMETRY_CAUSES.map((c) => (
                      <li key={c} className="flex gap-2.5 text-[14.5px] leading-[1.7] text-ink-soft">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-6 md:p-7">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-sun-600">SIGNS</p>
                  <h3 className="mt-2 text-[1.1rem] font-extrabold text-ink">거울에서 보이는 비대칭 신호</h3>
                  <ul className="mt-3 space-y-2.5">
                    {TMJ_ASYMMETRY_SIGNS.map((s) => (
                      <li key={s} className="flex gap-2.5 text-[14.5px] leading-[1.7] text-ink-soft">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" aria-hidden />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* 전신 증상 체크리스트 8갈래 — 참고 사이트 전문. 인과를 단정하지 않는 안내문을 반드시 함께 둔다 */}
              <div className="reveal mt-4 rounded-[28px] border border-hairline bg-canvas p-6 md:p-9">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-bold tracking-[0.2em] text-sun-600">CHECKLIST</p>
                    <h3 className="mt-1.5 text-[1.2rem] font-extrabold text-ink md:text-[1.3rem]">턱관절 장애와 함께 나타날 수 있는 증상</h3>
                  </div>
                  <p className="text-[13px] font-semibold text-ink-muted">8갈래 · {TMJ_BODY_CHECK.reduce((n, g) => n + g.items.length, 0)}항목</p>
                </div>
                {/* 갈래마다 타일 하나 — 아이콘·이름·항목 수 머리 + 체크 목록. 글자만 4열로 늘어놓으니 어디서 갈래가 바뀌는지 안 보였다 */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {TMJ_BODY_CHECK.map((g) => (
                    <div key={g.group} className="rounded-2xl border border-hairline bg-white p-5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <BodyIcon name={g.group} />
                        </span>
                        <span className="min-w-0 flex-1 text-[15px] font-extrabold text-ink">{g.group}</span>
                        <span className="rounded-full bg-canvas px-2 py-0.5 text-[11.5px] font-bold text-ink-muted">{g.items.length}</span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {g.items.map((it) => (
                          <li key={it} className="flex gap-2 text-[13.5px] leading-[1.6] text-ink-soft">
                            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sun-400" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-3 rounded-2xl bg-white p-4 md:p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[13px] font-extrabold text-white" aria-hidden>i</span>
                  <p className="text-[13.5px] leading-[1.8] text-ink-soft">
                    <Sentences text={TMJ_BODY_NOTE} clauses={false} />
                  </p>
                </div>
              </div>
            </section>

            {/* ── #knowhow — 3 + 실사 띠 + 원 3 ── */}
            <section id="knowhow" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="tmj-knowhow">
              <Head id="tmj-knowhow" big={<Big unit="가지">3</Big>} title={<>광화문선치과<br />턱관절 진료 <span className="accent-sun">노하우</span></>} lead={TMJ_KNOWHOW.title} />
              <div className="reveal relative mt-12 overflow-hidden rounded-[28px] bg-night">
                {/* ★ aspect-ratio 에 min-h 를 같이 주면 높이에 맞춰 폭이 늘어나 글이 잘린다 — 화면 폭별 비율로만 정한다 */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
                  <Image src={figSrc(TMJ_KNOWHOW.band.key)} alt={TMJ_KNOWHOW.band.alt} fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover object-[50%_30%]" data-parallax="0.12" />
                  <div className="absolute inset-0 bg-gradient-to-b from-night/75 via-night/25 to-night/70" />
                  <div className="absolute inset-x-0 top-0 px-5 py-6 text-center md:p-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-sun-300 md:text-[12px]">SUN DENTAL TMJ SYSTEM</p>
                    <p className="on-photo mt-2 text-[1.25rem] font-extrabold leading-[1.3] text-white sm:text-[1.6rem] md:mt-3 md:text-[2.1rem]" style={{ wordBreak: 'keep-all' }}>{TMJ_KNOWHOW.bandTitle}</p>
                  </div>
                </div>
              </div>
              <ol className="reveal-stack relative z-10 -mt-14 grid gap-8 px-4 sm:grid-cols-3 md:-mt-20 md:px-8">
                {TMJ_KNOWHOW.items.map((k, i) => (
                  <li key={k.title} className="text-center">
                    <span className="relative mx-auto block h-[150px] w-[150px] overflow-hidden rounded-full border-[6px] border-white bg-canvas-2 shadow-[var(--shadow-lift)] md:h-[180px] md:w-[180px]">
                      <Image src={figSrc(k.fig.key)} alt={k.fig.alt} fill sizes="180px" className="object-cover" />
                    </span>
                    <p className="mt-5 text-[13px] font-extrabold tracking-[0.18em] text-sun-500">0{i + 1}</p>
                    <h3 className="mt-1.5 text-[1.15rem] font-extrabold leading-snug text-ink md:text-[1.25rem]">{k.title}</h3>
                    <p className="mx-auto mt-3 max-w-[300px] text-[14.5px] leading-[1.75] text-ink-soft">
                      <Sentences text={k.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── #treatments — 5 STEP + 원칙·스플린트 ── */}
            <section id="treatments" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="tmj-steps">
              <Head id="tmj-steps" big={<Big unit="가지">5</Big>} title={<>턱관절, <span className="accent-sun">어떻게 치료</span>해야 할까요?</>} lead="약물치료와 물리치료부터 보톡스, 스플린트 장치치료, 관절강 세척술까지 한곳에서 이어서 진행합니다. 부담이 적은 치료부터 시작해 진단 결과에 따라 조합합니다." />
              <ol className="reveal-stack mt-12 grid gap-4">
                {TMJ_STEPS.map((s, i) => (
                  <li key={s.title} className="card grid items-center gap-5 p-4 md:grid-cols-[210px_72px_1fr] md:gap-7 md:p-5">
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-canvas-2">
                      <Image src={figSrc(s.fig.key)} alt={s.fig.alt} fill sizes="(max-width: 768px) 100vw, 210px" className={fitsBox(s.fig.key, 16, 10) ? 'object-cover' : '!object-contain p-2'} />
                    </span>
                    <span className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-night text-white md:h-[72px] md:w-[72px]">
                      <span className="text-[1.25rem] font-extrabold leading-none">{i + 1}</span>
                      <span className="mt-1 text-[10px] font-bold tracking-[0.18em]">STEP</span>
                    </span>
                    <div>
                      <h3 className="text-[1.2rem] font-extrabold text-ink md:text-[1.3rem]">{s.title}</h3>
                      <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">
                        <Sentences text={s.desc} clauses={false} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="reveal-stack mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl bg-night p-7 text-white md:p-8">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-sun-300">PRINCIPLE</p>
                  <h3 className="mt-2 text-[1.3rem] font-extrabold">{TMJ_PRINCIPLE.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.8] text-white/75">
                    <Sentences text={TMJ_PRINCIPLE.lead} clauses={false} />
                  </p>
                  {/* 단계 사다리 — 왼쪽 선을 따라 1 → 2 → 3 → 마지막. 긴 한 덩어리 글을 눈으로 따라가게 나눴다 */}
                  <ol className="mt-6 space-y-5 border-l border-white/15 pl-6">
                    {TMJ_PRINCIPLE.steps.map((s) => (
                      <li key={s.n} className="relative">
                        <span aria-hidden className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-sun-400 ring-4 ring-night" />
                        <span className="block text-[11.5px] font-extrabold tracking-[0.18em] text-sun-300">{s.n}</span>
                        <span className="mt-1 block text-[15.5px] font-bold leading-snug text-white">{s.label}</span>
                        <span className="mt-1.5 block text-[14px] leading-[1.7] text-white/70">{s.desc}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="card card-3d p-7 md:p-8">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-sun-600">SPLINT</p>
                  <h3 className="mt-2 text-[1.3rem] font-extrabold text-ink">스플린트, 이렇게 씁니다</h3>
                  <ul className="mt-4 space-y-3">
                    {TMJ_SPLINT_TIPS.map((t) => (
                      <li key={t.title} className="flex gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sun-500" aria-hidden />
                        <span>
                          <span className="block text-[15px] font-bold text-ink">{t.title}</span>
                          <span className="block text-[13.5px] leading-[1.6] text-ink-soft">{t.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* 스플린트가 하는 일 · 관절강 세척술 (2026-09-21 보완) — 위 5가지 가운데 설명이 가장 많이 필요한 둘 */}
              <div className="reveal-stack mt-4 grid gap-4 md:grid-cols-2">
                <div className="card p-7 md:p-8">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-brand-700">STEP 1 · SPLINT</p>
                  <h3 className="mt-2 text-[1.2rem] font-extrabold text-ink">{TMJ_SPLINT_ROLE.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-[1.8] text-ink-soft">
                    <Sentences text={TMJ_SPLINT_ROLE.lead} clauses={false} />
                  </p>
                  {/* 라벨 열 + 글 열 — 자가진단 카드와 같은 짜임 */}
                  <dl className="mt-5 space-y-3">
                    {TMJ_SPLINT_ROLE.points.map((p) => (
                      <div key={p.label} className="grid grid-cols-[64px_1fr] gap-3">
                        <dt className="pt-0.5 text-[12.5px] font-extrabold tracking-[0.06em] text-brand-700">{p.label}</dt>
                        <dd className="text-[14px] leading-[1.7] text-ink-soft">{p.desc}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="card p-7 md:p-8">
                  <p className="text-[12px] font-bold tracking-[0.2em] text-sun-600">ARTHROCENTESIS</p>
                  <h3 className="mt-2 text-[1.2rem] font-extrabold text-ink">{TMJ_ARTHRO.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-[1.8] text-ink-soft">
                    <Sentences text={TMJ_ARTHRO.lead} clauses={false} />
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-[12.5px] font-extrabold tracking-[0.06em] text-brand-700">장점</p>
                      <ul className="mt-2 space-y-1.5">
                        {TMJ_ARTHRO.merits.map((m) => (
                          <li key={m} className="flex gap-2 text-[14px] leading-[1.6] text-ink-soft">
                            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" aria-hidden />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="sm:min-w-[150px]">
                      <p className="text-[12.5px] font-extrabold tracking-[0.06em] text-brand-700">효과</p>
                      <ul className="mt-2 space-y-1.5">
                        {TMJ_ARTHRO.effects.map((e) => (
                          <li key={e} className="rounded-xl bg-brand-50 px-3 py-2 text-[13px] font-semibold leading-snug text-brand-700">{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* 보조적인 치료 3 — 행동 조절·물리치료·약물치료 */}
              <ul className="reveal-stack mt-4 grid gap-4 md:grid-cols-3">
                {TMJ_SUPPORT_CARE.map((s, i) => (
                  <li key={s.title} className="card p-6 md:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="rounded-full bg-sun-50 px-3 py-1 text-[12px] font-bold text-sun-700">{s.tag}</span>
                    </div>
                    <h3 className="mt-3 text-[1.1rem] font-extrabold text-ink">{s.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">
                      <Sentences text={s.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── 장비 2 ── */}
            <section className="pt-20 md:pt-28" aria-labelledby="tmj-equip">
              <h2 id="tmj-equip" className="sr-only">턱관절 진료 장비</h2>
              <ul className="reveal-stack grid gap-5 md:grid-cols-2">
                {TMJ_EQUIP.map((e) => (
                  <li key={e.title} className="card flex gap-5 p-5 md:p-6">
                    {/* 사진은 3:4 상자를 꽉 채운다 — 아주 긴 세로 원본이 회색 상자 안에 작게 떠 있던 것을 배경을 이어 붙여 규격에 맞췄다 */}
                    <span className="relative block aspect-[3/4] w-[104px] shrink-0 self-start overflow-hidden rounded-xl bg-canvas-2 md:w-[118px] lg:w-[132px]">
                      <Image src={figSrc(e.fig.key)} alt={e.fig.alt} fill sizes="150px" className="object-cover" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold tracking-[0.2em] text-sun-600">{e.eyebrow}</p>
                      <h3 className="mt-2 text-[1.15rem] font-extrabold leading-snug text-ink">{e.title}</h3>
                      <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-soft">{e.lead}</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {e.points.map((p) => (
                          <li key={p} className="rounded-full bg-brand-50 px-2.5 py-1 text-[12.5px] font-semibold text-brand-700">{p}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── 생활습관 6 ── */}
            <section className="pt-24 md:pt-32" aria-labelledby="tmj-habits">
              <Head id="tmj-habits" big={<Big unit="가지">6</Big>} title={<>치료 효과를 지키는<br /><span className="accent-sun">생활습관</span></>} lead="증상이 나아진 뒤에도 습관이 돌아오면 재발할 수 있습니다. 일상에서 지키면 좋은 여섯 가지입니다." />
              <ul className="reveal-stack mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TMJ_HABITS.map((h, i) => (
                  <li key={h.title} className="card card-3d p-6">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-3 text-[1.05rem] font-bold text-ink">{h.title}</p>
                    <p className="mt-1.5 text-[14.5px] leading-[1.7] text-ink-soft">{h.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── FAQ — 화면 = FAQPage 스키마 ── */}
            {doc.faq && doc.faq.length > 0 && (
              <section className="pt-24 md:pt-32" aria-labelledby="tmj-faq" id="faq-section">
                <Head id="tmj-faq" big={<Big>FAQ</Big>} title="자주 묻는 질문입니다" />
                <div className="reveal mt-10 rounded-[28px] border border-hairline bg-canvas p-5 md:p-10">
                  <FaqList items={doc.faq} />
                </div>
              </section>
            )}
          </div>

          {/* ───────── 사이드바 (넓은 화면은 오른쪽, 좁은 화면은 본문 아래) ───────── */}
          <aside className="space-y-6 lg:self-start" aria-label="턱관절 진료 안내">
            {/* 사이드바 카드는 components/SideRail — 블로그 글과 같은 카드 */}
            <DoctorCard />

            <div className="card p-5">
              <p className="text-[1.15rem] font-extrabold text-ink">턱관절 <span className="text-sun-500">안내</span></p>
              <ul className="mt-3 divide-y divide-hairline">
                {guides.map((g) => (
                  <li key={g.href}>
                    <a href={g.href} className="flex items-center justify-between gap-3 py-2.5 text-[14.5px] font-semibold text-ink-soft hover:text-brand-700">
                      <span className="truncate">{g.label}</span>
                      <span aria-hidden className="text-ink-muted">›</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-night p-5 text-white">
              <p className="text-[1.1rem] font-extrabold">정밀 진단 과정</p>
              <ol className="mt-4 space-y-4">
                {TMJ_PROCESS.map((p) => (
                  <li key={p.label} className="flex items-start gap-4">
                    <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-sun-500 text-[14px] font-extrabold">{p.label}</span>
                    <span className="min-w-0 pt-1">
                      <span className="block text-[14.5px] font-bold">{p.title}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-[1.6] text-white/65">{p.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <ContactCard />

            {doc.faq && doc.faq.length > 0 && (
              <div className="card p-5">
                <p className="flex items-baseline justify-between">
                  <span className="text-[1.1rem] font-extrabold text-ink">자주 묻는 질문</span>
                  <a href="#faq-section" className="text-[12.5px] font-semibold text-ink-muted hover:text-brand-700">more +</a>
                </p>
                <ul className="mt-3 space-y-2">
                  {doc.faq.slice(0, 4).map((q) => (
                    <li key={q.q}>
                      <a href="#faq-section" className="flex items-start gap-2.5 text-[14px] font-semibold leading-snug text-ink-soft hover:text-brand-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-night text-[11px] font-extrabold text-white" aria-hidden>Q</span>
                        <span className="line-clamp-1">{q.q}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-24 md:mt-32">
          <ContactBand bg="sun/tmj-explain-skull" title="턱에서 소리가 나거나 입이 잘 안 벌어지시나요?" text="검사 후 원인을 알기 쉽게 설명해 드립니다. 네이버 예약이나 전화로 편하게 문의해 주세요." />
        </div>
        <MedicalNotice />
      </main>
    </>
  );
}
