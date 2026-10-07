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
import { CardLink, CertMark, ContactBand, FaqList, Figure, MedicalNotice, ScrubText, Sentences } from '@/components/ui';
import { AwardCard } from '@/components/TmjPage';
import { FullArchBand } from '@/components/FullArchBand';
import { TMJ_AWARD } from '@/lib/content/tmjLanding';
import { HomeStage, HomeStats } from '@/components/HomeScroll';
import { CaseGallery } from '@/components/CaseGallery';
import { CLINIC, HOURS, HYGIENE, STRENGTHS } from '@/lib/clinic';
import { DOCTORS, isCertCareer } from '@/lib/doctors';
import type { NavItem } from '@/lib/nav';
import { SITE_FAQ } from '@/lib/faq';
import { figSrc } from '@/lib/docs';
import { faqSchema, medicalWebPageSchema, og, physicianSchema } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { 'ko-KR': CLINIC.url, 'x-default': CLINIC.url }, types: { 'application/rss+xml': `${CLINIC.url}/rss.xml` } },
  /* 홈 공유 카드 (2026-09-11): 다른 쪽은 og() 가 /api/og 카드를 내는데 홈만 빠져 있었다. 화면 무관. */
  openGraph: { ...og({ title: `${CLINIC.shortName} | 광화문역 치과 · 디지털 임플란트 · 턱관절 치료`, description: CLINIC.description, path: '/' }), type: 'website' },
};

/** 홈 FAQ — 사이트 FAQ 에서 묶음마다 첫 질문 하나씩. 화면과 스키마가 같은 배열. */
const HOME_FAQ = SITE_FAQ.map((g) => g.items[0]);

/**
 * 홈 '진료과목' 7 갈래 — 2026-09-21 메뉴가 5개로 줄었지만 홈의 이 구역은 예전 일곱 갈래 그대로(오너 "너무 적으니 이전처럼").
 * 메뉴(lib/nav)와 따로 두는 유일한 목록이다. 하위 이름은 아코디언 접힌 띠·폰 카드의 한 줄 요약에만 쓴다.
 */
const HOME_HUBS: NavItem[] = [
  { label: '임플란트', href: '/treatment/implant', children: [
    { label: '내비게이션 임플란트', href: '/treatment/implant/navigation' }, { label: '맞춤 임플란트', href: '/treatment/implant/custom' },
    { label: '풀아치 임플란트', href: '/treatment/implant/full-arch' }, { label: 'UV 임플란트', href: '/treatment/implant/uv' },
    { label: '자가혈 임플란트', href: '/treatment/implant/prf' }, { label: '보증제도', href: '/treatment/implant/warranty' },
  ] },
  { label: '턱관절', href: '/treatment/tmj', children: [
    { label: '턱관절 장애란?', href: '/treatment/tmj' }, { label: '증상과 자가진단', href: '/treatment/tmj/symptoms' },
    { label: '이갈이 · 이악물기', href: '/treatment/tmj/bruxism' }, { label: '치료법', href: '/treatment/tmj/treatment' },
  ] },
  { label: '심미치료', href: '/treatment/aesthetic', children: [
    { label: '심미보철', href: '/treatment/aesthetic/prosthetics' }, { label: '치아미백', href: '/treatment/aesthetic/whitening' },
  ] },
  { label: '보험 틀니&임플란트', href: '/treatment/insurance', children: [
    { label: '보험틀니', href: '/treatment/insurance/denture' }, { label: '보험임플란트', href: '/treatment/insurance/implant' },
  ] },
  { label: '매복사랑니', href: '/treatment/wisdom-tooth', children: [
    { label: '사랑니발치 노하우', href: '/treatment/wisdom-tooth' }, { label: '발생되는 문제', href: '/treatment/wisdom-tooth#problems' }, { label: '발치과정', href: '/treatment/wisdom-tooth#process' },
  ] },
  { label: '자연치아살리기', href: '/treatment/natural-tooth', children: [
    { label: 'MTA 근관치료', href: '/treatment/natural-tooth/mta' }, { label: '엔도소닉 초음파 세척', href: '/treatment/natural-tooth/endosonic' },
    { label: '재근관치료', href: '/treatment/re-root-canal' }, { label: '치주치료', href: '/treatment/periodontal' },
  ] },
  /* 수면마취는 2026-09-29 원장 확인(시행하지 않음)으로 뺐다 */
  { label: '무통&저자극시스템', href: '/treatment/painless', children: [
    { label: '무통마취', href: '/treatment/painless/anesthesia' }, { label: '도포 & 가글마취', href: '/treatment/painless/anesthesia#topical' },
    { label: '에어 플로우', href: '/treatment/painless/airflow' },
  ] },
];

