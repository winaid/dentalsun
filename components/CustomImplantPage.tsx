import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { ContactBand, FaqList, MedicalNotice, Sentences } from '@/components/ui';
import { ContactCard, DoctorCard } from '@/components/SideRail';
import { docCharCount, figSize, figSrc, fitsBox, type Doc } from '@/lib/docs';
import { docByPath, docsOfHub } from '@/lib/content';
import { HERO_COLLAGE, splitAccent } from '@/lib/heroCollage';
import {
  CI_ABUTMENT,
  CI_BENEFITS,
  CI_COMPARE,
  CI_DESIGN,
  CI_DIGITAL,
  CI_GLANCE,
  CI_HERO_ITEMS,
  CI_IF_CUSTOM,
  CI_NOTICE,
  CI_PARTS,
  CI_PERI,
  CI_PROCESS,
  CI_WHEN,
  CI_WHY,
} from '@/lib/content/customImplantLanding';
import { articleSchema, breadcrumbSchema, faqSchema, imageObjectSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC } from '@/lib/clinic';

/**
 * 맞춤 임플란트(커스텀 어버트먼트) 전용 화면 (2026-09-21, 오너 "턱관절 했듯이 내용 몰리지 않게 나누고 깔끔하게").
 *  DocPage 의 글·사진 번갈아 놓기 대신 턱관절 화면과 같은 짜임 — 구역마다 큰 머리(Head), 덩어리마다 소제목(SubHead)+큰 여백.
 *  구역: 세 부분 → 커스텀 어버트먼트란 → 장점 6 → 한눈에 6 → 비교표 → 디지털 제작·과정 4·디자인 4 → 왜 중요한가·시술 받을 경우 →
 *        권하는 경우 4 → 주위염 → FAQ → 관련 임플란트 쪽 카드(맨 끝 — 다른 쪽으로 보내는 카드는 다 읽은 뒤에, 오너).
 *  데이터는 lib/content/customImplantLanding — Doc.blocks·faq 도 거기서 만들어 스키마·llms.txt 와 화면이 같은 자료를 쓴다.
 *  ★ 페이지 안 구역 이동 목차(점프 메뉴)는 두지 않는다(오너 지시). 사이드바 안내는 임플란트 **쪽** 링크다.
 *  ★ 같은 사진 반복 금지(오너) — 첫 화면 배경 ai/implant-custom·카드 3장(implant/custom·custom-fit·custom-stock)은 본문에 다시 쓰지 않는다.
 */
const HERO_BG = 'ai/implant-custom';

/** 관련 쪽 카드 사진 — DocPage 의 DOC_AI 와 같은 사진(쪽마다 다른 사진) */
const REL_FIG: Record<string, string> = {
  '/treatment/implant': 'orig/implant-hero',
  '/treatment/implant/navigation': 'orig/misc-nav-implant-set',
  '/treatment/implant/full-arch': 'orig/implant-fa-fixed',
  '/treatment/implant/uv': 'ai/implant-uv',
  '/treatment/implant/prf': 'ai/implant-prf',
  '/treatment/implant/warranty': 'ai/implant-warranty',
};

/** 구역 머리 — 가운데 큰 글자(3·6·VS·FAQ) + 제목 + 한 줄 (턱관절 화면과 같은 꼴) */
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
/** 구역 안 소제목 — 위 여백을 크게(mt-16/24) 두어 앞 덩어리와 갈라 보이게 하는 것이 역할의 절반 */
function SubHead({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead?: string }) {
  return (
    <div className="reveal mt-16 text-center md:mt-24">
      <p className="text-[12px] font-bold tracking-[0.2em] text-sun-600">{eyebrow}</p>
      <h3 className="mt-2 text-[1.4rem] font-extrabold leading-tight text-ink md:text-[1.7rem]">{title}</h3>
      {lead && (
        <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-[1.75] text-ink-soft">
          <Sentences text={lead} clauses={false} />
        </p>
      )}
    </div>
  );
}
const Big = ({ children, unit }: { children: ReactNode; unit?: string }) => (
  <p className="tmj-big" aria-hidden>
    {children}
    {unit && <span className="ml-1 align-baseline text-[1.6rem] font-bold tracking-normal text-ink md:text-[2rem]">{unit}</span>}
  </p>
);
const Word = ({ children }: { children: ReactNode }) => (
  <span className="tmj-big !text-[2.4rem] md:!text-[3.4rem]" aria-hidden>{children}</span>
);

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

