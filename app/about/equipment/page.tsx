import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { ContactBand, MedicalNotice, Sentences } from '@/components/ui';
import { EquipShowcase, type EquipItem } from '@/components/EquipShowcase';
import { desc80, alt, articleSchema, breadcrumbSchema, medicalWebPageSchema, og } from '@/lib/seo';

const TITLE = '디지털치과 장비소개';
const DESC = '광화문 선치과 디지털 장비 — 3D 구강스캐너, 3D CT(CBCT), 모의 식립 소프트웨어, 수술 가이드, 캐드캠 원내 보철 제작(3D 프린터), INOS 실시간 소독, 무통마취기, 에어플로우, PHL-15 레이저.';

export const metadata: Metadata = { title: TITLE, description: desc80(DESC), alternates: alt('/about/equipment'), openGraph: og({ title: TITLE, description: DESC, path: '/about/equipment', images: [{ url: '/img/equip/scanner.webp', width: 1400, height: 421, alt: '3D 구강스캐너' }] }) };

/**
 * 기존 홈페이지 '디지털치과 장비소개' Point 01~06 + 각 진료 페이지의 장비 배너 원문.
 * 2026-09-10 오너 요청으로 열 개의 긴 2열 구역을 진료과목처럼 펼침 띠 두 묶음으로 바꿨다.
 * shot 값은 사진 성격 — 진료 장면은 꽉 채우고, 배경 있는 제품 사진은 통째로 놓는다(잘림 방지).
 *
 * 2026-09-29 원장 피드백 — 수식어('안전한·정확한·오차를 최소화')를 걷고, 무엇을 재고 무엇에 쓰는지로 다시 썼다.
 * ⚠️ Point 05 는 원래 '당일 디지털 보철 제작 시스템(수술 당일 임시 보철 → 빠른 일상 복귀)'이었다.
 *    '캐드캠 원내 보철 제작'으로 중립화 — 속도 약속을 넣지 말 것(당일 임시치아는 PPT 48쪽 조건부 문구가 있는 임플란트 쪽에서만).
 * ★ 2026-10-07 쉬운 말로(하치조신경관→신경, 모의 식립→모의 수술, 저작근→턱 근육, 근관→신경관). 이 표는 EquipShowcase 가 그대로 그려 하이라이트 표시는 넣지 않는다.
 * ⚠️ 장비 수치(99.999%·KTR·10단계·5배·NO-PAIN III)는 기존 원문 그대로. 바꾸지 않는다.
 */
const DIGITAL: EquipItem[] = [
  { short: '스캐너', n: 'Point 01', title: '3D 구강스캐너', desc: '본을 뜨는 재료를 입에 물지 않고, 치아와 잇몸을 스캔해 3차원 데이터로 기록합니다. 이 데이터가 모의 식립과 보철 설계의 기준이 됩니다.', more: ['인상 채득 없이 스캔으로 기록', '구역 반사가 심한 분의 부담 감소'], fig: { key: 'place2/doctor-scan', alt: '양대일 대표원장이 구강스캐너로 환자의 아래턱을 스캔하고, 벽 모니터에 3D 스캔 영상이 떠 있는 모습' }, shot: 'photo' },
  { short: '3D CT', n: 'Point 02', title: '3D CT (CBCT)', desc: '잇몸뼈의 폭과 높이, 신경과 상악동의 위치를 입체로 확인합니다. 임플란트·사랑니·턱관절 진단의 기준이 되는 영상입니다.', more: ['여러 영상을 제공하는 올인원 장비', '파노라마와 CT를 함께 촬영', '짧은 촬영 시간, 적은 방사선 노출량'], fig: { key: 'place/place08', alt: '광화문 선치과 3D CT(CBCT) 촬영실' }, shot: 'photo' },
  { short: '모의 수술', n: 'Point 03', title: '모의 수술 소프트웨어', desc: 'CT와 스캔 자료를 겹쳐, 임플란트의 위치와 각도, 깊이를 수술 전에 컴퓨터에서 정합니다. 신경까지의 거리도 이 단계에서 확인합니다.', fig: { key: 'orig/implant-nav-plan', alt: 'CT 위에 임플란트 식립 경로를 잡는 계획 소프트웨어 화면' }, shot: 'product-light' },
  { short: '가이드', n: 'Point 04', title: '수술 가이드', desc: '모의 수술 결과대로 만든 가이드를 끼우고, 정해 둔 위치와 각도로 심습니다. 절개 범위를 줄여, 출혈과 붓기가 덜할 수 있습니다.', fig: { key: 'equip/guide', alt: '개인 맞춤형 수술 가이드 모형' }, shot: 'product-light' },
  { short: 'CAD/CAM', n: 'Point 05', title: '캐드캠 원내 보철 제작', desc: '구강스캔 자료로 보철을 설계(CAD)하고, 원내 3D 프린터로 만듭니다. 임시치아도 원내에서 제작합니다.', fig: { key: 'equip/printer', alt: '3D 프린터와 보철 디자인 CAD 화면' }, shot: 'product-light' },
  { short: '소독', n: 'Point 06', title: 'INOS 실시간 소독기', desc: '진료 기구를 통한 교차감염을 막기 위해, 사용한 기구를 INOS 소독기로 바로 소독합니다.', more: ['최대 99.999% 소독력 — KTR 테스트 완료'], fig: { key: 'orig/intro-p06-inos-group', alt: 'INOS 실시간 소독기 세 종류' }, shot: 'product-light' },
];

