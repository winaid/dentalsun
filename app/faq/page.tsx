import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
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
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/faq' }), faqSchema(ALL_FAQ, '/faq')]} />
      <main id="main">
        <HeroCollage
          trail={trail}
          eyebrow="FREQUENTLY ASKED QUESTIONS"
          lines={['광화문 선치과에', <><span className="accent-sun">자주 묻는 질문</span></>]}
          lead="진료시간과 예약, 오시는 길, 임플란트·턱관절 치료, 건강보험 적용, 마취와 수면치료까지 환자분들이 가장 많이 물어보시는 내용을 모았습니다."
          bg="ai/wide-visit"
          cards={[
            { fig: { key: 'place/place09', alt: '광화문선치과 대기실' }, shape: 'portrait' },
            { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'wide' },
            { fig: { key: 'place/place02', alt: '광화문선치과 개별 진료실' }, shape: 'std' },
          ]}
          items={[
            { title: '진료시간 · 예약', desc: '월~금 10:00~19:00, 화·목요일은 밤 9시까지 야간진료, 토요일은 격주 10:00~14:00' },
            { title: '위치 · 주차', desc: '광화문역 6번 출구 도보 2분, 코리아나 호텔 야외주차장 무료 이용' },
            { title: '비용 · 건강보험', desc: '만 65세 이상 보험 임플란트(평생 2개)와 보험틀니는 본인 부담금 30%' },
          ]}
        />
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
