import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage, type CollageCard } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { TmjSelfCheck } from '@/components/TmjSelfCheck';
import { CaseGallery } from '@/components/CaseGallery';
import { ContactBand, FaqList, MedicalNotice, Sentences } from '@/components/ui';
import { ContactCard, DoctorCard } from '@/components/SideRail';
import { docCharCount, figSize, figSrc, fitsBox, type Doc, type Fig } from '@/lib/docs';
import { docByPath, docsOfHub } from '@/lib/content';
import { casesOf } from '@/lib/caseLibrary';
import { HERO_COLLAGE, splitAccent } from '@/lib/heroCollage';
import {
  BRUX_CARE,
  BRUX_CAUSES,
  BRUX_COMPARE,
  BRUX_DAMAGE,
  BRUX_DIAGNOSIS,
  BRUX_DIAGNOSIS_FIG,
  BRUX_SELF_CHECK,
  BRUX_TREATMENT_NOTE,
  BRUX_TREATMENTS,
  BRUX_WHAT,
  SECTIONS,
  TMJ_ANATOMY,
  TMJ_ARTHRO,
  TMJ_ASYMMETRY_CAUSES,
  TMJ_ASYMMETRY_SIGNS,
  TMJ_BODY_CHAIN,
  TMJ_BODY_CHECK,
  TMJ_BODY_NOTE,
  TMJ_CAUSE_DETAIL,
  TMJ_CAUSES,
  TMJ_CONTACT,
  TMJ_DISC,
  TMJ_EQUIP,
  TMJ_FAQ_HEAD,
  TMJ_PHYSIO,
  TMJ_LETTER,
  TMJ_AWARD,
  TMJ_HABITS,
  TMJ_HERO,
  TMJ_HERO_ITEMS,
  TMJ_HUB_HERO_ITEMS,
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
  TMJ_TYPES,
  type TmjSection,
} from '@/lib/content/tmjLanding';
import { articleSchema, breadcrumbSchema, faqSchema, imageObjectSchema, itemListSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC } from '@/lib/clinic';

/**
 * 턱관절 — 허브 1 + 하위 3쪽이 **이 한 화면**을 쓴다. 경로별로 보여 줄 구역을 VIEWS 에서 고른다.
 *  허브(장애란): 진료 특징 → 장애란+3대 증상 → 구조(도해)·운동·관절원판 전방 변위(도해)·연관통 → 원인 → 진료 방식 → 장비 → FAQ → 하위 쪽 카드
 *  symptoms: 주요 증상 → 분류(도해) → 거울 앞 자가진단+점검표 → 전신 증상
 *  bruxism(2026-09-29 신설): 이갈이란 → 원인 → 나타나는 문제(도해) → 자가 체크 → 진단 → 치료(+기성 마우스피스와의 차이) → 생활 관리
 *  treatment: 치료 다섯 가지 → 원칙·교합안정장치·관절강 세척술·보조 치료 → 생활 관리 → 치료 경과 사례
 *  첫 화면은 하위 쪽이면 lib/heroCollage 표(카드 글은 TMJ_HERO_ITEMS), 허브면 TMJ_HERO. 구조화 데이터·FAQ 는 쪽마다의 Doc(lib/content/tmj.ts).
 *  오른쪽 사이드바: 원장 배너 · 네 쪽 안내(메뉴와 같은 순서, 지금 쪽 진하게) · 진단 과정 · 진료시간 · 질문.
 * ★ 2026-09-29 원장 피드백 16번 — 큰 장식 글자(TMJ·TMD·ANATOMY·!·?·3·5·6·FAQ·2갈래)와 영문 눈썹(MOTION·REFERRED PAIN·SELF TEST·
 *   PRINCIPLE·SUPPORT 등)을 전부 **짧은 한글 소제목(Label)** 으로 바꿨다. 한글을 큰 장식 크기로 키우면 어색해 눈썹 크기로 줄였다.
 * ★ 페이지 안 구역 이동 목차(점프 메뉴)는 두지 않는다(오너 지시) — 사이드바 안내는 메뉴와 같은 **쪽** 링크다.
 * ★ 카드에 3D 기울기(card-3d)를 쓰지 않는다(원장 피드백 5번 — 가독성을 해친다).
 */
const HERO_CARDS: [CollageCard, CollageCard, CollageCard] = [
  { fig: { key: 'sun/circle-treatment', alt: '확대경을 쓰고 치료하는 양대일 원장' }, shape: 'portrait' },
  { fig: { key: 'sun/doctor-arms', alt: '진료실에서 팔짱을 낀 양대일 원장' }, shape: 'wide' },
  { fig: { key: 'sun/tmj-explain-skull-2', alt: '두개골 모형으로 턱관절을 설명하는 양대일 원장' }, shape: 'std' },
];

/** 제목 — {중괄호}는 주황 강조, \n 은 줄바꿈 */
function Title({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {splitAccent(line).map((p, k) => (p.accent ? <span key={k} className="accent-sun">{p.text}</span> : <Fragment key={k}>{p.text}</Fragment>))}
        </Fragment>
      ))}
    </>
  );
}

/** 짧은 한글 소제목 — 옛 큰 장식 글자·영문 눈썹 자리. 가운데 정렬이면 양옆에, 왼쪽 정렬이면 앞에만 가는 선 */
function Label({ children, center = true, light = false }: { children: ReactNode; center?: boolean; light?: boolean }) {
  const line = <span aria-hidden className="h-px w-5 shrink-0 bg-current opacity-50 md:w-7" />;
  return (
    <p className={`inline-flex items-center gap-2.5 text-[14px] font-bold leading-none md:text-[15px] ${light ? 'text-sun-300' : 'text-sun-600'}`}>
      {line}
      {children}
      {center && line}
    </p>
  );
}

/** 구역 머리 — 한글 소제목 + 제목(h2) + 한 줄 */
function Head({ id, s, lead }: { id: string; s: TmjSection; lead?: string }) {
  const l = lead ?? s.lead;
  return (
    <div className="reveal text-center">
      <Label>{s.label}</Label>
      <h2 id={id} className="display-sm mt-4">
        <Title text={s.title} />
      </h2>
      {l && (
        <p className="lead mx-auto mt-4 max-w-[640px] lg:max-w-[960px]">
          <Sentences text={l} clauses={false} />
        </p>
      )}
    </div>
  );
}
/**
 * 구역 안 소제목 — 큰 구역(Head) 아래 덩어리가 여럿일 때 덩어리마다 붙인다(오너 "너무 몰려 있다", 2026-09-21).
 * 위 여백을 크게(mt-16/24) 두어 앞 덩어리와 갈라 보이게 하는 것이 역할의 절반이다.
 */
