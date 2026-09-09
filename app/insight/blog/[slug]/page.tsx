import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

/* ★ ISR — 예약 글이 날짜가 되면 빌드 없이 실린다(app/insight/blog/page.tsx 주석). 미래 글은 그때까지 404 다. */
export const revalidate = 3600;
import { CLINIC } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { allPosts, publishedIso } from '@/lib/blog';
import { postBySlugMerged, extractFaq } from '@/lib/insightFeed';
import { ContactBand, Breadcrumb, Sentences } from '@/components/ui';
import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, abs, og, medicalWebPageSchema, alt } from '@/lib/seo';

/**
 * 블로그 글 한 편.
 *
 * ★ 본문은 content/blog/*.json 의 html 을 그대로 그린다. 그래서 생성기가 만든 HTML 이
 *   중간 변환 없이 화면에 나온다.
 * ⚠️ dangerouslySetInnerHTML 을 쓰는 유일한 자리다. 넣는 값은 **저장소에 커밋된 파일**뿐이고
 *    lib/blog.ts 가 script·iframe·on* 을 한 번 걷어 낸다. 외부 입력을 여기로 흘리지 말 것.
 * ⚠️ 본문 모양은 .blog-body 한 곳(globals.css)에서 정한다 — 글마다 클래스를 적을 수 없기
 *    때문이다. 생성기가 클래스를 붙이지 않아도 h2/p/ul 이 제 모양으로 나온다.
 *
 * ★ 날짜는 글 파일에서 온다. 다른 페이지처럼 contentDates(경로) 를 쓰지 않는다 —
 *   그쪽은 사람이 관리하는 표라 한 달에 열 편씩 늘어나는 글에는 맞지 않는다.
 */
/* 빌드 때 미리 만드는 건 우리 글뿐. 중앙 글은 첫 요청 때 그려지고(dynamicParams 기본값) ISR 로 남는다. */
export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

/** 중앙 글의 표지는 절대 주소 — abs() 를 다시 붙이지 않는다. */
const imgUrl = (s: string) => (/^https?:\/\//.test(s) ? s : abs(s));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await postBySlugMerged(slug);
  if (!post) return {};
  const path = `/insight/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.summary.slice(0, 155),
    alternates: alt(path),
    openGraph: og({
      title: `${post.title} | ${CLINIC.name}`,
      description: post.summary.slice(0, 155),
      path,
      /* 대표 사진이 있으면 카카오톡·검색 미리보기에 그 사진이 나간다. 없으면 og() 가 제목 카드를 만든다. */
      ...(post.image ? { images: [{ url: post.image, alt: post.imageAlt ?? post.title }] } : {}),
    }),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await postBySlugMerged(slug);
  if (!post) notFound();
  /* 본문 끝 '자주 묻는 질문' 이 있으면 FAQPage 로도 낸다(중앙 글 문서 권고 — AI 검색이 질문·답을 그대로 읽는다). */
  const faq = extractFaq(post.html);

  const path = `/insight/blog/${post.slug}`;
  const trail = [
    { name: '홈', path: '/' },
    { name: '인사이트', path: '/insight' },
    { name: '블로그', path: '/insight/blog' },
    { name: post.title, path },
  ];
  /* 글쓴이는 대표원장으로 둔다 — 의료 정보는 '누가 말했는가' 가 신뢰의 절반이다. */
  const author = DOCTORS[0];

  return (
    <>
      <SiteHeader />
      <JsonLd
        data={[
          breadcrumbSchema(trail),
          medicalWebPageSchema({ title: post.title, description: post.summary, path }),
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${CLINIC.url}${path}#post`,
            headline: post.title,
            description: post.summary,
            url: abs(path),
            inLanguage: 'ko-KR',
            datePublished: publishedIso(post),
            dateModified: post.updated ?? post.date,
            isPartOf: { '@id': `${CLINIC.url}/insight/blog#blog` },
            publisher: { '@id': `${CLINIC.url}/#clinic` },
            author: { '@id': `${CLINIC.url}/about/doctors#${author.slug}` },
            ...(post.category ? { articleSection: post.category } : {}),
            ...(post.image ? { image: imgUrl(post.image) } : {}),
          },
          ...(faq.length
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  '@id': `${CLINIC.url}${path}#faq`,
                  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
                },
              ]
            : []),
        ]}
      />

      {/* ⚠️ pb — 없으면 '블로그 목록' 단추가 아래 예약 띠에 붙는다(2026-09-07 오너 지적). */}
      <main id="main">
      <div className="wrap pt-[110px] pb-16 sm:pb-20 lg:pt-[130px] lg:pb-24">
        <Breadcrumb trail={trail} />

        <div className="mt-9 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <time dateTime={post.date} className="font-bold text-[15px] tabular-nums text-sun-600">
            {post.date.replace(/-/g, '. ')}
          </time>
          {post.category && (
            <span className="text-[14px] font-bold text-ink-muted">{post.category}</span>
          )}
        </div>

        <h1 className="display-sm mt-4 max-w-[20em] text-[clamp(28px,3.6vw,44px)] leading-[1.25] tracking-[-0.02em] text-ink">
          {post.title}
        </h1>
        <p className="mt-6 max-w-[46em] text-[18px] leading-[1.9] text-ink-soft"><Sentences text={post.summary} /></p>

        {/*
          대표 사진 — 요약 **다음**에 온다. 먼저 읽혀야 할 것은 제목과 요약이고, 사진은 그 답이
          무엇에 대한 것인지 붙여 주는 역할이다(증상 쪽과 같은 순서). 3:2 는 생성 원본(1536×1024) 비율.
        */}
        {post.image && (
          <figure className="mt-10 max-w-[56em] overflow-hidden rounded-2xl border border-hairline bg-canvas-2">
            <div className="relative aspect-[3/2]">
              <Image src={post.image} alt={post.imageAlt ?? ''} fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" />
            </div>
          </figure>
        )}

        {/*
          ⚠️ 본문 모양은 globals.css 의 .blog-body 가 정한다. 여기서 자식마다 클래스를 주려
             하지 말 것 — 본문은 문자열이라 손댈 수 없다.
        */}
        <div
          className="blog-body mt-12 max-w-[42em]"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/*
          (2026-09-07 오너) 본문 끝의 '개인차' 고지 문단과 대표원장 이름줄을 뺐다 — "이거 없애고".
          ⚠️ 개인차·부작용 고지는 사이트 푸터의 공통 고지와 각 글의 JSON-LD(reviewedBy) 가 계속 맡는다.
             글마다 다시 넣고 싶으면 여기 두는 대신 lib/blog.ts 의 sanitize 뒤에 붙일 것.
          ★ 목록 단추는 실선 위에 두고 아래 여백을 넉넉히 — 다음 띠(예약 CTA)에 붙어 보였다.
        */}
        <div className="mt-14 border-t border-hairline pt-8">
          <Link
            href="/insight/blog"
            className="group inline-flex items-center gap-2 text-[16px] font-bold text-sun-700"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            블로그 목록
          </Link>
        </div>
      </div>

      <ContactBand />
      </main>
    </>
  );
}
