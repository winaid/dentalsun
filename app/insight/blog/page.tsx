import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLINIC } from '@/lib/clinic';
import { publishedIso } from '@/lib/blog';
import { allPostsMerged } from '@/lib/insightFeed';
import { ContactBand } from '@/components/ui';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, abs, og, alt } from '@/lib/seo';

/*
 * ★ ISR — 한 시간마다 다시 그린다 (2026-09-07 오너: "매달 자동으로 발행").
 *   글마다 date 를 미리 적어 두면 lib/blog.ts 가 오늘 이후 글을 숨기고, 이 revalidate 가
 *   날짜가 지난 글을 다시 빌드 없이 실어 준다. 새 글 파일 자체는 커밋 → 빌드로 들어온다.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: '블로그',
  /* ⚠️ 49자였다(2026-09-07 실측) — 검색 결과 조각이 한 줄로 끝나 무슨 글이 있는지 안 보였다.
     무엇을 다루는지까지 적어 70~160자 안에 둔다. 화면에는 안 나오는 글이다. */
  description: `${CLINIC.name}이 진료하면서 자주 받는 질문과 알아 두시면 좋은 내용을 정리해 올립니다. 충치와 잇몸, 임플란트와 사랑니처럼 진료실에서 설명이 길어지는 주제를 글로 풀어 두었습니다.`,
  alternates: alt('/insight/blog'),
  openGraph: og({
    title: `블로그 | ${CLINIC.name}`,
    description: '진료하면서 자주 받는 질문과 알아 두시면 좋은 내용을 적습니다.',
    path: '/insight/blog',
  }),
};

const TRAIL = [
  { name: '홈', path: '/' },
  { name: '인사이트', path: '/insight' },
  { name: '블로그', path: '/insight/blog' },
];

/** 2026-09-08 → 2026년 9월 8일. 카드에 발행일을 사람이 읽는 형태로. */
const koDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

/**
 * 블로그 목록 — 사진 카드 격자 (2026-09-07 오너: "이미지 하나정도씩 캐러셀처럼 넣어서 카드형태로").
 *
 * ★ 카드마다 대표 사진 · 발행일 · 분류 · 제목 · 요약. 발행일을 눈에 띄게 두는 이유 —
 *   검색과 답변 엔진이 '언제 쓴 글인가' 를 신선도 신호로 보고, 사람도 그것을 보고 믿는다.
 * ★ 첫 글은 크게(2칸) — 가장 최근 글이 먼저 보이고 격자에 리듬이 생긴다.
 * ⚠️ 글은 content/blog/*.json 이 전부다(lib/blog.ts). 이 파일은 그 목록을 그리기만 한다.
 * ⚠️ 글이 하나도 없어도 정상이다 — 그때는 빈 화면 대신 '준비 중' 을 말한다. 404 로 만들지 말 것.
 */