function SubHead({ s }: { s: TmjSection }) {
  return (
    <div className="reveal mt-16 text-center md:mt-24">
      <Label>{s.label}</Label>
      <h3 className="mt-3 text-[1.4rem] font-extrabold leading-tight text-ink md:text-[1.7rem]">
        <Title text={s.title} />
      </h3>
      {s.lead && (
        <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-[1.75] text-ink-soft lg:max-w-[880px]">
          <Sentences text={s.lead} clauses={false} />
        </p>
      )}
    </div>
  );
}

/** 설명 도해(illust/*, 1200×800) — 흰 바탕에 잘리지 않게 통째로 */
function Illust({ fig, sizes, className = '' }: { fig: Fig; sizes: string; className?: string }) {
  return (
    <figure className={className}>
      <span className="img-in relative block aspect-[3/2] overflow-hidden rounded-[24px] border border-hairline bg-white">
        <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes={sizes} className="object-contain" />
      </span>
      {fig.caption && <figcaption className="mt-2.5 text-center text-[13px] leading-snug text-ink-muted">{fig.caption}</figcaption>}
    </figure>
  );
}

const Check = () => (
  <svg aria-hidden viewBox="0 0 20 20" className="mt-[3px] h-4 w-4 shrink-0 text-sun-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8.5" className="opacity-30" />
    <path d="m6.5 10.3 2.4 2.4 4.8-5" />
  </svg>
);
const Dot = ({ tone = 'bg-sun-500' }: { tone?: string }) => <span className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} aria-hidden />;

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

