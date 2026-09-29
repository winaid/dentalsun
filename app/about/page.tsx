import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, Figure , Sentences } from '@/components/ui';
import { CLINIC, HYGIENE, STRENGTHS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { desc80, alt, breadcrumbSchema, medicalWebPageSchema, og, physicianSchema } from '@/lib/seo';

const TITLE = '치과소개';
const DESC = '광화문 선치과 소개 — 통합치의학과 전문의 양대일 대표원장의 1:1 책임진료. CBCT·구강스캐너 진단, 모의 식립과 수술 가이드, 원내 CAD/CAM 보철, 1인 1기구 멸균. 광화문역 6번 출구 도보 2분.';

export const metadata: Metadata = { title: TITLE, description: desc80(DESC), alternates: alt('/about'), openGraph: og({ title: TITLE, description: DESC, path: '/about', images: [{ url: '/img/scene/intro-1.webp', width: 769, height: 495, alt: '광화문선치과 진료 장면' }] }) };

/**
 * 진료 공간 — 여덟 장 = 4열 두 줄이 딱 맞는다(마지막 줄에 한 장만 남지 않게).
 * 2026-09-29 네이버 플레이스 실사(place2/)로 입구·접수·대기실·진료실·물리치료실을 바꿨다.
 * ⚠️ place/place09(대기실)는 벽에 '2019 … 대상 수상' 현수막이 걸린 컷이라 뺐다 — 상장·현판 사진은 의료광고 심의를 고려해 쓰지 않는다.
 * ⚠️ place2/waiting 은 거울의 다른 원장 이름을 지운 판이다(원본 사용 금지).
 */
const TOUR = [
  { key: 'place2/entrance', alt: '금색 광화문 선치과 로고가 붙은 거울 기둥과 유리문이 있는 입구', caption: '입구' },
  { key: 'place2/reception', alt: '곡선형 나무 접수대와 광화문 선치과 간판', caption: '접수' },
  { key: 'place2/waiting', alt: '창가에 가죽 벤치가 놓인 대기실', caption: '대기실' },
  { key: 'place2/treatment-bays', alt: '유리 파티션으로 나뉜 진료 체어와 파노라마 영상이 뜬 모니터', caption: '진료실' },
  { key: 'place/place02', alt: '유리 칸막이로 나뉜 개별 진료실', caption: '개별 진료실' },
  { key: 'place/place06', alt: '수술 조명과 진료 체어, 영상 모니터가 있는 수술실 내부', caption: '수술실' },
  { key: 'place/place08', alt: '3D CT 촬영 장비가 있는 촬영실', caption: 'CT 촬영실' },
  { key: 'place2/physio-room', alt: '턱관절 레이저 물리치료 장비가 있는 물리치료실', caption: '물리치료실' },
];

/* 2026-09-29 — 05 '당일 디지털 보철 제작 시스템'은 원장 확인 전이라 '캐드캠 원내 보철 제작'으로 중립화(속도 약속 없음) */
const POINTS = [
  { n: '01', title: '3D 구강스캐너', desc: '본을 뜨는 재료를 입에 물지 않고, 치아와 잇몸을 스캔해 3차원 데이터로 기록합니다. 이 데이터가 모의 식립과 보철 설계의 기준이 됩니다.' },
  { n: '02', title: '3D CT (CBCT)', desc: '잇몸뼈의 폭과 높이, 하치조신경관과 상악동의 위치를 3차원으로 확인합니다. 파노라마와 CT를 한 장비로 촬영하며, 촬영 시간이 짧고 방사선 노출량이 적습니다.' },
  { n: '03', title: '모의 식립 소프트웨어', desc: 'CT와 스캔 데이터를 겹쳐, 임플란트의 위치와 각도, 깊이를 수술 전에 컴퓨터에서 정합니다.' },
  { n: '04', title: '수술 가이드', desc: '모의 식립 결과대로 제작한 가이드를 끼우고 식립합니다. 절개 범위를 줄여 출혈과 붓기를 줄이는 데 도움이 됩니다.' },
  { n: '05', title: '캐드캠 원내 보철 제작', desc: '구강스캔 데이터로 보철을 설계하고, 원내 3D 프린터로 제작합니다. 임시 보철의 장착 시점은 골질과 초기 고정력에 따라 정합니다.' },
  { n: '06', title: 'INOS 실시간 소독', desc: '사용한 진료 기구를 INOS 소독기로 바로 소독해 교차감염을 막습니다. KTR 소독력 테스트를 마친 장비입니다.' },
];

export default function AboutPage() {
  const trail = [{ name: TITLE, path: '/about' }];
  return (
    <>
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/about' }), ...DOCTORS.map(physicianSchema)]} />
      <main id="main">
        <HeroCollage
          trail={trail}
          eyebrow="ABOUT SUN DENTAL CLINIC"
          long
          cardsLead="광화문 선치과의 진료 원칙입니다."
          lines={['진단부터 정기검진까지', <>대표원장이 <span className="accent-sun">직접 봅니다</span></>]}
          lead="통합치의학과 전문의 양대일 대표원장이 첫 상담과 CBCT 진단, 수술과 보철, 정기검진까지 맡습니다. 검사 영상을 함께 보며 현재 상태를 설명하고, 살릴 수 있는 치아인지부터 확인합니다."
          bg="place/place01"
          cards={[
            { fig: { key: 'scene/loupe', alt: '확대경을 착용하고 진료하는 양대일 대표원장' }, shape: 'portrait' },
            { fig: { key: 'place2/reception', alt: '곡선형 나무 접수대와 광화문 선치과 간판' }, shape: 'wide' },
            { fig: { key: 'place/place08', alt: '3D CT 촬영실' }, shape: 'std' },
          ]}
          items={STRENGTHS.slice(0, 3).map((s) => ({ title: s.title, desc: s.desc }))}
        />

        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">WHY SUN DENTAL</p>
              <h2 className="display-sm mt-4">
                한 명의 전문의가 <span className="accent whitespace-nowrap">끝까지 책임지는 진료</span>
              </h2>
              <p className="lead mt-4"><Sentences text="진단한 의사가 수술과 보철, 정기검진까지 이어서 봅니다. 치료 계획을 세운 사람이 경과도 같은 기준으로 확인합니다." /></p>
            </div>
            <ul className="reveal-stack grid-cards mt-10 sm:grid-cols-2 lg:grid-cols-4">
              {STRENGTHS.map((s, i) => (
                <li key={s.title} className="card flex h-full flex-col p-6">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-4 text-[1.05rem] font-bold text-ink">{s.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft"><Sentences text={s.desc} /></p>
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
                통합치의학과 전문의
                <br />
                <span className="accent">양대일 대표원장</span>
              </h2>
              <p className="lead mt-4"><Sentences text="강남성심병원 통합치의학과에서 레지던트 수련을 마치고, 같은 병원 치과 외래교수를 지냈습니다. 임플란트와 턱관절, 근관치료와 보철을 한 사람이 함께 보기 때문에 치료 순서와 교합까지 하나의 계획으로 정합니다." /></p>
              <ul className="mt-6 space-y-3">
                {DOCTORS.map((d) => (
                  <li key={d.slug} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                    <Image src={d.photo} alt={d.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover object-top" />
                    <div>
                      <p className="font-bold text-ink">
                        {d.name} {d.role}
                      </p>
                      <p className="text-[14.5px] text-ink-soft">{d.specialty} · {d.career.find((c) => c.includes('외래교수')) ?? d.career[1]}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/about/doctors" className="btn-brand mt-8">의료진 소개 자세히</Link>
            </div>
            {/* ⚠️ 3/2 — 옛값은 원본과 같은 aspect-[960/767](1.25)이라 사진이 왼쪽 글 칸보다
                84px 더 길었다(1440px 에서 글 437 · 사진 521, 실측 2026-09-14). 두 칸 높이를 맞춘다.
                ⚠️ 더 납작하게(16/9 등) 가지 말 것 — 원장 머리 위 여백이 없어 잘린다.
                2026-09-29 — 확대경 사진(scene/loupe)은 첫 화면 카드에 이미 있어, 플레이스 고해상 실사(원장이 구강 스캔하는 장면, 3:2 원본)로 바꿨다. */}
            <Figure fig={{ key: 'place2/doctor-scan', alt: '양대일 대표원장이 구강스캐너로 환자의 아래턱을 스캔하고, 벽 모니터에 3D 스캔 영상이 떠 있는 모습' }} ratio="aspect-[3/2]" />
          </div>
        </section>

        <section className="section" id="digital">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">3D DIGITAL</p>
              <h2 className="display-sm mt-4">
                CBCT로 계측하고, <span className="accent whitespace-nowrap">계획대로 심습니다</span>
              </h2>
              <p className="lead mt-4"><Sentences text="잇몸뼈의 폭과 높이, 신경관까지의 거리를 CBCT로 잰 뒤, 식립 위치를 컴퓨터에서 먼저 정합니다. 수술은 그 계획으로 만든 가이드를 따라 진행합니다." /></p>
            </div>
            <ol className="reveal-stack grid-cards mt-10 sm:grid-cols-2 lg:grid-cols-3">
              {POINTS.map((p) => (
                <li key={p.n} className="card flex h-full flex-col p-6">
                  <span className="pill-sun">Point {p.n}</span>
                  <p className="mt-3 text-[1.05rem] font-bold text-ink">{p.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft"><Sentences text={p.desc} /></p>
                </li>
              ))}
            </ol>
            <div className="mt-8 text-center">
              <Link href="/about/equipment" className="btn-ghost">장비별 쓰임 자세히 보기</Link>
            </div>
          </div>
        </section>

        <section className="section bg-canvas" id="hygiene">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            {/* ⚠️ fill — 두 장 다 세로 사진인데 폭이 422·384px 이라 '작은 원본' 안전장치에 걸려
                카드의 41%·38% 만 채우고 회색 여백에 떠 있었다(2026-09-14 실측). 자세한 내력은 Figure 의 fill 주석에. */}
            <div className="reveal grid grid-cols-2 gap-4">
              <Figure fig={{ key: 'scene/sterile', alt: '멸균 소독한 진료 기구' }} ratio="aspect-[9/16]" sizes="25vw" effect="img-in" fill />
              <Figure fig={{ key: 'scene/sterile2', alt: '개별 포장된 1인 1기구' }} ratio="aspect-[9/16]" sizes="25vw" effect="img-in" fill />
            </div>
            <div className="reveal">
              <p className="eyebrow">STERILIZATION</p>
              <h2 className="display-sm mt-4">
                기구는 멸균하고, <span className="accent whitespace-nowrap">1인 1기구로 씁니다</span>
              </h2>
              <p className="lead mt-4"><Sentences text="진료 기구를 통한 교차감염을 막기 위해, 멸균과 소독 절차를 진료마다 같은 순서로 지킵니다." /></p>
              <ul className="mt-6 space-y-2.5">
                {HYGIENE.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[16px] text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-2xl bg-white p-5 text-[15.5px] leading-relaxed text-ink-soft">
                <span className="sent"><span className="font-bold text-ink">전원 치과위생사</span> — 진료 스태프는 모두 치과위생사 면허를 가지고 있습니다.</span>
                <span className="sent">진료 보조는 면허를 가진 인력이 맡습니다.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="tour">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">CLINIC TOUR</p>
              <h2 className="display-sm mt-4">
                입구에서 수술실까지, <span className="accent">진료 공간</span>
              </h2>
              <p className="lead mt-4"><Sentences text="진료실은 유리 파티션으로 나뉘어 있고, 수술실과 CT 촬영실, 턱관절 물리치료실을 따로 두었습니다." /></p>
              <p className="mt-3 text-[15px] text-ink-muted">{CLINIC.address.full} · {CLINIC.address.landmark}</p>
            </div>
            <div className="reveal-stack mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {TOUR.map((f) => (
                <Figure key={f.key} fig={f} ratio="aspect-[4/3]" sizes="(max-width: 768px) 50vw, 25vw" effect="img-in" />
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
    </>
  );
}
