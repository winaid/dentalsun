import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, CardLink, ContactBand, FaqList, Figure, MedicalNotice } from '@/components/ui';
import { docCharCount, docToc, figSize, figSrc, type Block, type Doc } from '@/lib/docs';
import { docByPath, docsOfHub } from '@/lib/content';
import { articleSchema, breadcrumbSchema, faqSchema, imageObjectSchema, itemListSchema, medicalWebPageSchema } from '@/lib/seo';
import { CLINIC } from '@/lib/clinic';

/**
 * 진료 문서 렌더러 — Doc 하나를 쪽 하나로.
 *
 * 구조(AEO): 빵부스러기 → 윗줄 라벨 → H1 → 한 줄 답(첫 <p>, speakable) → 목차 → 본문 블록 →
 *            FAQ(화면 = 스키마) → 관련 문서 → 상담 띠 → 의료 고지.
 */
export function DocPage({ doc }: { doc: Doc }) {
  const trail = [{ name: '진료 안내', path: '/treatment' }, { name: doc.hubLabel, path: doc.hub }];
  if (doc.path !== doc.hub) trail.push({ name: doc.title, path: doc.path });
  const toc = docToc(doc);
  const children = doc.isHub ? docsOfHub(doc.path) : [];
  const related = (doc.related ?? []).map(docByPath).filter(Boolean) as Doc[];
  const heroSize = doc.hero ? figSize(doc.hero.key) : null;

  const schema: unknown[] = [
    breadcrumbSchema(trail),
    medicalWebPageSchema({
      title: doc.title,
      description: doc.description,
      path: doc.path,
      about: doc.procedure ? { type: 'MedicalProcedure', name: doc.procedure } : undefined,
      image: doc.hero && heroSize ? { src: figSrc(doc.hero.key), caption: doc.hero.alt, width: heroSize.w, height: heroSize.h } : undefined,
      related: [...(doc.related ?? []), ...children.map((c) => c.path)],
    }),
  ];
  if (doc.hero && heroSize) schema.push(imageObjectSchema({ path: doc.path, src: figSrc(doc.hero.key), caption: doc.hero.alt, width: heroSize.w, height: heroSize.h }));
  if (!doc.isHub) schema.push(articleSchema({ path: doc.path, title: doc.title, description: doc.description, wordCount: docCharCount(doc), hasImage: !!doc.hero, keywords: doc.keywords }));
  if (doc.isHub && children.length) schema.push(itemListSchema(doc.path, children.map((c) => ({ name: c.title, path: c.path })), `${doc.title} 세부 안내`));
  if (doc.faq?.length) schema.push(faqSchema(doc.faq, doc.path));

  return (
    <>
      <SiteHeader dark />
      <JsonLd data={schema} />
      <main id="main">
        {/* 첫 화면 — 어두운 바탕, 왼쪽 글 / 오른쪽 사진 */}
        <section className="relative overflow-hidden bg-night pt-[104px] pb-14 text-white md:pt-[136px] md:pb-20">
          <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full bg-sun-500/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-52 left-1/4 h-[520px] w-[520px] rounded-full bg-brand-500/25 blur-3xl" />
          <div className="wrap relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <Breadcrumb trail={trail} dark />
              <p className="eyebrow on-dark mt-6 hero-in">{doc.eyebrow}</p>
              <h1 className="display mt-4 !text-white hero-in hero-in-2">{doc.title}</h1>
              <p className="mt-6 max-w-[640px] text-[1.05rem] leading-[1.8] text-white/80 hero-in hero-in-3 md:text-[1.12rem]">{doc.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3 hero-in hero-in-4">
                <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
                <a href={CLINIC.phoneHref} className="btn-ghost-dark">전화 {CLINIC.phone}</a>
              </div>
            </div>
            {doc.hero && (
              <div className="hero-in hero-in-3">
                <Figure fig={doc.hero} priority sizes="(max-width: 1024px) 100vw, 45vw" rounded="rounded-3xl" className="[&_figcaption]:text-white/50" />
              </div>
            )}
          </div>
        </section>

        {/* 목차 — 항목 3개 이상일 때만 */}
        {toc.length >= 3 && (
          <div className="border-b border-hairline bg-white">
            <div className="wrap">
              <nav aria-label="이 문서의 차례" className="hscroll !pb-0">
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`} className="border-b-2 border-transparent py-4 text-[14px] font-bold whitespace-nowrap text-ink-soft hover:border-sun-500 hover:text-ink">
                    {t.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* 허브: 하위 문서 카드 */}
        {doc.isHub && children.length > 0 && (
          <section className="section bg-canvas">
            <div className="wrap">
              <p className="eyebrow">MENU</p>
              <h2 className="display-sm mt-4">{doc.title} 세부 안내</h2>
              <ol className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((c, i) => (
                  <li key={c.path}>
                    <Link href={c.path} className="card card-hover group block h-full p-6">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="mt-4 block text-[1.1rem] font-bold text-ink group-hover:text-brand-700">{c.title}</span>
                      <span className="mt-2 block text-[14px] leading-relaxed text-ink-soft">{c.summary.split(/(?<=다\.)\s/)[0]}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {doc.blocks.map((b, i) => (
          <BlockView key={i} block={b} index={i} />
        ))}

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
                <p className="lead mt-4">환자분들이 자주 물어보시는 내용을 정리했습니다. 더 궁금한 점은 톡톡이나 전화로 문의해 주세요.</p>
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
              <p className="eyebrow">RELATED</p>
              <h2 className="display-sm mt-4">함께 보면 좋은 안내</h2>
              <div className="reveal-stack mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {doc.path !== doc.hub && <CardLink href={doc.hub} label={`${doc.hubLabel} 전체 안내`} desc="이 갈래의 모든 진료를 한눈에 봅니다." />}
                {related.map((r) => (
                  <CardLink key={r.path} href={r.path} label={r.title} desc={r.summary.split(/(?<=다\.)\s/)[0]} />
                ))}
                <CardLink href="/faq" label="자주 묻는 질문" desc="진료시간·주차·비용·보험 등 전체 문답" />
              </div>
            </div>
          </section>
        )}

        <ContactBand />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}

function BlockView({ block: b, index }: { block: Block; index: number }) {
  const id = ('id' in b && b.id) || `sec-${index + 1}`;
  const alt = index % 2 === 1;
  const wrapCls = `section ${alt ? 'bg-canvas' : 'bg-white'}`;
  const Head = ({ title, lead, center = false }: { title?: string; lead?: string; center?: boolean }) =>
    title ? (
      <div className={`reveal max-w-[760px] ${center ? 'mx-auto text-center' : ''}`}>
        <h2 className="display-sm">{title}</h2>
        {lead && <p className="lead mt-4">{lead}</p>}
      </div>
    ) : null;

  switch (b.type) {
    case 'text':
      return (
        <section id={id} className={wrapCls}>
          <div className={`wrap grid items-center gap-10 ${b.figure ? 'lg:grid-cols-2' : ''}`}>
            <div className={`reveal ${b.figure && b.figureSide === 'left' ? 'lg:order-2' : ''}`}>
              {b.title && <h2 className="display-sm">{b.title}</h2>}
              <div className={`prose-ko ${b.title ? 'mt-6' : ''}`}>
                {b.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            {b.figure && (
              <div className={b.figureSide === 'left' ? 'lg:order-1' : ''}>
                <Figure fig={b.figure} />
              </div>
            )}
          </div>
        </section>
      );
    case 'points': {
      const cols = b.columns ?? (b.items.length >= 4 ? 4 : b.items.length === 3 ? 3 : 2);
      const colCls = cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className={`mt-10 grid gap-10 ${b.figure ? 'lg:grid-cols-[1fr_1.4fr] lg:items-start' : ''}`}>
              {b.figure && <Figure fig={b.figure} />}
              <ul className={`reveal-stack grid gap-4 ${b.figure ? 'sm:grid-cols-2' : colCls}`}>
                {b.items.map((it, i) => (
                  <li key={i} className="card p-6">
                    {b.numbered !== false && <span className="num">{String(i + 1).padStart(2, '0')}</span>}
                    <p className={`text-[1.05rem] font-bold text-ink ${b.numbered !== false ? 'mt-3' : ''}`}>{it.title}</p>
                    {it.desc && <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{it.desc}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      );
    }
    case 'steps':
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <ol className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {b.steps.map((s, i) => (
                <li key={i} className="card relative overflow-hidden p-6">
                  {s.figure && <Figure fig={s.figure} className="-mx-6 -mt-6 mb-5" rounded="rounded-none" sizes="(max-width: 640px) 100vw, 25vw" />}
                  <span className="pill-sun">STEP {String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-3 text-[1.05rem] font-bold text-ink">{s.title}</p>
                  {s.desc && <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{s.desc}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
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
                <Figure key={i} fig={f} sizes="(max-width: 640px) 50vw, 33vw" />
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
            <div className="reveal mt-10 max-w-[960px]">
              <Figure fig={b.figure} sizes="(max-width: 1024px) 100vw, 960px" />
              <p className="mt-4 rounded-xl bg-sun-50 px-5 py-3.5 text-[13.5px] leading-relaxed text-sun-700">{b.note}</p>
            </div>
          </div>
        </section>
      );
    case 'quote':
      return (
        <section className="bg-brand-900 py-14 text-white">
          <div className="wrap reveal text-center">
            <p className="mx-auto max-w-[820px] text-[1.3rem] leading-[1.6] font-bold md:text-[1.7rem]">“{b.text}”</p>
            {b.by && <p className="mt-4 text-white/60">— {b.by}</p>}
          </div>
        </section>
      );
    case 'links':
      return (
        <section id={id} className={wrapCls}>
          <div className="wrap">
            <Head title={b.title} lead={b.lead} />
            <div className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {b.items.map((it) => (
                <CardLink key={it.href} href={it.href} label={it.label} desc={it.desc} external={it.href.startsWith('http')} />
              ))}
            </div>
          </div>
        </section>
      );
    case 'notice':
      return (
        <section className="py-6">
          <div className="wrap">
            <div className="reveal rounded-2xl border border-sun-200 bg-sun-50 p-6 md:p-8">
              {b.title && <p className="text-[1.05rem] font-bold text-sun-700">{b.title}</p>}
              <div className="prose-ko mt-3 [&_p]:!text-ink-soft">
                {b.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}