export function CustomImplantPage({ doc }: { doc: Doc }) {
  const trail = [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }, { name: doc.title, path: doc.path }];
  const first = (s: string) => s.split(/(?<=다\.)\s/)[0];
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

  /* 사이드바 안내 — 메뉴와 같은 임플란트 일곱 쪽(허브 + 하위 6). 지금 쪽은 진하게 */
  const hubDoc = docByPath(doc.hub);
  const guides = [
    ...(hubDoc ? [{ label: '임플란트 안내', href: hubDoc.path }] : []),
    ...docsOfHub(doc.hub).map((d) => ({ label: d.title, href: d.path })),
  ];
  const related = (doc.related ?? []).map((p) => docByPath(p)).filter((d): d is Doc => Boolean(d));

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
          items={CI_HERO_ITEMS}
        >
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="btn-ghost-dark">톡톡 상담</a>
          </div>
        </HeroCollage>

        <div className="wrap grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:pt-24 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ───────── 본문 ───────── */}
          <div className="min-w-0">
            {/* ── 1. 세 부분 — 맞춤이 바꾸는 것은 기둥 ── */}
            <section id="what" className="scroll-mt-[96px]" aria-labelledby="ci-what">
              <Head id="ci-what" big={<Big unit="부분">3</Big>} title={<>임플란트는 세 부분,<br /><span className="accent-sun">맞춤은 기둥</span>이 다릅니다</>} lead={CI_PARTS.lead} />
              {/* 세 부분 — 어두운 상자 한 개에 세 칸(턱관절 3대 증상과 같은 꼴). 가운데 '기둥' 칸을 주황으로 짚는다 */}
              <div className="reveal mt-12 rounded-[28px] bg-night p-7 text-white md:p-10">
                <p className="text-[12px] font-bold tracking-[0.2em] text-sun-300">3 PARTS OF AN IMPLANT</p>
                <ol className="mt-5 grid gap-5 sm:grid-cols-3">
                  {CI_PARTS.parts.map((p) => (
                    <li key={p.n} className={`rounded-2xl border p-5 ${p.n === '02' ? 'border-sun-500/70 bg-sun-500/10' : 'border-white/12 bg-white/[0.04]'}`}>
                      <span className={`block text-[13px] font-extrabold tracking-[0.18em] ${p.n === '02' ? 'text-sun-300' : 'text-white/55'}`}>{p.n}</span>
                      <span className="mt-1.5 block text-[1.1rem] font-bold">{p.title}</span>
                      {/* 세 칸짜리 좁은 카드 — 마디 줄바꿈을 태우면 두세 낱말짜리 줄이 생겨 그냥 흐르게 둔다(생활습관 카드와 같은 원칙) */}
                      <span className="mt-2 block text-[14.5px] leading-[1.7] text-white/70">{p.desc}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="reveal mx-auto mt-8 max-w-[720px] text-center text-[15px] leading-[1.8] text-ink-soft">
                <Sentences text={CI_PARTS.after} clauses={false} />
              </p>

              {/* ── 커스텀 어버트먼트란? — 사진 왼쪽 · 글 오른쪽 ── */}
              <SubHead eyebrow="CUSTOM ABUTMENT" title={<>커스텀 <span className="accent-sun">어버트먼트</span>란?</>} />
              <div className="reveal-stack mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <span className="img-in relative block aspect-[4/3] overflow-hidden rounded-[24px] bg-canvas-2">
                  <Image src={figSrc(CI_ABUTMENT.fig.key)} alt={CI_ABUTMENT.fig.alt} fill sizes="(max-width: 1024px) 100vw, 480px" className={fitsBox(CI_ABUTMENT.fig.key, 4, 3) ? 'object-cover' : '!object-contain p-3'} />
                </span>
                <div className="card p-7 md:p-8">
                  <Paras text={CI_ABUTMENT.paragraphs} className="text-[15px] leading-[1.85] text-ink-soft" />
                </div>
              </div>
            </section>

            {/* ── 2. 장점 6 + 한눈에 6 ── */}
            <section id="benefits" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-benefits">
              <Head id="ci-benefits" big={<Big unit="가지">6</Big>} title={<>맞춤 임플란트의<br /><span className="accent-sun">여섯 가지 장점</span></>} lead={CI_BENEFITS.lead} />
              <ul className="reveal-stack mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CI_BENEFITS.items.map((b, i) => (
                  <li key={b.title} className="card card-3d p-6">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 text-[1.05rem] font-extrabold leading-snug text-ink">{b.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">{b.desc}</p>
                  </li>
                ))}
              </ul>

              {/* 한눈에 — 짧은 여섯 줄. 위 카드와 같은 내용을 한 줄씩 다시 보여 주는 요약이라 가벼운 줄 목록으로 */}
              <SubHead eyebrow="AT A GLANCE" title={<>{CI_GLANCE.title}</>} lead="한눈에 보는 여섯 가지입니다." />
              <ol className="reveal mt-8 grid gap-x-8 rounded-[24px] border border-hairline bg-canvas p-6 sm:grid-cols-2 md:p-8">
                {CI_GLANCE.items.map((g, i) => (
                  <li key={g.title} className="flex items-start gap-4 border-b border-hairline py-3.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-night text-[12.5px] font-extrabold text-white">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-extrabold text-ink">{g.title}</span>
                      <span className="mt-0.5 block text-[14px] leading-[1.65] text-ink-soft">{g.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── 3. 비교표 — 왼쪽 기성(옅게) · 오른쪽 커스텀(강조) ── */}
            <section id="compare" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-compare">
              <Head id="ci-compare" big={<Word>VS</Word>} title={<>커스텀 어버트먼트 <span className="accent-sun">VS</span> 기성 어버트먼트</>} lead={CI_COMPARE.lead} />
              <div className="reveal mt-12 overflow-hidden rounded-[24px] border border-hairline">
                <div className="hidden grid-cols-[150px_1fr_1fr] bg-night text-white md:grid">
                  <div className="px-5 py-4 text-[12px] font-bold tracking-[0.16em] text-white/55">항목</div>
                  <div className="px-5 py-4 text-[15px] font-bold text-white/75">{CI_COMPARE.columns[0]}</div>
                  <div className="bg-sun-500 px-5 py-4 text-[15px] font-extrabold">{CI_COMPARE.columns[1]}</div>
                </div>
                <dl>
                  {CI_COMPARE.rows.map((r, i) => (
                    <div key={r.label} className={`grid md:grid-cols-[150px_1fr_1fr] ${i > 0 ? 'border-t border-hairline' : ''}`}>
                      <dt className="bg-canvas px-5 pb-1 pt-4 text-[14px] font-extrabold text-ink md:py-5">{r.label}</dt>
                      <dd className="px-5 pb-2 text-[14.5px] leading-[1.7] text-ink-muted md:py-5">
                        <span className="mr-2 inline-block rounded-md bg-canvas px-1.5 py-0.5 text-[11.5px] font-bold text-ink-muted md:hidden">{CI_COMPARE.columns[0]}</span>
                        {r.a}
                      </dd>
                      <dd className="bg-sun-50/60 px-5 pb-4 pt-2 text-[14.5px] font-semibold leading-[1.7] text-ink md:py-5">
                        <span className="mr-2 inline-block rounded-md bg-sun-500 px-1.5 py-0.5 text-[11.5px] font-bold text-white md:hidden">{CI_COMPARE.columns[1]}</span>
                        {r.b}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* ── 4. 디지털 제작 → 과정 4 → 디자인에서 살피는 것 4 ── */}
            <section id="digital" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-digital">
              <Head id="ci-digital" big={<Word>CAD / CAM</Word>} title={<>보철물 제작도 <span className="accent-sun">디지털로</span> 정밀하게</>} lead={CI_DIGITAL.lead} />
              {/* 장비 흐름 한 줄 — 스캐너 › CAD › 프린터 = 수술 당일 임시 보철 (두 단락 띠는 오너 "너무 안 보이고 문구 많고") */}
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

              <SubHead eyebrow="PROCESS · 4 STEPS" title={<>맞춤 기둥이 <span className="accent-sun">만들어지는 과정</span></>} />
              <ol className="reveal-stack mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CI_PROCESS.steps.map((s, i) => (
                  <li key={s.title} className="card relative flex flex-col overflow-hidden">
                    <span className="relative block aspect-[16/9] overflow-hidden bg-canvas-2">
                      <Image src={figSrc(s.fig.key)} alt={s.fig.alt} fill sizes="(max-width: 640px) 100vw, 260px" className={fitsBox(s.fig.key, 16, 9) ? 'object-cover' : '!object-contain p-2'} />
                    </span>
                    <span className="flex flex-1 flex-col p-5">
                      <span className="text-[11.5px] font-extrabold tracking-[0.18em] text-sun-600">STEP {i + 1}</span>
                      <span className="mt-1.5 block text-[1.05rem] font-extrabold text-ink">{s.title}</span>
                      <span className="mt-2 block text-[14px] leading-[1.7] text-ink-soft">{s.desc}</span>
                    </span>
                    {i < CI_PROCESS.steps.length - 1 && <span aria-hidden className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-[1.3rem] text-ink-muted lg:block">›</span>}
                  </li>
                ))}
              </ol>

              {/* 전문성 — 재료·잇몸 곡선·각도·경계선. 라벨 칩 + 제목 + 글 */}
              <SubHead eyebrow="DESIGN" title={<>맞춤 기둥을 디자인할 때 <span className="accent-sun">살피는 네 가지</span></>} lead={CI_DESIGN.lead} />
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

            {/* ── 5. 왜 중요할까요 + 시술 받을 경우 ── */}
            <section id="why" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-why">
              <Head id="ci-why" big={<Word>WHY</Word>} title={<>맞춤 임플란트, <span className="accent-sun">왜 중요할까요</span>?</>} />
              {/* 어두운 한 판 — 사진(왼쪽) · 큰 숫자 세 줄(오른쪽) · 아래 상담 띠. 세 부분 상자와 같은 결 (라벨 상자 세 줄은 오너 "너무 별론데") */}
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
                          <span className="block text-[12px] font-bold tracking-[0.16em] text-white/50">{p.label}</span>
                          <span className="mt-1 block text-[1.15rem] font-extrabold">{p.title}</span>
                          <span className="mt-1.5 block text-[14.5px] leading-[1.75] text-white/70">{p.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                {/* 상담 한 줄 + 단추 — 참고 두 쪽의 마지막 문장 */}
                <div className="flex flex-col items-start gap-4 border-t border-white/12 bg-white/[0.04] px-7 py-6 md:flex-row md:items-center md:justify-between md:px-10">
                  <p className="text-[15.5px] font-semibold leading-[1.7] text-white/90">
                    <Sentences text={CI_WHY.cta} clauses={false} />
                  </p>
                  <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun shrink-0">네이버 예약</a>
                </div>
              </div>

              {/* 기성품이라면 → 맞춤이라면 대비 + 달라지는 것 셋 */}
              <SubHead eyebrow="IF CUSTOM" title={<>{CI_IF_CUSTOM.title}</>} />
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
              </div>
            </section>

            {/* ── 6. 권하는 경우 4 → 주위염 → 안내 ── */}
            <section id="when" className="scroll-mt-[96px] pt-24 md:pt-32" aria-labelledby="ci-when">
              <Head id="ci-when" big={<Big unit="경우">4</Big>} title={<>이런 경우 커스텀 어버트먼트를<br /><span className="accent-sun">권해 드립니다</span></>} lead={CI_WHEN.lead} />
              <ul className="reveal-stack mt-12 grid gap-4 md:grid-cols-2">
                {CI_WHEN.items.map((w, i) => (
                  <li key={w.title} className="card card-3d flex gap-4 p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block text-[1.05rem] font-extrabold text-ink">{w.title}</span>
                      <span className="mt-1.5 block text-[14.5px] leading-[1.7] text-ink-soft">{w.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* 주위염 — 설명(왼쪽) · 신호 4 + 관리 3(오른쪽) */}
              <SubHead eyebrow="PERI-IMPLANTITIS" title={<>임플란트 <span className="accent-sun">주위염</span>이란</>} />
              <p className="reveal mx-auto mt-4 max-w-[640px] text-center text-[15px] leading-[1.75] text-ink-soft">
                <Sentences text={CI_PERI.lead} clauses={false} />
              </p>
              {/* 진행 3단계(왼쪽, 세로 흐름) · 신호 4 + 관리 3(오른쪽) */}
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

              <div className="reveal mt-8 rounded-2xl border border-sun-200 bg-sun-50/60 p-6 md:p-7">
                <p className="text-[12px] font-bold tracking-[0.18em] text-sun-700">NOTICE</p>
                <p className="mt-1.5 text-[1.05rem] font-extrabold text-ink">{CI_NOTICE.title}</p>
                <Paras text={CI_NOTICE.paragraphs} className="mt-2 text-[14.5px] leading-[1.8] text-ink-soft" />
              </div>
            </section>

            {/* ── FAQ — 화면 = FAQPage 스키마 ── */}
            {doc.faq && doc.faq.length > 0 && (
              <section className="pt-24 md:pt-32" aria-labelledby="ci-faq" id="faq-section">
                <Head id="ci-faq" big={<Big>FAQ</Big>} title="자주 묻는 질문입니다" />
                <div className="reveal mt-10 rounded-[28px] border border-hairline bg-canvas p-5 md:p-10">
                  <FaqList items={doc.faq} />
                </div>
              </section>
            )}

            {/* ── 관련 임플란트 쪽 카드 — 본문 맨 끝(FAQ 뒤) ── */}
            {related.length > 0 && (
              <section className="pt-20 md:pt-28" aria-labelledby="ci-related">
                <Head id="ci-related" big={<Word>MORE</Word>} title={<>함께 보면 좋은 <span className="accent-sun">임플란트 안내</span></>} />
                <ul className="reveal-stack mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((c) => (
                    <li key={c.path}>
                      <Link href={c.path} className="card card-hover flex h-full flex-col overflow-hidden">
                        <span className="relative block aspect-[4/3] overflow-hidden bg-canvas-2">
                          <Image src={figSrc(REL_FIG[c.path] ?? c.hero?.key ?? 'orig/implant-hero')} alt={c.hero?.alt ?? c.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                        </span>
                        <span className="flex flex-1 flex-col p-5">
                          <span className="text-[11.5px] font-bold tracking-[0.2em] text-sun-600">{c.eyebrow}</span>
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
              <p className="text-[1.1rem] font-extrabold">맞춤 기둥 제작 과정</p>
              <ol className="mt-4 space-y-4">
                {CI_PROCESS.steps.map((p, i) => (
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
          <ContactBand bg="ai/wide-implant" title="내 잇몸에 맞는 기둥이 궁금하신가요?" text="검사 후 기성품과 맞춤 가운데 어느 쪽이 알맞은지 설명해 드립니다. 네이버 예약이나 전화로 편하게 문의해 주세요." />
        </div>
        <MedicalNotice />
      </main>
    </>
  );
}
