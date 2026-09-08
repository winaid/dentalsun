import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocPage } from '@/components/DocPage';
import { ALL_DOCS, docByPath } from '@/lib/content';
import { alt, og, withLocality } from '@/lib/seo';
import { figSize, figSrc } from '@/lib/docs';

/**
 * 진료 문서 — /treatment/<허브>[/<세부>] 전부 여기서 나온다. 목록은 lib/content 의 ALL_DOCS.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_DOCS.map((d) => ({ slug: d.path.replace('/treatment/', '').split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = `/treatment/${slug.join('/')}`;
  const doc = docByPath(path);
  if (!doc) return {};
  const description = withLocality(doc.description).slice(0, 155);
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
  return <DocPage doc={doc} />;
}
