'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLINIC, HOURS } from '@/lib/clinic';
import { figSrc } from '@/lib/docs';

/**
 * 홈 첫 화면 — 전폭 실사 한 장이 화면을 채우고, 아래 띠에서 장면이 바뀐다.
 *
 * ★ 사진은 전부 오너가 준 병원 실사(sega8074)다. AI 사진·스톡 사진을 쓰지 않는다.
 * ★ 영상이 없어 사진으로 대신한다 — 켄번스(천천히 다가옴) + 6.5초 교차로 영상처럼 보이게 한다.
 * ★ 문구는 lib/clinic.ts 의 사실과 실제 진료 내용만 쓴다. 효과·최상급 표현 금지(의료광고).
 */
const SLIDES = [
  {
    key: 'sun/hero-surgery',
    label: '가이드 임플란트 수술',
    desc: '모의수술로 정한 위치 그대로, 수술 가이드를 대고 식립합니다.',
    alt: '광화문선치과 수술실에서 무영등 아래 임플란트 수술을 진행하는 의료진',
    /** 사진이 보이는 자리 — 넓은 화면은 글 자리를 비우려 오른쪽으로, 좁은 화면은 사람이 잘리지 않게 */
    fit: 'object-[56%_50%] md:object-[58%_50%]',
  },
  {
    key: 'sun/hero-scan',
    label: '3D 디지털 진단',
    desc: '구강스캐너와 3D CT 로 입안을 그대로 옮겨 계획을 세웁니다.',
    alt: '구강스캐너로 치아를 스캔하고 모니터에 3D 모형이 뜨는 광화문선치과 진료 장면',
    fit: 'object-[30%_50%] md:object-[62%_50%]',
  },
  {
    key: 'sun/hero-loupe',
    label: '확대경 정밀 진료',
    desc: '육안으로 놓치기 쉬운 부분까지 확대해 보며 치료합니다.',
    alt: '확대경을 착용하고 파노라마 사진을 띄운 채 진료하는 광화문선치과 원장',
    fit: 'object-[68%_50%] md:object-[60%_50%]',
  },
];

const DURATION = 6500;

export function HomeHero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [i]);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-white" data-hero-full>
      {/* 배경 사진 — 한 장씩 천천히 바뀐다 */}
      <div className="absolute inset-0 -z-10">
        {SLIDES.map((s, n) => (
          <div key={s.key} className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${n === i ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={figSrc(s.key)}
              alt={n === i ? s.alt : ''}
              fill
              priority={n === 0}
              sizes="100vw"
              className={`object-cover ${s.fit} ${n === i ? 'hero-zoom' : ''}`}
            />
          </div>
        ))}
        {/* 글 자리만 어둡게 — 오른쪽 사진은 그대로 보인다 */}
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/72 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/55 via-transparent to-night/80" />
        {/* 좁은 화면은 글이 사진 위를 가로지르므로 한 겹 더 덮는다 */}
        <div className="absolute inset-0 bg-night/35 md:hidden" />
      </div>

      <div className="wrap relative flex flex-1 flex-col justify-center pt-[132px] pb-[150px] md:pt-[150px] md:pb-[210px] lg:pb-[190px]">
        <div className="max-w-[880px]" data-scroll-fade>
          <p className="eyebrow on-dark hero-in">
            SUN DENTAL CLINIC<span className="hidden sm:inline"> · 광화문역 6번 출구 도보 2분</span>
          </p>
          <h1 className="display mt-6 !text-white hero-in hero-in-2 on-photo">
            더 빠르고, 정확하게,
            <br />
            그리고 <span className="accent-sun">편안하게</span>
            <br />
            {CLINIC.tagline}
          </h1>
          <p className="mt-7 max-w-[620px] text-[1.05rem] leading-[1.85] text-white/75 hero-in hero-in-3 md:text-[1.1rem]">
            강남성심병원 외래교수 출신 전문의가 이해하기 쉬운 설명과 불편함을 줄인 진료 시스템으로 함께합니다.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 hero-in hero-in-4">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">
              네이버 예약
            </a>
            <Link href="/treatment" className="btn-ghost-dark">
              진료 안내 보기
            </Link>
          </div>
        </div>
      </div>

      {/* 아래 띠 — 장면 고르기(사진이 바뀐다) + 진료시간 */}
      {/* 좁은 화면에서는 아래 빠른메뉴(64px) 위에 얹는다 */}
      <div className="absolute inset-x-0 bottom-[64px] z-10 border-t border-white/12 bg-night/35 backdrop-blur-md md:bottom-0">
        <div className="wrap grid gap-x-10 lg:grid-cols-[1fr_auto]">
          {/* 좁은 화면 — 점과 지금 장면 이름만 */}
          <div className="flex items-center gap-3 py-3.5 md:hidden">
            <span className="flex items-center gap-1.5">
              {SLIDES.map((s, n) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`${s.label} 장면 보기`}
                  aria-current={n === i}
                  className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-sun-500' : 'w-1.5 bg-white/30'}`}
                />
              ))}
            </span>
            <span className="text-[14px] font-bold text-white">{SLIDES[i].label}</span>
          </div>

          <ul className="hidden grid-cols-3 md:grid">
            {SLIDES.map((s, n) => (
              <li key={s.key} className="relative">
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={n === i}
                  aria-label={`${s.label} 장면 보기`}
                  className="group block w-full py-4 pr-4 text-left md:py-5"
                >
                  {/* 진행 막대 — 이 장면이 머무는 동안 왼쪽에서 오른쪽으로 찬다 */}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/12">
                    {n === i && <span key={i} className="hero-rail block h-px bg-sun-500" />}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                        n === i ? 'border-sun-500' : 'border-white/30 group-hover:border-white/60'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full transition-all ${n === i ? 'bg-sun-500' : 'bg-transparent'}`} />
                    </span>
                    <span className={`text-[14px] font-bold transition-colors md:text-[15.5px] ${n === i ? 'text-white' : 'text-white/60 group-hover:text-white/85'}`}>
                      {s.label}
                    </span>
                  </span>
                  <span className={`mt-1.5 hidden pl-[28px] text-[13.5px] leading-[1.5] transition-colors md:block ${n === i ? 'text-white/70' : 'text-white/40'}`}>
                    {s.desc}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-7 border-l border-white/12 py-5 pl-10 lg:flex">
            <div>
              <p className="text-[12px] font-bold tracking-[0.14em] text-white/45">진료시간</p>
              <ul className="mt-2 space-y-1 text-[13.5px]">
                {HOURS.display.slice(0, 3).map((h) => (
                  <li key={h.label} className="flex items-center justify-between gap-6">
                    <span className="text-white/55">{h.label}</span>
                    <span className="font-semibold tabular-nums text-white/90">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={CLINIC.phoneHref} className="flex flex-col items-start rounded-2xl border border-white/15 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10">
              <span className="text-[12px] font-bold tracking-[0.14em] text-white/45">대표전화</span>
              <span className="mt-1 text-[18px] font-extrabold tabular-nums">{CLINIC.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
