import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import Image from 'next/image';
import { Breadcrumb, ContactBand, MedicalNotice, Sentences } from '@/components/ui';
import { figSrc, fitsBox } from '@/lib/docs';

const HUB_IMG: Record<string, string> = {
  '/treatment/implant': 'orig/implant-hero',
  '/treatment/tmj': 'fit/tmj-hero',
  '/treatment/aesthetic': 'ai/aesthetic-hub',
  '/treatment/insurance': 'ai/insurance-hub',
  '/treatment/wisdom-tooth': 'orig/wisdom-doctor',
  '/treatment/natural-tooth': 'orig/mta-hero',
  '/treatment/painless': 'fit/pain-hero',
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
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/treatment' }), itemListSchema('/treatment', hubs.map((h) => ({ name: h.nav.label, path: h.nav.href })), '광화문 선치과 진료 갈래')]} />
      <main id="main">
        <HeroCollage
          trail={trail}
          eyebrow="TREATMENTS"
          long
          cardsLead="진료 갈래를 한눈에 봅니다."
          lines={['광화문 선치과', <><span className="accent-sun">진료 안내</span></>]}
          lead="임플란트부터 턱관절, 자연치아 살리기, 무통 시스템까지 일곱 갈래로 나눴습니다. 무엇을 어떻게 하는지, 어떤 경우에 필요한지 미리 읽고 오시면 상담이 편해집니다."
          bg="ai/wide-implant"
          cards={[
            { fig: { key: 'orig/mta-hero', alt: '확대경을 쓰고 MTA 신경치료를 하는 원장' }, shape: 'portrait' },
            { fig: { key: 'orig/implant-hero', alt: '확대경을 쓴 의료진이 파노라마 모니터 앞에서 임플란트 수술을 하는 장면' }, shape: 'wide' },
            { fig: { key: 'orig/pain-nopain', alt: '컴퓨터 제어 무통마취기 NO PAIN III 장비' }, shape: 'std' },
          ]}
          items={[
            { title: '디지털 임플란트', desc: 'CT와 3D 구강스캔 데이터로 모의수술을 거치는 내비게이션·풀아치·UV·자가혈·맞춤 임플란트' },
            { title: '턱관절 · 자연치아 살리기', desc: '원인을 찾는 턱관절 치료와 MTA 신경치료·엔도소닉 초음파 세척으로 내 치아를 보존' },
            { title: '무통 & 저자극 시스템', desc: '무통마취기 NO-PAIN III, 도포·가글마취, 수면치료, 에어플로우 스케일링' },
          ]}
        />
        <section className="section">
          <div className="wrap">
            <ol className="reveal-stack grid-cards md:grid-cols-2 xl:grid-cols-4">
              {hubs.map((h, i) => (
                <li key={h.nav.href} className="card card-hover flex h-full flex-col overflow-hidden">
                  <span className="card-img block">
                    <Image src={figSrc(HUB_IMG[h.nav.href] ?? 'ai/faq')} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className={fitsBox(HUB_IMG[h.nav.href] ?? 'ai/faq', 3, 2) ? 'object-cover' : '!object-contain p-3'} />
                  </span>
                  <div className="flex flex-1 flex-col p-7">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <Link href={h.nav.href} className="mt-3 block text-[1.35rem] font-extrabold text-ink hover:text-brand-700">{h.nav.label}</Link>
                  {h.doc && <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft"><Sentences text={h.doc.summary.split(/(?<=다.)s/)[0]} /></p>}
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
              <li className="card card-hover flex h-full flex-col overflow-hidden">
                <span className="card-img block">
                  <Image src={figSrc('ai/insight-hub')} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                </span>
                <div className="flex flex-1 flex-col p-7">
                  <span className="num">08</span>
                  <Link href="/insight" className="mt-3 block text-[1.35rem] font-extrabold text-ink hover:text-brand-700">인사이트</Link>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft">증상별 안내 12편과 치료 가이드 6편.</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    <li><Link href="/insight#symptoms" className="pill hover:border-brand-300 hover:text-brand-700">증상별 안내</Link></li>
                    <li><Link href="/insight#guides" className="pill hover:border-brand-300 hover:text-brand-700">치료 가이드</Link></li>
                  </ul>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <ContactBand />
        <MedicalNotice />
      </main>
    </>
  );
}