/** 턱관절 장애의 3대 증상 — 허브(장애란)와 구조 구역이 같은 상자를 쓴다 */
function Triad({ className = '' }: { className?: string }) {
  return (
    <div className={`reveal rounded-[28px] bg-night p-7 text-white md:p-10 ${className}`}>
      <Label center={false} light>{SECTIONS.triad.label}</Label>
      <h3 className="mt-3 text-[1.3rem] font-extrabold md:text-[1.5rem]">{SECTIONS.triad.title}</h3>
      <ol className="mt-6 grid gap-5 sm:grid-cols-3">
        {TMJ_ANATOMY.triad.map((t) => (
          <li key={t.n} className="border-t border-white/15 pt-4">
            <span className="block text-[13px] font-extrabold tracking-[0.18em] text-sun-300">{t.n}</span>
            <span className="mt-1.5 block text-[1.1rem] font-bold">{t.title}</span>
            <span className="mt-1.5 block text-[14.5px] leading-[1.7] text-white/70"><Sentences text={t.desc} /></span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * 상장 자리 — 사진이 오면(TMJ_AWARD.photo) 그 사진을, 오기 전에는 글자로 그린 액자를 둔다.
 * ★ 액자 틀은 사진 비율(세로 3:4)과 같은 크기라 사진이 와도 짜임이 흔들리지 않는다.
 * 2026-10-07 원장 PPT 46쪽 '홈화면에 턱관절 상장 이미지 추가' — 홈 턱관절 띠도 이걸 쓴다(사진이 오면 두 곳이 함께 바뀐다).
 */
export function AwardCard({ className = 'mt-10' }: { className?: string }) {
  const a = TMJ_AWARD;
  return (
    <div className={`reveal mx-auto flex max-w-[640px] items-center gap-5 rounded-2xl border border-hairline bg-white p-4 text-left shadow-[var(--shadow-soft)] md:gap-7 md:p-5 ${className}`}>
      <span className="relative block aspect-[3/4] w-[108px] shrink-0 overflow-hidden rounded-lg md:w-[132px]">
        {a.photo ? (
          <Image src={figSrc(a.photo.key)} alt={a.photo.alt} fill sizes="140px" className="object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-gradient-to-br from-[#eef0f4] via-[#d9dde5] to-[#eef0f4] p-2">
            <span className="flex h-full w-full flex-col items-center justify-center rounded-[5px] border border-[#c6ccd6] bg-white px-2 text-center">
              <span className="text-[9px] font-bold tracking-[0.12em] text-ink-muted">{a.year}</span>
              <span className="mt-1 block h-5 w-5 rounded-full bg-gradient-to-br from-sun-400 to-brand-600 opacity-80" />
              {/* 좁은 액자 안 — 붙여 쓴 상 이름이 끝 글자 하나만 넘어가지 않게 '대상' 앞에서만 끊는다(폭 없는 띄어쓰기) */}
              <span className="mt-1.5 text-[10.5px] font-extrabold leading-tight text-ink">{a.title.replace(/(\S)(대상)$/, '$1​$2')}</span>
              <span className="mt-1 text-[9px] leading-tight text-ink-soft">{a.category}</span>
            </span>
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-sun-600">
          {a.year} {a.by}
        </p>
        <p className="mt-1 text-[1.2rem] font-extrabold leading-snug text-ink md:text-[1.35rem]">{a.title}</p>
        <p className="mt-1.5 text-[15px] font-semibold text-brand-700">{a.category} 수상</p>
      </div>
    </div>
  );
}

/**
 * 맺음 편지 — 원장이 좋다고 한 참고 캡처의 짜임(어두운 진료실 사진 + 가운데 큰 글 + 단락). 글은 TMJ_LETTER.
 * ★ 본문 칸 안의 둥근 판 — 바로 아래 문의 띠(ContactBand)도 어두운 전폭 띠라, 전폭으로 두면 어두운 띠가 둘 겹친다.
 */
function TmjLetter() {
  const l = TMJ_LETTER;
  return (
    <section className="pt-24 md:pt-32" aria-labelledby="tmj-letter">
      <div className="reveal relative isolate overflow-hidden rounded-[28px] bg-night px-6 py-14 text-center text-white md:px-14 md:py-20">
        <Image src={figSrc(l.bg.key)} alt="" fill sizes="(max-width: 1024px) 380vw, 960px" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[rgba(9,11,20,0.8)]" />
        <h2 id="tmj-letter" className="mx-auto max-w-[780px] text-[1.4rem] font-bold leading-[1.6] tracking-[-0.01em] md:text-[1.85rem]">
          <Sentences text={l.title} />
        </h2>
        <span aria-hidden className="mx-auto mt-8 block h-px w-12 bg-sun-500 md:mt-10" />
        <div className="mx-auto mt-8 max-w-[720px] space-y-5 text-[15.5px] leading-[2] text-white/85 md:mt-10 md:text-[17px]">
          {l.body.map((p) => (
            <p key={p.slice(0, 12)}>
              <Sentences text={p} />
            </p>
          ))}
        </div>
        <p className="mt-10 text-[14.5px] font-semibold text-white/75 md:mt-12">
          {l.sign.role} <span className="ml-1 text-[1.2rem] font-extrabold text-white">{l.sign.name}</span>
        </p>
      </div>
    </section>
  );
}

/**
 * 쪽마다 보여 줄 구역. 한 파일의 구역을 경로별로 골라 쓴다 — 구역 JSX 를 쪽마다 복사하면 디자인을 고칠 때 여러 군데를 고쳐야 한다.
 * 목록 첫 구역은 위 여백을 두지 않는다(본문 격자의 위 여백만).
 */
const VIEWS: Record<string, string[]> = {
  '/treatment/tmj': ['intro', 'what', 'anatomy', 'causes', 'knowhow', 'equip', 'children'],
  '/treatment/tmj/symptoms': ['symptoms', 'types', 'self-tests', 'whole-body'],
  '/treatment/tmj/bruxism': ['brux-what', 'brux-causes', 'brux-damage', 'brux-check', 'brux-diagnosis', 'brux-treatment', 'brux-care'],
  '/treatment/tmj/treatment': ['steps', 'steps-detail', 'habits', 'cases'],
};

/** 메뉴와 같은 네 쪽 — 사이드바 안내가 이 순서를 그대로 쓴다(메뉴 = 목차, lib/nav.ts) */
const PAGES = [
  { label: '턱관절 장애란 · 구조 · 원인', href: '/treatment/tmj' },
  { label: '증상 · 자가진단 · 전신 증상', href: '/treatment/tmj/symptoms' },
  { label: '이갈이 · 이악물기', href: '/treatment/tmj/bruxism' },
  { label: '턱관절 장애의 치료법', href: '/treatment/tmj/treatment' },
];

/** 허브 '더 알아보기' 카드 사진 — 쪽마다 다른 사진(같은 사진 반복 금지), 설명도 그 사진의 것 */
const CHILD_FIG: Record<string, Fig> = {
  '/treatment/tmj/symptoms': { key: 'scene/tmj-sym-3', alt: '입이 벌어지는 정도를 자로 재는 모습' },
  '/treatment/tmj/bruxism': { key: 'illust/bruxism-muscle', alt: '머리뼈 옆모습에 측두근과 교근을 붉게 표시한 도해' },
  '/treatment/tmj/treatment': { key: 'orig/tmj-tx-splint', alt: '석고 모형 위에 올린 투명 교합안정장치' },
};

export function TmjPage({ doc }: { doc: Doc }) {
  const isHub = doc.path === doc.hub;
  const views = VIEWS[doc.path] ?? [];
  const show = (key: string) => views.includes(key);
  /** 쪽의 첫 구역이면 위 여백 없음 */
  const top = (key: string, cls = 'pt-20 md:pt-28') => (views[0] === key ? '' : cls);
  const trail = [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }];
  if (!isHub) trail.push({ name: doc.title, path: doc.path });
  /* 대표 사진 — 허브는 오너 실사, 하위 쪽은 문서가 지정한 사진 */
  const hero = isHub ? TMJ_HERO.fig : (doc.hero ?? TMJ_HERO.fig);
  const heroSize = figSize(hero.key);
  const first = (s: string) => s.split(/(?<=다\.)\s/)[0];
  const children = isHub ? docsOfHub(doc.hub) : [];
  /* 첫 화면 — 하위 쪽은 lib/heroCollage 표(제목 두 줄), 허브는 TMJ_HERO */
  const collage = isHub ? null : HERO_COLLAGE[doc.path];
  const heroLines: [ReactNode, ReactNode?] = collage
    ? (collage.lines.map((l) => (l ? <Title key={l} text={l} /> : undefined)) as [ReactNode, ReactNode?])
    : [TMJ_HERO.line1, <span key="l2" className="accent-sun">{TMJ_HERO.line2}</span>];
  const heroCards = collage?.cards ?? HERO_CARDS;
  const heroLead = collage?.lead ?? TMJ_HERO.desc;
  const heroCardsLead = collage?.cardsLead ?? TMJ_HERO.cardsLead;
  const heroItems = isHub
    ? TMJ_HUB_HERO_ITEMS
    : (TMJ_HERO_ITEMS[doc.path] ?? [{ title: doc.title, desc: first(doc.summary) }]);
  const faqHead = TMJ_FAQ_HEAD[doc.path] ?? TMJ_FAQ_HEAD['/treatment/tmj'];
  const contact = TMJ_CONTACT[doc.path] ?? TMJ_CONTACT['/treatment/tmj'];
  const hasCases = casesOf(['tmj']).length > 0;

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
  if (!isHub) schema.push(articleSchema({ path: doc.path, title: doc.title, description: doc.description, wordCount: docCharCount(doc), hasImage: true, keywords: doc.keywords }));
  if (isHub && children.length) schema.push(itemListSchema(doc.path, children.map((c) => ({ name: c.title, path: c.path })), `${doc.title} 세부 안내`));
  if (doc.faq?.length) schema.push(faqSchema(doc.faq, doc.path));

  /* 사이드바 안내 — 메뉴와 같은 네 쪽 + 인사이트 두 편. 지금 쪽은 진하게 */
  const guides = [
    ...PAGES,
    { label: '턱에서 딱딱 소리가 나요', href: '/insight/symptom/jaw-clicking' },
    { label: '턱관절 치료는 어떤 순서로 하나요', href: '/insight/guide/tmj-treatment-flow' },
  ].filter((g) => g.href.startsWith('/treatment/tmj') || docByPath(g.href));

  return (
    <>
      <SiteHeader dark />
      <JsonLd data={schema} />
      <main id="main" className="bg-white">
        <HeroCollage
          trail={trail}
          eyebrow={doc.eyebrow}
          cardsLead={heroCardsLead}
          lines={heroLines}
          lead={heroLead}
          long
          bg={TMJ_HERO.bg.key}
          cards={heroCards}
          items={heroItems}
        >
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.phoneHref} className="btn-ghost-dark">전화 {CLINIC.phone}</a>
          </div>
        </HeroCollage>

        <div className="wrap grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:pt-24 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ───────── 본문 ───────── */}
          <div className="min-w-0">
            {/* ── 허브: 진료 특징 — 옛 'TMJ' 큰 글자 자리 ── */}
            {show('intro') && (
              <section className={`text-center ${top('intro')}`} aria-labelledby="tmj-intro">
                <Head id="tmj-intro" s={SECTIONS.intro} />
                <ul className="reveal-stack mt-6 flex flex-wrap justify-center gap-2" aria-label="진료 특징">
                  {TMJ_HERO.tags.map((t, i) => (
                    <li key={t} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[14px] font-bold text-ink">
                      <span className="text-[12px] font-extrabold text-sun-500">0{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
                {TMJ_AWARD.show && <AwardCard />}
              </section>
            )}

            {/* ── 허브: 턱관절 장애란 + 3대 증상 ── */}
            {show('what') && (
              <section className={top('what')} aria-labelledby="tmj-what">
                <Head id="tmj-what" s={SECTIONS.what} />
                <Triad className="mt-10" />
              </section>
            )}

            {/* ── 허브: 구조(도해) → 운동 → 관절원판 전방 변위(도해) → 연관통 ── */}
            {show('anatomy') && (
              <section id="anatomy" className={`scroll-mt-[96px] ${top('anatomy')}`} aria-labelledby="tmj-anatomy">
                <Head id="tmj-anatomy" s={SECTIONS.anatomy} />
                {/* 도해는 이름표가 읽히게 넓게, 네 부분 설명은 그 아래 2열 */}
                <div className="reveal-stack mt-12">
                  <Illust fig={TMJ_ANATOMY.fig} sizes="(max-width: 1024px) 100vw, 860px" className="mx-auto max-w-[860px]" />
                  <ol className="mt-6 grid gap-3 md:grid-cols-2">
                    {TMJ_ANATOMY.parts.map((p, i) => (
                      <li key={p.title} className="card flex gap-4 p-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[13.5px] font-extrabold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="block text-[1.05rem] font-extrabold text-ink">{p.title}</span>
                          <span className="mt-1 block text-[14.5px] leading-[1.7] text-ink-soft">
                            <Sentences text={p.desc} clauses={false} />
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <SubHead s={SECTIONS.motion} />
                <ul className="reveal-stack mt-8 grid gap-4 md:grid-cols-2">
                  {TMJ_ANATOMY.motions.map((m) => (
                    <li key={m.title} className="card p-6 md:p-7">
                      <h4 className="text-[1.1rem] font-extrabold text-ink">{m.title}</h4>
                      <p className="mt-2 text-[14.5px] leading-[1.8] text-ink-soft">
                        <Sentences text={m.desc} clauses={false} />
                      </p>
                    </li>
                  ))}
                </ul>
                <SubHead s={SECTIONS.disc} />
                <Illust fig={TMJ_DISC.fig} sizes="(max-width: 1024px) 100vw, 860px" className="reveal mx-auto mt-8 max-w-[860px]" />
                <ul className="reveal-stack mt-6 grid gap-4 md:grid-cols-2">
                  {TMJ_DISC.types.map((t, i) => (
                    <li key={t.title} className="card p-6 md:p-7">
                      <span className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${i === 0 ? 'bg-brand-50 text-brand-700' : 'bg-sun-50 text-sun-700'}`}>{t.tag}</span>
                      <h4 className="mt-3 text-[1.1rem] font-extrabold text-ink">{t.title}</h4>
                      <p className="mt-2 text-[14.5px] leading-[1.8] text-ink-soft">
                        <Sentences text={t.desc} clauses={false} />
                      </p>
                    </li>
                  ))}
                </ul>
                {!show('what') && <Triad className="mt-16 md:mt-24" />}
                <SubHead s={SECTIONS.pain} />
                {/* 경로 3 — 긴 문단 대신 '증상 ← 이유' 한 줄씩 */}
                <ul className="reveal-stack mt-8 grid gap-3 md:grid-cols-3">
                  {TMJ_ANATOMY.pain.routes.map((r) => (
                    <li key={r.label} className="rounded-2xl bg-canvas p-5">
                      <span className="block text-[15px] font-extrabold text-ink">{r.label}</span>
                      <span className="mt-1.5 block text-[14px] leading-[1.7] text-ink-soft">{r.desc}.</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── 증상: 주요 증상 네 가지 + 함께 오는 증상 ── */}
            {show('symptoms') && (
              <section id="symptoms" className={`scroll-mt-[96px] ${top('symptoms')}`} aria-labelledby="tmj-symptoms">
                <Head id="tmj-symptoms" s={SECTIONS.symptoms} />
                <ol className="reveal-stack mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
                  {TMJ_SYMPTOMS.map((s, i) => (
                    <li key={s.num} className="relative text-center">
                      <span className={`mx-auto flex h-[128px] w-[128px] flex-col items-center justify-center rounded-full text-white shadow-[var(--shadow-lift)] md:h-[148px] md:w-[148px] ${s.tone === 'sun' ? 'bg-sun-500' : 'bg-night-2'}`}>
                        <span className="text-[1.35rem] font-extrabold leading-none tracking-[-0.02em] md:text-[1.6rem]">{s.num}</span>
                        <span className="mt-2 text-[15px] font-bold md:text-[17px]">{s.label}</span>
                      </span>
                      {i < TMJ_SYMPTOMS.length - 1 && <span aria-hidden className="absolute right-[-14px] top-[60px] hidden text-[1.4rem] text-ink-muted/60 lg:block">›</span>}
                      <span className="img-in mx-auto mt-6 block aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-canvas-2">
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
              </section>
            )}

            {/* ── 증상: 분류 세 갈래 + 관절원판 전방 변위 도해 ── */}
            {show('types') && (
              <section className={top('types')} aria-labelledby="tmj-types">
                <Head id="tmj-types" s={SECTIONS.types} />
                <div className="reveal-stack mt-12">
                  <Illust fig={TMJ_TYPES.fig} sizes="(max-width: 1024px) 100vw, 860px" className="mx-auto max-w-[860px]" />
                  <ol className="mt-6 grid gap-3 xl:grid-cols-3">
                    {TMJ_TYPES.items.map((t) => (
                      <li key={t.title} className="card p-5 md:p-6">
                        <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-bold text-brand-700">{t.tag}</span>
                        <h3 className="mt-2 text-[1.08rem] font-extrabold text-ink">{t.title}</h3>
                        <p className="mt-1.5 text-[14.5px] leading-[1.75] text-ink-soft">
                          <Sentences text={t.desc} clauses={false} />
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            )}

            {/* ── 증상: 거울 앞 자가진단 다섯 가지 + 점검표 — 소개 → 핵심 → 확인 사진 3장 → 다섯 단계 → 안내 → 점검표 ── */}
            {show('self-tests') && (
              <section id="self-test" className={`scroll-mt-[96px] ${top('self-tests')}`} aria-labelledby="tmj-self-tests">
                <Head id="tmj-self-tests" s={SECTIONS['self-tests']} lead={TMJ_SELF_INTRO} />
                <div className="reveal mt-8 grid gap-4 rounded-2xl bg-night p-6 text-white md:grid-cols-[auto_1fr] md:items-center md:gap-6 md:p-7">
                  <span className="inline-flex w-max items-center rounded-full bg-sun-500 px-3 py-1 text-[12.5px] font-extrabold">자가진단 핵심</span>
                  <p className="text-[15.5px] font-semibold leading-[1.75] text-white/90 md:text-[16.5px]">
                    <Sentences text={TMJ_SELF_KEY} clauses={false} />
                  </p>
                </div>
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
                <p className="mt-3 text-[12.5px] text-ink-muted"><Sentences text={TMJ_SELF_PHOTO_NOTE} /></p>
                <p className="reveal mt-10 text-center text-[1.2rem] font-extrabold text-ink md:text-[1.35rem]">이렇게 확인해 보세요</p>
                <ol className="reveal-stack mt-6 grid gap-4">
                  {TMJ_SELF_TESTS.map((t) => (
                    <li key={t.n} className="card grid gap-5 p-5 md:grid-cols-[112px_1fr] md:gap-7 md:p-6">
                      <span className="flex h-[64px] w-[64px] items-center justify-center rounded-xl bg-night text-[1.5rem] font-extrabold text-white md:h-[112px] md:w-[112px] md:text-[2.4rem]" aria-hidden>{t.n}</span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-[13px] font-extrabold text-sun-600">
                          {t.tag}
                          {t.normal && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-bold text-brand-700">{t.normal}</span>}
                        </p>
                        <h3 className="mt-1.5 text-[1.15rem] font-extrabold leading-snug text-ink md:text-[1.25rem]">{t.title}</h3>
                        {/* '방법' · '의미' — 라벨 열 + 글 열, 두 줄의 시작선이 같게 */}
                        <dl className="mt-3 grid gap-2.5">
                          <div className="grid grid-cols-[48px_1fr] items-start gap-3">
                            <dt className="mt-[3px] inline-flex justify-center rounded-md bg-night px-1.5 py-0.5 text-[11.5px] font-extrabold text-white">방법</dt>
                            <dd className="text-[14.5px] leading-[1.75] text-ink-soft"><Sentences text={t.how} clauses={false} /></dd>
                          </div>
                          <div className="grid grid-cols-[48px_1fr] items-start gap-3">
                            <dt className="mt-[3px] inline-flex justify-center rounded-md bg-sun-500 px-1.5 py-0.5 text-[11.5px] font-extrabold text-white">의미</dt>
                            <dd className="text-[14.5px] leading-[1.75] text-ink-soft"><Sentences text={t.means} clauses={false} /></dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="reveal mt-6 grid gap-4 rounded-2xl border border-hairline bg-canvas p-6 md:grid-cols-[1fr_auto] md:items-center md:p-7">
                  <div>
                    <p className="text-[1.15rem] font-extrabold text-ink">{TMJ_SELF_CTA.title}</p>
                    <p className="mt-1.5 text-[14.5px] leading-[1.7] text-ink-soft"><Sentences text={TMJ_SELF_CTA.desc} clauses={false} /></p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <a href={CLINIC.phoneHref} className="btn-ghost !px-4 !py-2.5 text-[14px]">{CLINIC.phone}</a>
                    <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun !px-4 !py-2.5 text-[14px]">네이버 예약</a>
                  </div>
                </div>
                {/* 점검표 — 움직이거나 기울지 않는다(오너) */}
                <div className="reveal mx-auto mt-10 max-w-[820px]">
                  <TmjSelfCheck items={TMJ_SELF_CHECK} />
                </div>
              </section>
            )}

            {/* ── 허브: 원인 카드 셋 + 상세 세 갈래 ── */}
            {show('causes') && (
              <section className={top('causes', 'pt-24 md:pt-32')} aria-labelledby="tmj-causes">
                <Head id="tmj-causes" s={SECTIONS.causes} />
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
                {/* 좌우 짜임 — 왼쪽 남색 패널에 번호·제목·핵심 한 줄, 오른쪽에 설명과 항목 목록 */}
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
                                <Check />
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
            )}

            {/* ── 증상: 턱관절과 전신 ── */}
            {show('whole-body') && (
              <section id="whole-body" className={`scroll-mt-[96px] ${top('whole-body', 'pt-24 md:pt-32')}`} aria-labelledby="tmj-body">
                <Head id="tmj-body" s={SECTIONS['whole-body']} />
                <ol className="reveal-stack mt-12 grid gap-4 md:grid-cols-2">
                  {TMJ_BODY_CHAIN.map((b) => (
                    <li key={b.n} className="card p-6 md:p-7">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="text-[13px] font-extrabold tracking-[0.18em] text-sun-500">{b.n}</span>
                        <h3 className="text-[1.15rem] font-extrabold text-ink md:text-[1.25rem]">{b.title}</h3>
                      </div>
                      <p className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-[12.5px] font-bold text-brand-700">{b.chain}</p>
                      <p className="mt-3 text-[14.5px] leading-[1.8] text-ink-soft">
                        <Sentences text={b.desc} clauses={false} />
                      </p>
                    </li>
                  ))}
                </ol>
                <SubHead s={SECTIONS.asym} />
                <div className="reveal-stack mt-8 grid gap-4 md:grid-cols-2">
                  <div className="card p-6 md:p-7">
                    <p className="text-[13px] font-bold text-brand-700">생기는 경로</p>
                    <h4 className="mt-1.5 text-[1.1rem] font-extrabold text-ink">이런 경로로 얼굴이 틀어집니다</h4>
                    <ul className="mt-3 space-y-2.5">
                      {TMJ_ASYMMETRY_CAUSES.map((c) => (
                        <li key={c} className="flex gap-2.5 text-[14.5px] leading-[1.7] text-ink-soft">
                          <Dot tone="bg-brand-400" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card p-6 md:p-7">
                    <p className="text-[13px] font-bold text-sun-600">확인할 신호</p>
                    <h4 className="mt-1.5 text-[1.1rem] font-extrabold text-ink">거울에서 보이는 비대칭 신호</h4>
                    <ul className="mt-3 space-y-2.5">
                      {TMJ_ASYMMETRY_SIGNS.map((s) => (
                        <li key={s} className="flex gap-2.5 text-[14.5px] leading-[1.7] text-ink-soft">
                          <Dot />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* 함께 보고되는 증상 8갈래 — 인과를 단정하지 않는 안내문을 반드시 함께 둔다 */}
                <SubHead s={SECTIONS['body-check']} />
                <div className="reveal mt-8 rounded-[28px] border border-hairline bg-canvas p-6 md:p-9">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            )}

            {/* ═════════ 이갈이 · 이악물기 (2026-09-29 신설) ═════════ */}
            {show('brux-what') && (
              <section className={top('brux-what')} aria-labelledby="brux-what">
                <Head id="brux-what" s={SECTIONS['brux-what']} />
                <div className="reveal-stack mt-12 grid gap-4 md:grid-cols-2">
                  {BRUX_WHAT.types.map((t, i) => (
                    <div key={t.title} className="card p-6 md:p-7">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[1.2rem] font-extrabold text-ink">{t.title}</h3>
                        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${i === 0 ? 'bg-night text-white' : 'bg-sun-50 text-sun-700'}`}>{t.tag}</span>
                      </div>
                      <ul className="mt-4 space-y-2.5">
                        {t.points.map((p) => (
                          <li key={p} className="flex gap-2.5 text-[14.5px] leading-[1.75] text-ink-soft">
                            <Dot />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="reveal mt-5 flex gap-3 rounded-2xl bg-canvas p-5 md:p-6">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[13px] font-extrabold text-white" aria-hidden>i</span>
                  <p className="text-[14.5px] leading-[1.8] text-ink-soft">
                    <Sentences text={BRUX_WHAT.note} clauses={false} />
                  </p>
                </div>
              </section>
            )}

            {show('brux-causes') && (
              <section className={top('brux-causes')} aria-labelledby="brux-causes">
                <Head id="brux-causes" s={SECTIONS['brux-causes']} />
                <ul className="reveal-stack mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {BRUX_CAUSES.map((c, i) => (
                    <li key={c.title} className="card p-6">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="mt-3 text-[1.08rem] font-extrabold text-ink">{c.title}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-[1.75] text-ink-soft">
                        <Sentences text={c.desc} clauses={false} />
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {show('brux-damage') && (
              <section className={top('brux-damage', 'pt-24 md:pt-32')} aria-labelledby="brux-damage">
                <Head id="brux-damage" s={SECTIONS['brux-damage']} />
                {/* 도해 왼쪽 · 설명 오른쪽 — 좁은 칸에 셋을 나란히 두면 목록이 잘게 꺾여 한 줄씩 쌓았다 */}
                <ol className="reveal-stack mt-12 grid gap-4">
                  {BRUX_DAMAGE.map((d, i) => (
                    <li key={d.title} className="card grid overflow-hidden md:grid-cols-[280px_1fr]">
                      <span className="relative block aspect-[3/2] border-b border-hairline bg-white md:aspect-auto md:min-h-[210px] md:border-b-0 md:border-r">
                        <Image src={figSrc(d.fig.key)} alt={d.fig.alt} fill sizes="(max-width: 768px) 100vw, 280px" className="object-contain p-2" />
                      </span>
                      <div className="p-6 md:p-7">
                        <span className="text-[13px] font-extrabold tracking-[0.18em] text-sun-500">{String(i + 1).padStart(2, '0')}</span>
                        <h3 className="mt-1.5 text-[1.2rem] font-extrabold text-ink md:text-[1.3rem]">{d.title}</h3>
                        <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">
                          <Sentences text={d.desc} clauses={false} />
                        </p>
                        <ul className="mt-4 grid gap-x-6 gap-y-2 border-t border-hairline pt-4 sm:grid-cols-2">
                          {d.items.map((it) => (
                            <li key={it} className="flex gap-2.5 text-[14px] leading-[1.6] text-ink">
                              <Check />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {show('brux-check') && (
              <section className={top('brux-check')} aria-labelledby="brux-check">
                <Head id="brux-check" s={SECTIONS['brux-check']} />
                {/* 점검표 — 움직이거나 기울지 않는다(오너) */}
                <div className="reveal mx-auto mt-10 max-w-[820px]">
                  <TmjSelfCheck items={BRUX_SELF_CHECK} title="이갈이·이악물기 자가 점검표" exam="치아 마모와 저작근 검사" />
                </div>
              </section>
            )}

            {show('brux-diagnosis') && (
              <section className={top('brux-diagnosis')} aria-labelledby="brux-diagnosis">
                <Head id="brux-diagnosis" s={SECTIONS['brux-diagnosis']} />
                <div className="reveal-stack mt-12 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
                  <span className="img-in relative block aspect-[3/2] overflow-hidden rounded-[24px] bg-canvas-2">
                    <Image src={figSrc(BRUX_DIAGNOSIS_FIG.key)} alt={BRUX_DIAGNOSIS_FIG.alt} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
                  </span>
                  <ol className="grid gap-3">
                    {BRUX_DIAGNOSIS.map((d, i) => (
                      <li key={d.title} className="card flex gap-4 p-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-night text-[13.5px] font-extrabold text-white">{String(i + 1).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="block text-[1.05rem] font-extrabold text-ink">{d.title}</span>
                          <span className="mt-1 block text-[14.5px] leading-[1.7] text-ink-soft">
                            <Sentences text={d.desc} clauses={false} />
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            )}

            {show('brux-treatment') && (
              <section className={top('brux-treatment', 'pt-24 md:pt-32')} aria-labelledby="brux-treatment">
                <Head id="brux-treatment" s={SECTIONS['brux-treatment']} />
                <ol className="reveal-stack mt-12 grid gap-4">
                  {BRUX_TREATMENTS.map((t, i) => (
                    <li key={t.title} className="card grid items-start gap-5 p-4 md:grid-cols-[240px_1fr] md:gap-7 md:p-5">
                      <span className={`relative block aspect-[3/2] overflow-hidden rounded-xl ${t.fig.key.startsWith('illust/') ? 'border border-hairline bg-white' : 'bg-canvas-2'}`}>
                        <Image
                          src={figSrc(t.fig.key)}
                          alt={t.fig.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 240px"
                          className={t.fig.key.startsWith('illust/') ? 'object-contain' : fitsBox(t.fig.key, 3, 2) ? 'object-cover' : '!object-contain p-2'}
                        />
                      </span>
                      <div className="md:py-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[13px] font-extrabold tracking-[0.18em] text-sun-500">{String(i + 1).padStart(2, '0')}</span>
                          <h3 className="text-[1.2rem] font-extrabold text-ink md:text-[1.3rem]">{t.title}</h3>
                          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-bold text-brand-700">{t.tag}</span>
                        </div>
                        {t.paragraphs.map((p) => (
                          <p key={p} className="mt-2.5 text-[14.5px] leading-[1.8] text-ink-soft">
                            <Sentences text={p} clauses={false} />
                          </p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="reveal mt-4 text-[13px] leading-[1.75] text-ink-muted"><Sentences text={BRUX_TREATMENT_NOTE} /></p>

                {/* 기성 마우스피스와의 차이 — 우열이 아니라 차이만(의료광고) */}
                <SubHead s={SECTIONS['brux-compare']} />
                <div className="reveal mt-8 overflow-hidden rounded-2xl border border-hairline">
                  <table className="w-full table-fixed border-collapse text-left">
                    <caption className="sr-only">기성 마우스피스와 맞춤 교합안정장치의 차이</caption>
                    <thead className="bg-canvas">
                      <tr>
                        <th scope="col" className="w-[22%] px-4 py-3.5 text-[13px] font-bold text-ink-muted md:w-[18%] md:px-5">구분</th>
                        <th scope="col" className="px-4 py-3.5 text-[14.5px] font-extrabold text-ink md:px-5">{BRUX_COMPARE.columns[0]}</th>
                        <th scope="col" className="px-4 py-3.5 text-[14.5px] font-extrabold text-brand-700 md:px-5">{BRUX_COMPARE.columns[1]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BRUX_COMPARE.rows.map((r) => (
                        <tr key={r.label} className="border-t border-hairline align-top">
                          <th scope="row" className="px-4 py-3.5 text-[14px] font-bold text-ink md:px-5">{r.label}</th>
                          <td className="px-4 py-3.5 text-[14px] leading-[1.65] text-ink-soft md:px-5">{r.a}</td>
                          <td className="px-4 py-3.5 text-[14px] leading-[1.65] text-ink md:px-5">{r.b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="reveal mt-4 text-[14px] leading-[1.75] text-ink-soft">
                  <Sentences text={BRUX_COMPARE.note} clauses={false} />
                </p>
              </section>
            )}

            {show('brux-care') && (
              <section className={top('brux-care', 'pt-24 md:pt-32')} aria-labelledby="brux-care">
                <Head id="brux-care" s={SECTIONS['brux-care']} />
                <ul className="reveal-stack mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {BRUX_CARE.map((h, i) => (
                    <li key={h.title} className="card p-6">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <p className="mt-3 text-[1.05rem] font-bold text-ink">{h.title}</p>
                      <p className="mt-1.5 text-[14.5px] leading-[1.7] text-ink-soft"><Sentences text={h.desc} clauses={false} /></p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── 허브: 진료 방식 세 가지 + 실사 띠 + 원 사진 셋 ── */}
            {show('knowhow') && (
              <section id="knowhow" className={`scroll-mt-[96px] ${top('knowhow', 'pt-24 md:pt-32')}`} aria-labelledby="tmj-knowhow">
                <Head id="tmj-knowhow" s={SECTIONS.knowhow} lead={TMJ_KNOWHOW.title} />
                <div className="reveal relative mt-12 overflow-hidden rounded-[28px] bg-night">
                  {/* ★ aspect-ratio 에 min-h 를 같이 주면 높이에 맞춰 폭이 늘어나 글이 잘린다 — 화면 폭별 비율로만 정한다 */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
                    <Image src={figSrc(TMJ_KNOWHOW.band.key)} alt={TMJ_KNOWHOW.band.alt} fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover object-[50%_30%]" data-parallax="0.12" />
                    <div className="absolute inset-0 bg-gradient-to-b from-night/75 via-night/25 to-night/70" />
                    <div className="absolute inset-x-0 top-0 px-5 py-6 text-center md:p-10">
                      <Label light>{TMJ_KNOWHOW.bandLabel}</Label>
                      <p className="on-photo mt-3 text-[1.25rem] font-extrabold leading-[1.3] text-white sm:text-[1.6rem] md:text-[2.1rem]" style={{ wordBreak: 'keep-all' }}>{TMJ_KNOWHOW.bandTitle}</p>
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
            )}

            {/* ── 치료법: 다섯 가지 + 원칙·교합안정장치·관절강 세척술·보조 치료 ── */}
            {show('steps') && (
              <section id="treatments" className={`scroll-mt-[96px] ${top('steps', 'pt-24 md:pt-32')}`} aria-labelledby="tmj-steps">
                <Head id="tmj-steps" s={SECTIONS.steps} />
                <ol className="reveal-stack mt-12 grid gap-4">
                  {TMJ_STEPS.map((s, i) => (
                    <li key={s.title} className="card grid items-center gap-5 p-4 md:grid-cols-[210px_64px_1fr] md:gap-7 md:p-5">
                      <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-canvas-2">
                        <Image src={figSrc(s.fig.key)} alt={s.fig.alt} fill sizes="(max-width: 768px) 100vw, 210px" className={fitsBox(s.fig.key, 16, 10) ? 'object-cover' : '!object-contain p-2'} />
                      </span>
                      <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-night text-[1.3rem] font-extrabold text-white md:h-[64px] md:w-[64px]" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
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
                {show('steps-detail') && (
                  <>
                    {/* ── 치료 원칙 — 가로 4단 ── */}
                    <SubHead s={{ ...SECTIONS.principle, lead: TMJ_PRINCIPLE.lead }} />
                    <ol className="reveal-stack mt-8 grid gap-4 md:grid-cols-4">
                      {TMJ_PRINCIPLE.steps.map((s, i) => (
                        <li key={s.n} className="relative rounded-2xl bg-night p-6 text-white">
                          <span className="text-[12.5px] font-extrabold text-sun-300">{s.n}</span>
                          <span className="mt-2 block text-[15.5px] font-bold leading-snug">{s.label}</span>
                          <span className="mt-2 block text-[13.5px] leading-[1.7] text-white/70"><Sentences text={s.desc} /></span>
                          {i < TMJ_PRINCIPLE.steps.length - 1 && <span aria-hidden className="absolute -right-3.5 top-1/2 hidden -translate-y-1/2 text-[1.3rem] text-ink-muted md:block">›</span>}
                        </li>
                      ))}
                    </ol>

                    {/* ── 교합안정장치 — 하는 일(왼쪽) · 쓰는 법(오른쪽) ── */}
                    <SubHead s={SECTIONS.splint} />
                    <div className="reveal card mt-8 grid gap-8 p-7 md:grid-cols-2 md:gap-10 md:p-9">
                      <div>
                        <h4 className="text-[1.15rem] font-extrabold text-ink">{TMJ_SPLINT_ROLE.title}</h4>
                        <p className="mt-3 text-[14.5px] leading-[1.8] text-ink-soft">
                          <Sentences text={TMJ_SPLINT_ROLE.lead} clauses={false} />
                        </p>
                        <dl className="mt-5 space-y-3">
                          {TMJ_SPLINT_ROLE.points.map((p) => (
                            <div key={p.label} className="grid grid-cols-[64px_1fr] gap-3">
                              <dt className="pt-0.5 text-[13px] font-extrabold text-brand-700">{p.label}</dt>
                              <dd className="text-[14px] leading-[1.7] text-ink-soft"><Sentences text={p.desc} /></dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <div className="border-t border-hairline pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                        <h4 className="text-[1.15rem] font-extrabold text-ink">이렇게 씁니다</h4>
                        <ul className="mt-4 space-y-3">
                          {TMJ_SPLINT_TIPS.map((t) => (
                            <li key={t.title} className="flex gap-3">
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sun-500" aria-hidden />
                              <span>
                                <span className="block text-[15px] font-bold text-ink">{t.title}</span>
                                <span className="block text-[13.5px] leading-[1.6] text-ink-soft"><Sentences text={t.desc} /></span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* ── 관절강 세척술 — 방법·기대 효과(왼쪽) · 특징(오른쪽) ── */}
                    <SubHead s={SECTIONS.arthro} />
                    <div className="reveal card mt-8 grid gap-8 p-7 md:grid-cols-2 md:gap-10 md:p-9">
                      <div>
                        <p className="text-[14.5px] leading-[1.8] text-ink-soft">
                          <Sentences text={TMJ_ARTHRO.lead} clauses={false} />
                        </p>
                        <p className="mt-5 text-[13px] font-extrabold text-brand-700">기대 효과</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {TMJ_ARTHRO.effects.map((e) => (
                            <li key={e} className="rounded-xl bg-brand-50 px-3 py-2 text-[13px] font-semibold leading-snug text-brand-700">{e}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-hairline pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                        <p className="text-[13px] font-extrabold text-brand-700">특징</p>
                        <ul className="mt-2 space-y-2">
                          {TMJ_ARTHRO.merits.map((m) => (
                            <li key={m} className="flex gap-2 text-[14px] leading-[1.6] text-ink-soft">
                              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" aria-hidden />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* ── 보조 치료 세 가지 ── */}
                    <SubHead s={SECTIONS.support} />
                    <ul className="reveal-stack mt-8 grid gap-4 md:grid-cols-3">
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

                    {/* ── 물리치료 세 가지 — 번호 붙은 사진 카드(원장 참고 캡처 짜임, 2026-09-29) ── */}
                    <SubHead s={SECTIONS.physio} />
                    <ul className="reveal-stack mt-8 grid gap-5 md:grid-cols-3">
                      {TMJ_PHYSIO.map((p, i) => (
                        <li key={p.title} className="card flex h-full flex-col overflow-hidden">
                          <span className="relative block aspect-[4/3] overflow-hidden border-b border-hairline bg-white">
                            <Image
                              src={figSrc(p.fig.key)}
                              alt={p.fig.alt}
                              fill
                              sizes="(max-width: 768px) 100vw, 30vw"
                              className={fitsBox(p.fig.key, 4, 3) ? 'object-cover' : '!object-contain p-3'}
                            />
                            <span aria-hidden className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-sun-500 text-[14px] font-extrabold text-white shadow-[var(--shadow-soft)]">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </span>
                          <span className="flex flex-1 flex-col p-6">
                            <h3 className="text-[1.15rem] font-extrabold text-sun-600">{p.title}</h3>
                            <span className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">
                              <Sentences text={p.desc} clauses={false} />
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}

            {/* ── 허브: 장비 두 가지 ── */}
            {show('equip') && (
              <section className={top('equip')} aria-labelledby="tmj-equip">
                <Head id="tmj-equip" s={SECTIONS.equip} />
                <ul className="reveal-stack mt-12 grid gap-5 md:grid-cols-2">
                  {TMJ_EQUIP.map((e) => (
                    <li key={e.title} className="card flex gap-5 p-5 md:p-6">
                      {/* 사진은 3:4 상자를 꽉 채운다 */}
                      <span className="relative block aspect-[3/4] w-[104px] shrink-0 self-start overflow-hidden rounded-xl bg-canvas-2 md:w-[118px] lg:w-[132px]">
                        <Image src={figSrc(e.fig.key)} alt={e.fig.alt} fill sizes="150px" className="object-cover" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-sun-600">{e.eyebrow}</p>
                        <h3 className="mt-1.5 text-[1.15rem] font-extrabold leading-snug text-ink">{e.title}</h3>
                        <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-soft"><Sentences text={e.lead} /></p>
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
            )}

            {/* ── 치료법: 생활 관리 여섯 가지 ── */}
            {show('habits') && (
              <section className={top('habits', 'pt-24 md:pt-32')} aria-labelledby="tmj-habits">
                <Head id="tmj-habits" s={SECTIONS.habits} />
                <ul className="reveal-stack mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {TMJ_HABITS.map((h, i) => (
                    <li key={h.title} className="card p-6">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <p className="mt-3 text-[1.05rem] font-bold text-ink">{h.title}</p>
                      <p className="mt-1.5 text-[14.5px] leading-[1.7] text-ink-soft"><Sentences text={h.desc} clauses={false} /></p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── 치료법: 실제 치료 경과 사례(lib/caseLibrary 의 tmj) — 사례가 없으면 구역째 숨긴다 ── */}
            {show('cases') && hasCases && (
              <section className={top('cases', 'pt-24 md:pt-32')} aria-labelledby="tmj-cases">
                <Head id="tmj-cases" s={SECTIONS.cases} />
                <div className="reveal mt-10">
                  <CaseGallery categories={['tmj']} />
                </div>
              </section>
            )}

            {/* ── FAQ — 화면 = FAQPage 스키마 ── */}
            {doc.faq && doc.faq.length > 0 && (
              <section className="pt-24 md:pt-32" aria-labelledby="tmj-faq" id="faq-section">
                <Head id="tmj-faq" s={faqHead} />
                <div className="reveal mt-10 rounded-[28px] border border-hairline bg-canvas p-5 md:p-10">
                  <FaqList items={doc.faq} />
                </div>
              </section>
            )}

            {/* ── 맺음 편지 — 어두운 사진 판 위 대표원장의 글(원장 요청 2026-09-29). 모든 턱관절 쪽의 본문 끝 ── */}
            <TmjLetter />

            {/* ── 허브: 하위 쪽 카드 — 본문 맨 끝(FAQ 뒤). 다른 쪽으로 보내는 카드는 다 읽은 뒤에 (오너 2026-09-21) ── */}
            {show('children') && children.length > 0 && (
              <section className="pt-20 md:pt-28" aria-labelledby="tmj-children">
                <Head id="tmj-children" s={SECTIONS.children} />
                <ul className="reveal-stack mt-12 grid gap-5 md:grid-cols-3">
                  {children.map((c) => {
                    const f = CHILD_FIG[c.path] ?? c.hero ?? { key: 'ai/tmj-hub', alt: c.title };
                    return (
                      <li key={c.path}>
                        <Link href={c.path} className="card card-hover flex h-full flex-col overflow-hidden">
                          <span className={`relative block aspect-[4/3] overflow-hidden ${f.key.startsWith('illust/') ? 'border-b border-hairline bg-white' : 'bg-canvas-2'}`}>
                            <Image src={figSrc(f.key)} alt={f.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className={f.key.startsWith('illust/') ? 'object-contain' : 'object-cover'} />
                          </span>
                          <span className="flex flex-1 flex-col p-6">
                            <span className="text-[1.15rem] font-extrabold text-ink">{c.title}</span>
                            <span className="mt-2 text-[14px] leading-[1.7] text-ink-soft">{first(c.summary)}</span>
                            <span className="mt-auto pt-4 text-[13.5px] font-bold text-brand-700">자세히 보기 ›</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* ───────── 사이드바 (넓은 화면은 오른쪽, 좁은 화면은 본문 아래) ───────── */}
          <aside className="space-y-6 lg:self-start" aria-label="턱관절 진료 안내">
            <DoctorCard />

            <div className="card p-5">
              <p className="text-[1.15rem] font-extrabold text-ink">턱관절 <span className="text-sun-500">안내</span></p>
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
                  <a href="#faq-section" className="text-[12.5px] font-semibold text-ink-muted hover:text-brand-700">전체 보기</a>
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
          <ContactBand bg="sun/tmj-explain-skull" title={contact.title} text={contact.text} />
        </div>
        <MedicalNotice />
      </main>
    </>
  );
}
