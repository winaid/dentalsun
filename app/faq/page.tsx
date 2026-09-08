import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, FaqList, MedicalNotice , Sentences } from '@/components/ui';
import { SITE_FAQ, ALL_FAQ } from '@/lib/faq';
import { alt, breadcrumbSchema, faqSchema, medicalWebPageSchema, og } from '@/lib/seo';

const TITLE = '자주 묻는 질문';
const DESC = '광화문 선치과에 자주 묻는 질문 — 진료시간·야간진료·주차·임플란트·턱관절·건강보험 임플란트와 틀니·무통마취·수면치료를 문답으로 정리했습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: alt('/faq'),
  openGraph: og({ title: TITLE, description: DESC, path: '/faq' }),
};

export default function FaqPage() {
  const trail = [{ name: TITLE, path: '/faq' }];
  return (
    <>
      <SiteHeader />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/faq' }), faqSchema(ALL_FAQ, '/faq')]} />
      <main id="main" className="pt-[72px] md:pt-[88px]">
        <section className="section bg-canvas">
          <div className="wrap">
            <Breadcrumb trail={trail} />
            <p className="eyebrow mt-6">FREQUENTLY ASKED QUESTIONS</p>
            <h1 className="display mt-4">
              광화문 선치과에 <span className="accent">자주 묻는 질문</span>
            </h1>
            <p className="lead mt-5 max-w-[720px]"><Sentences text="진료시간과 예약, 오시는 길, 임플란트·턱관절 치료, 건강보험 적용, 마취와 수면치료까지 환자분들이 가장 많이 물어보시는 내용을 모았습니다." /></p>
          </div>
        </section>
        {SITE_FAQ.map((g, i) => (
          <section key={g.id} id={g.id} className={`section ${i % 2 ? 'bg-canvas' : ''}`}>
            <div className="wrap grid gap-8 lg:grid-cols-[1fr_2fr]">
              <div className="reveal">
                <p className="eyebrow">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="display-sm mt-3">{g.title}</h2>
              </div>
              <div className="reveal">
                <FaqList items={g.items} id={`${g.id}-list`} />
              </div>
            </div>
          </section>
        ))}
        <ContactBand title="여기에 없는 질문은 톡톡이나 전화로 물어보세요" />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}
