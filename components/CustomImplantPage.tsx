import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { ContactBand, FaqList, MedicalNotice, Sentences } from '@/components/ui';
import { ContactCard, DoctorCard } from '@/components/SideRail';
import { docCharCount, figSize, figSrc, fitsBox, type Doc, type Fig } from '@/lib/docs';
import { docByPath, docsOfHub } from '@/lib/content';
import { HERO_COLLAGE, splitAccent } from '@/lib/heroCollage';
import {
  CI_ABUTMENT,
  CI_BENEFITS,
  CI_COMPARE,
  CI_DESIGN,
  CI_DIGITAL,
  CI_HERO_ITEMS,
  CI_IF_CUSTOM,
  CI_NOTICE,
  CI_PARTS,
  CI_PERI,
  CI_PROCESS,
  CI_WHEN,
  CI_WHY,
  NAVI_BENEFITS,
  NAVI_GUIDE,
  NAVI_HERO_ITEMS,
  NAVI_COMPARE,
  NAVI_NOTICE,
  NAVI_PROCESS,
  NAVI_STRUCTURE,
  NAVI_SYSTEM,
  NAVI_WHAT,
} from '@/lib/content/customImplantLanding';
import { articleSchema, breadcrumbSchema, faqSchema, imageObjectSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC } from '@/lib/clinic';

/**
 * 내비게이션 임플란트 · 맞춤 임플란트 전용 화면 — 한 파일, part 로 한 쪽씩 그린다.
 *  DocPage 의 글·사진 번갈아 놓기 대신 턱관절 화면과 같은 짜임 — 구역마다 머리(Head), 덩어리마다 소제목(SubHead)+큰 여백.
 *  navigation: 정의 → 임플란트 구조(도해) → 가이드 식립의 기준 4 → 수술 가이드 원리(도해) → 진행 4 → 절개식 vs 가이드 → 장비·위생 → 알아두실 점
 *  custom(로이스 S2~S7 전부): 정의(도해) → 세 부분 → 장점 6 + 잇몸 경계(도해) → 비교(넓은 도해 + 표) → 디지털 제작·과정 4·설계 4 →
 *        중요한 이유 · 받을 경우(반반 도해) → 권하는 경우 4 → 주위염 → 알아두실 점
 *  공통: FAQ → 관련 임플란트 쪽 카드(맨 끝). 데이터는 lib/content/customImplantLanding — Doc.blocks·faq 도 거기서 만든다.
 * ★ 2026-09-29 원장: 큰 영문·숫자 장식 글자(PART 1 · 3D PLAN, VS, CAD / CAM, 6가지, 4경우, FAQ, MORE)와 영문 눈썹이 싫다 →
 *   구역 머리는 짧은 한글 라벨(Label), 소제목 눈썹도 한글로. 크기·색 짜임은 그대로 둔다.
 * ★ 페이지 안 구역 이동 목차(점프 메뉴)는 두지 않는다(오너 지시). 사이드바 안내는 임플란트 **쪽** 링크다.
 * ★ 같은 사진 반복 금지(오너) — 첫 화면 배경·카드 사진은 본문에 다시 쓰지 않는다.
 * ★ 도해(illust/*)는 글자 라벨이 가장자리에 있어 잘라 채우지 않는다 — 3:2 상자에 통째로(object-contain).
 */
/** 첫 화면 배경 — 쪽마다 다른 사진(같은 사진 반복 금지) */
const HERO_BG_OF = { navigation: 'place2/doctor-scan', custom: 'illust/custom-abutment-seal' } as const;

/** 관련 쪽 카드 사진 — 쪽마다 다른 사진 */
const REL_FIG: Record<string, string> = {
  '/treatment/implant': 'orig/implant-hero',
  '/treatment/implant/navigation': 'orig/misc-nav-implant-set',
  '/treatment/implant/custom': 'ai/implant-custom',
  '/treatment/implant/full-arch': 'orig/implant-fa-sim',
  '/treatment/implant/uv': 'ai/implant-uv',
  '/treatment/implant/prf': 'ai/implant-prf',
  '/treatment/implant/warranty': 'ai/implant-warranty',
};

/** 구역 머리 위 짧은 한글 라벨 — 옛 영문·숫자 장식 글자 자리(원장: 의미 있는 한글 소제목) */
function Label({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-3 text-[13.5px] font-extrabold tracking-[0.12em] text-sun-600 md:text-[15px]">
      <span aria-hidden className="h-px w-7 bg-sun-400/70" />
      {children}
      <span aria-hidden className="h-px w-7 bg-sun-400/70" />
    </p>
  );
}

