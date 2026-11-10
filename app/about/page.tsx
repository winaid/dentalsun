import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, Figure , RoundBadges, ScrubText, Sentences } from '@/components/ui';
import { CLINIC, HYGIENE, STRENGTHS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { Fragment } from 'react';
import { SECTIONS, TMJ_AWARD, TMJ_HUB_HERO_ITEMS } from '@/lib/content/tmjLanding';
import { AwardCard } from '@/components/TmjPage';
import { HygienistBand } from '@/components/HygienistBand';
import { BottomGuide } from '@/components/BottomGuide';
import { NAV } from '@/lib/nav';
import { figSrc } from '@/lib/docs';
import { splitAccent } from '@/lib/heroCollage';
import { metaDesc, alt, breadcrumbSchema, medicalWebPageSchema, og, physicianSchema } from '@/lib/seo';

const TITLE = '치과소개';
const DESC = '광화문 선치과 소개 — 통합치의학과 전문의 양대일 대표원장의 1:1 책임진료. 3D CT·구강스캐너 진단, 모의 수술과 원내 3D 프린터 수술 가이드, 1인 1기구 멸균. 광화문역 6번 출구 도보 2분, 시청역 3번 출구 도보 5분.';

export const metadata: Metadata = { title: TITLE, description: metaDesc('/about', DESC), alternates: alt('/about'), openGraph: og({ title: TITLE, description: DESC, path: '/about', images: [{ url: '/img/scene/intro-1.webp', width: 769, height: 495, alt: '광화문선치과 진료 장면' }] }) };

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

/*
 * 진료 원칙 세 줄 — 2026-11-10 병원(본부장 전달) "3D CT로 먼저 보고~ 구역을 아래 내용으로 변경, 박스가 아닌 형태로 가시성 높게".
 * 문구는 병원이 보낸 글자 그대로(띄어쓰기 '뼈이식,턱관절'까지 — 오너 문구 그대로 규칙). accent = 제목 중 주황 밑줄이 차오르는 끝 마디(글자는 그대로).
 * 예전 이 자리(3D DIGITAL 장비 여섯 칸, 원장 PPT 109쪽)는 장비소개(/about/equipment) DIGITAL 표와 같은 글이라 내용은 그쪽에 남아 있다.
 */
const PRINCIPLES = [
  {
    n: '01',
    tag: '편안한 진료',
    title: '치료에 대한 두려움부터 살핍니다',
    accent: '두려움부터 살핍니다',
    desc: '치료를 앞두고 느끼시는 긴장과 걱정을 가볍게 여기지 않습니다. 치료 전에는 진행 과정을 충분히 설명하고, 치료 중에는 불편한 곳이 없는지 세심하게 확인합니다. 불편하시면 손을 들어 주세요. 잠시 멈추고 상태를 살핀 뒤 진행하겠습니다.',
  },
  {
    n: '02',
    tag: '정직한 진료',
    title: '살릴 수 있는 치아인지 먼저 확인합니다',
    accent: '먼저 확인합니다',
    desc: '발치와 임플란트를 결정하기 전에 신경치료나 잇몸치료로 자연치아를 살릴 수 있는지 먼저 확인합니다. 엑스레이와 구강 사진을 함께 보며 현재 상태와 치료가 필요한 이유, 치료 순서를 설명드립니다. 지금 필요한 치료만 권하며, 경과를 지켜봐도 되는 부분은 정기적으로 확인합니다.',
  },
  {
    n: '03',
    tag: '전문적인 치료',
    title: '정확한 진단부터 치료의 마무리까지',
    accent: '치료의 마무리까지',
    desc: '보건복지부 인증 통합치의학과 전문의 양대일 대표원장이 진단부터 치료의 마무리까지 직접 담당합니다. 임플란트와 뼈이식,턱관절 치료, 사랑니 발치, 자연치아 보존 치료까지 치아와 잇몸, 턱관절의 상태를 종합적으로 살펴 환자에게 필요한 치료를 계획합니다.',
  },
];

/* 턱관절 구역 동그라미 배지 — 위 줄 작게 · 아래 줄 굵게. 근거: 상장(TMJ_AWARD) · STRENGTHS '대표원장 1:1 책임진료' ·
   턱관절 장비 설명 '세 가지 물리치료 모두 건강보험이 적용' (2026-11-04 오너 "수상·1:1 어필").
   폰(390)에서 네 개는 글자가 원 밖으로 넘쳐 세 개로 — 학회 정회원은 아래 02 칸 글에 있다 */
const TMJ_BADGES = ['턱관절치료\n대상 수상', '대표원장\n1:1 책임진료', '물리치료\n건강보험 적용'];
/* 세 칸 — 1:1 책임진료 + 턱관절 첫 화면 카드 01·02(원장 PPT 167쪽·261026 17쪽).
   ⚠️ 01 은 턱관절 전용 문장 — 2026-11-10 병원(본부장 전달) "첫 상담부터 수술과 정기검진까지…는 턱관절 진료와 맞지 않아 수정".
   예전엔 STRENGTHS(병원 전체·임플란트 흐름 글)를 그대로 가져와 '수술'이 옆 02 '보존적 치료부터'와 엇갈렸고, 위 WHY 카드 01 과 글자까지 같았다.
   새 문장은 턱관절 쪽 원장 글을 이었다: '문진부터 치아·근육·관절 검사까지 직접'(이갈이) · '3D CT 영상을 직접 판독'(진단) · '치료부터 장기적인 관리까지'(첫머리).
   공용 STRENGTHS(홈·WHY)는 병원 전체 이야기라 그대로 둔다. */
const TMJ_STRONG = [
  { title: '대표원장 1:1 책임진료', desc: '문진과 턱관절·근육 검사, 3D CT 판독부터 치료와 장기적인 관리까지 대표원장이 직접 진료합니다. 진료 중간에 담당 의사가 바뀌지 않습니다.' },
  TMJ_HUB_HERO_ITEMS[0],
  TMJ_HUB_HERO_ITEMS[1],
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
          /* 2026-10-20 원장 PPT 107쪽 — 제목 둘째 줄 '대표원장이 직접 책임집니다' · 설명 '수술을 포함한 치료와' · 카드 3장은 진료 원칙(WHY 구역과 중복) 대신 '광화문선치과의 중점 진료'. 글자 그대로, 굵게 = {…}, 번호 01~03 은 카드가 그린다 */
          cardsLead="광화문선치과의 중점 진료"
          lines={['진단부터 정기검진까지', <>대표원장이 <span className="accent-sun whitespace-nowrap">직접 책임집니다</span></>]}
          lead="통합치의학과 전문의 양대일 대표원장이 첫 상담과 3D CT 진단, 수술을 포함한 치료와 정기검진까지 맡습니다. 검사 영상을 함께 보며 지금 상태를 설명하고, {살릴 수 있는 치아인지부터} 확인합니다."
          bg="place/place01"
          cards={[
            { fig: { key: 'scene/loupe', alt: '확대경을 착용하고 진료하는 양대일 대표원장' }, shape: 'portrait' },
            { fig: { key: 'place2/reception', alt: '곡선형 나무 접수대와 광화문 선치과 간판' }, shape: 'wide' },
            { fig: { key: 'place/place08', alt: '3D CT 촬영실' }, shape: 'std' },
          ]}
          items={[
            { title: '디지털 임플란트', desc: '3D CT와 컴퓨터 모의수술로 임플란트의 위치·각도·깊이를 설계하고, 맞춤형 수술 가이드를 활용해 계획한 위치에 정밀하게 식립합니다.' },
            { title: '턱관절 치료', desc: '턱관절 CT와 개구량·맞물림·근육 검사를 통해 원인을 파악하고, 물리치료·보톡스·스플린트 등 {필요한 치료만 진행합니다}.' },
            { title: '자연치아 보존치료', desc: '신경치료와 재신경치료, 치근단절제술 등을 통해 {발치하기 전에 자연치아를 살릴 수 있는지부터 확인합니다}.' },
          ]}
        />

        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">WHY SUN DENTAL</p>
              {/* 2026-11-02 원장 PPT(261030) 10쪽 '소개 구역에 15년 이상 문구' — 원장 예시 두 줄 그대로(윗줄 = 이 줄, 아랫줄 = 기존 제목).
                   큰 숫자 판은 09-29 오너 반려라 글 한 줄로만 */}
              <p className="mt-4 text-[1.1rem] font-bold text-ink md:text-[1.3rem]">
                <span className="text-brand-700">15년 이상</span>, 광화문 한 자리를 지켜온 신뢰
              </p>
              <h2 className="display-sm mt-2">
                한 명의 전문의가 <span className="accent whitespace-nowrap">끝까지 책임지는 진료</span>
              </h2>
              <p className="lead mt-4"><Sentences text="진단한 의사가 수술과 보철, 정기검진까지 이어서 봅니다. 치료를 계획한 대표원장이 치료 뒤 경과까지 직접 확인합니다." /></p>
            </div>
            {/* 2026-10-06 카드 05 신설로 다섯 장 — 홈과 같이 3칸 + 2칸(넓은 화면), 2칸(태블릿, 마지막 가운데) */}
            <ul className="reveal-stack grid-cards mt-10 sm:grid-cols-2 lg:grid-cols-6">
              {STRENGTHS.map((s, i) => (
                <li
                  key={s.title}
                  className={`card flex h-full flex-col p-6 lg:col-span-2 ${i === 3 ? 'lg:col-start-2' : ''} ${i === STRENGTHS.length - 1 ? 'sm:col-span-2 sm:w-[calc(50%-0.625rem)] sm:justify-self-center lg:w-auto lg:justify-self-stretch' : ''}`}
                >
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-4 text-[1.05rem] font-bold text-ink">{s.title}</p>
                  <p className="mt-2 text-[17px] leading-relaxed text-ink-soft"><Sentences text={s.desc} /></p>
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
              <p className="lead mt-4"><Sentences text="강남성심병원에서 레지던트 수련을 마친 보건복지부 인증 통합치의학과 전문의로, {현재 강남성심병원 치과 외래교수로 활동하고 있습니다}. 임플란트와 턱관절, 신경치료와 보철을 대표원장이 함께 보기 때문에, 치료의 우선순위부터 최종 보철물의 맞물림까지 고려해 계획을 세웁니다." /></p>
              <ul className="mt-6 space-y-3">
                {DOCTORS.map((d) => (
                  <li key={d.slug} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                    <Image src={d.photo} alt={d.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover object-top" />
                    <div>
                      <p className="font-bold text-ink">
                        {d.name} {d.role}
                      </p>
                      <p className="text-[15.5px] text-ink-soft">{d.specialty} · {d.career.find((c) => c.includes('외래교수')) ?? d.career[1]}</p>
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

        {/* ── 턱관절 — 2026-11-04 본부장 "치과소개가 거의 임플란트 위주라 턱관절 내용이 빈약, 사진 밑에 턱관절 진료 얘기도" ·
             오너 "위와 구역 분리 · 수상·1:1 어필(턱관절이 강점) · 모션그래픽도 쫙".
             의료진(회색) 아래 따로 짙은 남색 사진 띠 — 위 의료진 구역(글+사진 두 칸)과 짜임을 다르게. 아래 진료 원칙(흰색)과도 갈린다.
             새 문구 없음: 제목·설명 = 턱관절 쪽 첫머리(원장 PPT 168쪽, SECTIONS.intro) · 1:1 = STRENGTHS(원장 피드백 09-29) ·
             경험·진단/근본 치료 = TMJ_HUB_HERO_ITEMS(PPT 167쪽·261026 17쪽) · 상장 = TMJ_AWARD(병원이 보낸 사진) · 학회·건강보험 = 의료진 약력·턱관절 장비 설명.
             ⚠️ 상장 광고는 의료법 제56조 제2항 제14호 소지 — 2026-09-29 오너에게 알렸고 병원 결정으로 싣는다(홈·턱관절 쪽과 같음).
             모션 = 사이트에 있는 것만: 배경 사진 흐름(data-parallax) · 설명 글 스크롤 채움(ScrubText) · 동그라미 배지 테두리(RoundBadges) ·
             상장 카드 올라앉기(AwardCard) · 세 칸 차례로(reveal-stack). 새 반짝이·번지는 빛 없음. */}
        <section id="tmj" className="relative isolate scroll-mt-16 overflow-hidden bg-night py-24 text-white md:py-32">
          <div className="absolute inset-0 -z-10">
            <Image src={figSrc('sun/tmj-explain-skull')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-45" data-parallax="0.2" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/90 via-night/70 to-night/95" />
          </div>
          <div className="wrap">
            <div className="reveal mx-auto max-w-[880px] text-center">
              <p className="eyebrow on-dark justify-center">TMJ · 턱관절</p>
              <h2 className="display-sm mt-4 !text-white on-photo">
                {SECTIONS.intro.title.split('\n').map((line, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {splitAccent(line).map((p, k) => (p.accent ? <span key={k} className="accent-sun">{p.text}</span> : <Fragment key={k}>{p.text}</Fragment>))}
                  </Fragment>
                ))}
              </h2>
              {SECTIONS.intro.lead && (
                <p className="mx-auto mt-6 max-w-[760px] text-[1.1rem] leading-[1.85] text-white md:text-[1.15rem]">
                  {/* ⚠️ light 를 주면 밝은 바탕용(짙은 남색 글자)이 되어 이 남색 띠에서 안 보였다(2026-11-04 오너 "색도 안 보이는데") — 홈 턱관절 띠처럼 기본값 */}
                  <ScrubText text={SECTIONS.intro.lead} />
                </p>
              )}
            </div>
            <RoundBadges tone="dark" className="mx-auto mt-12 max-sm:grid-cols-3 sm:justify-center" items={TMJ_BADGES} />
            {TMJ_AWARD.show && <AwardCard className="mt-14" />}
            <ol className="reveal-stack mx-auto mt-14 grid max-w-[1040px] gap-7 text-left md:grid-cols-3 md:gap-10">
              {TMJ_STRONG.map((it, i) => (
                <li key={it.title} className="border-l-2 border-sun-400/80 pl-5">
                  <p className="flex items-baseline gap-2.5">
                    <span className="text-[1.05rem] font-extrabold tabular-nums text-sun-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[1.1rem] font-bold leading-snug text-white md:text-[1.15rem]">{it.title}</span>
                  </p>
                  <p className="mt-3 text-[16.5px] leading-[1.8] text-white/80">{it.desc}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href="/treatment/tmj" className="btn-sun">턱관절 진료 자세히</Link>
              <Link href="/treatment/tmj/symptoms" className="btn-ghost-dark">증상 자가진단</Link>
            </div>
          </div>
        </section>

        {/* ── 진료 원칙 — 2026-11-10 병원 요청으로 옛 3D DIGITAL 장비 여섯 칸 자리를 바꿨다.
             오너 "카드형태 말고 포인트 한 개씩 그냥 한 줄로, 모션그래픽이랑 색감 넣어서 가시성 좋게" — 턱관절 생활 관리 줄(.habit-rows)과 같은 결.
             줄 하나하나가 따로 나타난다(.reveal 이 줄마다라 스크롤로 닿을 때마다): 왼쪽 세로 선이 주황으로 차오르고, 선 위 동그라미가 커지고,
             큰 번호가 올라오고, 제목 끝 마디 밑줄이 왼쪽부터 찬다(globals.css .prin-*). 새 반짝이·번지는 빛·그라데이션 없음. ── */}
        <section className="section" id="principles">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">OUR PRINCIPLES</p>
              <h2 className="display-sm mt-4">
                광화문 선치과가 <span className="accent-sun whitespace-nowrap">지키는 진료 원칙</span>
              </h2>
            </div>
            <ol className="mx-auto mt-12 max-w-[1040px] md:mt-16">
              {PRINCIPLES.map((p) => {
                const cut = p.title.lastIndexOf(p.accent);
                return (
                  <li key={p.n} className="reveal prin-row">
                    <span className="prin-dot" aria-hidden />
                    <div className="prin-head">
                      <span className="prin-num">{p.n}</span>
                      <span className="prin-tag">{p.tag}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[1.35rem] font-extrabold leading-[1.4] tracking-[-0.025em] text-ink md:text-[1.65rem]">
                        {p.title.slice(0, cut)}
                        <span className="prin-accent whitespace-nowrap">{p.accent}</span>
                      </h3>
                      <p className="mt-4 text-[17px] leading-[1.85] text-ink-soft"><Sentences text={p.desc} /></p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="section bg-canvas" id="hygiene">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            {/* ⚠️ fill — 두 장 다 세로 사진인데 폭이 422·384px 이라 '작은 원본' 안전장치에 걸려
                카드의 41%·38% 만 채우고 회색 여백에 떠 있었다(2026-09-14 실측). 자세한 내력은 Figure 의 fill 주석에. */}
            <div className="reveal grid grid-cols-2 gap-4">
              <Figure fig={{ key: 'scene/sterile', alt: '멸균 소독한 진료 기구' }} ratio="aspect-[9/16]" sizes="(max-width: 1023px) 45vw, 25vw" effect="img-in" fill />
              <Figure fig={{ key: 'scene/sterile2', alt: '개별 포장된 1인 1기구' }} ratio="aspect-[9/16]" sizes="(max-width: 1023px) 45vw, 25vw" effect="img-in" fill />
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
              {/* 2026-11-10 병원 "멸균 내용 중 치과위생사는 삭제" — 옛 흰 상자('전원 치과위생사 — …')를 빼고 아래 띠로 옮겼다 */}
            </div>
          </div>
        </section>

        {/* ── 국가자격 치과위생사 띠 — 홈과 같은 부품. 병원 "치과위생사는 두 번째 첨부 사진(홈 띠)처럼" ── */}
        <HygienistBand />

        <section className="section" id="tour">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">CLINIC TOUR</p>
              <h2 className="display-sm mt-4">
                입구에서 수술실까지, <span className="accent">진료 공간</span>
              </h2>
              <p className="lead mt-4"><Sentences text="진료실은 유리 파티션으로 나뉘어 있고, 수술실과 CT 촬영실, 턱관절 물리치료실을 따로 두었습니다." /></p>
              <p className="mt-3 text-[16px] text-ink-muted">{CLINIC.address.full} · {CLINIC.address.landmark}</p>
            </div>
            <div className="reveal-stack mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {TOUR.map((f) => (
                <Figure key={f.key} fig={f} ratio="aspect-[4/3]" sizes="(max-width: 768px) 50vw, 25vw" effect="img-in" />
              ))}
            </div>
          </div>
        </section>

        {/* 맨 아래 바로가기 — 원장 카드 + 치과소개 안내(메뉴와 같은 다섯) + 전체 메뉴. 위 둘러보기가 흰 바탕이라 회색 */}
        <BottomGuide current="/about" own={{ title: '치과소개', accent: '안내', items: NAV.find((n) => n.href === '/about')!.children!.map(({ label, href }) => ({ label, href })) }} />

        <ContactBand />
      </main>
    </>
  );
}
