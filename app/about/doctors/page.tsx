import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { PageHero } from '@/components/PageHero';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, Figure , Sentences } from '@/components/ui';
import { DOCTORS } from '@/lib/doctors';
import { alt, breadcrumbSchema, medicalWebPageSchema, og, physicianSchema } from '@/lib/seo';

const TITLE = '의료진 소개';
const DESC = '광화문 선치과 의료진 — 양대일 대표원장(보건복지부 인증 통합치의학과 전문의, 강남성심병원 치과 외래교수)과 홍진기 대표원장(보건복지부 인증 치과보철과 전문의).';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: alt('/about/doctors'),
  openGraph: og({ title: TITLE, description: DESC, path: '/about/doctors', images: [{ url: DOCTORS[0].photo, width: 1200, height: 1259, alt: `${DOCTORS[0].name} ${DOCTORS[0].role}` }] }),
};

export default function DoctorsPage() {
  const trail = [
    { name: '치과소개', path: '/about' },
    { name: TITLE, path: '/about/doctors' },
  ];
  return (
    <>
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/about/doctors' }), ...DOCTORS.map(physicianSchema)]} />
      <main id="main">
        <PageHero trail={trail} eyebrow="OUR DOCTORS" bg="ai/wide-clinic" title={<>두 분의 <span className="accent">전문의</span>가
              <br />
              직접 진단하고 치료합니다</>} lead="보건복지부 인증 통합치의학과 전문의와 치과보철과 전문의. 아래 약력은 기존 홈페이지에 밝힌 내용 그대로입니다."></PageHero>

        {DOCTORS.map((d, i) => (
          <section key={d.slug} id={d.slug} className={`section scroll-mt-24 ${i % 2 ? 'bg-canvas' : ''}`}>
            <div className="wrap grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
              <div className={`reveal ${i % 2 ? 'lg:order-2' : ''}`}>
                <div className="wipe relative aspect-[4/5] overflow-hidden rounded-3xl bg-canvas-2">
                  <Image src={d.photo} alt={`${d.name} ${d.role}`} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top" priority={i === 0} />
                </div>
              </div>
              <div className={`reveal ${i % 2 ? 'lg:order-1' : ''}`}>
                <span className="pill-brand">보건복지부 인증 · {d.specialty}</span>
                <h2 className="display-sm mt-4">
                  {d.name} <span className="text-[1.1rem] font-semibold text-ink-muted">{d.role}</span>
                </h2>
                <p className="mt-3 text-[14px] text-ink-soft">진료 분야 — {d.focus.join(' · ')}</p>
                <h3 className="mt-8 text-[13px] font-bold tracking-wide text-ink-muted">주요 약력</h3>
                <ul className={`mt-3 grid gap-2 ${d.career.length % 2 === 0 ? "sm:grid-cols-2" : ""}`}>
                  {d.career.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 rounded-xl bg-white px-4 py-3 text-[14.5px] text-ink shadow-[var(--shadow-soft)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        <section className="section">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            <Figure fig={{ key: 'orig/intro-monitor-pair', alt: '모니터의 3D 구강 스캔 화면을 함께 보며 설명하는 모습' }} ratio="aspect-[2/1]" />
            <div className="reveal">
              <p className="eyebrow">PHILOSOPHY</p>
              <h2 className="display-sm mt-4">
                다년간의 임상경험으로 믿을 수 있는 진료,
                <br />
                <span className="accent">이해하기 쉬운 친절한 설명</span>
              </h2>
              <p className="lead mt-4"><Sentences text="내 치아만큼 좋은 것은 없기에 자연치아를 살릴 수 있는지 먼저 살피고, 환자분이 이해하실 수 있도록 검사 결과와 치료 방법을 설명해 드립니다." /></p>
            </div>
          </div>
        </section>
        <ContactBand />
      </main>
    </>
  );
}