const HUB_ICON: Record<string, string> = {
  '/treatment/implant': 'M12 3l3 4h-6l3-4zm-3 6h6v6a3 3 0 0 1-6 0V9z',
  '/treatment/tmj': 'M7 4h10v6a5 5 0 0 1-10 0V4zm3 12l-2 5m8-5l2 5',
  '/treatment/aesthetic': 'M4 14c2-6 14-6 16 0-2 4-14 4-16 0z',
  '/treatment/insurance': 'M4 6h16v12H4zM8 10h8M8 14h5',
  '/treatment/wisdom-tooth': 'M8 4c-3 0-4 3-3 7l2 9h2l1-6 1 6h2l2-9c1-4 0-7-3-7-1 0-2 1-2 1s-1-1-2-1z',
  '/treatment/natural-tooth': 'M12 3c-4 0-6 3-5 7l2 11h2l1-6 1 6h2l2-11c1-4-1-7-5-7z',
  '/treatment/painless': 'M12 4v16m-6-8h12',
  '/treatment/general': 'M12 3c-4 0-6 3-5 7l2 11h2l1-6 1 6h2l2-11c1-4-1-7-5-7z',
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
  '/treatment/general': '일반진료',
};
const HUB_IMG: Record<string, string> = {
  '/treatment/implant': 'ai/implant-hub',
  '/treatment/tmj': 'sun/tmj-explain-skull-2',
  '/treatment/aesthetic': 'ai/aesthetic-hub',
  '/treatment/insurance': 'ai/insurance-hub',
  '/treatment/wisdom-tooth': 'ai/wisdom',
  '/treatment/natural-tooth': 'ai/natural-hub',
  '/treatment/painless': 'ai/painless-hub',
  '/treatment/general': 'orig/mta-hero',
};