/** 구역 머리 — 한글 라벨 + 제목 + 한 줄 */
function Head({ label, title, lead, id }: { label: string; title: ReactNode; lead?: string; id: string }) {
  return (
    <div className="reveal text-center">
      <Label>{label}</Label>
      <h2 id={id} className="display-sm mt-4">{title}</h2>
      {lead && (
        <p className="lead mx-auto mt-4 max-w-[680px]">
          <Sentences text={lead} clauses={false} />
        </p>
      )}
    </div>
  );
}
/** 구역 안 소제목 — 위 여백을 크게(mt-16/24) 두어 앞 덩어리와 갈라 보이게 하는 것이 역할의 절반 */
function SubHead({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead?: string }) {
  return (
    <div className="reveal mt-16 text-center md:mt-24">
      <p className="text-[12.5px] font-bold tracking-[0.12em] text-sun-600">{eyebrow}</p>
      <h3 className="mt-2 text-[1.4rem] font-extrabold leading-tight text-ink md:text-[1.7rem]">{title}</h3>
      {lead && (
        <p className="mx-auto mt-3 max-w-[660px] text-[15px] leading-[1.75] text-ink-soft">
          <Sentences text={lead} clauses={false} />
        </p>
      )}
    </div>
  );
}

/** 도해 — 3:2 상자에 통째로. 가장자리의 한글 라벨이 잘리지 않게 */
function Illust({ fig, className = '', sizes = '(max-width: 1024px) 100vw, 820px', priority = false }: { fig: Fig; className?: string; sizes?: string; priority?: boolean }) {
  return (
    <span className={`img-in relative block aspect-[3/2] overflow-hidden rounded-[24px] border border-hairline bg-white ${className}`}>
      <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes={sizes} priority={priority} className="object-contain" />
    </span>
  );
}

