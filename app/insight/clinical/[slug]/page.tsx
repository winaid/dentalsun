import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CLINIC } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { allClinicalPosts, clinicalBySlug, publishedIso } from '@/lib/blog';
import { docByPath, docsOfHub } from '@/lib/content';
import { hubForCategory } from '@/lib/postHub';
import { ContactBand } from '@/components/ui';
import { PostArticle } from '@/components/PostArticle';
import { JsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { desc80, breadcrumbSchema, abs, og, medicalWebPageSchema, alt } from '@/lib/seo';

/**
 * 임상 사례 · 핵심 안내 한 편 — 네이버 블로그에서 가져온 글(content/clinical, scripts/import-naver.mjs).
 * 화면은 블로그 글과 같은 PostArticle. 다른 점: 임상 사례에는 개인차 고지 한 줄, 아래에 네이버 원문 링크.
 */
export const revalidate = 3600;

const CLINICAL_NOTE = '본 사례는 광화문선치과에서 진료받은 환자의 치료 과정이며, 개인의 구강 상태와 시술 종류에 따라 결과는 다를 수 있습니다.';

export function generateStaticParams() {
  return allClinicalPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = clinicalBySlug(slug);
  if (!post) return {};
  const path = `/insight/clinical/${post.slug}`;
  return {
    title: post.title,
    description: desc80(post.summary),
    alternates: alt(path),
    openGraph: og({
      title: `${post.title} | ${CLINIC.name}`,
      description: desc80(post.summary),
      path,
      ...(post.image ? { images: [{ url: post.image, alt: post.imageAlt ?? post.title }] } : {}),
    }),
  };
}

export default async function ClinicalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = clinicalBySlug(slug);
  if (!post) notFound();

  const hubPath = hubForCategory(post.category);
  const hub = hubPath ? docByPath(hubPath) : undefined;
  const hubLinks = hub ? [{ label: `${hub.title} 안내`, href: hub.path }, ...docsOfHub(hub.path).slice(0, 4).map((d) => ({ label: d.title, href: d.path }))] : [];
  /* 다른 글 — 같은 묶음(임상 사례끼리, 핵심 안내끼리) 먼저 */
  const others = allClinicalPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.kind === post.kind ? -1 : 0) - (b.kind === post.kind ? -1 : 0))
    .slice(0, 4)
    .map((p) => ({ label: p.title, href: `/insight/clinical/${p.slug}`, meta: p.date.replace(/-/g, '. ') }));

  const path = `/insight/clinical/${post.slug}`;
  const trail = [
    { name: '인사이트', path: '/insight' },
    { name: post.kind === 'notice' ? '핵심 안내' : '임상 사례', path: post.kind === 'notice' ? '/insight/clinical#notice' : '/insight/clinical' },
    { name: post.title, path },
  ];
  const author = DOCTORS[0];

  return (
    <>
      <SiteHeader />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: '홈', path: '/' }, ...trail]),
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
            isPartOf: { '@id': `${CLINIC.url}/insight/clinical#blog` },
            publisher: { '@id': `${CLINIC.url}/#clinic` },
            author: { '@id': `${CLINIC.url}/about/doctors#${author.slug}` },
            ...(post.category ? { articleSection: post.category } : {}),
            ...(post.image ? { image: abs(post.image) } : {}),
          },
        ]}
      />
      <PostArticle
        post={post}
        trail={trail}
        back={{ href: post.kind === 'notice' ? '/insight/clinical#notice' : '/insight/clinical', label: post.kind === 'notice' ? '핵심 안내 목록' : '임상 사례 목록' }}
        hubLinks={hubLinks}
        others={others}
        note={post.kind === 'clinical' ? CLINICAL_NOTE : undefined}
        sourceUrl={post.sourceUrl}
        showCover={false}
      />
      <ContactBand />
    </>
  );
}