export default function HomePage() {
  const featured = [
    /* 2026-09-29 맞춤 임플란트가 다시 독립 → 여섯 장 유지를 위해 보증제도는 아래 버튼으로 */
    { href: '/treatment/implant/navigation', label: '내비게이션 임플란트', desc: '3D CT로 미리 계획하고, 수술 가이드로 심습니다.', fig: 'orig/misc-nav-implant-set' },
    { href: '/treatment/implant/custom', label: '맞춤 임플란트', desc: '잇몸 라인에 맞춘 맞춤 지대주로 완성합니다.', fig: 'ai/implant-custom' },
    { href: '/treatment/implant/full-arch', label: '풀아치 임플란트', desc: '치아가 없는 턱에 4~6개를 심고, 고정된 치아를 연결합니다.', fig: 'orig/implant-fa-fixed' },
    { href: '/treatment/implant/uv', label: 'UV 임플란트', desc: '자외선으로 표면을 처리해, 뼈와 잘 붙도록 돕습니다.', fig: 'ai/implant-uv' },
    { href: '/treatment/implant/prf', label: '자가혈 임플란트', desc: '뼈이식 부위에 내 혈액에서 얻은 PRF를 함께 넣습니다.', fig: 'ai/implant-prf' },
    { href: '/treatment/insurance', label: '보험 틀니 · 임플란트', desc: '만 65세 이상 건강보험 적용 기준을 안내합니다.', fig: 'ai/insurance-hub' },
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

        {/* 첫 화면 아래 흐르는 낱말 띠는 오너 지시로 뺐다(2026-09-10) */}

        {/* ── 의료진 ── 2026-09-29 원장 피드백 6번: 첫 화면 바로 아래로 올리고, 약력 외에 소개 글을 넣는다.
             ★★ 짜임은 원래 판(2c41690) 그대로 — 가운데 머리말(OUR DOCTORS·제목·한 줄 설명) + 사진 | 이름·약력 카드.
                '15년 이상' 을 큰 숫자로 세운 판은 오너 반려("이런 식으로 디자인 바뀌는 건 안 돼", 2026-09-29).
                새 문구는 원래 자리에 넣는다 — 제목 = 병원이 고른 문구(lib/doctors headline), 설명 = '15년 이상 … 한자리를 지켜온'. */}
        <section className="section relative overflow-hidden bg-canvas !py-14 lg:!py-20">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center lg:max-w-[960px]">
              <p className="eyebrow justify-center">OUR DOCTORS</p>
              <h2 className="display-sm mt-4">
                {DOCTORS[0].headline[0]}
                <br className="md:hidden" /> <span className="accent">{DOCTORS[0].headline[1]}</span>
              </h2>
              <p className="lead mt-3">
                <Sentences text="{15년 이상 한결같은 마음으로 한자리를 지켜온} 광화문 선치과, 보건복지부 인증 통합치의학과 전문의가 직접 진료합니다." />
              </p>
            </div>
            {/* 가운데에 적당한 크기(오너: 너무 컸다). 뒤에는 병원 영문 이름이 저절로 흐르는 큰 글자 띠(동그라미치과처럼). */}
            {DOCTORS.map((d) => (
              <div key={d.slug} className="relative mt-6 py-6 md:py-8">
                <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-screen -translate-x-1/2 -translate-y-1/2 select-none">
                  <div className="marquee">
                    {[0, 1].map((k) => (
                      <span key={k} className="whitespace-nowrap pr-10 text-[110px] font-extrabold leading-none tracking-[-0.04em] text-brand-900/[0.11] md:text-[160px]">
                        GWANGHWAMUN SUN DENTAL CLINIC&nbsp;·&nbsp;
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-10 md:grid-cols-[minmax(0,360px)_1fr] md:gap-12 lg:grid-cols-[460px_1fr] lg:gap-16 xl:grid-cols-[480px_1fr]">
                  {/* 배경을 지운 사진(누끼) — 액자 없이 바탕 위에 바로 선다. 뒤에 옅은 빛과 바닥 그림자만 둔다 */}
                  <div className="reveal relative">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-6 top-0 -z-10 bg-[radial-gradient(58%_58%_at_50%_52%,rgba(242,111,30,0.16)_0%,rgba(242,111,30,0)_70%)]"
                    />
                    <Image
                      src={d.cutout ?? d.photo}
                      alt={`${d.name} ${d.role}`}
                      width={995}
                      height={1346}
                      sizes="(max-width: 768px) 76vw, 480px"
                      className="mx-auto h-auto w-full max-w-[300px] drop-shadow-[0_26px_36px_rgba(9,14,35,0.16)] md:max-w-[340px] lg:max-w-none"
                    />
                    <span aria-hidden className="mx-auto mt-[-14px] block h-4 w-[62%] rounded-[999px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(19,24,41,0.16)_0%,rgba(19,24,41,0)_72%)]" />
                  </div>
                  <div className="reveal">
                    <p className="text-[1.1rem] font-semibold text-brand-600 md:text-[1.2rem]">{d.specialty}</p>
                    <h3 className="mt-2 text-[2.1rem] font-extrabold tracking-[-0.02em] text-ink md:text-[2.6rem] lg:text-[2.9rem]">
                      {d.name} <span className="text-[1.3rem] font-bold text-ink-soft md:text-[1.5rem]">{d.role}</span>
                    </h3>
                    {/* 소개 글 한 단락(원장 피드백 6번) — 이름과 약력 카드 사이, 본문 글씨로만 */}
                    <p className="mt-3 max-w-[640px] text-[16px] leading-[1.8] text-ink-soft md:text-[16.5px]">
                      <Sentences text={d.intro} />
                    </p>
                    <div className="mt-5 rounded-2xl border border-hairline bg-white/95 p-6 shadow-[var(--shadow-soft)] backdrop-blur md:mt-6 md:p-8">
                      <p className="text-[14.5px] font-bold tracking-wide text-ink-muted md:text-[15px]">주요 약력</p>
                      <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 md:mt-5 md:gap-x-10 md:gap-y-3.5">
                        {d.career.map((c) => (
                          <li key={c} className="flex items-start gap-3 text-[15.5px] leading-[1.5] text-ink md:text-[16.5px]">
                            {isCertCareer(c) ? (
                              <CertMark className="-ml-[5px] mt-[1px] h-[22px] w-[22px] text-brand-600 md:h-6 md:w-6" />
                            ) : (
                              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600 md:mt-[10px]" />
                            )}
                            {isCertCareer(c) ? <strong className="font-bold">{c}</strong> : c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href={`/about/doctors#${d.slug}`} className="btn-brand mt-6 md:mt-7">의료진 소개 자세히</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 강점 4 ── 2026-09-29 원장 피드백: '네 가지 약속' 문구는 오글거린다 → 뺐다. 숫자 카드(HomeStats)는 맨 아래 오시는 길로 내렸다. */}
        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[820px]">
              <p className="eyebrow">WHY SUN DENTAL</p>
              {/* 2026-10-07 오너 지시(카톡 '정확한 진단 원칙을 지키는 진료'): 제목 글자 그대로. 강조는 소개 페이지처럼 뒷부분, 좁은 화면은 '진단' 뒤에서만 끊긴다 */}
              <h2 className="display-sm mt-4">
                정확한 진단 <span className="accent whitespace-nowrap">원칙을 지키는 진료</span>
              </h2>
              <p className="lead mt-4">
                {/* 2026-10-06 원장 PPT 53쪽 '보철 >> 치료' — 둘째 문장(오너 지시: '검사 영상을 치료 순으로 설명하고') */}
                <Sentences text="진단과 수술, 보철과 정기검진을 대표원장이 직접 맡습니다. 검사 영상을 치료 순으로 설명하고, 지금 필요한 치료부터 권해 드립니다." />
              </p>
            </div>
            {/* 카드 다섯 장 — 넓은 화면은 3칸 + 2칸(아래 줄 가운데), 태블릿은 2칸(마지막 한 장 가운데), 폰은 1칸.
                 사진은 54쪽 예시처럼 글 아래에 붙여, 줄마다 사진 높이가 맞도록 카드 맨 아래로 민다. */}
            <ul className="reveal-stack grid-cards mt-12 sm:grid-cols-2 lg:grid-cols-6">
              {STRENGTHS.map((s, i) => (
                <li
                  key={s.title}
                  className={`card card-3d flex h-full flex-col lg:col-span-2 ${i === 3 ? 'lg:col-start-2' : ''} ${i === STRENGTHS.length - 1 ? 'sm:col-span-2 sm:w-[calc(50%-0.625rem)] sm:justify-self-center lg:w-auto lg:justify-self-stretch' : ''}`}
                >
                  <div className="p-5 sm:p-7">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-3 text-[1.12rem] font-bold leading-snug text-ink sm:mt-5">{s.title}</p>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft sm:mt-3">
                      <Sentences text={s.desc} />
                    </p>
                  </div>
                  {/* 54쪽 예시처럼 사진 위쪽이 흰 카드에 녹아들게 — 얼굴이 흐려지지 않도록 위 1/5 만 */}
                  <span className="relative mt-auto block aspect-[4/3] w-full overflow-hidden bg-white">
                    <Image src={figSrc(s.fig.key)} alt={s.fig.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={s.fig.pos.startsWith('object-contain') ? s.fig.pos : `object-cover ${s.fig.pos}`} />
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-white to-transparent" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 국가자격 치과위생사 — 2026-10-07 원장 PPT 61쪽 '추가 희망 · 내용 변경 가능'(예시 띠). 예시 문구를 우리 말로 다듬었다(스탭→스태프, 치위생사→치과위생사).
             바로 위 강점 카드 04·05 가 스태프 이야기라 그 뒤에 둔다. 배경은 AI 사진(병원 사진은 전부 원장이라 스태프 사진이 없다, 얼굴 없음).
             ⚠️ '스태프 전원이 국가자격 치과위생사' 는 병원 확인 대기 — 사실이 아니면 거짓 광고(의료법 제56조). 오너에게 알림(2026-10-07). ── */}
        <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-28">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('ai/wide-hygienist')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-45" data-parallax="0.2" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/60 to-night/85" />
          </div>
          <div className="wrap">
            <div className="reveal mx-auto max-w-[860px] text-center">
              <p className="eyebrow on-dark justify-center">COMFORT &amp; CARE</p>
              <h2 className="display-sm mt-4 !text-white on-photo">
                전문의 의료진은 물론,
                <br />
                스태프 전원이 <span className="accent-sun whitespace-nowrap">국가자격 치과위생사</span>로 구성됩니다
              </h2>
              <p className="mx-auto mt-6 max-w-[640px] text-[1.05rem] leading-[1.8] text-white/80 md:text-[1.12rem]">편안하고 친절하게, 안심하실 수 있도록 함께 돌봅니다.</p>
            </div>
          </div>
        </section>

        {/* ── 진료과목 — 사진 카드 ── */}
        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center lg:max-w-[960px]">
              <p className="eyebrow justify-center">DEPARTMENTS</p>
              <h2 className="display-sm mt-4">
                광화문선치과 <span className="accent">진료과목</span>
              </h2>
            </div>
            {/* 넓은 화면: 펼침 아코디언 띠(오너 선택). 좁은 화면: 아래 카드 격자. */}
            <HubAccordion
              items={[
                ...HOME_HUBS.map((h) => ({
                  href: h.href,
                  label: h.label,
                  short: HUB_SHORT[h.href] ?? h.label,
                  desc: docByPath(h.href)?.summary.split(/(?<=다\.)\s/)[0] ?? '',
                  subs: h.children?.slice(0, 4).map((c) => c.label) ?? [],
                  fig: HUB_IMG[h.href],
                })),
              ]}
            />
            {/* ★ .grid-cards 의 display:grid 가 lg:hidden 을 이기므로 감싸는 상자에서 숨긴다 */}
            <div className="lg:hidden">
            <ul className="reveal-stack grid-cards mt-12 grid-cols-2">
              {HOME_HUBS.map((h) => (
                <li key={h.href} className="last:col-span-2">
                  <Link href={h.href} className="card card-hover group flex h-full flex-col overflow-hidden">
                    <span className="card-img block">
                      <Image src={figSrc(HUB_IMG[h.href])} alt={`${h.label} 진료 사진`} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                    </span>
                    {/* 좁은 화면은 두 칸이라 글자 자리가 좁다 — 여백·아이콘·글자를 줄여 이름이 쪼개지지 않게 한다 */}
                    <span className="flex flex-1 flex-col p-4 sm:p-6">
                      <span className="flex items-center gap-2.5 sm:gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-sun-500 group-hover:text-white sm:h-10 sm:w-10">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="sm:h-5 sm:w-5"><path d={HUB_ICON[h.href] ?? 'M4 12h16'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>
                        </span>
                        {/* 폰에서는 짧은 이름(무통&저자극시스템 → 무통치료)이라 낱말이 쪼개지지 않는다 */}
                        <span className="text-[15px] font-bold text-ink group-hover:text-brand-700 sm:text-[1.08rem]">
                          <span className="sm:hidden">{HUB_SHORT[h.href] ?? h.label}</span>
                          <span className="hidden sm:inline">{h.label}</span>
                        </span>
                      </span>
                      <span className="mt-2.5 text-[13px] leading-[1.55] text-ink-muted sm:mt-3 sm:text-[14.5px] sm:leading-relaxed">{h.children?.slice(0, 3).map((c) => c.label).join(' · ')}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>

        {/* ── 임플란트 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center lg:max-w-[960px]">
              <p className="eyebrow justify-center">PREMIUM DIGITAL IMPLANT</p>
              {/* 2026-10-06 원장 PPT 56쪽 — 제목·설명 모두 병원 문구 그대로("계측에서 방법이 나온다는 표현이 어렵다") */}
              <h2 className="display-sm mt-4">
                임플란트 10년 보증,
                <br className="md:hidden" /> <span className="accent">오래 쓸 결과까지 생각합니다</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="임플란트는 식립하는 것으로 끝나는 치료가 아닙니다. 오래 안정적으로 사용할 수 있도록 정확한 진단과 환자의 구강 상태에 맞는 치료를 원칙으로 하며, 치료 후에도 10년 보증제도로 책임을 이어갑니다." />
              </p>
            </div>
            {/* 유튜브 영상은 2026-09-29 원장 피드백 7번으로 FAQ 바로 위 구역으로 옮겼다 */}
            <div className="mt-10 sm:mt-14">
              {/* 뒤집기 카드 3×2 — 앞면은 번호·제목만, 마우스를 올리면 사진 배경과 설명이 나온다(오너 요청). 폰은 2열 */}
              <ul className="reveal-stack mt-2 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {featured.map((f, i) => (
                  <li key={f.href}>
                    <FlipCard href={f.href} num={String(i + 1).padStart(2, '0')} label={f.label} desc={f.desc} back={docByPath(f.href)?.summary.split(/(?<=다\.)\s/)[0] ?? f.desc} fig={{ key: f.fig, alt: f.label }} />
                  </li>
                ))}
              </ul>
            </div>
            {/* 보증제도 단추는 바로 아래 보증 기간 띠로 옮겼다(2026-10-07) */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/treatment/implant" className="btn-brand">임플란트 전체 안내</Link>
            </div>
          </div>
        </section>

        {/* ── 풀아치 — 원장 PPT 46쪽 '홈화면에 풀아치 추가' · 50쪽 글 그대로. 그림 두 겹 모션(components/FullArchBand) ── */}
        <FullArchBand />

        {/* ── 보증 기간 띠 — 2026-10-07 원장 PPT 62쪽 '추가 희망'(예시: 본플란트치과 띠). 카톡 보증서 줄은 '지우기' → 뺐다.
             제목과 맨 아래 단서는 PPT 글자 그대로(제목 끝 마침표만 다른 제목들처럼 뺐다). 숫자는 예시(남의 병원 값)가 아니라
             우리 보증표(lib/content/implant.ts 보증제도 table) 값 — 임플란트 수술관련 10년 · 임플란트 보철관련 5년 · 보존 및 보철 5년.
             10년은 전부 무상이 아니라 기간별 지원(무상 → 50·30·15%)이라 한 줄로 밝히고 보증표로 잇는다(과장 소지 방지). ── */}
        <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-28">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('place2/treatment-bays')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-35" data-parallax="0.2" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/70 to-night/90" />
          </div>
          <div className="wrap">
            <div className="reveal mx-auto max-w-[880px] text-center">
              <p className="eyebrow on-dark justify-center">WARRANTY</p>
              <h2 className="display-sm mt-4 !text-white on-photo">
                치료에 대한 자신감,
                <br />
                보증기간으로 약속합니다
              </h2>
              <p className="mt-10 text-[19px] font-bold text-white md:text-[22px]">
                임플란트
                <span className="mx-1.5 inline-block align-[-0.12em] text-[64px] font-extrabold leading-none text-sun-300 md:text-[84px]">10</span>년
              </p>
              <ul className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 divide-x divide-white/20">
                {[
                  ['임플란트 보철', '5'],
                  ['보존 · 보철 치료', '5'],
                ].map(([label, years]) => (
                  <li key={label} className="px-3">
                    <p className="text-[15px] font-bold text-white/85 md:text-[16px]">{label}</p>
                    <p className="mt-2 text-[16px] text-white/85">
                      <span className="mr-1 align-[-0.1em] text-[44px] font-extrabold leading-none text-sun-300 md:text-[52px]">{years}</span>년
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-[14px] text-white/65 md:text-[15px]">기간에 따라 무상 · 50% · 30% · 15%로 나눠 지원합니다.</p>
              <p className="mx-auto mt-2 max-w-[640px] text-balance text-[15px] font-bold leading-[1.7] text-white md:text-[16px]">(단, 본원의 치료계획을 준수하고 정기검진을 지속적으로 받는 경우에 한합니다)</p>
              <div className="mt-8 flex justify-center">
                <Link href="/treatment/implant/warranty" className="btn-sun">보증표 자세히 보기</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 내비게이션 임플란트 과정 — 고정 무대(스크롤하면 사진이 바뀐다) ── */}
        <HomeStage />

        {/* ── 턱관절 — 어두운 사진 띠 ── */}
        <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-32">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('ai/wide-tmj')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-50" data-parallax="0.2" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/65 to-night/90" />
          </div>
          {/* 사진 카드 없이 글만 가운데(오너: 억지로 맞춘 사진 카드 제거). 배경 사진이 분위기를 맡는다. */}
          <div className="wrap">
            <div className="reveal mx-auto max-w-[880px] text-center">
              <p className="eyebrow on-dark justify-center">TMJ · 턱관절</p>
              <h2 className="display-sm mt-4 !text-white on-photo">
                {/* 2026-10-07 46쪽 '어렵다' — 예전: '관절잡음 · 개구장애 · 저작근 통증, 원인 감별이 치료의 시작입니다' */}
                턱에서 소리가 나거나 아프다면,
                <br />
                <span className="accent-sun">원인부터</span> 정확히 찾습니다
              </h2>
              <p className="mx-auto mt-6 max-w-[720px] text-[1.05rem] leading-[1.85] text-white md:text-[1.15rem]">
                <ScrubText text="턱관절 질환은 턱관절 디스크의 위치, 턱 근육의 긴장, 이갈이·이악물기, 치아 맞물림이 함께 얽혀 생깁니다. 턱관절 CT와 입 벌리는 폭·맞물림·근육 검사로 원인을 나눈 뒤, 약과 물리치료부터 장치 치료, 관절 세척까지 {필요한 단계만} 진행합니다." />
              </p>
              <ul className="reveal-stack mx-auto mt-10 grid max-w-[860px] gap-4 sm:grid-cols-3">
                {[
                  ['01', '턱관절 CT · 맞물림 · 근육 검사'],
                  ['02', '맞춤 장치 치료 · 관절 세척'],
                  ['03', '턱관절 진료 5,000건 이상'],
                ].map(([n, t]) => (
                  /* 폰에서는 번호·글이 한 줄로 나란히(세 장을 세로로 쌓아도 얇게) — 넓은 화면은 가운데 정렬 상자 */
                  <li key={n} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-left backdrop-blur-md sm:min-h-[110px] sm:flex-col sm:justify-center sm:gap-0 sm:py-5 sm:text-center">
                    <span className="text-[12px] font-extrabold tracking-[0.2em] text-sun-300">{n}</span>
                    <span className="text-[16px] font-bold leading-snug sm:mt-2">{t}</span>
                  </li>
                ))}
              </ul>
              {/* 2026-10-07 원장 PPT 46쪽 '홈화면에 턱관절 상장 이미지 추가' — 턱관절 쪽과 같은 상장 카드(사진이 오기 전엔 글자 액자).
                   ⚠️ 상장 광고는 의료법 제56조 제2항 제14호 소지 — 2026-09-29 오너에게 알렸고 병원 결정으로 싣는다 */}
              {TMJ_AWARD.show && <AwardCard className="mt-10" />}
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/treatment/tmj" className="btn-sun">턱관절 치료 안내</Link>
                <Link href="/treatment/tmj/symptoms" className="btn-ghost-dark">증상 자가진단</Link>
                <Link href="/treatment/tmj/bruxism" className="btn-ghost-dark">이갈이 · 이악물기</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 무통·자연치아·심미·사랑니 ── */}
        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal max-w-[820px]">
              <p className="eyebrow">GENERAL CARE</p>
              <h2 className="display-sm mt-4">
                발치를 말하기 전에 <span className="accent">살릴 수 있는지</span>부터 봅니다
              </h2>
              <p className="lead mt-4">
                <Sentences text="신경치료와 잇몸치료로 내 치아를 살릴 수 있는지 먼저 확인합니다. {살리기 어려운 경우에만} 발치와 보철을 이야기합니다." />
              </p>
            </div>
            {/* 폰도 두 칸 — 진료과목 카드와 같은 격자(한 칸씩 쌓으면 사진 네 장에 2,000px) */}
            <ul className="reveal-stack grid-cards mt-12 !gap-3 grid-cols-2 sm:!gap-5 lg:grid-cols-3">
              {[
                { href: '/treatment/natural-tooth', label: '자연치아 살리기', desc: '치아 뿌리 속을 초음파로 깨끗이 씻고, MTA로 단단히 막습니다.', fig: 'ai/natural-hub' },
                { href: '/treatment/re-root-canal', label: '재근관치료', desc: '신경치료 후 다시 생긴 뿌리 끝 염증을 치료합니다.', fig: 'ai/natural-mta' },
                { href: '/treatment/periodontal', label: '치주치료', desc: '치석을 없애고, 잇몸 속 뿌리 표면까지 깨끗하게 치료합니다.', fig: 'ai/insight-gum' },
                { href: '/treatment/wisdom-tooth', label: '매복사랑니', desc: '3D CT로 신경과의 거리를 확인한 뒤 뽑습니다.', fig: 'ai/wisdom' },
                { href: '/treatment/aesthetic', label: '심미치료', desc: '라미네이트 · 올세라믹 · 지르코니아 · 치아미백.', fig: 'ai/aesthetic-hub' },
                { href: '/treatment/painless', label: '무통 & 저자극 치료', desc: '무통마취기와 바르는 마취로 주사 자극을 줄입니다.', fig: 'ai/painless-hub' },
              ].map((c) => (
                <li key={c.href}>
                  <CardLink href={c.href} label={c.label} desc={c.desc} fig={{ key: c.fig, alt: c.label }} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 치료 전후 사례 — 2026-09-29 원장 요청: 병원이 보낸 실제 사진을 '구내 / 방사선' 두 영역. 영역마다 좌우로 끄는 비교(왼쪽=전·오른쪽=후, 보는 법은 CaseGallery 아래 안내가 맡는다).
             목록은 lib/caseLibrary.ts (빼고 싶은 사례는 거기서 한 줄 지우면 된다) ── */}
        <section className="section" id="cases">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center lg:max-w-[960px]">
              <p className="eyebrow justify-center">BEFORE &amp; AFTER</p>
              <h2 className="display-sm mt-4">
                광화문 선치과 <span className="accent">실제 치료 전후</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="대표원장이 직접 진료한 사례입니다." />
              </p>
            </div>
            <div className="reveal mt-10">
              <CaseGallery filter />
            </div>
          </div>
        </section>

        {/* ── 위생·소독 — AI 사진 배경 띠 ── */}
        <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-32">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('ai/wide-clinic')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-30" data-parallax="0.2" />
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
                환자마다 <span className="accent-sun">멸균한 기구</span>로 진료합니다
              </h2>
              <p className="mt-4 text-[1.05rem] leading-[1.8] text-white/75">진료 기구는 멸균 후 개별 포장해 1인 1기구로 사용하고, 유니트체어 용수와 진료실 공기까지 관리합니다.</p>
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

        {/* ── 영상 — 2026-09-29 원장 피드백 7번: 임플란트 구역에서 빼서 FAQ 바로 위로 내렸다 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[820px] text-center lg:max-w-[960px]">
              <p className="eyebrow justify-center">YOUTUBE</p>
              <h2 className="display-sm mt-4">
                영상으로 보는 <span className="accent">광화문 선치과 임플란트</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="디지털 임플란트와 풀아치 임플란트의 진료 과정을 영상으로 확인하실 수 있습니다." />
              </p>
            </div>
            {/* 폰에서는 영상 네 편을 옆으로 넘기는 한 줄로(세로로 쌓으면 1,000px 넘게 길어진다) — 넓은 화면은 2×2 */}
            <div className="reveal-stack mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0">
              {CLINIC.videos.map((v) => (
                <div key={v.id} className="w-[84%] shrink-0 snap-start sm:w-auto sm:shrink">
                  <VideoFacade id={v.id} poster={v.thumb} title={v.title} />
                  <p className="mt-3 text-[15px] font-semibold text-ink sm:text-[15.5px]">{v.title}</p>
                </div>
              ))}
            </div>
          </div>
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
                <Sentences text="진료시간과 주차부터 건강보험 적용 기준까지, 자주 받는 질문을 모았습니다. 더 많은 문답은 FAQ 페이지에 있습니다." />
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
            <div className="reveal mx-auto max-w-[820px] text-center lg:max-w-[960px]">
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
                      <li key={h.label} className="flex items-center justify-between gap-3 py-2.5 text-[16px]">
                        <span className="font-semibold text-ink">
                          {h.label}
                          {/* 폰에서는 알림표를 요일 아래 줄로 — 시간이 두 줄로 쪼개지지 않게 */}
                          {h.note && <span className="mt-1 !block w-fit pill-sun !py-0.5 !text-[11px] sm:ml-2 sm:mt-0 sm:!inline-flex">{h.note}</span>}
                        </span>
                        <span className="shrink-0 whitespace-nowrap font-bold tabular-nums text-brand-800">{h.time}</span>
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
                    이달의 진료일정 보기 →
                  </Link>
                </div>
              </div>
            </div>
            {/* 숫자 카드 — 2026-09-29 원장 피드백 4번 "의미 없는 숫자, 맨 아래로" → 강점 구역에서 여기(맨 아래)로 내리고
                오시는 길에 쓸모 있는 숫자만 남겼다(HomeStats) */}
            <HomeStats />
          </div>
        </section>

        <ContactBand />
        <MedicalNotice />
      </main>
    </>
  );
}
