import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/* ★ ISR — 예약 글이 날짜가 되면 빌드 없이 실린다(app/insight/blog/page.tsx 주석). 미래 글은 그때까지 404 다. */
export const revalidate = 3600;
import { CLINIC } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { allPosts, publishedIso } from '@/lib/blog';
import { allPostsMerged, postBySlugMerged, extractFaq } from '@/lib/insightFeed';
import { docByPath, docsOfHub } from '@/lib/content';
import { hubForCategory } from '@/lib/postHub';
import { ContactBand } from '@/components/ui';
import { PostArticle } from '@/components/PostArticle';
import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { desc80, breadcrumbSchema, abs, og, medicalWebPageSchema, alt } from '@/lib/seo';

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
    description: desc80(post.summary),
    alternates: alt(path),
    openGraph: og({
      title: `${post.title} | ${CLINIC.name}`,
      description: desc80(post.summary),
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

  /* 사이드바 — 이 글의 분류와 이어지는 진료 갈래(허브 + 하위 문서 넷), 다른 글 넷 */
  const hubPath = hubForCategory(post.category);
  const hub = hubPath ? docByPath(hubPath) : undefined;
  const hubLinks = hub ? [{ label: `${hub.title} 안내`, href: hub.path }, ...docsOfHub(hub.path).slice(0, 4).map((d) => ({ label: d.title, href: d.path }))] : [];
  const others = (await allPostsMerged())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4)
    .map((p) => ({ label: p.title, href: `/insight/blog/${p.slug}`, meta: p.date.replace(/-/g, '. ') }));

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
      {/* 본문 화면은 components/PostArticle — 임상 글(/insight/clinical)과 같은 틀 */}
      <PostArticle post={post} trail={trail.slice(1)} back={{ href: '/insight/blog', label: '블로그 목록' }} hubLinks={hubLinks} others={others} />
      <ContactBand />
    </>
  );
}
