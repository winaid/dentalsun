import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLINIC } from '@/lib/clinic';
import { allClinicalPosts, publishedIso, type BlogPost } from '@/lib/blog';
import { ContactBand } from '@/components/ui';
import { HeroCollage } from '@/components/HeroCollage';
import { Carousel } from '@/components/Carousel';
import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, abs, og, alt } from '@/lib/seo';

/**
 * 임상 사례 · 핵심 안내 목록 — 네이버 블로그(sundent21)에서 가져온 글 두 묶음.
 *  · 임상 사례(kind=clinical): 실제 치료 과정을 사진과 함께
 *  · 핵심 안내(kind=notice): 치료를 이해하는 설명글
 * 글 파일은 content/clinical/*.json (scripts/import-naver.mjs 가 만든다). 이 화면은 그리기만 한다.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: '임상 사례 · 핵심 안내',
  description: `${CLINIC.name}에서 실제로 진행한 치료 과정을 사진과 함께 정리한 임상 사례와, 상악동거상술·임플란트 구조·틀니와 풀아치 임플란트처럼 치료를 이해하는 데 필요한 핵심 안내 글을 모았습니다.`,
  alternates: alt('/insight/clinical'),
  openGraph: og({ title: `임상 사례 · 핵심 안내 | ${CLINIC.name}`, description: '실제 치료 과정과 치료를 이해하는 핵심 안내 글.', path: '/insight/clinical' }),
};

const TRAIL = [
  { name: '홈', path: '/' },
  { name: '인사이트', path: '/insight' },
  { name: '임상 사례', path: '/insight/clinical' },
];

const koDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

/**
 * 한 줄 캐러셀 — 카드를 작게 해 한 줄에 넷씩, 좌우 화살표로 넘긴다(오너 2026-09-11: "카드 너무 큰데 한 줄로 하나씩 넘기면서",
 * "핵심 안내가 밑에 있는 줄 몰랐어"). 3열 격자로 두 묶음을 쌓으니 둘째 묶음이 화면 두 장 아래로 내려가 있었다.
 */
function Cards({ posts, priority = false }: { posts: BlogPost[]; priority?: boolean }) {
  return (
    <Carousel label={`${posts.length}편`} itemClass="w-[264px] md:w-[290px] xl:w-[300px]">
      {posts.map((p, i) => (
        <Link key={p.slug} href={`/insight/clinical/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-white transition-colors hover:border-brand-300">
          <div className="relative aspect-[3/2] overflow-hidden bg-canvas-2">
            {p.image ? (
              <Image src={p.image} alt={p.imageAlt ?? ''} fill priority={priority && i < 4} sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-canvas-2">
                <span className="display-sm text-[20px] text-sun-700">{p.category ?? '임상 사례'}</span>
                <span className="text-[13px] font-bold text-ink-muted">{CLINIC.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <time dateTime={p.date} className="text-[12.5px] font-bold tabular-nums text-sun-700">{koDate(p.date)}</time>
              {p.category && <span className="text-[12px] font-bold text-ink-muted">{p.category}</span>}
            </div>
            <h3 className="mt-2.5 line-clamp-2 min-h-[2.8em] text-[16.5px] font-extrabold leading-[1.4] tracking-[-0.02em] text-ink transition-colors group-hover:text-sun-700">{p.title}</h3>
            <p className="mt-2 line-clamp-2 min-h-[3.4em] text-[13.5px] leading-[1.7] text-ink-soft">{p.summary}</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[13.5px] font-black text-sun-700">
              읽기 <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </Link>
      ))}
    </Carousel>
  );
}

export default function ClinicalIndexPage() {
  const all = allClinicalPosts();
  const cases = all.filter((p) => p.kind !== 'notice');
  const notices = all.filter((p) => p.kind === 'notice');

  return (
    <>
      <SiteHeader dark />
      <JsonLd
        data={[
          breadcrumbSchema(TRAIL),
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            '@id': `${CLINIC.url}/insight/clinical#blog`,
            name: `${CLINIC.name} 임상 사례 · 핵심 안내`,
            url: abs('/insight/clinical'),
            publisher: { '@id': `${CLINIC.url}/#clinic` },
            blogPost: all.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: abs(`/insight/clinical/${p.slug}`),
              datePublished: publishedIso(p),
              dateModified: p.updated ?? p.date,
              description: p.summary,
              ...(p.image ? { image: abs(p.image) } : {}),
            })),
          },
        ]}
      />

      <main id="main">
        <HeroCollage
          trail={TRAIL.slice(1)}
          eyebrow="CLINICAL CASES"
          cardsLead="이런 글을 모았습니다."
          lines={['진료실에서 실제로 있었던', <><span className="accent-sun">임상 사례</span>와 <span className="accent-sun">핵심 안내</span></>]}
          long
          lead="어떤 상태로 오셔서 어떤 순서로 치료했는지, 사진과 함께 그대로 보여 드립니다. 비슷한 고민이라면 내 경우는 어떨지 가늠해 보세요."
          bg="ai/wide-implant"
          cards={[
            { fig: { key: 'scene/surgery', alt: '수술 가운과 확대경을 착용하고 임플란트 수술 중인 광화문선치과 원장' }, shape: 'portrait' },
            { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'wide' },
            { fig: { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형' }, shape: 'std' },
          ]}
          items={[
            { title: '임상 사례', desc: '뼈가 부족한 임플란트, 신경 가까운 자리, 자연치아 보존처럼 실제 치료 과정을 단계별 사진으로 보여 드립니다.' },
            { title: '핵심 안내', desc: '상악동거상술의 종류, 임플란트의 구조, 틀니와 풀아치 임플란트의 차이처럼 치료를 고르기 전에 알아 둘 내용입니다.' },
            { title: '개인차가 있습니다', desc: '사례의 결과는 그 환자분의 것입니다. 내 경우는 검사 뒤에 함께 정합니다.' },
          ]}
        />

        {/* 두 묶음이 한 화면에 이어 보이도록 위아래 여백을 줄이고, 첫 묶음 머리에 둘째 묶음으로 가는 길을 둔다 */}
        <section className="section !pb-10 lg:!pb-12" id="cases">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow reveal">CASES</p>
                <h2 className="display-sm reveal mt-4">임상 사례</h2>
                <p className="lead reveal mt-3 max-w-[46em]">실제로 진행한 치료를 초진부터 마무리까지 순서대로 정리했습니다.</p>
              </div>
              <a href="#notice" className="reveal inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[14px] font-bold text-ink-soft hover:border-brand-300 hover:text-brand-700">
                핵심 안내 {notices.length}편 <span aria-hidden>↓</span>
              </a>
            </div>
            <div className="mt-8">
              {cases.length ? <Cards posts={cases} priority /> : <p className="text-[17px] leading-[1.9] text-ink-soft">첫 사례를 준비하고 있습니다.</p>}
            </div>
          </div>
        </section>

        <section className="section bg-canvas !pt-10 lg:!pt-12 scroll-mt-[96px]" id="notice">
          <div className="wrap">
            <p className="eyebrow reveal">GUIDE</p>
            <h2 className="display-sm reveal mt-4">핵심 안내</h2>
            <p className="lead reveal mt-3 max-w-[46em]">치료를 고르기 전에 알아 두면 좋은 내용을 설명한 글입니다.</p>
            <div className="mt-8">
              {notices.length ? <Cards posts={notices} /> : <p className="text-[17px] leading-[1.9] text-ink-soft">준비 중입니다.</p>}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
    </>
  );
}
