import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { JsonLd } from '@/components/JsonLd';
import Image from 'next/image';
import { Breadcrumb, ContactBand, MedicalNotice, Sentences } from '@/components/ui';
import { figSrc } from '@/lib/docs';

const HUB_IMG: Record<string, string> = {
  '/treatment/implant': 'ai/implant-hub',
  '/treatment/tmj': 'ai/tmj-hub',
  '/treatment/aesthetic': 'ai/aesthetic-hub',
  '/treatment/insurance': 'ai/insurance-hub',
  '/treatment/wisdom-tooth': 'ai/wisdom',
  '/treatment/natural-tooth': 'ai/natural-hub',
  '/treatment/painless': 'ai/painless-hub',
};
import { ALL_DOCS, docsOfHub } from '@/lib/content';
import { TREATMENT_HUBS } from '@/lib/nav';
import { alt, breadcrumbSchema, itemListSchema, medicalWebPageSchema, og } from '@/lib/seo';

const TITLE = '진료 안내';
const DESC = '광화문 선치과 진료 안내 — 디지털 임플란트, 턱관절 치료, 심미치료, 보험 틀니와 임플란트, 매복사랑니, MTA 신경치료로 자연치아 살리기, 무통·저자극 시스템.';

export const metadata: Metadata = { title: TITLE, description: DESC, alternates: alt('/treatment'), openGraph: og({ title: TITLE, description: DESC, path: '/treatment' }) };

export default function TreatmentIndex() {
  const trail = [{ name: TITLE, path: '/treatment' }];
  const hubs = TREATMENT_HUBS.map((h) => ({ nav: h, doc: ALL_DOCS.find((d) => d.path === h.href), children: docsOfHub(h.href) }));
  return (
    <>
      <SiteHeader />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/treatment' }), itemListSchema('/treatment', hubs.map((h) => ({ name: h.nav.label, path: h.nav.href })), '광화문 선치과 진료 갈래')]} />
      <main id="main" className="pt-[72px] md:pt-[88px]">
        <section className="section bg-canvas">
          <div className="wrap">
            <Breadcrumb trail={trail} />
            <p className="eyebrow mt-6">TREATMENTS</p>
            <h1 className="display mt-4">
              광화문 선치과 <span className="accent">진료 안내</span>
            </h1>
            <p className="lead mt-5 max-w-[720px]"><Sentences text="일곱 진료 갈래를 세부 항목까지 각각의 문서로 정리했습니다. 궁금한 진료를 고르면 무엇을 어떻게 하는지, 어떤 경우에 필요한지, 자주 묻는 질문까지 볼 수 있습니다." /></p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <ol className="reveal-stack grid-cards md:grid-cols-2 xl:grid-cols-3">
              {hubs.map((h, i) => (
                <li key={h.nav.href} className="card card-hover flex h-full flex-col overflow-hidden">
                  <span className="card-img block">
                    <Image src={figSrc(HUB_IMG[h.nav.href] ?? 'ai/faq')} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </span>
                  <div className="flex flex-1 flex-col p-7">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <Link href={h.nav.href} className="mt-3 block text-[1.35rem] font-extrabold text-ink hover:text-brand-700">{h.nav.label}</Link>
                  {h.doc && <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft"><Sentences text={h.doc.summary.split(/(?<=다.)s/)[0]} /></p>}
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {h.children.map((c) => (
                      <li key={c.path}>
                        <Link href={c.path} className="pill hover:border-brand-300 hover:text-brand-700">{c.title}</Link>
                      </li>
                    ))}
                    {h.children.length === 0 &&
                      h.nav.children
                        ?.filter((c) => c.href.includes('#'))
                        .map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="pill hover:border-brand-300 hover:text-brand-700">{c.label}</Link>
                          </li>
                        ))}
                  </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <ContactBand />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}
