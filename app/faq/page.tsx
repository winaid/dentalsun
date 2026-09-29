import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, FaqList, MedicalNotice , Sentences } from '@/components/ui';
import { SITE_FAQ, ALL_FAQ } from '@/lib/faq';
import { desc80, alt, breadcrumbSchema, faqSchema, medicalWebPageSchema, og } from '@/lib/seo';

const TITLE = '자주 묻는 질문';
const DESC = '광화문 선치과에 자주 묻는 질문 — 진료시간·야간진료·주차, 내비게이션·풀아치 임플란트, 턱관절 소리와 개구장애, 만 65세 보험 임플란트와 틀니, 무통마취를 문답으로 정리했습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: desc80(DESC),
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
          long
          cardsLead="내원 전에 먼저 확인하실 내용입니다."
          lines={['광화문 선치과에', <><span className="accent-sun">자주 묻는 질문</span></>]}
          lead="진료시간과 예약, 위치와 주차, 임플란트와 턱관절, 건강보험과 마취까지 진료실에서 자주 받는 질문에 답했습니다. 여기에 없는 내용은 전화로 문의해 주세요."
          bg="ai/wide-visit"
          cards={[
            { fig: { key: 'place2/waiting', alt: '창가에 가죽 벤치가 놓인 대기실' }, shape: 'portrait' },
            { fig: { key: 'orig/misc-consult-desk', alt: '책상에서 의사가 환자에게 서류를 설명하는 모습' }, shape: 'wide' },
            { fig: { key: 'place2/reception', alt: '곡선형 나무 접수대와 광화문 선치과 간판' }, shape: 'std' },
          ]}
          items={[
            { title: '진료시간 · 예약', desc: '월~금 10:00~19:00, 화·목요일은 오후 9시까지 야간진료, 토요일은 2·4째주 10:00~14:00' },
            { title: '위치 · 주차', desc: '광화문역 6번 출구 도보 2분, 코리아나 호텔 야외주차장 무료 이용' },
            { title: '비용 · 건강보험', desc: '만 65세 이상 보험 임플란트는 평생 2개까지, 보험틀니와 함께 본인 부담금 30%' },
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
        <ContactBand title="여기에 없는 질문은 전화로 문의해 주세요" />
        <MedicalNotice />
      </main>
    </>
  );
}
