import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, Figure } from '@/components/ui';
import { CLINIC, HYGIENE, STRENGTHS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { alt, breadcrumbSchema, medicalWebPageSchema, og, physicianSchema } from '@/lib/seo';

const TITLE = '치과소개';
const DESC = '광화문 선치과 소개 — 환자중심의 디지털 치과 진료. 강남성심병원 외래교수 출신 전문의, 3D 디지털 장비, 멸균 소독 시스템, 전원 치과위생사. 광화문역 6번 출구 도보 2분.';

export const metadata: Metadata = { title: TITLE, description: DESC, alternates: alt('/about'), openGraph: og({ title: TITLE, description: DESC, path: '/about', images: [{ url: '/img/scene/intro-1.webp', width: 769, height: 495, alt: '광화문선치과 진료 장면' }] }) };

/** 둘러보기 — 기존 홈페이지 '둘러보기' 사진 10장 그대로. 설명은 사진에 보이는 것만. */
const TOUR = [
  { key: 'place/place01', alt: '광화문선치과 진료실 복도', caption: '진료실 복도' },
  { key: 'place/place02', alt: '광화문선치과 개별 진료실', caption: '진료실' },
  { key: 'place/place03', alt: '광화문선치과 진료실과 간판', caption: '진료실' },
  { key: 'place/place04', alt: '광화문선치과 진료실 유닛체어', caption: '진료실' },
  { key: 'place/place05', alt: '수술실 표지', caption: '수술실' },
  { key: 'place/place06', alt: '광화문선치과 수술실 내부', caption: '수술실' },
  { key: 'place/place07', alt: '인증패·상장 진열장', caption: '인증패 진열장' },
  { key: 'place/place08', alt: '3D CT 촬영실', caption: '3D CT 촬영실' },
  { key: 'place/place09', alt: '광화문선치과 대기실', caption: '대기실' },
  { key: 'place/place10', alt: '대기실의 2019 대한민국 메디컬 헬스케어 치과부문 대상 현판', caption: '대기실' },
];

const POINTS = [
  { n: '01', title: '디지털 진단장비, 3D 구강스캐너', desc: '기존의 본뜨는 작업을 3D 구강스캐너가 대체하여 불편했던 치과 치료를 편하게' },
  { n: '02', title: '디지털 진단장비, 3D CT', desc: '3D 촬영으로 보다 정확하고 안전한 진단. 파노라마와 CT를 함께 촬영, 짧은 촬영시간과 적은 방사선 노출량' },
  { n: '03', title: '오차를 줄인 디지털 분석 시스템', desc: '임플란트 수술 시 컴퓨터 모의수술로 미리 결과를 예측해 오차를 최소화' },
  { n: '04', title: '안전한 디지털 수술 가이드 시스템', desc: '수술유도장치(가이드)를 이용하여 출혈 및 붓기를 최소화' },
  { n: '05', title: '당일 디지털 보철 제작 시스템', desc: '캐드캠 디지털 시스템으로 수술 당일 임시 보철 장착까지 진행' },
  { n: '06', title: '교차감염 방지, 디지털 실시간 소독 시스템', desc: 'INOS 소독기를 사용하여 진료기구를 실시간으로 소독 (KTR 소독력 테스트 완료)' },
];

export default function AboutPage() {
  const trail = [{ name: TITLE, path: '/about' }];
  return (
    <>
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/about' }), ...DOCTORS.map(physicianSchema)]} />
      <main id="main">
        <section className="relative isolate overflow-hidden bg-night text-white">
          <div className="absolute inset-0 -z-10">
            <Image src="/img/scene/intro-1.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30" />
          </div>
          <div className="wrap pt-[120px] pb-16 md:pt-[160px] md:pb-24">
            <Breadcrumb trail={trail} dark />
            <p className="eyebrow on-dark mt-6 hero-in">ABOUT SUN DENTAL CLINIC</p>
            <h1 className="display mt-4 max-w-[720px] !text-white hero-in hero-in-2">
              환자중심의
              <br />
              <span className="accent-sun">디지털 치과 진료</span>
            </h1>
            <p className="mt-6 max-w-[600px] text-[1.05rem] leading-[1.8] text-white/80 hero-in hero-in-3">이해하기 쉬운 설명과 불편함을 줄인 진료시스템. 더 빠르고, 정확하게, 그리고 편안하게 — 스마트한 진료를 약속 드립니다.</p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">OUR PROMISE</p>
              <h2 className="display-sm mt-4">
                치과치료, <span className="accent">광화문선치과</span>는 다릅니다
              </h2>
            </div>
            <ul className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STRENGTHS.map((s, i) => (
                <li key={s.title} className="card p-6">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-4 text-[1.05rem] font-bold text-ink">{s.title}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{s.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section bg-canvas" id="doctors">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            <div className="reveal">
              <p className="eyebrow">DOCTORS</p>
              <h2 className="display-sm mt-4">
                강남성심병원 외래교수 출신
                <br />
                <span className="accent">전문의 진료</span>
              </h2>
              <p className="lead mt-4">“다년간의 임상경험으로 믿을 수 있는 진료! 환자분이 이해하기 쉬운 친절한 설명”</p>
              <ul className="mt-6 space-y-3">
                {DOCTORS.map((d) => (
                  <li key={d.slug} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                    <Image src={d.photo} alt={d.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover object-top" />
                    <div>
                      <p className="font-bold text-ink">
                        {d.name} {d.role}
                      </p>
                      <p className="text-[13.5px] text-ink-soft">{d.specialty} · {d.career[0]}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/about/doctors" className="btn-brand mt-8">의료진 소개 자세히</Link>
            </div>
            <Figure fig={{ key: 'scene/loupe', alt: '확대경을 착용하고 진료하는 광화문선치과 원장' }} />
          </div>
        </section>

        <section className="section" id="digital">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">3D DIGITAL</p>
              <h2 className="display-sm mt-4">
                첨단 디지털 장비로 진료하는 <span className="accent">3D 디지털치과</span>
              </h2>
              <p className="lead mt-4">진단부터 치료까지 치과 진료에 디지털을 더해 보다 빠르고 정확한 진료를 약속 드립니다.</p>
            </div>
            <ol className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POINTS.map((p) => (
                <li key={p.n} className="card p-6">
                  <span className="pill-sun">Point {p.n}</span>
                  <p className="mt-3 text-[1.05rem] font-bold text-ink">{p.title}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{p.desc}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 text-center">
              <Link href="/about/equipment" className="btn-ghost">장비 하나하나 자세히 보기</Link>
            </div>
          </div>
        </section>

        <section className="section bg-canvas" id="hygiene">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            <div className="reveal grid grid-cols-2 gap-4">
              <Figure fig={{ key: 'scene/sterile', alt: '멸균 소독한 진료 기구' }} sizes="25vw" />
              <Figure fig={{ key: 'scene/sterile2', alt: '개별 포장된 1인 1기구' }} sizes="25vw" />
            </div>
            <div className="reveal">
              <p className="eyebrow">STERILIZATION</p>
              <h2 className="display-sm mt-4">
                철저한 위생관리 <span className="accent">멸균 소독 시스템</span>
              </h2>
              <p className="lead mt-4">교차감염을 차단하여 환자의 안전을 최우선으로 생각합니다.</p>
              <ul className="mt-6 space-y-2.5">
                {HYGIENE.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[15px] text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-2xl bg-white p-5 text-[14.5px] leading-relaxed text-ink-soft">
                <span className="font-bold text-ink">전원 치과위생사</span> — 치과위생사 면허를 보유한 전문 진료스텝이 편안하고 안전한 진료를 도와드립니다. 환자분의 진료 만족도를 높여 드립니다.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="tour">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">CLINIC TOUR</p>
              <h2 className="display-sm mt-4">
                광화문선치과 <span className="accent">둘러보기</span>
              </h2>
              <p className="lead mt-4">{CLINIC.address.full} · {CLINIC.address.landmark}</p>
            </div>
            <div className="reveal-stack mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {TOUR.map((f, i) => (
                <Figure key={f.key} fig={f} sizes="(max-width: 768px) 50vw, 25vw" className={i === 0 ? 'col-span-2 row-span-2' : ''} />
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
    </>
  );
}
