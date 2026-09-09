import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage, type CollageCard } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { CardLink, ContactBand, FaqList, MedicalNotice, Sentences } from '@/components/ui';
import { figSize, figSrc, type Doc, type Fig } from '@/lib/docs';
import { docByPath, docsOfHub } from '@/lib/content';
import { TMJ_CAUSES, TMJ_EQUIP, TMJ_HERO, TMJ_KNOWHOW, TMJ_PROCESS, TMJ_STEPS, TMJ_SYMPTOMS } from '@/lib/content/tmjLanding';
import { breadcrumbSchema, faqSchema, imageObjectSchema, itemListSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC, HOURS, MONTHLY_NOTICE } from '@/lib/clinic';

/**
 * 턱관절 허브 전용 화면 — 레퍼런스(tmjdoctor.co.kr 턱관절)의 짜임새를 따른다(오너: "똑같이 따라해도 된다").
 *  흰 바탕 · 가운데 정렬 큰 글자(TMJ · ! · ? · 3 · 5 · FAQ) · 오른쪽 고정 사이드바(원장 배너 · 안내 목록 · 진단 과정 · 진료시간 · 질문).
 *  글·사진은 옛 홈페이지 캡처와 오너 제공 실사(lib/content/tmjLanding.ts). 구조화 데이터·FAQ 는 Doc(lib/content/tmj.ts)에서 그대로.
 *  ★ 구역 이동 목차는 두지 않는다(오너 지시). 사이드바의 '자주 묻는 질문' 은 FAQ 로 내려가는 링크뿐이다.
 */
/** 히어로 사진 카드 3장 — 오너 실사. 원본 비율 그대로(HeroCollage 가 자르지 않는다) */
const HERO_CARDS: [CollageCard, CollageCard, CollageCard] = [
  { fig: { key: 'sun/circle-treatment', alt: '확대경을 쓰고 치료하는 양대일 원장' }, shape: 'portrait' },
  { fig: { key: 'sun/doctor-arms', alt: '진료실에서 팔짱을 낀 양대일 원장' }, shape: 'wide' },
  { fig: { key: 'sun/tmj-explain-skull-2', alt: '두개골 모형으로 턱관절을 설명하는 양대일 원장' }, shape: 'std' },
];
const CHILD_FIG: Record<string, Fig> = {
  '/treatment/tmj/symptoms': { key: 'ai/tmj-symptoms', alt: '턱관절 주요 증상과 원인' },
  '/treatment/tmj/treatments': { key: 'orig/tmj-tx-splint', alt: '턱관절 치료 방법' },
};