/** 서로 독립된 장비 네 가지 — 뒤집기 카드(오너: 여기는 카드로). 누르면 그 장비를 쓰는 진료 쪽으로 간다. */
const COMFORT: EquipItem[] = [
  { short: '무통마취', n: '마취', title: '무통마취기 NO-PAIN III', front: '마취액을 일정한 속도로 주입합니다.', desc: '컴퓨터가 마취액의 주입 속도와 압력을 일정하게 조절해, 마취액이 들어갈 때의 압력 통증을 줄입니다.', fig: { key: 'orig/pain-hero', alt: '무통마취기 NO-PAIN III 를 이용한 마취 장면' }, shot: 'photo', href: '/treatment/painless/anesthesia' },
  { short: '에어플로우', n: '치석제거', title: '에어플로우 스케일러 (EMS)', front: '파우더를 분사하는 저자극 치석제거.', desc: '공기와 물의 압력으로 미세 파우더를 분사해 치석과 바이오필름을 제거합니다. 강도는 10단계로, 물 온도도 조절할 수 있습니다.', more: ['10단계 강도조절', '온도조절 기능'], fig: { key: 'equip/airflow', alt: 'EMS 에어플로우 스케일러' }, shot: 'product-dark', href: '/treatment/painless/airflow' },
  { short: '레이저', n: '턱관절', title: 'PHL-15 레이저 물리치료', front: '턱 근육의 통증과 긴장을 완화합니다.', desc: '저출력 레이저와 저주파 전기치료로, 턱을 움직이는 근육의 통증과 긴장을 풀어 줍니다. 증상에 따라 치료 모드를 정하며, 건강보험이 적용됩니다.', more: ['원적외선보다 5배 높은 피부 침투력', '건강보험 적용'], fig: { key: 'place2/physio-room', alt: '턱관절 레이저 물리치료 장비가 있는 광화문 선치과 물리치료실' }, shot: 'photo', href: '/treatment/tmj' },
  { short: '초음파', n: '신경치료', title: '엔도소닉 초음파 세척기', front: '신경관 속을 초음파로 씻어 냅니다.', desc: '신경치료 중 신경관 안에 남은 신경 조직과 세균을, 작은 초음파 진동으로 씻어 내고 소독합니다.', fig: { key: 'orig/endo-handpiece', alt: '엔도소닉 초음파 세척기 핸드피스' }, shot: 'photo', href: '/treatment/natural-tooth/endosonic' },
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
          cardsLead="진단에서 보철 제작까지 이어지는 장비입니다."
          lines={['먼저 측정하고 계획한 뒤', <><span className="accent-sun">원내에서 제작합니다</span></>]}
          long
          lead="3D CT와 구강스캐너로 잇몸뼈와 치아를 재고, 모의 수술 소프트웨어로 수술을 먼저 계획합니다. 보철은 원내 CAD/CAM 장비로 설계하고 만듭니다. 광화문 선치과가 진료에 쓰는 장비를 쓰임과 함께 소개합니다."
          bg="place/place08"
          cards={[
            { fig: { key: 'equip/ct', alt: '3D CT(CBCT) 장비' }, shape: 'portrait' },
            { fig: { key: 'orig/intro-p05-group', alt: '원내 보철 제작 장비 일체 (3D 프린터·CAD 모니터·후처리기)' }, shape: 'wide' },
            { fig: { key: 'orig/intro-p06-inos-tower', alt: '파란 UV 불이 켜진 INOS 소독 타워 두 대' }, shape: 'std' },
          ]}
          items={DIGITAL.slice(0, 3).map((it) => ({ title: it.title, desc: it.desc }))}
        />

        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[820px]">
              <p className="eyebrow">DIGITAL SYSTEM</p>
              <h2 className="display-sm mt-4">
                검사부터 보철까지, <span className="accent whitespace-nowrap">디지털 데이터 하나로 잇습니다</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="구강스캔과 CT로 얻은 자료가 모의 수술, 수술 가이드, 보철 설계까지 그대로 이어집니다. 단계가 바뀌어도 같은 자료를 기준으로 삼아, {계획과 결과 사이의 차이를 줄입니다}." />
              </p>
            </div>
            <EquipShowcase items={DIGITAL} />
          </div>
        </section>

        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal max-w-[820px]">
              <p className="eyebrow">COMFORT</p>
              <h2 className="display-sm mt-4">
                통증과 자극을 줄이는 <span className="accent">진료 장비</span>
              </h2>
              <p className="lead mt-4">
                <Sentences text="마취 주사, 스케일링, 턱 근육 치료처럼 불편이 큰 진료에 쓰는 장비입니다." />
              </p>
            </div>
            <EquipShowcase items={COMFORT} variant="flip" />
          </div>
        </section>

        <ContactBand />
        <MedicalNotice />
      </main>
    </>
  );
}
