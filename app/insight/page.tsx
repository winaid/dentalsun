import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocPage } from '@/components/DocPage';
import { docByPath } from '@/lib/content';
import { desc80, alt, og } from '@/lib/seo';
import { figSrc } from '@/lib/docs';

const doc = docByPath('/insight');
export const metadata: Metadata = doc
  ? { title: doc.title, description: desc80(doc.description), keywords: doc.keywords, alternates: alt('/insight'), openGraph: og({ title: doc.title, description: doc.description, path: '/insight', images: [{ url: figSrc('ai/insight-hub'), width: 1200, height: 800, alt: doc.title }] }) }
  : {};

export default function InsightHub() {
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