/** 두 열 비교표 — 항목 | A(옅게) | B(주황 강조). 절개식 vs 가이드, 기성 vs 맞춤 두 곳이 같은 표를 쓴다 */
function Compare({ columns, rows }: { columns: [string, string]; rows: Array<{ label: string; a: string; b: string }> }) {
  return (
    <div className="reveal mt-8 overflow-hidden rounded-[24px] border border-hairline">
      <div className="hidden grid-cols-[150px_1fr_1fr] bg-night text-white md:grid">
        <div className="px-5 py-4 text-[12.5px] font-bold tracking-[0.08em] text-white/55">항목</div>
        <div className="px-5 py-4 text-[15px] font-bold text-white/75">{columns[0]}</div>
        <div className="bg-sun-500 px-5 py-4 text-[15px] font-extrabold">{columns[1]}</div>
      </div>
      <dl>
        {rows.map((r, i) => (
          <div key={r.label} className={`grid md:grid-cols-[150px_1fr_1fr] ${i > 0 ? 'border-t border-hairline' : ''}`}>
            <dt className="bg-canvas px-5 pb-1 pt-4 text-[14px] font-extrabold text-ink md:py-5">{r.label}</dt>
            <dd className="px-5 pb-2 text-[14.5px] leading-[1.7] text-ink-muted md:py-5">
              <span className="mr-2 inline-block rounded-md bg-canvas px-1.5 py-0.5 text-[11.5px] font-bold text-ink-muted md:hidden">{columns[0]}</span>
              {r.a}
            </dd>
            <dd className="bg-sun-50/60 px-5 pb-4 pt-2 text-[14.5px] font-semibold leading-[1.7] text-ink md:py-5">
              <span className="mr-2 inline-block rounded-md bg-sun-500 px-1.5 py-0.5 text-[11.5px] font-bold text-white md:hidden">{columns[1]}</span>
              {r.b}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** 알아두실 점 상자 — 한계와 부작용을 먼저 말한다 */
function NoticeBox({ title, paragraphs, className = 'mt-8' }: { title: string; paragraphs: string[]; className?: string }) {
  return (
    <div className={`reveal rounded-2xl border border-sun-200 bg-sun-50/60 p-6 md:p-7 ${className}`}>
      <p className="text-[12.5px] font-bold tracking-[0.08em] text-sun-700">알아두실 점 · 한계와 부작용</p>
      <p className="mt-1.5 text-[1.05rem] font-extrabold text-ink">{title}</p>
      <Paras text={paragraphs} className="mt-2 text-[14.5px] leading-[1.8] text-ink-soft" />
    </div>
  );
}

const renderAccent = (line: string): ReactNode =>
  splitAccent(line).map((p, i) => (p.accent ? <span key={i} className="accent-sun">{p.text}</span> : <span key={i}>{p.text}</span>));

/** 단락 여러 개 — 줄바꿈 규칙(Sentences) 태워서 */
function Paras({ text, className = '' }: { text: string[]; className?: string }) {
  return (
    <>
      {text.map((t, i) => (
        <p key={i} className={`${i > 0 ? 'mt-4 ' : ''}${className}`}>
          <Sentences text={t} clauses={false} />
        </p>
      ))}
    </>
  );
}

/** 순서 카드 네 장 — 사진 + STEP + 제목 + 글 */
function StepCards({ steps }: { steps: Array<{ title: string; desc: string; fig: Fig }> }) {
  return (
    <ol className="reveal-stack mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="card relative flex flex-col overflow-hidden">
          <span className="relative block aspect-[16/9] overflow-hidden bg-canvas-2">
            <Image src={figSrc(s.fig.key)} alt={s.fig.alt} fill sizes="(max-width: 640px) 100vw, 260px" className={fitsBox(s.fig.key, 16, 9) ? 'object-cover' : '!object-contain p-2'} />
          </span>
          <span className="flex flex-1 flex-col p-5">
            <span className="text-[11.5px] font-extrabold tracking-[0.18em] text-sun-600">STEP {i + 1}</span>
            <span className="mt-1.5 block text-[1.05rem] font-extrabold text-ink">{s.title}</span>
            <span className="mt-2 block text-[14px] leading-[1.7] text-ink-soft">{s.desc}</span>
          </span>
          {i < steps.length - 1 && <span aria-hidden className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-[1.3rem] text-ink-muted lg:block">›</span>}
        </li>
      ))}
    </ol>
  );
}

/**
 * ★ 2026-09-29 원장 피드백 "맞춤 임플란트를 카테고리로 새로 추가" — 09-21 에 합쳤던 두 쪽을 다시 나눴다.
 *   화면(짜임·부품)은 이 파일 하나를 그대로 쓰고, part 로 내비게이션 / 맞춤 지대주 중 하나만 그린다.
 */
export function CustomImplantPage({ doc, part }: { doc: Doc; part: 'navigation' | 'custom' }) {
  const trail = [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }, { name: doc.title, path: doc.path }];
  const first = (s: string) => s.split(/(?<=다\.)\s/)[0];
  const HERO_BG = HERO_BG_OF[part];
  const heroSize = figSize(HERO_BG);
  const collage = HERO_COLLAGE[doc.path];
  const heroLines = collage.lines.map((l) => (l ? renderAccent(l) : undefined)) as [ReactNode, ReactNode?];

  const schema: unknown[] = [
    breadcrumbSchema(trail),
    medicalWebPageSchema({
      title: doc.title,
      description: doc.description,
      path: doc.path,
      image: { src: figSrc(HERO_BG), caption: doc.hero?.alt ?? doc.title, width: heroSize.w, height: heroSize.h },
      related: doc.related ?? [],
    }),
    imageObjectSchema({ path: doc.path, src: figSrc(HERO_BG), caption: doc.hero?.alt ?? doc.title, width: heroSize.w, height: heroSize.h }),
    articleSchema({ path: doc.path, title: doc.title, description: doc.description, wordCount: docCharCount(doc), hasImage: true, keywords: doc.keywords }),
  ];
  if (doc.faq?.length) schema.push(faqSchema(doc.faq, doc.path));

  /* 사이드바 안내 — 메뉴와 같은 임플란트 쪽들(허브 + 하위). 지금 쪽은 진하게 */
  const hubDoc = docByPath(doc.hub);
  const guides = [
    ...(hubDoc ? [{ label: '임플란트 안내', href: hubDoc.path }] : []),
    ...docsOfHub(doc.hub).map((d) => ({ label: d.title, href: d.path })),
  ];
  const related = (doc.related ?? []).map((p) => docByPath(p)).filter((d): d is Doc => Boolean(d));
  /* 사이드바 순서 카드 — 쪽에 맞는 과정 */
  const sideSteps = part === 'custom' ? { title: '맞춤 지대주 제작 순서', steps: CI_PROCESS.steps } : { title: '가이드 식립 순서', steps: NAVI_PROCESS.steps };
  const band =
    part === 'custom'
      ? { title: '내 잇몸에 맞는 지대주가 궁금하시다면', text: '검사 후 기성 지대주와 맞춤 지대주 가운데 어느 쪽이 알맞은지 설명해 드립니다. 네이버 예약이나 전화로 문의해 주세요.' }
      : { title: '가이드 식립이 가능한지, CBCT로 먼저 확인합니다', text: '골량과 신경관까지의 거리를 계측한 뒤, 무절개가 가능한지와 골이식이 필요한지를 화면으로 보여 드리며 설명합니다.' };

  return (
    <>
      <SiteHeader dark />
      <JsonLd data={schema} />
      <main id="main" className="bg-white">
        <HeroCollage
          trail={trail}
          eyebrow={doc.eyebrow}
          cardsLead={collage.cardsLead}
          lines={heroLines}
          lead={collage.lead ?? first(doc.summary)}
          long
          bg={HERO_BG}
          cards={collage.cards}
          items={part === 'custom' ? CI_HERO_ITEMS : NAVI_HERO_ITEMS}
        >
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.phoneHref} className="btn-ghost-dark">전화 {CLINIC.phone}</a>
          </div>
        </HeroCollage>

        <div className="wrap grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:pt-24 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ───────── 본문 ───────── */}
          <div className="min-w-0">
            {/* ══ 내비게이션 임플란트 쪽 ══ */}
            {part === 'navigation' && (
            <section id="navigation" className="scroll-mt-[96px]" aria-labelledby="ci-navi">
              <Head id="ci-navi" label="수술 계획" title={<>식립 위치는 수술 전에, <span className="accent-sun">CBCT 위에서 정합니다</span></>} lead="CBCT와 구강스캔 데이터를 겹쳐 모의 식립을 마치고, 그 계획을 옮긴 수술 가이드로 식립합니다. 계획과 식립은 대표원장이 직접 맡습니다." />
              <div className="reveal-stack mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <span className="img-in relative block aspect-[4/3] overflow-hidden rounded-[24px] bg-canvas-2">
                  <Image src={figSrc(NAVI_WHAT.fig.key)} alt={NAVI_WHAT.fig.alt} fill sizes="(max-width: 1024px) 100vw, 480px" className={fitsBox(NAVI_WHAT.fig.key, 4, 3) ? 'object-cover' : '!object-contain p-3'} />
                </span>
                <div className="card p-7 md:p-8">
                  <h3 className="text-[1.15rem] font-extrabold text-ink">{NAVI_WHAT.title}</h3>
                  <div className="mt-3">
                    <Paras text={NAVI_WHAT.paragraphs} className="text-[15px] leading-[1.85] text-ink-soft" />
                  </div>
                </div>
              </div>

              {/* 임플란트 구조 — 도해 + 세 부분(픽스처 칸을 주황으로: 가이드 식립이 정하는 것) */}
              <SubHead eyebrow="임플란트의 구조" title={<>임플란트의 구조와 <span className="accent-sun">가이드 식립이 정하는 것</span></>} lead={NAVI_STRUCTURE.lead} />
              <div className="reveal-stack mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
                <Illust fig={NAVI_STRUCTURE.fig} sizes="(max-width: 1024px) 100vw, 520px" />
                <ol className="space-y-3">
                  {NAVI_STRUCTURE.parts.map((p, i) => {
                    const key = i === NAVI_STRUCTURE.parts.length - 1;
                    return (
                      <li key={p.title} className={`flex gap-4 rounded-2xl border p-5 ${key ? 'border-sun-300 bg-sun-50/70' : 'border-hairline bg-white'}`}>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${key ? 'bg-sun-500 text-white' : 'bg-night text-white'}`}>{String(i + 1).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="block text-[1.05rem] font-extrabold text-ink">{p.title}</span>
                          <span className="mt-1 block text-[14.5px] leading-[1.7] text-ink-soft">{p.desc}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <SubHead eyebrow="우리 방식" title={<>광화문 선치과 <span className="accent-sun">가이드 식립의 기준</span></>} />
              <ul className="reveal-stack mt-8 grid gap-4 md:grid-cols-2">
                {NAVI_BENEFITS.items.map((b, i) => (
                  <li key={b.title} className="card flex gap-4 p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block text-[1.05rem] font-extrabold text-ink">{b.title}</span>
                      <span className="mt-1.5 block text-[14.5px] leading-[1.7] text-ink-soft">{b.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* 수술 가이드 원리 — 넓은 도해 + 세 가지 */}
              <SubHead eyebrow="수술 가이드" title={<>수술 가이드는 <span className="accent-sun">이렇게 계획을 옮깁니다</span></>} lead={NAVI_GUIDE.lead} />
              <div className="reveal mt-8">
                <Illust fig={NAVI_GUIDE.fig} />
              </div>
              <ol className="reveal-stack mt-5 grid gap-4 md:grid-cols-3">
                {NAVI_GUIDE.points.map((p, i) => (
                  <li key={p.title} className="rounded-2xl bg-canvas p-5">
                    <span className="text-[12px] font-extrabold tracking-[0.12em] text-sun-600">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mt-1.5 block text-[1.02rem] font-extrabold text-ink">{p.title}</span>
                    <span className="mt-1.5 block text-[14px] leading-[1.7] text-ink-soft">{p.desc}</span>
                  </li>
                ))}
              </ol>

              <SubHead eyebrow="진행 순서" title={<>내비게이션 임플란트 <span className="accent-sun">진행 순서</span></>} lead={NAVI_PROCESS.lead} />
              <StepCards steps={NAVI_PROCESS.steps.map((s) => ({ title: s.title, desc: s.desc, fig: s.figure }))} />

              <SubHead eyebrow="방식 비교" title={<>절개식 식립과 <span className="accent-sun">가이드 식립의 차이</span></>} />
              <Compare columns={NAVI_COMPARE.columns} rows={NAVI_COMPARE.rows} />
              <p className="reveal mt-4 text-[14px] leading-[1.7] text-ink-muted">※ {NAVI_COMPARE.note}</p>

              <SubHead eyebrow="장비와 위생" title={<>{NAVI_SYSTEM.title}</>} />
              <ul className="reveal-stack mt-8 grid gap-4 md:grid-cols-2">
                {NAVI_SYSTEM.items.map((s, i) => (
                  <li key={s.title} className="rounded-2xl bg-night p-6 text-white md:p-7">
                    <span className="text-[11.5px] font-extrabold tracking-[0.18em] text-sun-300">0{i + 1}</span>
                    <span className="mt-2 block text-[1.1rem] font-extrabold">{s.title}</span>
                    <span className="mt-2 block text-[14.5px] leading-[1.75] text-white/70">{s.desc}</span>
                  </li>
                ))}
              </ul>
              <NoticeBox title={NAVI_NOTICE.title} paragraphs={NAVI_NOTICE.paragraphs} className="mt-6" />
            </section>
            )}

            {/* ══ 맞춤 임플란트 쪽 ══ */}
            {part === 'custom' && (<>
            {/* ── 1. 커스텀 어버트먼트란(로이스 S2) → 세 부분 ── */}
            <section id="what" className="scroll-mt-[96px]" aria-labelledby="ci-what">
              <Head id="ci-what" label="정의" title={<>맞춤 지대주, <span className="accent-sun">커스텀 어버트먼트</span>란</>} />
              <div className="reveal-stack mt-12 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
                <Illust fig={CI_ABUTMENT.fig} sizes="(max-width: 1024px) 100vw, 520px" priority />
                <div className="card p-7 md:p-8">
                  <Paras text={CI_ABUTMENT.paragraphs} className="text-[15px] leading-[1.85] text-ink-soft" />
                </div>
              </div>

              <SubHead eyebrow="임플란트의 세 부분" title={<>임플란트는 세 부분, <span className="accent-sun">맞춤은 지대주가 다릅니다</span></>} lead={CI_PARTS.lead} />
              {/* 세 부분 — 어두운 상자 한 개에 세 칸. 가운데 '지대주' 칸을 주황으로 짚는다 */}
              <div className="reveal mt-8 rounded-[28px] bg-night p-7 text-white md:p-10">
                <p className="text-[12.5px] font-bold tracking-[0.12em] text-sun-300">픽스처 · 지대주 · 크라운</p>
                <ol className="mt-5 grid gap-5 sm:grid-cols-3">
                  {CI_PARTS.parts.map((p) => (
                    <li key={p.n} className={`rounded-2xl border p-5 ${p.n === '02' ? 'border-sun-500/70 bg-sun-500/10' : 'border-white/12 bg-white/[0.04]'}`}>
                      <span className={`block text-[13px] font-extrabold tracking-[0.18em] ${p.n === '02' ? 'text-sun-300' : 'text-white/55'}`}>{p.n}</span>
                      <span className="mt-1.5 block text-[1.1rem] font-bold">{p.title}</span>
                      {/* 세 칸짜리 좁은 카드 — 마디 줄바꿈을 태우면 두세 낱말짜리 줄이 생겨 그냥 흐르게 둔다 */}
                      <span className="mt-2 block text-[14.5px] leading-[1.7] text-white/70">{p.desc}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="reveal mx-auto mt-8 max-w-[720px] text-center text-[15px] leading-[1.8] text-ink-soft">
                <Sentences text={CI_PARTS.after} clauses={false} />
              </p>
            </section>

            {/* ── 2. 장점 6(로이스 S3 + 파손) → 잇몸이 감싸는 경계(도해) ── */}
            <section id="benefits" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-benefits">
              <Head id="ci-benefits" label="장점" title={<>맞춤 임플란트의 <span className="accent-sun">장점</span></>} lead={CI_BENEFITS.lead} />
              <ul className="reveal-stack mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CI_BENEFITS.items.map((b, i) => (
                  <li key={b.title} className="card p-6">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 text-[1.05rem] font-extrabold leading-snug text-ink">{b.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">{b.desc}</p>
                  </li>
                ))}
              </ul>

              {/* 잇몸 경계 — 짙은 남색 도해와 같은 결의 어두운 판 */}
              <div className="reveal mt-10 overflow-hidden rounded-[28px] bg-night text-white">
                <div className="grid lg:grid-cols-[1.1fr_1fr]">
                  <span className="relative block aspect-[3/2] lg:aspect-auto lg:min-h-[340px]">
                    <Image src={figSrc(CI_BENEFITS.seal.fig.key)} alt={CI_BENEFITS.seal.fig.alt} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
                  </span>
                  <div className="p-7 md:p-9">
                    <p className="text-[12.5px] font-bold tracking-[0.12em] text-sun-300">잇몸 경계 · 위생</p>
                    <h3 className="mt-2 text-[1.3rem] font-extrabold leading-snug">{CI_BENEFITS.seal.title}</h3>
                    <Paras text={CI_BENEFITS.seal.paragraphs} className="mt-3 text-[14.5px] leading-[1.8] text-white/75" />
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. 비교(로이스 S5) — 넓은 도해 + 표 ── */}
            <section id="compare" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-compare">
              <Head id="ci-compare" label="비교" title={<>맞춤 지대주와 기성 지대주, <span className="accent-sun">무엇이 다른가</span></>} lead={CI_COMPARE.lead} />
              <figure className="reveal mt-10">
                <Illust fig={CI_COMPARE.fig} />
                <figcaption className="mt-4 grid gap-3 md:grid-cols-2">
                  {CI_COMPARE.legend.map((l, i) => (
                    <span key={l.side} className={`flex gap-3 rounded-2xl p-4 ${i === 0 ? 'bg-canvas' : 'bg-sun-50/70'}`}>
                      <span className={`h-fit shrink-0 rounded-md px-2 py-0.5 text-[12px] font-extrabold ${i === 0 ? 'bg-white text-ink-muted' : 'bg-sun-500 text-white'}`}>{l.side}</span>
                      <span className="text-[14px] leading-[1.7] text-ink-soft">{l.text}</span>
                    </span>
                  ))}
                </figcaption>
              </figure>
              <Compare columns={CI_COMPARE.columns} rows={CI_COMPARE.rows} />
              <p className="reveal mt-4 text-[14px] leading-[1.7] text-ink-muted">※ {CI_COMPARE.note}</p>
            </section>

            {/* ── 4. 디지털 제작(로이스 S4) → 과정 4 → 설계에서 확인하는 것 4 ── */}
            <section id="digital" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-digital">
              <Head id="ci-digital" label="제작 과정" title={<>보철 제작도 <span className="accent-sun">디지털 데이터로</span> 설계합니다</>} lead={CI_DIGITAL.lead} />
              {/* 장비 흐름 한 줄 — 스캐너 › CAD › CAM = 완성 */}
              <div className="reveal mt-10 rounded-[24px] border border-hairline bg-canvas p-5 md:p-6">
                <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
                  <ol className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    {CI_DIGITAL.chain.map((c, i) => (
                      <li key={c} className="flex flex-1 items-center gap-2">
                        <span className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[15px] font-extrabold text-ink shadow-[var(--shadow-soft)]">
                          <span className="text-[12px] font-extrabold tracking-[0.12em] text-sun-500">0{i + 1}</span>
                          {c}
                        </span>
                        {i < CI_DIGITAL.chain.length - 1 && <span aria-hidden className="hidden text-[1.3rem] text-ink-muted sm:block">›</span>}
                      </li>
                    ))}
                  </ol>
                  <span aria-hidden className="hidden text-[1.5rem] font-light text-ink-muted lg:block">=</span>
                  <span className="flex h-[52px] items-center justify-center rounded-xl bg-night px-6 text-[15px] font-extrabold text-white lg:min-w-[240px]">
                    <span className="mr-2 text-sun-300">✓</span>{CI_DIGITAL.result}
                  </span>
                </div>
                <p className="mt-4 text-center text-[13.5px] text-ink-muted">{CI_DIGITAL.note}</p>
              </div>

              <SubHead eyebrow="제작 순서" title={<>맞춤 지대주 <span className="accent-sun">제작 과정</span></>} lead={CI_PROCESS.lead} />
              <StepCards steps={CI_PROCESS.steps} />

              {/* 전문성 — 재료·이머전스 프로파일·각도·경계선 */}
              <SubHead eyebrow="설계 기준" title={<>맞춤 지대주를 설계할 때 <span className="accent-sun">확인하는 네 가지</span></>} lead={CI_DESIGN.lead} />
              <ul className="reveal-stack mt-8 grid gap-4 md:grid-cols-2">
                {CI_DESIGN.items.map((d, i) => (
                  <li key={d.title} className="card p-6 md:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="rounded-full bg-sun-50 px-3 py-1 text-[12px] font-bold text-sun-700">{d.tag}</span>
                    </div>
                    <h3 className="mt-3 text-[1.1rem] font-extrabold text-ink">{d.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">
                      <Sentences text={d.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── 5. 중요한 이유(로이스 S6) + 치료받을 경우(로이스 S7, 반반 도해) ── */}
            <section id="why" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-why">
              <Head id="ci-why" label="중요한 이유" title={<>맞춤 임플란트가 <span className="accent-sun">중요한 이유</span></>} />
              {/* 어두운 한 판 — 사진(왼쪽) · 번호 세 줄(오른쪽) · 아래 상담 띠 */}
              <div className="reveal mt-12 overflow-hidden rounded-[28px] bg-night text-white">
                <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
                  <span className="relative block min-h-[260px] lg:min-h-0">
                    <Image src={figSrc(CI_WHY.fig.key)} alt={CI_WHY.fig.alt} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-night" />
                  </span>
                  <ol className="p-7 md:p-10">
                    {CI_WHY.points.map((p, i) => (
                      <li key={p.title} className={`grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[88px_1fr] ${i > 0 ? 'border-t border-white/12' : ''}`}>
                        <span className="text-[2.6rem] font-extralight leading-none tracking-[-0.04em] text-sun-300" aria-hidden>0{i + 1}</span>
                        <span className="min-w-0">
                          <span className="block text-[12.5px] font-bold tracking-[0.08em] text-white/50">{p.label}</span>
                          <span className="mt-1 block text-[1.15rem] font-extrabold">{p.title}</span>
                          <span className="mt-1.5 block text-[14.5px] leading-[1.75] text-white/70">{p.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                {/* 상담 한 줄 + 단추 */}
                <div className="flex flex-col items-start gap-4 border-t border-white/12 bg-white/[0.04] px-7 py-6 md:flex-row md:items-center md:justify-between md:px-10">
                  <p className="text-[15.5px] font-semibold leading-[1.7] text-white/90">
                    <Sentences text={CI_WHY.cta} clauses={false} />
                  </p>
                  <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun shrink-0">네이버 예약</a>
                </div>
              </div>

              {/* 기성이라면 → 맞춤이라면 — 반반 단면 도해를 크게 먼저 */}
              <SubHead eyebrow="치료받을 경우" title={<>맞춤 지대주로 <span className="accent-sun">치료받을 경우</span></>} />
              <figure className="reveal mt-8">
                <Illust fig={CI_IF_CUSTOM.fig} />
                <figcaption className="mx-auto mt-3 max-w-[680px] text-center text-[13.5px] leading-[1.7] text-ink-muted">
                  <Sentences text={CI_IF_CUSTOM.caption} clauses={false} />
                </figcaption>
              </figure>
              <div className="reveal card mt-8 overflow-hidden">
                <div className="relative grid md:grid-cols-2">
                  <div className="bg-canvas p-7 md:p-9">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-extrabold tracking-[0.06em] text-ink-muted">{CI_IF_CUSTOM.stock.label}</span>
                    <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
                      <Sentences text={CI_IF_CUSTOM.stock.desc} clauses={false} />
                    </p>
                  </div>
                  <div className="bg-night p-7 text-white md:p-9">
                    <span className="inline-flex rounded-full bg-sun-500 px-3 py-1 text-[12px] font-extrabold tracking-[0.06em] text-white">{CI_IF_CUSTOM.custom.label}</span>
                    <p className="mt-4 text-[15px] leading-[1.8] text-white/85">
                      <Sentences text={CI_IF_CUSTOM.custom.desc} clauses={false} />
                    </p>
                  </div>
                  <span aria-hidden className="absolute left-1/2 top-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-sun-500 text-[1.2rem] font-extrabold text-white md:flex">›</span>
                </div>
                <ul className="grid gap-4 p-6 sm:grid-cols-3 md:p-7">
                  {CI_IF_CUSTOM.results.map((r, i) => (
                    <li key={r.title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12.5px] font-extrabold text-brand-700">0{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-semibold text-ink-muted">{r.desc}</span>
                        <span className="block text-[15px] font-extrabold text-ink">{r.title}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-hairline px-6 py-3 text-[13px] text-ink-muted md:px-7">※ {CI_IF_CUSTOM.note}</p>
              </div>
            </section>

            {/* ── 6. 권하는 경우 4 → 주위염 → 알아두실 점 ── */}
            <section id="when" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-when">
              <Head id="ci-when" label="권하는 경우" title={<>맞춤 지대주를 <span className="accent-sun">권하는 경우</span></>} lead={CI_WHEN.lead} />
              <ul className="reveal-stack mt-12 grid gap-4 md:grid-cols-2">
                {CI_WHEN.items.map((w, i) => (
                  <li key={w.title} className="card flex gap-4 p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block text-[1.05rem] font-extrabold text-ink">{w.title}</span>
                      <span className="mt-1.5 block text-[14.5px] leading-[1.7] text-ink-soft">{w.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* 주위염 — 진행 3단계(왼쪽) · 신호 4 + 관리 3(오른쪽) */}
              <SubHead eyebrow="치료 후 관리" title={<>임플란트 <span className="accent-sun">주위염</span></>} />
              <p className="reveal mx-auto mt-4 max-w-[660px] text-center text-[15px] leading-[1.75] text-ink-soft">
                <Sentences text={CI_PERI.lead} clauses={false} />
              </p>
              <div className="reveal card mt-8 grid gap-8 p-7 md:grid-cols-2 md:gap-10 md:p-9">
                <div>
                  <p className="text-[12.5px] font-extrabold tracking-[0.06em] text-brand-700">이렇게 진행됩니다</p>
                  <ol className="mt-3">
                    {CI_PERI.stages.map((s, i) => (
                      <li key={s.title} className="relative flex gap-4 pb-5 last:pb-0">
                        {i < CI_PERI.stages.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-hairline" />}
                        <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-extrabold ${i === CI_PERI.stages.length - 1 ? 'bg-sun-500 text-white' : 'bg-night text-white'}`}>{i + 1}</span>
                        <span className="min-w-0 pt-1">
                          <span className="block text-[15px] font-extrabold text-ink">{s.title}</span>
                          <span className="mt-0.5 block text-[14px] leading-[1.65] text-ink-soft">{s.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 rounded-xl bg-sun-50/70 px-4 py-3 text-[14px] leading-[1.7] text-ink">
                    <Sentences text={CI_PERI.prevent} clauses={false} />
                  </p>
                </div>
                <div className="border-t border-hairline pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                  <p className="text-[12.5px] font-extrabold tracking-[0.06em] text-brand-700">이런 신호가 있으면 미루지 마세요</p>
                  <ul className="mt-2 space-y-2">
                    {CI_PERI.signs.map((s) => (
                      <li key={s} className="flex gap-2 text-[14px] leading-[1.6] text-ink-soft">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" aria-hidden />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[12.5px] font-extrabold tracking-[0.06em] text-brand-700">오래 쓰는 관리</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {CI_PERI.care.map((c) => (
                      <li key={c} className="rounded-xl bg-brand-50 px-3 py-2 text-[13px] font-semibold leading-snug text-brand-700">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <NoticeBox title={CI_NOTICE.title} paragraphs={CI_NOTICE.paragraphs} />
            </section>
            </>)}

            {/* ── FAQ — 화면 = FAQPage 스키마 ── */}
            {doc.faq && doc.faq.length > 0 && (
              <section className="pt-24 md:pt-32" aria-labelledby="ci-faq" id="faq-section">
                <Head id="ci-faq" label="자주 묻는 질문" title={<>{doc.title}, <span className="accent-sun">자주 묻는 질문</span></>} />
                <div className="reveal mt-10 rounded-[28px] border border-hairline bg-canvas p-5 md:p-10">
                  <FaqList items={doc.faq} />
                </div>
              </section>
            )}

            {/* ── 관련 임플란트 쪽 카드 — 본문 맨 끝(FAQ 뒤) ── */}
            {related.length > 0 && (
              <section className="pt-20 md:pt-28" aria-labelledby="ci-related">
                <Head id="ci-related" label="다른 임플란트 진료" title={<>함께 보면 좋은 <span className="accent-sun">임플란트 안내</span></>} />
                <ul className="reveal-stack mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((c) => (
                    <li key={c.path}>
                      <Link href={c.path} className="card card-hover flex h-full flex-col overflow-hidden">
                        <span className="relative block aspect-[4/3] overflow-hidden bg-canvas-2">
                          <Image src={figSrc(REL_FIG[c.path] ?? c.hero?.key ?? 'orig/implant-hero')} alt={c.hero?.alt ?? c.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                        </span>
                        <span className="flex flex-1 flex-col p-5">
                          <span className="text-[12px] font-bold tracking-[0.08em] text-sun-600">{c.eyebrow}</span>
                          <span className="mt-2 text-[1.05rem] font-extrabold text-ink">{c.title}</span>
                          <span className="mt-2 text-[13.5px] leading-[1.65] text-ink-soft">{first(c.summary)}</span>
                          <span className="mt-auto pt-4 text-[13px] font-bold text-brand-700">자세히 보기 ›</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ───────── 사이드바 ───────── */}
          <aside className="space-y-6 lg:self-start" aria-label="임플란트 진료 안내">
            <DoctorCard />

            <div className="card p-5">
              <p className="text-[1.15rem] font-extrabold text-ink">임플란트 <span className="text-sun-500">안내</span></p>
              <ul className="mt-3 divide-y divide-hairline">
                {guides.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      aria-current={g.href === doc.path ? 'page' : undefined}
                      className={`flex items-center justify-between gap-3 py-2.5 text-[14.5px] font-semibold hover:text-brand-700 ${g.href === doc.path ? 'text-brand-700' : 'text-ink-soft'}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {g.href === doc.path && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />}
                        <span className="truncate">{g.label}</span>
                      </span>
                      <span aria-hidden className="text-ink-muted">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-night p-5 text-white">
              <p className="text-[1.1rem] font-extrabold">{sideSteps.title}</p>
              <ol className="mt-4 space-y-4">
                {sideSteps.steps.map((p, i) => (
                  <li key={p.title} className="flex items-start gap-4">
                    <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-sun-500 text-[14px] font-extrabold">{String(i + 1).padStart(2, '0')}</span>
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
                  <a href="#faq-section" className="text-[12.5px] font-semibold text-ink-muted hover:text-brand-700">전체 보기 ›</a>
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
          <ContactBand bg="ai/wide-implant" title={band.title} text={band.text} />
        </div>
        <MedicalNotice />
      </main>
    </>
  );
}