export function TmjPage({ doc }: { doc: Doc }) {
  const trail = [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }];
  const children = docsOfHub(doc.path);
  const related = (doc.related ?? []).map(docByPath).filter((d): d is Doc => !!d && d.hub !== doc.hub);
  const hero = TMJ_HERO.fig;
  const heroSize = figSize(hero.key);
  const shortSummary = (s: string) => s.split(/(?<=다\.)\s/)[0];

  const schema: unknown[] = [
    breadcrumbSchema(trail),
    medicalWebPageSchema({
      title: doc.title,
      description: doc.description,
      path: doc.path,
      image: { src: figSrc(hero.key), caption: hero.alt, width: heroSize.w, height: heroSize.h },
      related: [...(doc.related ?? []), ...children.map((c) => c.path)],
    }),
    imageObjectSchema({ path: doc.path, src: figSrc(hero.key), caption: hero.alt, width: heroSize.w, height: heroSize.h }),
  ];
  if (children.length) schema.push(itemListSchema(doc.path, children.map((c) => ({ name: c.title, path: c.path })), `${doc.title} 세부 안내`));
  if (doc.faq?.length) schema.push(faqSchema(doc.faq, doc.path));

  const guides = [
    { label: '턱관절 주요 증상과 원인', href: '/treatment/tmj/symptoms' },
    { label: '턱관절 치료 방법 5가지', href: '/treatment/tmj/treatments' },
    { label: '턱에서 딱딱 소리가 나요', href: '/insight/symptom/jaw-clicking' },
    { label: '턱관절 치료는 어떤 순서로 하나요', href: '/insight/guide/tmj-treatment-flow' },
    { label: '의료진 소개 · 양대일 원장', href: '/about/doctors' },
  ].filter((g) => g.href.startsWith('/about') || docByPath(g.href));

  return (
    <>
      <SiteHeader dark />
      <JsonLd data={schema} />
      <main id="main" className="bg-white">
        {/* 첫 화면 — 다른 서브페이지와 같은 콜라주 히어로(오너: "맨 위에만 다른 서브페이지처럼"). 배경·카드 모두 오너 실사, 제목은 원본 첫 배너 문구 */}
        <HeroCollage
          trail={trail}
          eyebrow="TMJ · 턱관절"
          lines={[TMJ_HERO.line1, <span key="l2" className="accent-sun">{TMJ_HERO.line2}</span>]}
          lead={TMJ_HERO.desc}
          bg={TMJ_HERO.bg.key}
          cards={HERO_CARDS}
          items={TMJ_KNOWHOW.items.map((k) => ({ title: k.title, desc: k.desc.split(/(?<=다.)s/)[0] }))}
        >
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.phoneHref} className="btn-ghost-dark">전화 {CLINIC.phone}</a>
          </div>
        </HeroCollage>

        <div className="wrap grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:pt-24 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ───────── 본문 ───────── */}
          <div className="min-w-0">
            {/* 1. TMJ 큰 글자 — 레퍼런스 첫 구역. 제목·설명은 히어로가 맡았으니 여기는 글자와 특징 세 개만 */}
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

            {/* 2. 경고 — ! + 증상 4가지 (원본 3가지 + 연관통) */}
            <section className="pt-20 md:pt-28" aria-labelledby="tmj-symptoms">
              <div className="reveal text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sun-500 text-[2.2rem] font-extrabold leading-none text-white shadow-[0_12px_30px_rgba(242,111,30,0.35)]" aria-hidden>!</span>
                <h2 id="tmj-symptoms" className="display-sm mt-6">
                  턱관절이 보내는 신호,
                  <br />
                  <span className="accent-sun">내 턱도 치료가 필요할까요?</span>
                </h2>
                <p className="lead mx-auto mt-4 max-w-[640px]">
                  <Sentences text="턱관절 장애는 단순히 턱에만 머물지 않습니다. 관절 사이의 디스크가 제자리를 벗어나면 씹는 근육이 굳고, 두통이나 목·어깨 결림처럼 엉뚱한 곳의 통증으로 이어지기도 합니다." clauses={false} />
                </p>
              </div>
              <ol className="reveal-stack mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
                {TMJ_SYMPTOMS.map((s, i) => (
                  <li key={s.num} className="relative text-center">
                    <span className={`mx-auto flex h-[128px] w-[128px] flex-col items-center justify-center rounded-full text-white shadow-[var(--shadow-lift)] md:h-[148px] md:w-[148px] ${s.tone === 'sun' ? 'bg-sun-500' : 'bg-night-2'}`}>
                      <span className="text-[1.35rem] font-extrabold leading-none tracking-[-0.02em] md:text-[1.6rem]">{s.num}</span>
                      <span className="mt-2 text-[15px] font-bold md:text-[17px]">{s.label}</span>
                    </span>
                    {i < TMJ_SYMPTOMS.length - 1 && (
                      <span aria-hidden className="absolute right-[-14px] top-[60px] hidden text-[1.4rem] text-ink-muted/60 lg:block">›</span>
                    )}
                    <span className="mx-auto mt-6 block aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-canvas-2 img-in">
                      <Image src={figSrc(s.fig.key)} alt={s.fig.alt} width={figSize(s.fig.key).w} height={figSize(s.fig.key).h} sizes="220px" className="h-full w-full object-cover" />
                    </span>
                    <p className="mx-auto mt-4 max-w-[230px] text-[15px] leading-[1.75] text-ink-soft">
                      <Sentences text={s.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* 3. 원인 — ? + 3가지 카드 */}
            <section className="pt-24 md:pt-32" aria-labelledby="tmj-causes">
              <div className="reveal text-center">
                <span className="tmj-big !text-[4.5rem] md:!text-[6rem]" aria-hidden>?</span>
                <h2 id="tmj-causes" className="display-sm mt-4">
                  원인을 알아야
                  <br />
                  <span className="accent-sun">근본 치료</span>가 가능합니다
                </h2>
                <p className="lead mx-auto mt-4 max-w-[640px]">
                  <Sentences text="턱관절 장애는 한 가지 원인으로 생기기보다 관절에 가해지는 부담, 생활 습관, 심리적인 긴장이 겹쳐서 나타나는 경우가 많습니다. 그래서 진단은 원인을 나누어 보는 데서 시작합니다." clauses={false} />
                </p>
              </div>
              <ul className="reveal-stack mt-12 grid gap-6 sm:grid-cols-3">
                {TMJ_CAUSES.map((c) => (
                  <li key={c.title} className="text-center">
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-canvas-2 img-in">
                      <Image src={figSrc(c.fig.key)} alt={c.fig.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    </span>
                    <h3 className="mt-5 text-[1.2rem] font-extrabold text-ink">{c.title}</h3>
                    <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-[1.75] text-ink-soft">
                      <Sentences text={c.desc} clauses={false} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. 노하우 — 3 + 실사 띠 + 원 3개(원본 사진) */}
            <section className="pt-24 md:pt-32" aria-labelledby="tmj-knowhow">
              <div className="reveal text-center">
                <p className="tmj-big" aria-hidden>
                  3<span className="ml-1 align-baseline text-[1.6rem] font-bold tracking-normal text-ink md:text-[2rem]">가지</span>
                </p>
                <h2 id="tmj-knowhow" className="display-sm mt-4">
                  광화문선치과
                  <br />
                  턱관절 진료 <span className="accent-sun">노하우</span>
                </h2>
                <p className="lead mx-auto mt-4 max-w-[680px]">
                  <Sentences text={TMJ_KNOWHOW.lead} clauses={false} />
                </p>
              </div>
              <div className="reveal relative mt-12 overflow-hidden rounded-[28px] bg-night">
                {/* ★ aspect-ratio 에 min-h 를 같이 주면 높이에 맞춰 폭이 늘어나 글이 잘린다 — 화면 폭별 비율로만 정한다 */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
                  <Image src={figSrc(TMJ_KNOWHOW.band.key)} alt={TMJ_KNOWHOW.band.alt} fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover object-[50%_30%]" data-parallax="0.12" />
                  <div className="absolute inset-0 bg-gradient-to-b from-night/75 via-night/25 to-night/70" />
                  <div className="absolute inset-x-0 top-0 px-5 py-6 text-center md:p-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-sun-300 md:text-[12px]">SUN DENTAL TMJ SYSTEM</p>
                    <p className="on-photo mt-2 text-[1.25rem] font-extrabold leading-[1.3] text-white sm:text-[1.6rem] md:mt-3 md:text-[2.1rem]" style={{ wordBreak: 'keep-all' }}>{TMJ_KNOWHOW.bandTitle}</p>
                    <p className="mt-2 text-[13.5px] text-white/80 md:text-[16.5px]" style={{ wordBreak: 'keep-all' }}>{TMJ_KNOWHOW.title}</p>
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

            {/* 5. 치료 5가지 — 5 step 목록(원본 사진) */}
            <section className="pt-24 md:pt-32" aria-labelledby="tmj-steps">
              <div className="reveal text-center">
                <p className="tmj-big" aria-hidden>
                  5<span className="ml-1 align-baseline text-[1.6rem] font-bold tracking-normal text-ink md:text-[2rem]">가지</span>
                </p>
                <h2 id="tmj-steps" className="display-sm mt-4">
                  턱관절, <span className="accent-sun">어떻게 치료</span>해야 할까요?
                </h2>
                <p className="lead mx-auto mt-4 max-w-[680px]">
                  <Sentences text="간단한 약물치료와 물리치료부터 보톡스, 스플린트 장치치료, 관절강 세척술까지 한곳에서 이어서 진행합니다. 일반적으로 부담이 적은 치료부터 시작하고, 진단 결과에 따라 방법을 조합합니다." clauses={false} />
                </p>
              </div>
              <ol className="reveal-stack mt-12 border-t border-hairline">
                {TMJ_STEPS.map((s, i) => (
                  <li key={s.title} className="grid items-center gap-5 border-b border-hairline py-6 md:grid-cols-[210px_72px_1fr] md:gap-7">
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-canvas-2">
                      <Image src={figSrc(s.fig.key)} alt={s.fig.alt} fill sizes="(max-width: 768px) 100vw, 210px" className="object-cover" />
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
            </section>

            {/* 6. 장비 — PHL-15 · 디지털 CT (원본 배너 문구) */}
            <section className="pt-20 md:pt-28" aria-labelledby="tmj-equip">
              <h2 id="tmj-equip" className="sr-only">턱관절 진료 장비</h2>
              <ul className="reveal-stack grid gap-5 md:grid-cols-2">
                {TMJ_EQUIP.map((e) => (
                  <li key={e.title} className="card flex gap-5 p-5 md:p-6">
                    <span className="flex w-[110px] shrink-0 items-center justify-center rounded-xl bg-canvas-2 p-2 md:w-[130px]">
                      <Image src={figSrc(e.fig.key)} alt={e.fig.alt} width={figSize(e.fig.key).w} height={figSize(e.fig.key).h} sizes="130px" className="h-auto max-h-[230px] w-auto max-w-full object-contain" />
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

            {/* 7. FAQ — 화면 = FAQPage 스키마(같은 배열) */}
            {doc.faq && doc.faq.length > 0 && (
              <section className="pt-24 md:pt-32" aria-labelledby="tmj-faq" id="faq-section">
                <div className="reveal text-center">
                  <p className="tmj-big" aria-hidden>FAQ</p>
                  <h2 id="tmj-faq" className="display-sm mt-4">자주 묻는 질문입니다</h2>
                </div>
                <div className="reveal mt-10 rounded-[28px] border border-hairline bg-canvas p-5 md:p-10">
                  <FaqList items={doc.faq} />
                </div>
                <p className="mt-8 text-center text-[15px] leading-relaxed text-ink-soft">
                  턱관절 주요 증상과 원인, 치료 방법 다섯 가지는 별도 페이지에 정리해 두었습니다.
                  <br />
                  <Link href="/treatment/tmj/symptoms" className="mt-2 inline-block font-bold text-sun-600 underline-offset-4 hover:underline">주요 증상 보기 ›</Link>
                  <span className="mx-3 text-hairline">|</span>
                  <Link href="/treatment/tmj/treatments" className="mt-2 inline-block font-bold text-sun-600 underline-offset-4 hover:underline">치료 방법 보기 ›</Link>
                </p>
              </section>
            )}
          </div>

          {/* ───────── 사이드바 (넓은 화면은 오른쪽 고정, 좁은 화면은 본문 아래) ───────── */}
          <aside className="space-y-6 lg:self-start" aria-label="턱관절 진료 안내">
            {/* 원장 배너 */}
            <Link href="/about/doctors" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-night shadow-[var(--shadow-soft)]">
              <Image src={figSrc('sun/doctor-arms')} alt="진료실에서 팔짱을 낀 양대일 원장" fill sizes="360px" className="object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-[1.04]" />
              <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="block text-[12px] font-bold tracking-[0.18em] text-sun-300">보건복지부 인증 전문의</span>
                <span className="mt-1 block text-[1.15rem] font-extrabold leading-snug">양대일 원장이 직접 진단하고 치료합니다</span>
                <span className="mt-1 block text-[13px] text-white/75">강남성심병원 외래교수 출신 · 의료진 소개 ›</span>
              </span>
            </Link>

            {/* 안내 목록 */}
            <div className="card p-5">
              <p className="flex items-baseline justify-between">
                <span className="text-[1.15rem] font-extrabold text-ink">턱관절 <span className="text-sun-500">안내</span></span>
                <Link href="/insight" className="text-[12.5px] font-semibold text-ink-muted hover:text-brand-700">more +</Link>
              </p>
              <ul className="mt-3 divide-y divide-hairline">
                {guides.map((g) => (
                  <li key={g.href}>
                    <Link href={g.href} className="flex items-center justify-between gap-3 py-2.5 text-[14.5px] font-semibold text-ink-soft hover:text-brand-700">
                      <span className="truncate">{g.label}</span>
                      <span aria-hidden className="text-ink-muted">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 진단 과정 */}
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

            {/* 진료상담안내 */}
            <div className="card p-5">
              <p className="text-[1.1rem] font-extrabold text-ink">진료상담안내</p>
              <a href={CLINIC.phoneHref} className="mt-1 block text-[1.9rem] font-extrabold tracking-[-0.03em] text-brand-800 hover:text-sun-600">{CLINIC.phone}</a>
              <dl className="mt-3 divide-y divide-hairline text-[14px]">
                {HOURS.display.map((h) => (
                  <div key={h.label} className="flex items-baseline justify-between gap-3 py-2">
                    <dt className="font-semibold text-ink">
                      {h.label}
                      {h.note && <span className="ml-1.5 text-[12px] font-semibold text-sun-600">{h.note}</span>}
                    </dt>
                    <dd className="tabular-nums text-ink-soft">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12.5px] leading-[1.6] text-ink-muted">{HOURS.closed}</p>
              <p className="mt-4 rounded-xl bg-sun-50 px-4 py-3 text-[12.5px] leading-[1.6] text-sun-700">
                <span className="font-bold">{MONTHLY_NOTICE.title}</span>
                <br />
                {MONTHLY_NOTICE.items.map((it) => `${it.dates} ${it.label}`).join(' · ')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun !px-3 !py-2.5 text-center text-[14px]">네이버 예약</a>
                <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="btn-ghost !px-3 !py-2.5 text-center text-[14px]">톡톡 상담</a>
              </div>
            </div>

            {/* 자주 묻는 질문 — 아래 FAQ 로 내려가는 링크 */}
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

        {/* 하위 문서 카드 + 관련 안내 */}
        <section className="section bg-canvas mt-24 md:mt-32">
          <div className="wrap">
            <p className="eyebrow reveal">MENU</p>
            <h2 className="display-sm reveal mt-4">{doc.title} 세부 안내</h2>
            <div className="reveal-stack grid-cards mt-10 sm:grid-cols-2 lg:grid-cols-4">
              {children.map((c, i) => (
                <CardLink key={c.path} href={c.path} label={c.title} desc={shortSummary(c.summary)} num={String(i + 1).padStart(2, '0')} fig={CHILD_FIG[c.path] ?? { key: c.hero?.key ?? 'ai/wide-tmj', alt: c.title }} />
              ))}
              {related.slice(0, 4 - children.length).map((r) => (
                <CardLink key={r.path} href={r.path} label={r.title} desc={shortSummary(r.summary)} fig={{ key: r.hero?.key ?? 'ai/faq', alt: r.title }} />
              ))}
            </div>
          </div>
        </section>

        <ContactBand bg="ai/wide-tmj" title="턱에서 소리가 나거나 입이 잘 안 벌어지시나요?" text="검사 후 원인을 알기 쉽게 설명해 드립니다. 네이버 예약이나 전화로 편하게 문의해 주세요." />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}
