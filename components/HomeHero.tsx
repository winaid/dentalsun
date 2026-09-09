import Link from 'next/link';
import Image from 'next/image';
import { Sentences } from '@/components/ui';
import { CLINIC, HOURS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { figSrc } from '@/lib/docs';

/**
 * 홈 첫 화면 — 레퍼런스처럼 사진이 또렷하게 보이는 전폭 배경 + 오른쪽에 떠 있는 사진 카드와 정보 칩.
 *
 * ★ 배경은 어둡게 뭉개지 않는다. 왼쪽 글 자리에만 남색 그라데이션을 깔고 오른쪽은 사진이 그대로 보인다.
 * ★ 오른쪽 빈 공간을 채우는 것: 진료 장면 사진 카드 + 진료시간 유리 카드 + 전문의 2인 칩 + 역 칩.
 *   전부 lib/clinic.ts·lib/doctors.ts 의 사실만 쓴다.
 */
const BACKDROPS = [
  { key: 'ai/hero-wide-1', alt: '' },
  { key: 'ai/hero-wide-2', alt: '' },
];

export function HomeHero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-white" data-hero-full>
      {/* 배경 — 두 장 교차, 천천히 다가옴 */}
      <div className="absolute inset-0 -z-10" data-parallax="0.25">
        {BACKDROPS.map((b, i) => (
          <div key={b.key} className="hero-slide" style={{ animationDuration: '16s', animationDelay: `${i * 8}s` }}>
            <Image src={figSrc(b.key)} alt={b.alt} fill priority={i === 0} sizes="100vw" className="object-cover object-center" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/10" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night to-transparent" />
        <div aria-hidden className="orb pointer-events-none absolute -bottom-40 left-[30%] h-[520px] w-[520px] rounded-full bg-sun-500/12 blur-3xl" />
      </div>

      <div className="wrap grid flex-1 items-center gap-12 pt-[120px] pb-24 md:pt-[150px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* 왼쪽 — 글 (스크롤하면 살짝 올라가며 옅어진다) */}
        <div data-scroll-fade>
          <p className="eyebrow on-dark hero-in">SUN DENTAL CLINIC · 광화문역 6번 출구 도보 2분</p>
          <h1 className="display mt-6 max-w-[760px] !text-white hero-in hero-in-2 on-photo">
            더 빠르고, 정확하게,
            <br />
            그리고 <span className="accent-sun">편안하게</span>
            <br />
            환자중심의 디지털 치과 진료
          </h1>
          <p className="mt-7 max-w-[600px] text-[1.05rem] leading-[1.85] text-white/80 hero-in hero-in-3 md:text-[1.12rem]">
            <Sentences text="강남성심병원 외래교수 출신 전문의가 이해하기 쉬운 설명과 불편함을 줄인 진료시스템으로 진료합니다. 디지털 임플란트와 턱관절 치료, MTA 신경치료로 자연치아를 지키는 광화문 선치과입니다." />
          </p>
          <div className="mt-10 flex flex-wrap gap-3 hero-in hero-in-4">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <Link href="/treatment" className="btn-ghost-dark">진료 안내 보기</Link>
          </div>
          <ul className="mt-12 flex flex-wrap gap-2.5 hero-in hero-in-4">
            {['통합치의학과 · 치과보철과 전문의', '3D 구강스캐너 · 3D CT · 수술 가이드', '무통마취기 · 에어플로우 · 수면치료'].map((t) => (
              <li key={t} className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[13.5px] font-semibold text-white/85 backdrop-blur">{t}</li>
            ))}
          </ul>
        </div>

        {/* 오른쪽 — 사진 카드 + 떠 있는 정보 */}
        <div className="relative hidden aspect-[5/4] w-full lg:block" data-tilt data-scroll-fade="0.6">
          <div data-tilt-item="10" className="hero-in hero-in-2 absolute top-0 right-0 h-[88%] w-[82%] overflow-hidden rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
            <Image src={figSrc('scene/loupe')} alt="확대경을 착용하고 임플란트 수술을 하는 광화문선치과 원장" fill priority sizes="(max-width: 1280px) 50vw, 700px" className="kenburns object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
            <p className="absolute top-5 right-5 rounded-full border border-white/20 bg-night/50 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-white/85 backdrop-blur">DIGITAL IMPLANT</p>
          </div>

          {/* 전문의 2인 칩 */}
          <div data-tilt-item="22" className="float-y hero-in hero-in-3 absolute top-[6%] left-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
            <span className="flex -space-x-3">
              {DOCTORS.map((d) => (
                <Image key={d.slug} src={d.photo} alt={d.name} width={40} height={40} className="h-10 w-10 rounded-full border-2 border-night object-cover object-top" />
              ))}
            </span>
            <span className="text-[13px] leading-tight">
              <span className="block font-bold">보건복지부 인증 전문의 2인</span>
              <span className="block text-white/65">통합치의학과 · 치과보철과</span>
            </span>
          </div>

          {/* 진료시간 유리 카드 */}
          <div data-tilt-item="18" className="float-y hero-in hero-in-4 absolute bottom-0 left-0 w-[46%] rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md" style={{ animationDelay: '-1.4s' }}>
            <p className="flex items-center gap-2 text-[12px] font-bold tracking-wide text-white/70">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              진료시간
            </p>
            <ul className="mt-3 space-y-1.5 text-[13.5px]">
              {HOURS.display.slice(0, 3).map((h) => (
                <li key={h.label} className="flex items-center justify-between gap-3">
                  <span className="text-white/80">{h.label}</span>
                  <span className="font-bold tabular-nums">{h.time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 inline-flex rounded-full bg-sun-500/90 px-2.5 py-1 text-[11px] font-bold">화·목 야간진료 21:00</p>
          </div>

          {/* 역 칩 */}
          <div data-tilt-item="26" className="float-y hero-in hero-in-4 absolute right-[4%] bottom-[4%] flex items-center gap-2.5 rounded-2xl border border-white/15 bg-night/70 px-4 py-3 backdrop-blur-md" style={{ animationDelay: '-2.6s' }}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: CLINIC.transit[0].color }}>5</span>
            <span className="text-[13px] leading-tight">
              <span className="block font-bold">{CLINIC.transit[0].station} {CLINIC.transit[0].exit}</span>
              <span className="block text-white/65">{CLINIC.transit[0].walk} · {CLINIC.parking.place} {CLINIC.parking.fee}</span>
            </span>
          </div>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60">
        <span className="scroll-hint block text-[11px] tracking-[0.3em]">SCROLL</span>
      </div>
    </section>
  );
}
