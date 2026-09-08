import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { JsonLd } from '@/components/JsonLd';
import { VideoFacade } from '@/components/VideoFacade';
import { ContactBand, FaqList, Figure, MedicalNotice } from '@/components/ui';
import { CLINIC, HOURS, HYGIENE, MONTHLY_NOTICE, STRENGTHS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { TREATMENT_HUBS } from '@/lib/nav';
import { SITE_FAQ } from '@/lib/faq';
import { faqSchema, medicalWebPageSchema, physicianSchema } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { 'ko-KR': CLINIC.url, 'x-default': CLINIC.url } },
};

/** 홈 FAQ — 사이트 FAQ 에서 묶음마다 첫 질문 하나씩. 화면과 스키마가 같은 배열. */
const HOME_FAQ = SITE_FAQ.map((g) => g.items[0]);

const HUB_ICON: Record<string, string> = {
  '/treatment/implant': 'M12 3l3 4h-6l3-4zm-3 6h6v6a3 3 0 0 1-6 0V9z',
  '/treatment/tmj': 'M7 4h10v6a5 5 0 0 1-10 0V4zm3 12l-2 5m8-5l2 5',
  '/treatment/aesthetic': 'M4 14c2-6 14-6 16 0-2 4-14 4-16 0z',
  '/treatment/insurance': 'M4 6h16v12H4zM8 10h8M8 14h5',
  '/treatment/wisdom-tooth': 'M8 4c-3 0-4 3-3 7l2 9h2l1-6 1 6h2l2-9c1-4 0-7-3-7-1 0-2 1-2 1s-1-1-2-1z',
  '/treatment/natural-tooth': 'M12 3c-4 0-6 3-5 7l2 11h2l1-6 1 6h2l2-11c1-4-1-7-5-7z',
  '/treatment/painless': 'M12 4v16m-6-8h12',
};

