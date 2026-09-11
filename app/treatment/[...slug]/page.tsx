import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocPage } from '@/components/DocPage';
import { TmjPage } from '@/components/TmjPage';
import { ALL_DOCS, docByPath } from '@/lib/content';
import { desc80, alt, og, withLocality } from '@/lib/seo';
import { figSize, figSrc } from '@/lib/docs';

/**
 * 진료 문서 — /treatment/<허브>[/<세부>] 전부 여기서 나온다. 목록은 lib/content 의 ALL_DOCS.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_DOCS.filter((d) => d.path.startsWith('/treatment/')).map((d) => ({ slug: d.path.replace('/treatment/', '').split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = `/treatment/${slug.join('/')}`;
  const doc = docByPath(path);
  if (!doc) return {};
  const description = desc80(withLocality(doc.description));
  const hero = doc.hero ? figSize(doc.hero.key) : null;
  return {
    title: doc.title,
    description,
    keywords: doc.keywords,
    alternates: alt(path),
    openGraph: og({
      title: doc.title,
      description,
      path,
      images: doc.hero && hero ? [{ url: figSrc(doc.hero.key), width: hero.w, height: hero.h, alt: doc.hero.alt }] : undefined,
    }),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const doc = docByPath(`/treatment/${slug.join('/')}`);
  if (!doc) notFound();
  /* 턱관절 허브는 레퍼런스(tmjdoctor) 짜임새의 전용 화면 — 데이터·FAQ·스키마는 같은 Doc 을 쓴다 */
  if (doc.path === '/treatment/tmj') return <TmjPage doc={doc} />;
  return <DocPage doc={doc} />;
}