/** 중앙 글의 표지는 절대 주소로 온다 — abs() 를 다시 붙이면 주소가 두 겹이 된다. */
const imgUrl = (s: string) => (/^https?:\/\//.test(s) ? s : abs(s));

export default async function BlogIndexPage() {
  /* 우리 글(content/blog) + 중앙(winaid) 글 — lib/insightFeed.ts. 중앙이 안 되면 우리 글만 남는다. */
  const posts = await allPostsMerged();

  return (
    <>
      <SiteHeader dark />
      <JsonLd
        data={[
          breadcrumbSchema(TRAIL),
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            '@id': `${CLINIC.url}/insight/blog#blog`,
            name: `${CLINIC.name} 블로그`,
            url: abs('/insight/blog'),
            publisher: { '@id': `${CLINIC.url}/#clinic` },
            blogPost: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: abs(`/insight/blog/${p.slug}`),
              datePublished: publishedIso(p),
              dateModified: p.updated ?? p.date,
              description: p.summary,
              ...(p.image ? { image: imgUrl(p.image) } : {}),
            })),
          },
        ]}
      />

      <main id="main">
      <HeroCollage
        trail={TRAIL.slice(1)}
        eyebrow="BLOG"
        cardsLead="이런 이야기를 씁니다."
        lines={['진료하면서 자주 받는 질문을', <><span className="accent-sun">글로 정리합니다</span></>]}
        long
        lead="상담 중에 짧게밖에 말씀드리지 못한 내용을 글로 남깁니다. 읽고 오시면 진료실에서 다음 이야기부터 하실 수 있습니다."
        bg="ai/wide-insight"
        cards={[
          { fig: { key: 'scene/consult', alt: '환자와 상담하는 장면' }, shape: 'portrait' },
          { fig: { key: 'ai/insight-hub', alt: '휴대폰으로 치과 안내 글을 읽는 손' }, shape: 'wide' },
          { fig: { key: 'orig/misc-online-phone', alt: '노트북 앞에서 스마트폰을 든 손' }, shape: 'std' },
        ]}
        items={[
          { title: '진료실에서 받는 질문', desc: '임플란트·턱관절·사랑니처럼 상담 때 자주 나오는 질문에 대표원장이 설명하듯 답합니다.' },
          { title: '사실만, 과장 없이', desc: '의료광고 기준에 맞춰 효과를 단정하지 않고 일반적인 기준과 광화문선치과의 진료 방식을 나눠 씁니다.' },
          { title: '정기적으로 새 글', desc: '새 글은 날짜를 정해 예약 발행됩니다. 오래된 글도 내용이 바뀌면 고쳐 둡니다.' },
        ]}
      />

      <section className="section"><div className="wrap">
        {posts.length === 0 ? (
          <p className="max-w-[46em] text-[17px] leading-[1.9] text-ink-soft">
            첫 글을 준비하고 있습니다. 궁금한 점은 전화나 네이버 톡톡으로 먼저 물어보셔도 됩니다.
          </p>
        ) : (
          /*
            ★★ 아카이브 격자 — 카드 전부 **같은 규격** (2026-09-07 오너: "카드 사이즈 다르게 하지말고, 아카이브 형식으로") ★★
              첫 글을 2칸으로 키웠더니 둘째 줄이 한 장만 남아 행이 안 맞았다. 이제 셋씩 같은 크기로 선다.
            ★ 행·열이 맞는 규칙: 사진 3:2 고정 · 제목 2줄 · 요약 3줄로 **잘라서** 카드 높이를 같게 하고,
              h-full 로 한 줄의 카드가 서로 높이를 맞춘다. 제목이 길어도 카드가 커지지 않는다.
            ⚠️ 첫 카드를 다시 키우지 말 것 — 글 수가 3n+1 이면 반드시 행이 깨진다.
            ⚠️ 삼항식의 가지 안이라 중괄호 주석이 아니라 맨 주석이다 — 표현식 자리에 중괄호를 두면 빌드가 깨진다(실제로 깨졌다).
               그리고 주석 글 안에 '별표 슬래시' 를 적지 말 것 — 주석이 거기서 닫혀 또 깨진다(이것도 실제로 깨졌다).
          */
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/insight/blog/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-white transition-colors hover:border-brand-300"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-canvas-2">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.imageAlt ?? ''}
                        fill
                        priority={i < 3}
                        sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      /* 표지가 없는 글(중앙 글은 흔하다) — '사진 없음' 은 오류처럼 읽힌다. 분류를 적은 제목 타일로 대신한다. */
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-canvas-2">
                        <span className="display-sm text-[22px] text-sun-700">{p.category ?? '블로그'}</span>
                        <span className="text-[13px] font-bold text-ink-muted">{CLINIC.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <time dateTime={p.date} className="text-[13.5px] font-bold tabular-nums text-sun-700">
                        {koDate(p.date)}
                      </time>
                      {p.category && <span className="text-[13px] font-bold text-ink-muted">{p.category}</span>}
                    </div>
                    <h2 className="mt-3 line-clamp-2 min-h-[2.8em] text-[20px] font-extrabold leading-[1.4] tracking-[-0.02em] text-ink transition-colors group-hover:text-sun-700">
                      {p.title}
                    </h2>
                    {/* ⚠️ Sentences 를 쓰지 않는다 — 카드 폭에서 쉼표마다 줄이 갈려 계단이 된다(증상 허브와 같은 이유). */}
                    <p className="mt-3 line-clamp-3 min-h-[5.4em] text-[15.5px] leading-[1.8] text-ink-soft">{p.summary}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[14.5px] font-black text-sun-700">
                      읽기 <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div></section>

      <ContactBand />
      </main>
    </>
  );
}
