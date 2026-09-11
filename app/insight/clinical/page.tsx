import type { Metadata } from 'next';
import Link from 'next/link';
import { CLINIC } from '@/lib/clinic';
import { allClinicalPosts, publishedIso, type BlogPost } from '@/lib/blog';
import { ContactBand } from '@/components/ui';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { desc80, breadcrumbSchema, abs, og, alt } from '@/lib/seo';

/**
 * 임상 사례 · 핵심 안내 목록 — 네이버 블로그(sundent21)에서 가져온 글 두 묶음.
 *  · 임상 사례(kind=clinical): 실제 치료 과정을 사진과 함께
 *  · 핵심 안내(kind=notice): 치료를 이해하는 설명글
 * 글 파일은 content/clinical/*.json (scripts/import-naver.mjs 가 만든다). 이 화면은 그리기만 한다.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: '임상 사례 · 핵심 안내',
  description: desc80(`${CLINIC.name}에서 실제로 진행한 치료 과정을 사진과 함께 정리한 임상 사례와, 상악동거상술·임플란트 구조·틀니와 풀아치 임플란트처럼 치료를 이해하는 데 필요한 핵심 안내 글을 모았습니다.`),
  alternates: alt('/insight/clinical'),
  openGraph: og({ title: `임상 사례 · 핵심 안내 | ${CLINIC.name}`, description: '실제 치료 과정과 치료를 이해하는 핵심 안내 글.', path: '/insight/clinical' }),
};

const TRAIL = [
  { name: '홈', path: '/' },
  { name: '인사이트', path: '/insight' },
  { name: '임상 사례 · 핵심 안내', path: '/insight/clinical' },
];

/**
 * 글 목록 — 썸네일 없이 줄로(오너 2026-09-11: "썸네일 없이 네이버 공지 목록처럼, 우리 디자인으로").
 *  · 한 줄 = 번호 · 분류 칩 · 제목(굵게) · 요약 한 줄(데스크톱) · 날짜(오른쪽, 숫자 정렬).
 *  · 줄 전체가 링크. 올리면 배경이 살짝 뜨고 제목이 주황으로, 오른쪽에 화살표가 나온다.
 *  · 카드 격자·캐러셀을 거쳐 여기로 왔다 — 사진 표지가 글마다 겹치고 카드가 커서 둘째 묶음이 안 보였다.
 */
function PostList({ posts, onCanvas = false }: { posts: BlogPost[]; onCanvas?: boolean }) {
  return (
    <ol className="reveal-stack divide-y divide-hairline border-y border-hairline">
      {posts.map((p, i) => (
        <li key={p.slug}>
          <Link
            href={`/insight/clinical/${p.slug}`}
            className={`group -mx-3 grid grid-cols-[2.6rem_minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-xl px-3 py-4 transition-colors md:-mx-5 md:grid-cols-[3.2rem_minmax(0,1fr)_auto] md:gap-x-5 md:px-5 md:py-5 ${onCanvas ? 'hover:bg-white' : 'hover:bg-canvas'}`}
          >
            <span className="num !text-[1.3rem] md:!text-[1.5rem]">{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                {p.category && <span className="rounded-full bg-canvas-2 px-2 py-0.5 text-[11.5px] font-bold text-ink-soft">{p.category}</span>}
                <h3 className="text-[16px] font-extrabold leading-[1.45] tracking-[-0.01em] text-ink transition-colors group-hover:text-sun-700 md:text-[17.5px]">
                  {p.title}
                  <span aria-hidden className="ml-2 inline-block translate-x-0 text-sun-500 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">→</span>
                </h3>
              </span>
              <span className="mt-1 hidden text-[14px] leading-[1.7] text-ink-soft md:line-clamp-1">{p.summary}</span>
            </span>
            <time dateTime={p.date} className="shrink-0 text-[12.5px] font-semibold tabular-nums text-ink-muted md:text-[13.5px]">
              {p.date.replace(/-/g, '. ')}
            </time>
          </Link>
        </li>
      ))}
    </ol>
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
            { title: '핵심 안내', desc: '상악동거상술의 종류, 임플란트의 구조, 틀니와 풀아치 임플란트의 차이처럼 치료를 고르기 전에 알아 둘 내용입니다.' },
            { title: '임상 사례', desc: '뼈가 부족한 임플란트, 신경 가까운 자리, 자연치아 보존처럼 실제 치료 과정을 단계별 사진으로 보여 드립니다.' },
            { title: '개인차가 있습니다', desc: '사례의 결과는 그 환자분의 것입니다. 내 경우는 검사 뒤에 함께 정합니다.' },
          ]}
        />

        {/* 핵심 안내가 먼저, 임상 사례가 다음(오너 2026-09-11). 두 묶음이 한 화면에 이어 보이도록 사이 여백을 줄였다 */}
        <section className="section !pb-10 lg:!pb-12 scroll-mt-[96px]" id="notice">
          <div className="wrap">
            <p className="eyebrow reveal">GUIDE</p>
            <h2 className="display-sm reveal mt-4">핵심 안내</h2>
            <p className="lead reveal mt-3 max-w-[46em]">치료를 고르기 전에 알아 두면 좋은 내용을 설명한 글입니다.</p>
            <div className="mt-8">
              {notices.length ? <PostList posts={notices} /> : <p className="text-[17px] leading-[1.9] text-ink-soft">준비 중입니다.</p>}
            </div>
          </div>
        </section>

        <section className="section bg-canvas !pt-10 lg:!pt-12 scroll-mt-[96px]" id="cases">
          <div className="wrap">
            <p className="eyebrow reveal">CASES</p>
            <h2 className="display-sm reveal mt-4">임상 사례</h2>
            <p className="lead reveal mt-3 max-w-[46em]">실제로 진행한 치료를 초진부터 마무리까지 순서대로 정리했습니다.</p>
            <div className="mt-8">
              {cases.length ? <PostList posts={cases} onCanvas /> : <p className="text-[17px] leading-[1.9] text-ink-soft">첫 사례를 준비하고 있습니다.</p>}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
    </>
  );
}
