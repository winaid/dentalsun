import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { HomeHero } from '@/components/HomeHero';
import { JsonLd } from '@/components/JsonLd';
import { VideoFacade } from '@/components/VideoFacade';
import { FlipCard } from '@/components/FlipCard';
import { HubAccordion } from '@/components/HubAccordion';
import { docByPath } from '@/lib/content';
import { CardLink, ContactBand, FaqList, Figure, Marquee, MedicalNotice, ScrubText, Sentences } from '@/components/ui';
import { HomeStage, HomeStats, HomeTourPan } from '@/components/HomeScroll';
import { BeforeAfter } from '@/components/BeforeAfter';
import { CASE_GROUPS, CASE_NOTE } from '@/lib/cases';
import { CLINIC, HOURS, HYGIENE, MONTHLY_NOTICE, STRENGTHS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { TREATMENT_HUBS } from '@/lib/nav';
import { SITE_FAQ } from '@/lib/faq';
import { figSrc } from '@/lib/docs';
import { faqSchema, medicalWebPageSchema, physicianSchema } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { 'ko-KR': CLINIC.url, 'x-default': CLINIC.url } },
};

/** 홈 FAQ — 사이트 FAQ 에서 묶음마다 첫 질문 하나씩. 화면과 스키마가 같은 배열. */
const HOME_FAQ = SITE_FAQ.map((g) => g.items[0]);

const HUB_ICON: Record<string, string> = {
  '/treatment/implant': 'M12 3l3 4h-6l3-4zm-3 6h6v6a3 3 0 0 1-6 0V9z',
  '/treatment/tmj': 'M7 4h10v6a5 5 0 0 1-10 0V4zm3 12l-2 5m8-5l2 5',
  '/treatment/aesthetic': 'M4 14c2-6 14-6 16 0-2 4-14 4-16 0z',
  '/treatment/insurance': 'M4 6h16v12H4zM8 10h8M8 14h5',
  '/treatment/wisdom-tooth': 'M8 4c-3 0-4 3-3 7l2 9h2l1-6 1 6h2l2-9c1-4 0-7-3-7-1 0-2 1-2 1s-1-1-2-1z',
  '/treatment/natural-tooth': 'M12 3c-4 0-6 3-5 7l2 11h2l1-6 1 6h2l2-11c1-4-1-7-5-7z',
  '/treatment/painless': 'M12 4v16m-6-8h12',
};
/** 아코디언 접힌 띠의 짧은 이름 */
const HUB_SHORT: Record<string, string> = {
  '/treatment/implant': '임플란트',
  '/treatment/tmj': '턱관절',
  '/treatment/aesthetic': '심미치료',
  '/treatment/insurance': '보험틀니',
  '/treatment/wisdom-tooth': '사랑니',
  '/treatment/natural-tooth': '자연치아',
  '/treatment/painless': '무통치료',
};
const HUB_IMG: Record<string, string> = {
  '/treatment/implant': 'ai/implant-hub',
  '/treatment/tmj': 'ai/tmj-hub',
  '/treatment/aesthetic': 'ai/aesthetic-hub',
  '/treatment/insurance': 'ai/insurance-hub',
  '/treatment/wisdom-tooth': 'ai/wisdom',
  '/treatment/natural-tooth': 'ai/natural-hub',
  '/treatment/painless': 'ai/painless-hub',
};

