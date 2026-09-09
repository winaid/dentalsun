import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, CardLink, ContactBand, FaqList, Figure, MedicalNotice, ScrubText, Sentences } from '@/components/ui';
import { docCharCount, figSize, figSrc, type Block, type Doc, type Fig } from '@/lib/docs';
import { docByPath, docsOfHub } from '@/lib/content';
import { caseGroup } from '@/lib/cases';
import { BeforeAfter } from '@/components/BeforeAfter';
import { HeroCollage, type CollageItem } from '@/components/HeroCollage';
import { HERO_COLLAGE, splitAccent, type HeroCollageSpec } from '@/lib/heroCollage';
import { articleSchema, breadcrumbSchema, faqSchema, imageObjectSchema, itemListSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC } from '@/lib/clinic';

/**
 * 진료·인사이트 문서 렌더러 — Doc 하나를 쪽 하나로.
 *
 * 구조(AEO): 빵부스러기 → 윗줄 라벨 → H1 → 한 줄 답(첫 <p>, speakable) → 본문 블록 →
 *            FAQ(화면 = 스키마) → 관련 문서 → 상담 띠 → 의료 고지.
 * ★ 구역 사이 이동 버튼(목차)은 두지 않는다 (오너 지시). 긴 문서는 AI 정물 사진을 배경으로 깐 띠로 숨을 고른다.
 */

/** 허브별 배경 사진 — 구역이 길어 비슷해 보일 때 배경으로 깐다. */
const HUB_BG: Record<string, string> = {
  '/treatment/implant': 'ai/wide-implant',
  '/treatment/tmj': 'ai/wide-tmj',
  '/treatment/aesthetic': 'ai/wide-aesthetic',
  '/treatment/insurance': 'ai/wide-insurance',
  '/treatment/wisdom-tooth': 'ai/wide-wisdom',
  '/treatment/natural-tooth': 'ai/wide-natural',
  '/treatment/painless': 'ai/wide-painless',
  '/insight': 'ai/wide-insight',
};
/** 문서 경로별 대표 AI 사진 — 원본 사진이 없거나 반복될 때 hero 로 쓴다. */
const DOC_AI: Record<string, string> = {
  '/treatment/implant': 'orig/implant-hero',
  '/treatment/implant/navigation': 'orig/misc-nav-implant-set',
  '/treatment/implant/full-arch': 'orig/implant-fa-fixed',
  '/treatment/implant/uv': 'ai/implant-uv',
  '/treatment/implant/prf': 'ai/implant-prf',
  '/treatment/implant/custom': 'equip/printer',
  '/treatment/implant/warranty': 'ai/implant-warranty',
  '/treatment/tmj': 'orig/tmj-hero',
  '/treatment/tmj/symptoms': 'ai/tmj-symptoms',
  '/treatment/tmj/treatments': 'place/place04',
  '/treatment/aesthetic': 'ai/aesthetic-hub',
  '/treatment/aesthetic/prosthetics': 'ai/aesthetic-prosthetics',
  '/treatment/aesthetic/whitening': 'ai/aesthetic-whitening',
  '/treatment/insurance': 'ai/insurance-hub',
  '/treatment/insurance/denture': 'ai/insurance-denture',
  '/treatment/insurance/implant': 'ai/insurance-implant',
  '/treatment/wisdom-tooth': 'orig/wisdom-doctor',
  '/treatment/natural-tooth': 'orig/mta-hero',
  '/treatment/natural-tooth/mta': 'orig/mta-hero',
  '/treatment/natural-tooth/endosonic': 'orig/endo-handpiece',
  '/treatment/painless': 'orig/pain-hero',
  '/treatment/painless/anesthesia': 'orig/pain-nopain',
  '/treatment/painless/sedation': 'orig/sleep-hero',
  '/treatment/painless/airflow': 'orig/airflow-device',
  '/insight': 'ai/insight-hub',
};

