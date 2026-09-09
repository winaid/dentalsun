import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, Figure, MedicalNotice , Sentences } from '@/components/ui';
import type { Fig } from '@/lib/docs';
import { alt, articleSchema, breadcrumbSchema, medicalWebPageSchema, og } from '@/lib/seo';

const TITLE = '디지털치과 장비소개';
const DESC = '광화문 선치과 디지털 장비 — 3D 구강스캐너, 3D CT, 컴퓨터 모의수술 분석, 수술 가이드, 당일 디지털 보철(캐드캠·3D 프린터), INOS 실시간 소독, 무통마취기, 에어플로우, PHL-15 레이저.';

export const metadata: Metadata = { title: TITLE, description: DESC, alternates: alt('/about/equipment'), openGraph: og({ title: TITLE, description: DESC, path: '/about/equipment', images: [{ url: '/img/equip/scanner.webp', width: 1400, height: 421, alt: '3D 구강스캐너' }] }) };

/** 기존 홈페이지 '디지털치과 장비소개' Point 01~06 + 각 진료 페이지의 장비 배너 원문 */
const ITEMS: Array<{ n: string; title: string; desc: string; more?: string[]; fig: Fig; ratio?: string }> = [
  { n: 'Point 01', title: '디지털 진단장비, 3D 구강스캐너', desc: '기존의 본뜨는 작업을 3D 구강스캐너가 대체하여 불편했던 치과 치료를 편하게.', fig: { key: 'orig/intro-hero', alt: '원장이 모니터의 3D 구강 스캔 화면을 보며 구강스캐너로 환자를 스캔하는 모습' }, ratio: 'aspect-[16/9]' },
  { n: 'Point 02', title: '디지털 진단장비, 3D CT', desc: '3D 촬영으로 보다 정확하고 안전한 진단.', more: ['여러가지 영상을 제공하는 올인원 시스템', '파노라마와 CT를 함께 촬영 가능', '짧은 촬영시간과 적은 방사선 노출량으로 안전한 CT'], fig: { key: 'place/place08', alt: '광화문선치과 3D CT 촬영실' } },
  { n: 'Point 03', title: '오차를 줄인 디지털 분석 시스템', desc: '임플란트 수술 시 컴퓨터가 모의수술을 통해 미리 결과를 예측할 수 있어 오차를 최소화할 수 있습니다.', fig: { key: 'orig/implant-nav-plan', alt: 'CT 위에 임플란트 식립 경로를 잡는 계획 소프트웨어 화면' } },
  { n: 'Point 04', title: '안전한 디지털 수술 가이드 시스템', desc: '임플란트 수술 시 수술유도장치(가이드)를 이용하여 출혈 및 붓기를 최소화합니다.', fig: { key: 'equip/guide', alt: '개인 맞춤형 수술 유도장치 모형' } },
  { n: 'Point 05', title: '당일 디지털 보철 제작 시스템', desc: '캐드캠 디지털 시스템을 구축하여 수술 당일 임시 보철 장착까지 진행되어 빠르게 일상생활에 복귀 가능.', fig: { key: 'equip/printer', alt: '3D 프린터와 보철 디자인 CAD 화면' } },
  { n: 'Point 06', title: '교차감염 방지, 디지털 실시간 소독 시스템', desc: '진료기구를 통해 발생하는 교차감염의 위험성을 최소화하기 위해 INOS 소독기를 사용하여 실시간으로 소독합니다.', more: ['최대 99.999% 소독력 — KTR(한국화학융합시험연구원) 테스트 완료'], fig: { key: 'orig/intro-p06-inos-group', alt: 'INOS 실시간 소독기 세 종류' } },
  { n: '무통마취', title: '무통마취기 NO-PAIN III', desc: '컴퓨터 자동 시스템이 일정한 속도와 압력으로 마취액을 주입하여 통증을 줄인 마취를 진행합니다.', fig: { key: 'scene/nopain', alt: '무통마취기 NO-PAIN III 를 이용한 마취 장면' } },
  { n: '저자극', title: '에어플로우 스케일러 (EMS)', desc: '공기와 물의 압력을 이용해 파우더를 분사해 통증은 줄이고 효과는 높인 스케일러 장비. 10단계 강도조절·온도조절 기능.', fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 스케일러' } },
  { n: '턱관절', title: '턱관절 물리치료 장비, PHL-15 레이저', desc: '저출력 레이저 및 저주파 전기치료기를 이용하여 턱관절 근육 통증 완화. 원적외선보다 5배 높은 피부 침투력, 증상에 따른 여러 가지 치료 모드, 건강보험 적용.', fig: { key: 'orig/tmj-tx-laser', alt: 'PHL-15 레이저 물리치료 장비' } },
  { n: '신경치료', title: '엔도소닉 초음파 세척기', desc: '신경치료 시 남아 있는 신경과 염증을 미세 초음파로 깨끗하게 제거·소독하여 성공률을 높여 줍니다.', fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' } },
];

export default function EquipmentPage() {
  const trail = [
    { name: '치과소개', path: '/about' },
    { name: TITLE, path: '/about/equipment' },
  ];
  return (
    <>
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/about/equipment' }), articleSchema({ path: '/about/equipment', title: TITLE, description: DESC, keywords: ['디지털치과', '3D 구강스캐너', '3D CT', '수술 가이드', '캐드캠', 'INOS 소독기', '무통마취기', '에어플로우'] })]} />
      <main id="main">
        <HeroCollage
          trail={trail}
          eyebrow="DIGITAL EQUIPMENT"
          lines={['첨단 디지털 장비로 진료하는', <><span className="accent-sun">3D 디지털치과</span></>]}
          long
          lead="진단부터 치료까지 치과 진료에 디지털을 더해 보다 빠르고 정확한 진료를 약속 드립니다. 아래는 광화문선치과가 실제로 갖추고 있는 장비와 시스템입니다."
          bg="place/place08"
          cards={[
            { fig: { key: 'equip/ct', alt: '3D CT 장비' }, shape: 'portrait' },
            { fig: { key: 'orig/intro-p05-group', alt: '당일 보철 제작 장비 일체 (3D 프린터·CAD 모니터·후처리기)' }, shape: 'wide' },
            { fig: { key: 'orig/intro-p06-inos-tower', alt: '파란 UV 불이 켜진 INOS 소독 타워 두 대' }, shape: 'std' },
          ]}
          items={ITEMS.slice(0, 3).map((it) => ({ title: it.title, desc: it.desc }))}
        />
        {ITEMS.map((it, i) => (
          <section key={it.title} className={`section ${i % 2 ? 'bg-canvas' : ''}`}>
            <div className="wrap grid items-center gap-10 lg:grid-cols-2">
              <div className={`reveal ${i % 2 ? 'lg:order-2' : ''}`}>
                <span className="pill-sun">{it.n}</span>
                <h2 className="display-sm mt-4">{it.title}</h2>
                <p className="lead mt-4">{it.desc}</p>
                {it.more && (
                  <ul className="mt-5 space-y-2">
                    {it.more.map((m) => (
                      <li key={m} className="flex items-start gap-2.5 text-[15px] text-ink">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={i % 2 ? 'lg:order-1' : ''}>
                <Figure fig={it.fig} ratio={it.ratio ?? 'aspect-[4/3]'} />
              </div>
            </div>
          </section>
        ))}
        <ContactBand />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}