export default function HomePage() {
  const featured = [
    { href: '/treatment/implant/navigation', label: '내비게이션 임플란트', desc: '모의수술로 오차를 없앤 무절개 임플란트', fig: 'implant/navigation' },
    { href: '/treatment/implant/full-arch', label: '풀아치(전체) 임플란트', desc: '4~6개 최소식립으로 무치악 해결', fig: 'implant/fullarch-model' },
    { href: '/treatment/implant/uv', label: 'UV 임플란트', desc: '잇몸이 좋지 않다면', fig: 'implant/uv' },
    { href: '/treatment/implant/prf', label: '자가혈 임플란트', desc: '뼈이식이 필요하다면', fig: 'implant/prf' },
    { href: '/treatment/implant/custom', label: '맞춤 임플란트', desc: '내 잇몸에 꼭 맞게 제작', fig: 'implant/custom' },
  ];

  return (
    <>
      <SiteHeader dark />
      <JsonLd
        data={[
          medicalWebPageSchema({ title: `${CLINIC.shortName} | 광화문역 치과`, description: CLINIC.description, path: '/' }),
          ...DOCTORS.map(physicianSchema),
          faqSchema(HOME_FAQ, '/'),
        ]}
      />
      <main id="main">
        {/* ── 첫 화면 ── */}
        <section className="relative isolate overflow-hidden bg-night text-white">
          <div className="absolute inset-0 -z-10">
            <Image src="/img/scene/surgery.webp" alt="" fill priority sizes="100vw" className="object-cover object-[70%_center] opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/40" />
          </div>
          <div className="wrap pt-[128px] pb-20 md:pt-[176px] md:pb-32">
            <p className="eyebrow on-dark hero-in">SUN DENTAL CLINIC · 광화문역 6번 출구 도보 2분</p>
            <h1 className="display mt-5 max-w-[720px] !text-white hero-in hero-in-2 on-photo">
              더 빠르고, 정확하게,
              <br />
              그리고 <span className="accent-sun">편안하게</span>
              <br />
              환자중심의 디지털 치과 진료
            </h1>
            <p className="mt-6 max-w-[560px] text-[1.05rem] leading-[1.8] text-white/80 hero-in hero-in-3 md:text-[1.12rem]">
              강남성심병원 외래교수 출신 전문의가 이해하기 쉬운 설명과 불편함을 줄인 진료시스템으로 진료합니다. 디지털 임플란트와 턱관절 치료, MTA 신경치료로 자연치아를 지키는 광화문 선치과입니다.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 hero-in hero-in-4">
              <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
              <Link href="/treatment" className="btn-ghost-dark">진료 안내 보기</Link>
            </div>
            <ul className="mt-14 grid gap-3 text-[14.5px] text-white/85 hero-in hero-in-4 sm:grid-cols-3">
              {[
                '강남성심병원 외래교수 출신 · 통합치의학과 · 치과보철과 전문의',
                '3D 구강스캐너 · 저선량 CT · 수술 가이드 · 당일 디지털 보철',
                '무통마취기 · 에어플로우 · 수면치료 · 전원 치과위생사',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-sun-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 강점 4 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">WHY SUN DENTAL</p>
              <h2 className="display-sm mt-4">
                치과치료, <span className="accent">광화문선치과</span>는 다릅니다
              </h2>
              <p className="lead mt-4">다년간의 임상경험으로 믿을 수 있는 진료, 환자분이 이해하기 쉬운 친절한 설명 — 기존 홈페이지에서 스스로 밝혀 온 네 가지 약속입니다.</p>
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

        {/* ── 진료과목 ── */}
        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">DEPARTMENTS</p>
              <h2 className="display-sm mt-4">
                광화문선치과 <span className="accent">진료과목</span>
              </h2>
            </div>
            <ul className="reveal-stack mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {TREATMENT_HUBS.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} className="card card-hover group flex h-full flex-col items-center p-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-sun-500 group-hover:text-white">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d={HUB_ICON[h.href] ?? 'M4 12h16'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>
                    </span>
                    <span className="mt-4 text-[1.02rem] font-bold text-ink">{h.label}</span>
                    <span className="mt-1.5 text-[12.5px] text-ink-muted">{h.children?.slice(0, 3).map((c) => c.label).join(' · ')}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/faq" className="card card-hover group flex h-full flex-col items-center justify-center p-6 text-center">
                  <span className="text-[1.02rem] font-bold text-brand-700">자주 묻는 질문 →</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 임플란트 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">PREMIUM DIGITAL IMPLANT</p>
              <h2 className="display-sm mt-4">
                광화문선치과의 임플란트,
                <br />
                <span className="accent">왜 특별할까요?</span>
              </h2>
              <p className="lead mt-4">내 치아 상태에 따른 다양한 수술 방법으로, 치아가 안 좋아도 잇몸뼈가 부족해도 구강 상태에 맞는 임플란트를 제안합니다.</p>
            </div>
            <div className="reveal mt-12 grid gap-6 lg:grid-cols-2">
              {CLINIC.videos.slice(0, 2).map((v) => (
                <div key={v.id}>
                  <VideoFacade id={v.id} poster={v.thumb} title={v.title} />
                  <p className="mt-3 text-[14.5px] font-semibold text-ink">{v.title}</p>
                </div>
              ))}
            </div>
            <ul className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {featured.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className="card card-hover group block h-full overflow-hidden">
                    <Figure fig={{ key: f.fig, alt: f.label }} rounded="rounded-none" sizes="(max-width: 640px) 100vw, 20vw" />
                    <span className="block p-5">
                      <span className="block text-[1rem] font-bold text-ink group-hover:text-brand-700">{f.label}</span>
                      <span className="mt-1 block text-[13px] text-ink-soft">{f.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <Link href="/treatment/implant" className="btn-brand">임플란트 전체 안내</Link>
            </div>
          </div>
        </section>

        {/* ── 턱관절 ── */}
        <section className="relative isolate overflow-hidden bg-night py-20 text-white md:py-28">
          <div className="absolute inset-0 -z-10">
            <Image src="/img/scene/loupe.webp" alt="" fill sizes="100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/40" />
          </div>
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            <div className="reveal">
              <p className="eyebrow on-dark">TMJ · 턱관절</p>
              <h2 className="display-sm mt-4 !text-white">
                원인부터 해결하는
                <br />
                <span className="accent-sun">턱관절 진료</span>
              </h2>
              <p className="mt-5 text-[1.05rem] leading-[1.8] text-white/80">정확한 진단과 근본적인 치료로 재발률을 낮춘 턱관절 진료. 기본적인 진료부터 어려운 장치치료까지, 다수의 환자분들을 진료하며 얻은 노하우로 개인별 맞춤 진료를 합니다.</p>
              <ul className="reveal-stack mt-8 grid gap-3 sm:grid-cols-3">
                {['01 정확한 진단', '02 전반적인 턱관절 치료 진행', '03 오랜 기간 다수의 턱관절 환자 진료'].map((t) => (
                  <li key={t} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-[14px] font-semibold backdrop-blur">{t}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/treatment/tmj" className="btn-sun">턱관절 치료 안내</Link>
                <Link href="/treatment/tmj/symptoms" className="btn-ghost-dark">주요 증상 확인</Link>
              </div>
            </div>
            <div className="reveal grid grid-cols-2 gap-4">
              <Figure fig={{ key: 'tmj/splint', alt: '턱관절 스플린트 장치 모형' }} sizes="25vw" />
              <Figure fig={{ key: 'tmj/skull', alt: '턱관절 위치 도해' }} sizes="25vw" />
              <Figure fig={{ key: 'equip/laser', alt: '턱관절 물리치료 장비 PHL-15 레이저' }} sizes="25vw" />
              <Figure fig={{ key: 'scene/tmj-3', alt: '턱관절 진료 상담' }} sizes="25vw" />
            </div>
          </div>
        </section>

        {/* ── 무통·자연치아·심미·사랑니 (원본 카드 4) ── */}
        <section className="section bg-canvas">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">COMFORT & CARE</p>
              <h2 className="display-sm mt-4">
                통증은 줄이고, <span className="accent">내 치아는 지키는</span> 진료
              </h2>
            </div>
            <ul className="reveal-stack mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: '/treatment/painless', label: '무통 & 저자극 치료', desc: '무통마취기, 저자극 스케일러 등을 이용한 편안한 치과 치료', fig: 'illust/airflow-device' },
                { href: '/treatment/natural-tooth', label: '자연치아 살리기', desc: 'MTA 치료를 통해 내 치아를 최대한 보존', fig: 'illust/tooth-mta' },
                { href: '/treatment/aesthetic', label: '심미치료', desc: '심미보철 · 치아미백', fig: 'illust/aesthetic' },
                { href: '/treatment/wisdom-tooth', label: '매복사랑니', desc: '까다로운 매복 사랑니도 3D CT 진단 후 안전하게 발치', fig: 'illust/wisdom' },
              ].map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="card card-hover group block h-full overflow-hidden">
                    <Figure fig={{ key: c.fig, alt: c.label }} rounded="rounded-none" sizes="(max-width: 640px) 100vw, 25vw" />
                    <span className="block p-5">
                      <span className="block text-[1.05rem] font-bold text-ink group-hover:text-brand-700">{c.label}</span>
                      <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ink-soft">{c.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 의료진 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">OUR DOCTORS</p>
              <h2 className="display-sm mt-4">
                두 분의 <span className="accent">전문의</span>가 진료합니다
              </h2>
              <p className="lead mt-4">보건복지부 인증 통합치의학과 전문의와 치과보철과 전문의 — 강남성심병원 외래교수 출신의 다년간 임상경험으로 진료합니다.</p>
            </div>
            <ul className="reveal-stack mx-auto mt-10 grid max-w-[900px] gap-6 sm:grid-cols-2">
              {DOCTORS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/about/doctors#${d.slug}`} className="card card-hover group block overflow-hidden">
                    <div className="relative aspect-[4/3] bg-canvas-2">
                      <Image src={d.photo} alt={`${d.name} ${d.role}`} fill sizes="(max-width: 640px) 100vw, 450px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                    </div>
                    <div className="p-6 text-center">
                      <span className="pill-brand">{d.specialty}</span>
                      <p className="mt-3 text-[1.25rem] font-extrabold text-ink">
                        {d.name} <span className="text-[0.95rem] font-semibold text-ink-muted">{d.role}</span>
                      </p>
                      <p className="mt-1.5 text-[13.5px] text-ink-soft">{d.career[0]}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 위생·소독 ── */}
        <section className="section bg-canvas">
          <div className="wrap grid items-center gap-10 lg:grid-cols-2">
            <div className="reveal order-2 lg:order-1 grid grid-cols-2 gap-4">
              <Figure fig={{ key: 'scene/sterile', alt: '멸균 소독한 진료 기구' }} sizes="25vw" />
              <Figure fig={{ key: 'scene/sterile2', alt: '개별 포장된 1인 1기구' }} sizes="25vw" />
            </div>
            <div className="reveal order-1 lg:order-2">
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
              <Link href="/about/equipment" className="btn-ghost mt-8">디지털 장비 · 소독 시스템 보기</Link>
            </div>
          </div>
        </section>

        {/* ── 둘러보기 ── */}
        <section className="section">
          <div className="wrap">
            <div className="reveal flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">CLINIC TOUR</p>
                <h2 className="display-sm mt-4">
                  광화문선치과 <span className="accent">둘러보기</span>
                </h2>
              </div>
              <Link href="/about#tour" className="btn-ghost">전체 사진 보기</Link>
            </div>
            <div className="reveal-stack mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { key: 'place/place01', alt: '광화문선치과 진료실 복도' },
                { key: 'place/place03', alt: '광화문선치과 진료실' },
                { key: 'place/place08', alt: '3D CT 촬영실' },
                { key: 'place/place10', alt: '대기실 · 2019 대한민국 메디컬 헬스케어 치과부문 대상 현판' },
              ].map((f) => (
                <Figure key={f.key} fig={f} sizes="25vw" />
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section bg-canvas">
          <div className="wrap grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div className="reveal">
              <p className="eyebrow">FAQ</p>
              <h2 className="display-sm mt-4">
                광화문선치과에
                <br />
                <span className="accent">자주 묻는 질문</span>
              </h2>
              <p className="lead mt-4">진료시간·주차·임플란트·턱관절·건강보험·수면치료. 더 많은 문답은 FAQ 페이지에 있습니다.</p>
              <Link href="/faq" className="btn-ghost mt-6">전체 FAQ 보기</Link>
            </div>
            <div className="reveal">
              <FaqList items={HOME_FAQ} />
            </div>
          </div>
        </section>

        {/* ── 오시는 길 · 진료시간 ── */}
        <section className="section" id="visit">
          <div className="wrap">
            <div className="reveal mx-auto max-w-[760px] text-center">
              <p className="eyebrow justify-center">VISIT US</p>
              <h2 className="display-sm mt-4">
                광화문역 <span className="accent">6번 출구 도보 2분</span>, 광화문선치과
              </h2>
            </div>
            <div className="reveal mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="card overflow-hidden">
                <iframe
                  title="광화문선치과 지도"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`)}&z=17&output=embed&hl=ko`}
                  className="h-[380px] w-full border-0 lg:h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="grid gap-4">
                <div className="card p-6">
                  <p className="text-[13px] font-bold tracking-wide text-ink-muted">진료시간</p>
                  <ul className="mt-3 divide-y divide-hairline">
                    {HOURS.display.map((h) => (
                      <li key={h.label} className="flex items-center justify-between py-2.5 text-[15px]">
                        <span className="font-semibold text-ink">
                          {h.label}
                          {h.note && <span className="ml-2 pill-sun !py-0.5 !text-[11px]">{h.note}</span>}
                        </span>
                        <span className="font-bold tabular-nums text-brand-800">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[13px] text-ink-muted">{HOURS.closed}</p>
                </div>
                <a href={CLINIC.phoneHref} className="rounded-2xl bg-brand-700 p-6 text-white transition-colors hover:bg-brand-800">
                  <p className="text-[13px] text-white/70">전화 문의 · 예약</p>
                  <p className="mt-1 text-[1.8rem] font-extrabold tracking-tight">{CLINIC.phone}</p>
                </a>
                <div className="card p-5 text-[14px] text-ink-soft">
                  <p>
                    <span className="font-bold text-ink">주소</span> {CLINIC.address.full} ({CLINIC.address.landmark})
                  </p>
                  <p className="mt-1.5">
                    <span className="font-bold text-ink">지하철</span> {CLINIC.transit.map((t) => `${t.line} ${t.station} ${t.exit} ${t.walk}`).join(' · ')}
                  </p>
                  <p className="mt-1.5">
                    <span className="font-bold text-ink">주차</span> {CLINIC.parking.place} {CLINIC.parking.fee}
                  </p>
                  <Link href="/visit" className="mt-3 inline-block font-bold text-brand-700 hover:underline">
                    {MONTHLY_NOTICE.title} 보기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContactBand />
        <div className="py-8">
          <MedicalNotice />
        </div>
      </main>
    </>
  );
}