export default function HomePage() {
  const featured = [
    { href: '/treatment/implant/navigation', label: '내비게이션 임플란트', desc: '모의수술로 오차를 줄인 무절개 임플란트.', fig: 'orig/misc-nav-implant-set' },
    { href: '/treatment/implant/full-arch', label: '풀아치(전체) 임플란트', desc: '4~6개 최소식립으로 무치악 해결.', fig: 'orig/implant-fa-fixed' },
    { href: '/treatment/implant/uv', label: 'UV 임플란트', desc: '잇몸이 좋지 않다면.', fig: 'ai/implant-uv' },
    { href: '/treatment/implant/prf', label: '자가혈 임플란트', desc: '뼈이식이 필요하다면.', fig: 'ai/implant-prf' },
    { href: '/treatment/implant/custom', label: '맞춤 임플란트', desc: '내 잇몸에 꼭 맞게 제작.', fig: 'orig/implant-custom-fit' },
    { href: '/treatment/implant/warranty', label: '보증제도', desc: '치료 후 철저한 사후 관리.', fig: 'ai/implant-warranty' },
  ];

  return (
    <>
      <SiteHeader dark />
      <JsonLd
        data={[
          medicalWebPageSchema({ title: `${CLINIC.shortName} | 광화문역 치과`, description: CLINIC.description, path: '/' }),
          ...DOCTORS.map(physicianSchema),
          faqSchema(HOME_FAQ, '/'),
        ]}
      />
      <main id="main">
        <HomeHero />

        <Marquee overlap items={['디지털 임플란트', '내비게이션 임플란트', '풀아치 임플란트', '턱관절 치료', 'MTA 신경치료', '무통마취', '에어플로우 스케일링', '수면치료', '심미보철', '치아미백', '보험 틀니 · 임플란트', '매복사랑니']} />

        {/* ── 강점 4 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[820px]">
              <p className="eyebrow">WHY SUN DENTAL</p>
              <h2 className="display-sm mt-4">
                치과치료, <span className="accent">광화문선치과</span>는 다릅니다
              </h2>
              <p className="lead mt-4">
                <Sentences text="다년간의 임상경험으로 믿을 수 있는 진료, 환자분이 이해하기 쉬운 친절한 설명. 광화문선치과가 지켜 온 네 가지 약속입니다." />
              </p>
            </div>
            <HomeStats />
            <ul className="reveal-stack grid-cards mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {STRENGTHS.map((s, i) => (
                <li key={s.title} className="card card-3d flex h-full flex-col p-7">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-5 text-[1.12rem] font-bold leading-snug text-ink">{s.title}</p>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
                    <Sentences text={s.desc} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 진료과목 — 사진 카드 ── */}
        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center">
              <p className="eyebrow justify-center">DEPARTMENTS</p>
              <h2 className="display-sm mt-4">
                광화문선치과 <span className="accent">진료과목</span>
              </h2>
            </div>
            {/* 넓은 화면: 펼침 아코디언 띠(오너 선택). 좁은 화면: 아래 카드 격자. */}
            <HubAccordion
              items={[
                ...TREATMENT_HUBS.map((h) => ({
                  href: h.href,
                  label: h.label,
                  short: HUB_SHORT[h.href] ?? h.label,
                  desc: docByPath(h.href)?.summary.split(/(?<=다\.)\s/)[0] ?? '',
                  subs: h.children?.slice(0, 4).map((c) => c.label) ?? [],
                  fig: HUB_IMG[h.href],
                })),
                { href: '/insight', label: '인사이트', short: '인사이트', desc: '턱 소리, 시린 이, 잇몸 출혈처럼 자주 겪는 증상을 환자의 말로 풀어 쓴 안내와 임플란트 과정·비용·건강보험 가이드.', subs: ['증상별 안내', '임플란트 과정', '비용 요인', '건강보험'], fig: 'ai/insight-hub' },
              ]}
            />
            {/* ★ .grid-cards 의 display:grid 가 lg:hidden 을 이기므로 감싸는 상자에서 숨긴다 */}
            <div className="lg:hidden">
            <ul className="reveal-stack grid-cards mt-12 grid-cols-2">
              {TREATMENT_HUBS.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} className="card card-hover group flex h-full flex-col overflow-hidden">
                    <span className="card-img block">
                      <Image src={figSrc(HUB_IMG[h.href])} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                    </span>
                    <span className="flex flex-1 flex-col p-6">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-sun-500 group-hover:text-white">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d={HUB_ICON[h.href] ?? 'M4 12h16'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>
                        </span>
                        <span className="text-[1.08rem] font-bold text-ink group-hover:text-brand-700">{h.label}</span>
                      </span>
                      <span className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">{h.children?.slice(0, 3).map((c) => c.label).join(' · ')}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/insight" className="card card-hover group flex h-full flex-col overflow-hidden">
                  <span className="card-img block">
                    <Image src={figSrc('ai/insight-hub')} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  </span>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="text-[1.08rem] font-bold text-brand-700">인사이트 · 증상별 안내 →</span>
                    <span className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">턱 소리 · 시린 이 · 잇몸 출혈 · 임플란트 과정 · 건강보험</span>
                  </span>
                </Link>
              </li>
            </ul>
            </div>
          </div>
        </section>

        {/* ── 임플란트 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center">
              <p className="eyebrow justify-center">PREMIUM DIGITAL IMPLANT</p>
              <h2 className="display-sm mt-4">
                광화문선치과의 임플란트, <span className="accent">왜 특별할까요?</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="내 치아 상태에 따른 다양한 수술 방법으로, 치아가 안 좋아도 잇몸뼈가 부족해도 구강 상태에 맞는 임플란트를 제안합니다." />
              </p>
            </div>
            <div className="reveal-stack mt-12 grid gap-6 sm:grid-cols-2">
              {CLINIC.videos.map((v) => (
                <div key={v.id}>
                  <VideoFacade id={v.id} poster={v.thumb} title={v.title} />
                  <p className="mt-3 text-[15.5px] font-semibold text-ink">{v.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-14">
              {/* 뒤집기 카드 3×2 — 앞면은 번호·제목만, 마우스를 올리면 사진 배경과 설명이 나온다(오너 요청) */}
              <ul className="reveal-stack mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((f, i) => (
                  <li key={f.href}>
                    <FlipCard href={f.href} num={String(i + 1).padStart(2, '0')} label={f.label} desc={f.desc} back={docByPath(f.href)?.summary.split(/(?<=다\.)\s/)[0] ?? f.desc} fig={{ key: f.fig, alt: f.label }} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 text-center">
              <Link href="/treatment/implant" className="btn-brand">임플란트 전체 안내</Link>
            </div>
          </div>
        </section>

        {/* ── 내비게이션 임플란트 과정 — 고정 무대(스크롤하면 사진이 바뀐다) ── */}
        <HomeStage />

        {/* ── 턱관절 — 어두운 사진 띠 ── */}
        <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-32">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('ai/wide-tmj')} alt="" fill sizes="100vw" className="object-cover opacity-50" data-parallax="0.2" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/65 to-night/90" />
          </div>
          {/* 사진 카드 없이 글만 가운데(오너: 억지로 맞춘 사진 카드 제거). 배경 사진이 분위기를 맡는다. */}
          <div className="wrap">
            <div className="reveal mx-auto max-w-[880px] text-center">
              <p className="eyebrow on-dark justify-center">TMJ · 턱관절</p>
              <h2 className="display-sm mt-4 !text-white on-photo">
                원인부터 해결하는
                <br />
                <span className="accent-sun">턱관절 진료</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[720px] text-[1.05rem] leading-[1.85] text-white md:text-[1.15rem]">
                <ScrubText text="정확한 진단과 근본적인 치료로 재발률을 낮춘 턱관절 진료. 기본적인 진료부터 어려운 장치치료까지, 다수의 환자분들을 진료하며 얻은 노하우로 개인별 맞춤 진료를 합니다." />
              </p>
              <ul className="reveal-stack mx-auto mt-10 grid max-w-[860px] gap-4 sm:grid-cols-3">
                {[
                  ['01', '정확한 진단'],
                  ['02', '전반적인 턱관절 치료 진행'],
                  ['03', '오랜 기간 다수의 턱관절 환자 진료'],
                ].map(([n, t]) => (
                  <li key={n} className="flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-5 py-5 text-center backdrop-blur-md">
                    <span className="text-[12px] font-extrabold tracking-[0.2em] text-sun-300">{n}</span>
                    <span className="mt-2 text-[16px] font-bold leading-snug">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/treatment/tmj" className="btn-sun">턱관절 치료 안내</Link>
                <Link href="/treatment/tmj/symptoms" className="btn-ghost-dark">주요 증상 확인</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 무통·자연치아·심미·사랑니 ── */}
        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal max-w-[820px]">
              <p className="eyebrow">COMFORT & CARE</p>
              <h2 className="display-sm mt-4">
                통증은 줄이고, <span className="accent">내 치아는 지키는</span> 진료
              </h2>
            </div>
            <ul className="reveal-stack grid-cards mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: '/treatment/painless', label: '무통 & 저자극 치료', desc: '무통마취기, 저자극 스케일러 등을 이용한 편안한 치과 치료.', fig: 'ai/painless-hub' },
                { href: '/treatment/natural-tooth', label: '자연치아 살리기', desc: 'MTA 치료를 통해 내 치아를 최대한 보존합니다.', fig: 'ai/natural-hub' },
                { href: '/treatment/aesthetic', label: '심미치료', desc: '라미네이트 · 올세라믹 · 지르코니아 · 치아미백.', fig: 'ai/aesthetic-hub' },
                { href: '/treatment/wisdom-tooth', label: '매복사랑니', desc: '까다로운 매복 사랑니도 3D CT 진단 후 안전하게 발치합니다.', fig: 'ai/wisdom' },
              ].map((c) => (
                <li key={c.href}>
                  <CardLink href={c.href} label={c.label} desc={c.desc} fig={{ key: c.fig, alt: c.label }} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 치료 전후 사례 — 실제 환자 사진, 손잡이를 끌어 비교 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center">
              <p className="eyebrow justify-center">BEFORE &amp; AFTER</p>
              <h2 className="display-sm mt-4">
                광화문선치과 <span className="accent">실제 치료 전후 사례</span>
              </h2>
              <p className="lead mt-4">환자분이 경험한 치료 전후의 변화를 실제 사례로 확인해 보세요.</p>
            </div>
            <div className="reveal mt-10">
              <BeforeAfter groups={CASE_GROUPS} note={CASE_NOTE} />
            </div>
          </div>
        </section>

        {/* ── 의료진 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center">
              <p className="eyebrow justify-center">OUR DOCTORS</p>
              <h2 className="display-sm mt-4">
                보건복지부 인증 <span className="accent">전문의</span>가 직접 진료합니다
              </h2>
              <p className="lead mt-4">
                <Sentences text="보건복지부 인증 통합치의학과 전문의. 강남성심병원 외래교수 출신의 다년간 임상경험으로 진료합니다." />
              </p>
            </div>
            {/* 가운데에 적당한 크기(오너: 너무 컸다). 뒤에는 병원 영문 이름이 저절로 흐르는 큰 글자 띠(동그라미치과처럼). */}
            {DOCTORS.map((d) => (
              <div key={d.slug} className="relative isolate mt-12 overflow-hidden py-10 md:py-14">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none">
                  <div className="marquee">
                    {[0, 1].map((k) => (
                      <span key={k} className="whitespace-nowrap pr-10 text-[110px] font-extrabold leading-none tracking-[-0.04em] text-brand-900/[0.045] md:text-[170px]">
                        GWANGHWAMUN SUN DENTAL CLINIC&nbsp;·&nbsp;
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mx-auto grid max-w-[980px] items-center gap-8 md:grid-cols-[360px_1fr] md:gap-10">
                  <div className="reveal">
                    <div className="wipe relative mx-auto aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-3xl bg-canvas-2 shadow-[var(--shadow-lift)]">
                      <Image src={d.photo} alt={`${d.name} ${d.role}`} fill sizes="360px" className="object-cover object-top" />
                    </div>
                  </div>
                  <div className="reveal">
                    <p className="text-[1.05rem] font-semibold text-brand-600">{d.specialty}</p>
                    <h3 className="mt-1.5 text-[1.9rem] font-extrabold tracking-[-0.02em] text-ink md:text-[2.2rem]">
                      {d.name} <span className="text-[1.2rem] font-bold text-ink-soft md:text-[1.35rem]">{d.role}</span>
                    </h3>
                    <div className="mt-5 rounded-2xl border border-hairline bg-white/95 p-6 shadow-[var(--shadow-soft)] backdrop-blur md:p-7">
                      <p className="text-[14px] font-bold tracking-wide text-ink-muted">주요 약력</p>
                      <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {d.career.map((c) => (
                          <li key={c} className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-ink">
                            <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href={`/about/doctors#${d.slug}`} className="btn-brand mt-6">의료진 소개 자세히</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 위생·소독 — AI 사진 배경 띠 ── */}
        <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-32">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('ai/wide-clinic')} alt="" fill sizes="100vw" className="object-cover opacity-30" data-parallax="0.2" />
            <div className="absolute inset-0 bg-gradient-to-l from-night via-night/85 to-night/50" />
          </div>
          <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* 세로로 긴 원본(폭 422·384px) 두 장 — 틀 없이 원본 비율 그대로, 둘째 장은 살짝 내려 어긋나게 */}
            <div className="reveal-stack order-2 mx-auto grid w-full max-w-[560px] grid-cols-2 items-start gap-5 lg:order-1 lg:mx-0">
              <Figure fig={{ key: 'scene/sterile', alt: '멸균 소독한 진료 기구' }} sizes="280px" effect="img-in" rounded="rounded-3xl" />
              <Figure fig={{ key: 'scene/sterile2', alt: '개별 포장된 1인 1기구' }} sizes="280px" effect="img-in" rounded="rounded-3xl" className="mt-10" />
            </div>
            <div className="reveal order-1 lg:order-2">
              <p className="eyebrow on-dark">STERILIZATION</p>
              <h2 className="display-sm mt-4 !text-white">
                철저한 위생관리 <span className="accent-sun">멸균 소독 시스템</span>
              </h2>
              <p className="mt-4 text-[1.05rem] leading-[1.8] text-white/75">교차감염을 차단하여 환자의 안전을 최우선으로 생각합니다.</p>
              <ul className="mt-6 space-y-2.5">
                {HYGIENE.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[16px] text-white/90">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sun-500 text-[11px] font-bold text-white">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
              <Link href="/about/equipment" className="btn-ghost-dark mt-8">디지털 장비 · 소독 시스템 보기</Link>
            </div>
          </div>
        </section>

        {/* ── 둘러보기 — 스크롤하는 만큼 사진 띠가 옆으로 흐른다 ── */}
        <section className="section overflow-hidden">
          <div className="wrap">
            <div className="reveal flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">CLINIC TOUR</p>
                <h2 className="display-sm mt-4">
                  광화문선치과 <span className="accent">둘러보기</span>
                </h2>
              </div>
              <Link href="/about#tour" className="btn-ghost">전체 사진 보기</Link>
            </div>
          </div>
          <HomeTourPan />
        </section>

        {/* ── FAQ ── */}
        <section className="section bg-canvas">
          <div className="wrap grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div className="reveal">
              <p className="eyebrow">FAQ</p>
              <h2 className="display-sm mt-4">
                광화문선치과에
                <br />
                <span className="accent">자주 묻는 질문</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="진료시간·주차·임플란트·턱관절·건강보험·수면치료. 더 많은 문답은 FAQ 페이지에 있습니다." />
              </p>
              <Link href="/faq" className="btn-ghost mt-6">전체 FAQ 보기</Link>
            </div>
            <div className="reveal">
              <FaqList items={HOME_FAQ} />
            </div>
          </div>
        </section>

        {/* ── 오시는 길 · 진료시간 ── */}
        <section className="section" id="visit">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center">
              <p className="eyebrow justify-center">VISIT US</p>
              <h2 className="display-sm mt-4">
                광화문역 <span className="accent">6번 출구 도보 2분</span>, 광화문선치과
              </h2>
            </div>
            <div className="reveal mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="card overflow-hidden">
                <iframe
                  title="광화문선치과 지도"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`)}&z=17&output=embed&hl=ko`}
                  className="h-[420px] w-full border-0 lg:h-full lg:min-h-[560px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="grid gap-4">
                <div className="card p-6">
                  <p className="text-[14px] font-bold tracking-wide text-ink-muted">진료시간</p>
                  <ul className="mt-3 divide-y divide-hairline">
                    {HOURS.display.map((h) => (
                      <li key={h.label} className="flex items-center justify-between py-2.5 text-[16px]">
                        <span className="font-semibold text-ink">
                          {h.label}
                          {h.note && <span className="ml-2 pill-sun !py-0.5 !text-[11px]">{h.note}</span>}
                        </span>
                        <span className="font-bold tabular-nums text-brand-800">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[14px] text-ink-muted">{HOURS.closed}</p>
                </div>
                <a href={CLINIC.phoneHref} className="rounded-2xl bg-brand-700 p-6 text-white transition-colors hover:bg-brand-800">
                  <p className="text-[14px] text-white/70">전화 문의 · 예약</p>
                  <p className="mt-1 text-[1.8rem] font-extrabold tracking-tight">{CLINIC.phone}</p>
                </a>
                <div className="card p-5 text-[15px] text-ink-soft">
                  <p>
                    <span className="font-bold text-ink">주소</span> {CLINIC.address.full} ({CLINIC.address.landmark})
                  </p>
                  <p className="mt-1.5">
                    <span className="font-bold text-ink">지하철</span> {CLINIC.transit.map((t) => `${t.line} ${t.station} ${t.exit} ${t.walk}`).join(' · ')}
                  </p>
                  <p className="mt-1.5">
                    <span className="font-bold text-ink">주차</span> {CLINIC.parking.place} {CLINIC.parking.fee}
                  </p>
                  <Link href="/visit#notice" className="mt-3 inline-block font-bold text-brand-700 hover:underline">
                    {MONTHLY_NOTICE.title} 보기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContactBand />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}