export function DocPage({ doc }: { doc: Doc }) {
  const isInsight = doc.path.startsWith('/insight');
  const trail = isInsight ? [{ name: '인사이트', path: '/insight' }] : [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }];
  if (doc.path !== doc.hub) trail.push({ name: doc.title, path: doc.path });
  /* 허브에 links 블록이 있으면(인사이트처럼 묶음별로 직접 나열) 자동 카드는 붙이지 않는다 — 같은 카드가 두 번 나온다. */
  const children = doc.isHub && !doc.blocks.some((b) => b.type === 'links') ? docsOfHub(doc.path) : [];
  const related = (doc.related ?? []).map(docByPath).filter(Boolean) as Doc[];
  /* 대표 사진 — 쪽마다 다른 AI 정물을 우선 쓴다(원본 사진 24장이 서른 쪽에 반복되지 않게). 인사이트처럼 매핑이 없으면 문서가 지정한 사진. */
  const heroKey = DOC_AI[doc.path] ?? doc.hero?.key;
  const hero: Fig | undefined = heroKey ? { key: heroKey, alt: doc.hero?.alt ?? doc.title } : undefined;
  const heroSize = hero ? figSize(hero.key) : null;
  const bandBg = HUB_BG[doc.hub] ?? 'ai/wide-clinic';
  const shortSummary = (s: string) => s.split(/(?<=다\.)\s/)[0];
  /* 첫 화면 콜라주 — 표에 없는 문서는 제목을 마지막 띄어쓰기에서 두 줄로 나누고 허브 배경 사진 세 장으로 채운다 */
  const collage: HeroCollageSpec = HERO_COLLAGE[doc.path] ?? fallbackCollage(doc, bandBg);
  const collageLines = collage.lines.map((l) => (l ? renderAccent(l) : undefined)) as [ReactNode, ReactNode?];
  const collageLong = collage.lines.join('').replace(/[{}]/g, '').length > 14;
  /* 첫 화면 요약은 앞 두 문장만 — 나머지는 본문 첫 단락이 이어받는다 */
  const heroLead = doc.summary.split(/(?<=[.!?])\s+(?=\S)/).slice(0, 2).join(' ');
  const firstPoints = doc.blocks.find((b): b is Extract<Block, { type: 'points' }> => b.type === 'points');
  const collageItems: CollageItem[] = collage.items ?? (firstPoints ? firstPoints.items.slice(0, 3).map((it) => ({ title: it.title, desc: it.desc ?? '' })) : [{ title: doc.title, desc: shortSummary(doc.summary) }]);

  const schema: unknown[] = [
    breadcrumbSchema(trail),
    medicalWebPageSchema({
      title: doc.title,
      description: doc.description,
      path: doc.path,
      about: doc.procedure ? { type: 'MedicalProcedure', name: doc.procedure } : undefined,
      image: hero && heroSize ? { src: figSrc(hero.key), caption: hero.alt, width: heroSize.w, height: heroSize.h } : undefined,
      related: [...(doc.related ?? []), ...children.map((c) => c.path)],
    }),
  ];
  if (hero && heroSize) schema.push(imageObjectSchema({ path: doc.path, src: figSrc(hero.key), caption: hero.alt, width: heroSize.w, height: heroSize.h }));
  if (!doc.isHub) schema.push(articleSchema({ path: doc.path, title: doc.title, description: doc.description, wordCount: docCharCount(doc), hasImage: !!hero, keywords: doc.keywords }));
  if (doc.isHub && children.length) schema.push(itemListSchema(doc.path, children.map((c) => ({ name: c.title, path: c.path })), `${doc.title} 세부 안내`));
  if (doc.faq?.length) schema.push(faqSchema(doc.faq, doc.path));

  /* 긴 문서: 세 번째 블록마다 배경 띠로 바꿔 구역이 비슷해 보이지 않게 한다. */
  let bandCount = 0;
  /* '글 + 사진' 2열 구역이 세 번 이상 이어지면 가운데 하나는 사진을 배경으로 깔고 글을 가운데 놓는다(오너: 같은 구역 반복 지루함).
     배경으로 쓸 사진은 폭 900px 이상인 진짜 사진이어야 한다 — 작은 배너 조각이면 첫 화면 사진, 그것도 작으면 허브 배경. */
  const textFigIdx = doc.blocks.map((b, i) => (b.type === 'text' && b.figure ? i : -1)).filter((i) => i >= 0);
  const photoBandIndex = textFigIdx.length >= 3 ? textFigIdx[Math.floor(textFigIdx.length / 2)] : -1;
  const bigEnough = (key?: string) => !!key && figSize(key).w >= 900 && !/^(equip|illust|implant|tmj|aesthetic|wisdom)\//.test(key);
  const photoBandBlock = photoBandIndex >= 0 ? (doc.blocks[photoBandIndex] as Extract<Block, { type: 'text' }>) : null;
  const photoBandKey = photoBandBlock ? (bigEnough(photoBandBlock.figure?.key) ? photoBandBlock.figure!.key : bigEnough(hero?.key) ? hero!.key : bandBg) : undefined;

  return (
    <>
      <SiteHeader dark />
      <JsonLd data={schema} />
      <main id="main">
        {/* 첫 화면 — 콜라주(components/HeroCollage): 큰 제목 두 줄 + 옛 홈페이지 사진 세 장 + 유리 카드 세 장. 표는 lib/heroCollage.ts */}
        <HeroCollage
          trail={trail}
          eyebrow={doc.eyebrow}
          lines={collageLines}
          long={collageLong}
          lead={heroLead}
          bg={hero && heroSize ? hero.key : bandBg}
          bgSoft={!!heroSize && heroSize.w < 900}
          cards={collage.cards}
          items={collageItems}
        >
          <div className="flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.phoneHref} className="btn-ghost-dark">전화 {CLINIC.phone}</a>
          </div>
        </HeroCollage>

        {/* 허브: 하위 문서 카드 (같은 높이·같은 사진 비율) */}
        {doc.isHub && children.length > 0 && (
          <section className="section bg-canvas">
            <div className="wrap">
              <p className="eyebrow reveal">MENU</p>
              <h2 className="display-sm reveal mt-4">{doc.title} 세부 안내</h2>
              <ol className="reveal-stack cards-flex mt-10" style={gridVars(children.length)}>
                {children.map((c, i) => (
                  <li key={c.path}>
                    <CardLink href={c.path} label={c.title} desc={shortSummary(c.summary)} num={String(i + 1).padStart(2, '0')} fig={{ key: DOC_AI[c.path] ?? c.hero?.key ?? bandBg, alt: c.title }} />
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {doc.blocks.map((b, i) => {
          const band = !doc.isHub && (b.type === 'points' || b.type === 'steps') && i > 0 && i % 3 === 2 && bandCount < 2;
          if (band) bandCount++;
          return <BlockView key={i} block={b} index={i} band={band ? bandBg : undefined} photoBand={i === photoBandIndex ? photoBandKey : undefined} />;
        })}

        {doc.faq && doc.faq.length > 0 && (
          <section className="section bg-canvas" id="faq-section">
            <div className="wrap grid gap-10 lg:grid-cols-[1fr_2fr]">
              <div className="reveal">
                <p className="eyebrow">FAQ</p>
                <h2 className="display-sm mt-4">
                  {doc.title}
                  <br />
                  <span className="accent">자주 묻는 질문</span>
                </h2>
                <p className="lead mt-4">
                  <Sentences text="환자분들이 자주 물어보시는 내용을 정리했습니다. 더 궁금한 점은 톡톡이나 전화로 문의해 주세요." />
                </p>
              </div>
              <div className="reveal">
                <FaqList items={doc.faq} />
              </div>
            </div>
          </section>
        )}

        {(related.length > 0 || doc.path !== doc.hub) && (
          <section className="section">
            <div className="wrap">
              <p className="eyebrow reveal">RELATED</p>
              <h2 className="display-sm reveal mt-4">함께 보면 좋은 안내</h2>
              <div className="reveal-stack grid-cards mt-10 sm:grid-cols-2 lg:grid-cols-4">
                {doc.path !== doc.hub && <CardLink href={doc.hub} label={`${isInsight ? '인사이트' : doc.hubLabel} 전체 안내`} desc="이 갈래의 모든 문서를 한눈에 봅니다." fig={{ key: bandBg, alt: doc.hubLabel }} />}
                {related.slice(0, 3).map((r) => (
                  <CardLink key={r.path} href={r.path} label={r.title} desc={shortSummary(r.summary)} fig={{ key: DOC_AI[r.path] ?? r.hero?.key ?? 'ai/faq', alt: r.title }} />
                ))}
              </div>
            </div>
          </section>
        )}

        <ContactBand bg={bandBg} />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}

/** 링크 카드의 사진 — 가리키는 문서의 AI 사진(없으면 그 문서가 지정한 사진) */
function linkFig(href: string, label: string): Fig | undefined {
  const target = docByPath(href);
  const key = DOC_AI[href] ?? target?.hero?.key;
  return key ? { key, alt: label } : undefined;
}

/** {강조} 표기를 주황 밑줄 span 으로 */
function renderAccent(line: string): ReactNode {
  return splitAccent(line).map((p, i) => (p.accent ? <span key={i} className="accent-sun">{p.text}</span> : <span key={i}>{p.text}</span>));
}

/** 표에 없는 문서의 콜라주 — 제목은 마지막 띄어쓰기에서 나누고, 사진은 대표 사진과 허브 배경으로 채운다 */
function fallbackCollage(doc: Doc, bandBg: string): HeroCollageSpec {
  const t = doc.title;
  const cut = t.lastIndexOf(' ');
  const lines: [string, string?] = cut > 0 ? [t.slice(0, cut), '{' + t.slice(cut + 1) + '}'] : ['{' + t + '}'];
  const key = doc.hero?.key ?? bandBg;
  return { lines, cards: [{ fig: { key, alt: doc.title }, shape: 'portrait' }, { fig: { key: bandBg, alt: '' }, shape: 'wide' }, { fig: { key, alt: doc.title }, shape: 'std' }] };
}

/**
 * 균형 격자(.cards-flex)의 열 수 — 줄마다 개수가 고르도록 개수로 정한다. 마지막 줄이 모자라면 CSS 가 가운데로 모은다.
 *  1→3폭 · 2→3폭 · 3의 배수→3 · 4의 배수→4 · 5→3(3+2) · 7→4(4+3) · 10→4/xl5 · 그 밖→4
 */
function gridVars(n: number, opt: { max?: number; compact?: boolean } = {}): CSSProperties {
  const max = opt.max ?? (opt.compact ? 6 : 4);
  /* 설명 없는 짧은 항목(라벨 칩)은 원본처럼 한 줄에 다 놓는다(최대 6) */
  /* 1~2개도 3열 폭으로 — 카드 한 장이 화면 절반을 차지하지 않게(오너: 크기가 너무 큼). cards-flex 가 가운데로 모은다. */
  let lg = opt.compact && n <= 6 ? n : n <= 2 ? 3 : n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n === 5 ? 3 : 4;
  let xl = n === 10 ? 5 : lg;
  lg = Math.min(lg, max);
  xl = Math.min(xl, max);
  return { '--sm': Math.min(2, n, max), '--lg': lg, '--xl': xl } as CSSProperties;
}

/**
 * 글 옆 사진 — 원본 비율 그대로, 원본 크기보다 키우지 않는다(옛 배너 조각이 4:3 틀에 큼직하게 늘어나 어색했다).
 *  · 세로 사진(장비 배너 등)은 폭 340px 까지, 가로 사진은 560px 까지. 칸 안에서 가운데.
 */
function TextFigure({ fig }: { fig: Fig }) {
  const s = figSize(fig.key);
  const portrait = s.h > s.w * 1.1;
  const cap = Math.min(portrait ? 340 : 560, s.w);
  return (
    <div className="mx-auto w-full" style={{ maxWidth: `${cap}px` }}>
      <Figure fig={fig} sizes="(max-width: 1024px) 90vw, 560px" />
    </div>
  );
}

function BlockView({ block: b, index, band, photoBand }: { block: Block; index: number; band?: string; photoBand?: string }) {
  const id = ('id' in b && b.id) || `sec-${index + 1}`;
  const alt = index % 2 === 1;
  const wrapCls = band ? 'relative isolate overflow-hidden bg-night text-white section' : `section ${alt ? 'bg-canvas' : 'bg-white'}`;
  const Bg = () =>
    band ? (
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc(band)} alt="" fill sizes="100vw" className="object-cover opacity-25" data-parallax="0.18" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/90 via-night/80 to-night/95" />
      </div>
    ) : null;
  const Head = ({ title, lead }: { title?: string; lead?: string }) =>
    title ? (
      <div className="reveal max-w-[820px]">
        <h2 className={`display-sm ${band ? '!text-white' : ''}`}>{title}</h2>
        {lead && (
          <p className={`lead mt-4 ${band ? '!text-white' : ''}`}>
            {band ? <ScrubText text={lead} /> : <Sentences text={lead} />}
          </p>
        )}
      </div>
    ) : null;
  const cardCls = band ? 'flex h-full flex-col rounded-2xl border border-white/12 bg-white/8 p-6 backdrop-blur-sm' : 'card flex h-full flex-col p-6';
  const titleCls = band ? 'text-[1.05rem] font-bold text-white' : 'text-[1.05rem] font-bold text-ink';
  const descCls = band ? 'mt-2 text-[14.5px] leading-relaxed text-white/75' : 'mt-2 text-[14.5px] leading-relaxed text-ink-soft';

  switch (b.type) {
    case 'text':
      /* 사진을 배경으로 깐 가운데 정렬 구역 — 2열 반복 사이의 숨 고르기 */
      if (photoBand) {
        return (
          <section id={id} className="relative isolate overflow-hidden bg-night py-28 text-white md:py-36">
            <div className="absolute inset-0 -z-10">
              <Image src={figSrc(photoBand)} alt="" fill sizes="100vw" className="object-cover" data-parallax="0.15" />
              <div className="absolute inset-0 bg-night/70" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night/70 to-transparent" />
            </div>
            <div className="wrap">
              <div className="reveal mx-auto max-w-[780px] text-center">
                {b.title && <h2 className="display-sm !text-white on-photo">{b.title}</h2>}
                <div className={`prose-ko prose-on-dark ${b.title ? 'mt-7' : ''}`}>
                  {b.paragraphs.map((p, i) => (
                    <p key={i} className="!text-white/85">
                      <Sentences text={p} clauses={false} />
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      }
      return (
        <section id={id} className={wrapCls}>
          <div className={`wrap grid items-center gap-10 lg:gap-16 ${b.figure ? 'lg:grid-cols-2' : ''}`}>
            <div className={`reveal ${b.figure && b.figureSide === 'left' ? 'lg:order-2' : ''} ${b.figure ? '' : 'max-w-[900px]'}`}>
              {b.title && <h2 className="display-sm">{b.title}</h2>}
              <div className={`prose-ko ${b.title ? 'mt-6' : ''}`}>
                {b.paragraphs.map((p, i) => (
                  <p key={i}>
                    <Sentences text={p} />
                  </p>
                ))}
              </div>
            </div>
            {b.figure && (
              <div className={b.figureSide === 'left' ? 'lg:order-1' : ''}>
                <TextFigure fig={b.figure} />
              </div>
            )}
          </div>
        </section>
      );
    case 'points': {
      const n = b.items.length;
      /* 사진 옆에 붙는 목록은 최대 2열, 아니면 개수에 맞춰 줄마다 고르게(마지막 줄은 가운데) */
      const compact = b.items.every((it) => !it.desc);
      const vars = b.figure ? gridVars(n, { max: 2 }) : b.columns === 2 ? gridVars(n, { max: 2 }) : gridVars(n, { compact });
      return (
        <section id={id} className={wrapCls}>
          <Bg />
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className={`mt-10 grid gap-10 ${b.figure ? 'lg:grid-cols-[1fr_1.4fr] lg:items-start' : ''}`}>
              {b.figure && <Figure fig={b.figure} ratio="aspect-[4/3]" />}
              <ul className="reveal-stack cards-flex" style={vars}>
                {b.items.map((it, i) => (
                  <li key={i} className={cardCls}>
                    {b.numbered !== false && <span className={`num ${band ? '!text-sun-300' : ''}`}>{String(i + 1).padStart(2, '0')}</span>}
                    <p className={`${titleCls} ${b.numbered !== false ? 'mt-3' : ''}`}>{it.title}</p>
                    {it.desc && (
                      <p className={descCls}>
                        <Sentences text={it.desc} clauses={false} />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      );
    }
    case 'steps': {
      const withFig = b.steps.some((s) => s.figure);
      return (
        <section id={id} className={wrapCls}>
          <Bg />
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <ol className="reveal-stack cards-flex mt-10" style={gridVars(b.steps.length)}>
              {b.steps.map((s, i) => (
                <li key={i} className={`${cardCls} overflow-hidden`}>
                  {withFig && (
                    <span className="card-img -mx-6 -mt-6 mb-5 !w-auto">
                      <Image src={figSrc(s.figure?.key ?? band ?? 'ai/insight-journey')} alt={s.figure?.alt ?? ''} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                    </span>
                  )}
                  <span className="pill-sun self-start">STEP {String(i + 1).padStart(2, '0')}</span>
                  <p className={`${titleCls} mt-3`}>{s.title}</p>
                  {s.desc && (
                    <p className={descCls}>
                      <Sentences text={s.desc} clauses={false} />
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
    }
    case 'compare': {
      const hl = b.highlight ?? 'b';
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className="reveal mt-10 overflow-x-auto">
              <table className="tbl min-w-[640px]">
                <caption className="sr-only">{b.title ?? '비교표'}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[22%]">구분</th>
                    <th scope="col" className={hl === 'a' ? '!bg-brand-700 !text-white' : ''}>{b.columns[0]}</th>
                    <th scope="col" className={hl === 'b' ? '!bg-brand-700 !text-white' : ''}>{b.columns[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, i) => (
                    <tr key={i}>
                      <th scope="row">{r.label}</th>
                      <td className={hl === 'a' ? 'bg-brand-50/60 font-semibold text-brand-800' : 'text-ink-soft'}>{r.a}</td>
                      <td className={hl === 'b' ? 'bg-brand-50/60 font-semibold text-brand-800' : 'text-ink-soft'}>{r.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {b.note && <p className="mt-4 text-[13.5px] leading-relaxed text-ink-muted">※ {b.note}</p>}
          </div>
        </section>
      );
    }
    case 'table':
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className="reveal mt-10 overflow-x-auto">
              <table className="tbl min-w-[640px]">
                <caption className="sr-only">{b.title ?? '표'}</caption>
                <thead>
                  <tr>
                    {b.head.map((h, i) => (
                      <th key={i} scope="col">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} className="text-ink-soft">{c}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {b.note && <p className="mt-4 text-[13.5px] leading-relaxed text-ink-muted">※ {b.note}</p>}
          </div>
        </section>
      );
    case 'gallery': {
      const cols = b.columns ?? 3;
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className={`reveal-stack mt-10 grid gap-5 ${cols === 4 ? 'grid-cols-2 lg:grid-cols-4' : cols === 2 ? 'sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {b.figures.map((f, i) => (
                <Figure key={i} fig={f} ratio="aspect-[4/3]" sizes="(max-width: 640px) 50vw, 33vw" effect="img-in" />
              ))}
            </div>
          </div>
        </section>
      );
    }
    case 'cases':
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            {b.caseGroup && caseGroup(b.caseGroup) ? (
              <div className="reveal mt-10">
                <BeforeAfter groups={[caseGroup(b.caseGroup)!]} note={b.note} showTabs={false} />
              </div>
            ) : (
              <div className="reveal mt-10 max-w-[1000px]">
                <Figure fig={b.figure} sizes="(max-width: 1024px) 100vw, 1000px" />
                <p className="mt-4 rounded-xl bg-sun-50 px-5 py-3.5 text-[13.5px] leading-relaxed text-sun-700">{b.note}</p>
              </div>
            )}
          </div>
        </section>
      );
    case 'quote':
      return (
        <section className="relative isolate overflow-hidden bg-brand-900 py-20 text-white">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('ai/wide-philosophy')} alt="" fill sizes="100vw" className="object-cover opacity-20" data-parallax="0.15" />
          </div>
          <div className="wrap reveal text-center">
            <p className="mx-auto max-w-[900px] text-[1.3rem] leading-[1.6] font-bold md:text-[1.8rem]">
              “<ScrubText text={b.text} />”
            </p>
            {b.by && <p className="mt-4 text-white/60">— {b.by}</p>}
          </div>
        </section>
      );
    case 'links':
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className="reveal-stack cards-flex mt-10" style={gridVars(b.items.length)}>
              {b.items.map((it) => (
                <CardLink key={it.href} href={it.href} label={it.label} desc={it.desc} external={it.href.startsWith('http')} fig={linkFig(it.href, it.label)} />
              ))}
            </div>
          </div>
        </section>
      );
    case 'notice':
      /* 안내 구역 — 연한 상자 대신 구역 전체에 진한 주황을 깔고, 왼쪽 라벨+큰 제목 / 오른쪽 본문의 편집 배치 */
      return (
        <section className="relative isolate overflow-hidden bg-[#e8783a] py-16 text-white md:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(255,255,255,0.26),transparent_60%),radial-gradient(700px_360px_at_0%_110%,rgba(120,40,0,0.18),transparent_60%)]" />
          <span aria-hidden className="pointer-events-none absolute -right-6 -bottom-10 -z-10 select-none text-[220px] font-extrabold leading-none tracking-[-0.06em] text-white/10 md:text-[300px]">!</span>
          <div className="wrap grid gap-8 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
            <div className="reveal">
              <p className="inline-flex items-center gap-2.5 text-[12px] font-bold tracking-[0.2em] text-white/80">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-[13px]">!</span>
                NOTICE · 알아두세요
              </p>
              {b.title && <h2 className="display-sm mt-5 !text-white">{b.title}</h2>}
            </div>
            <div className="reveal border-l border-white/30 pl-6 md:pl-8">
              {b.paragraphs.map((p, i) => (
                <p key={i} className={`text-[1.02rem] leading-[1.9] text-white/92 md:text-[1.08rem] ${i > 0 ? 'mt-5' : ''}`}>
                  <Sentences text={p} clauses={false} />
                </p>
              ))}
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}
