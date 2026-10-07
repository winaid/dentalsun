import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, CertMark, ContactBand, Figure , Sentences } from '@/components/ui';
import { DOCTORS, isCertCareer } from '@/lib/doctors';
import { desc80, alt, breadcrumbSchema, medicalWebPageSchema, og, physicianSchema } from '@/lib/seo';

const TITLE = '의료진 소개';
const DESC = '광화문 선치과 의료진 — 양대일 대표원장(보건복지부 인증 통합치의학과 전문의, 강남성심병원 치과 외래교수). 약력과 진료 철학을 소개합니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: desc80(DESC),
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
        <HeroCollage
          trail={trail}
          eyebrow="OUR DOCTORS"
          /* 2026-10-06 원장 PPT 52쪽 — 카드 머리 '보철 → 치료', 소개 문단·카드 02 설명 끝은 병원 문구 그대로. 하이라이트는 PPT 에서 원장이 굵게 한 둘째 문장(10-07 재대조) */
          cardsLead="진단부터 치료, 정기검진까지 한 원장이 맡습니다."
          lines={[<>통합치의학과 <span className="accent-sun">전문의</span>가</>, '처음부터 끝까지 직접 진료합니다']}
          long
          lead="양대일 대표원장은 강남성심병원에서 레지던트 수련을 마친 보건복지부 인증 통합치의학과 전문의로, 현재 강남성심병원 치과 외래교수로 활동하고 있습니다. {임플란트, 턱관절, 자연치아 보존치료 등 폭넓은 임상 경험을 바탕으로 정확한 진단과 환자에게 필요한 치료에 집중합니다}."
          bg="ai/wide-clinic"
          cards={[
            /* ★ 2026-09-29 원장 피드백 10번: orig/intro-monitor-pair 는 퇴사한 페이닥터가 함께 나와 뺐다 — 다시 쓰지 말 것 */
            { fig: { key: 'orig/doctor-yang', alt: '양대일 대표원장' }, shape: 'portrait' },
            { fig: { key: 'place2/doctor-scan', alt: '구강스캐너로 스캔하며 모니터의 3D 치열 모형을 확인하는 양대일 대표원장' }, shape: 'wide' },
            { fig: { key: 'scene/loupe', alt: '확대경을 착용하고 진료하는 양대일 대표원장' }, shape: 'std' },
          ]}
          items={[
            { title: `${DOCTORS[0].name} ${DOCTORS[0].role}`, desc: DOCTORS[0].career[0] },
            { title: '강남성심병원 치과 외래교수', desc: '강남성심병원 통합치의학과 레지던트 수련 · 서울대학교 치의학 대학원 고급치의학 과정 수료' },
            { title: '임플란트 · 심미 · 턱관절 학회 정회원', desc: 'AAID(미국 임플란트 학회) · AACD(미국 심미치과 학회) · 대한 구강악안면 임플란트 학회 · 대한 턱관절교합학회' },
          ]}
        />

        {/* 기존 홈페이지 배치 그대로(오너 지시): 왼쪽 큰 사진, 오른쪽 위 전문의·이름, 약력 카드가 사진 오른쪽 가장자리에 걸친다. 뒤에는 옅은 SUN 워터마크. */}
        {DOCTORS.map((d, i) => (
          <section key={d.slug} id={d.slug} className="section relative isolate overflow-hidden scroll-mt-24">
            <span aria-hidden className="pointer-events-none absolute right-[3%] top-6 -z-10 select-none text-right font-extrabold leading-none tracking-[-0.05em] text-brand-900/[0.05]">
              <span className="block text-[160px] md:text-[220px]">SUN</span>
              <span className="-mt-3 block pr-2 text-[28px] tracking-[0.02em] md:text-[40px]">Dental clinic</span>
            </span>
            <div className="wrap grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-0">
              <div className="reveal">
                <div className="wipe relative aspect-[4/5] overflow-hidden rounded-3xl bg-canvas-2 lg:aspect-[5/6]">
                  <Image src={d.photo} alt={`${d.name} ${d.role}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-top" priority={i === 0} />
                </div>
              </div>
              <div className="reveal relative z-10 lg:pt-[12%] lg:pl-2">
                <p className="text-[1.1rem] font-semibold text-brand-600 md:text-[1.2rem]">{d.specialty}</p>
                <h2 className="display-sm mt-2">
                  {d.name} <span className="font-bold">{d.role}</span>
                </h2>
                <div className="mt-8 rounded-2xl border border-hairline bg-white p-7 shadow-[var(--shadow-lift)] md:p-9 lg:-ml-[22%]">
                  <h3 className="text-[1.15rem] font-bold text-ink">주요 약력</h3>
                  <ul className="mt-5 space-y-2.5">
                    {d.career.map((c) => (
                      <li key={c} className="flex items-start gap-3 text-[16px] leading-[1.6] text-ink">
                        {isCertCareer(c) ? (
                          <CertMark className="-ml-[5px] mt-[1px] h-6 w-6 text-brand-600" />
                        ) : (
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                        )}
                        {isCertCareer(c) ? <strong className="font-bold">{c}</strong> : c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="section">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            {/* ★ 옛 사진(orig/intro-monitor-pair)은 퇴사한 페이닥터가 함께 나와 뺐다(2026-09-29 원장 피드백 10번) */}
            <Figure fig={{ key: 'sun/consult-monitor', alt: '모니터에 치아 차트를 띄워 놓고 환자에게 설명하는 양대일 대표원장' }} ratio="aspect-[3/2]" />
            <div className="reveal">
              <p className="eyebrow">PHILOSOPHY</p>
              <h2 className="display-sm mt-4">
                살릴 수 있는 치아인지
                <br />
                <span className="accent">먼저 확인합니다</span>
              </h2>
              <p className="lead mt-4"><Sentences text="발치와 임플란트를 이야기하기 전에 신경치료나 잇몸치료로 살릴 수 있는지부터 확인합니다. 엑스레이와 입안 사진을 함께 보며 지금 상태와 치료 순서를 설명하고, {지금 필요한 치료만} 권해 드립니다." /></p>
            </div>
          </div>
        </section>
        <ContactBand />
      </main>
    </>
  );
}
