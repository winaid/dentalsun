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
    desc: '모의수술로 정한 자리에 식립합니다.',
    alt: '광화문선치과 수술실에서 무영등 아래 임플란트 수술을 진행하는 의료진',
    /** 사진이 보이는 자리 — 넓은 화면은 글 자리를 비우려 오른쪽으로, 좁은 화면은 사람이 잘리지 않게 */
    fit: 'object-[56%_50%] md:object-[58%_50%]',
    /* 첫 문장(후킹)은 오너가 준 문구 그대로. ⚠️ 15년 · 5,000건 은 병원이 확인한 숫자여야 한다(허위·과장 광고 금지) */
    title: (
      <>
        바른 진료 <span className="accent-sun">15년</span>,
        <br className="sm:hidden" /> 결과는 오래도록.
      </>
    ),
    lead: '턱관절 5,000건+ & 고난도 풀아치·임플란트 전문 광화문선치과',
  },
  {
    key: 'sun/hero-scan',
    label: '3D 디지털 진단',
    desc: '구강스캐너와 3D CT 로 미리 확인합니다.',
    alt: '구강스캐너로 치아를 스캔하고 모니터에 3D 모형이 뜨는 광화문선치과 진료 장면',
    fit: 'object-[30%_50%] md:object-[62%_50%]',
    title: (
      <>
        3D 로 미리 보고 계획하는
        <br />
        <span className="accent-sun">디지털</span> 임플란트
      </>
    ),
    lead: '구강스캐너와 3D CT 로 뼈와 신경 위치를 확인하고, 모의수술로 정한 자리에 식립합니다.',
  },
  {
    key: 'sun/hero-tmj',
    label: '턱관절 치료',
    desc: '왜 아픈지부터 그림으로 설명합니다.',
    alt: '턱관절 구조 그림을 화면에 띄우고 두개골 모형으로 환자에게 설명하는 광화문선치과 원장',
    fit: 'object-[72%_50%] md:object-[62%_50%]',
    title: (
      <>
        턱에서 소리가 나고 아프다면
        <br />
        <span className="accent-sun">원인</span>부터 찾습니다
      </>
    ),
    lead: '턱관절은 원인이 여러 가지라 진단이 먼저입니다. 확인한 원인에 맞춰 단계적으로 치료합니다.',
  },
];

const DURATION = 6500;

/** 오시는 길 — 같은 역·같은 출구는 한 줄로 묶는다 (시청역 1·2호선). 값은 lib/clinic.ts 하나뿐. */
const STATIONS = CLINIC.transit.reduce<Array<{ station: string; exit: string; walk: string; lines: Array<{ n: string; color: string }> }>>((acc, t) => {
  const n = t.line.replace('호선', '');
  const hit = acc.find((s) => s.station === t.station && s.exit === t.exit);
  if (hit) hit.lines.push({ n, color: t.color });
  else acc.push({ station: t.station, exit: t.exit, walk: t.walk, lines: [{ n, color: t.color }] });
  return acc;
}, []);

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
          <div
            key={s.key}
            className={`absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(0.33,0,0.2,1)] ${n === i ? 'opacity-100' : 'opacity-0'}`}
          >
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

      <div className="wrap relative flex flex-1 flex-col justify-center pt-[132px] pb-[150px] md:pt-[150px] md:pb-[230px] lg:pb-[220px]">
        <div className="max-w-[1000px]" data-scroll-fade>
          <p className="eyebrow on-dark hero-in">
            SUN DENTAL CLINIC<span className="hidden sm:inline"> · 광화문역 6번 출구 도보 2분</span>
          </p>
          {/* 장면이 바뀌면 글도 같이 바뀐다 — key 를 바꿔 다시 그리면서 짧게 올라온다 */}
          <div key={i} className="hero-swap">
            <h1 className="display mt-6 text-balance !text-white on-photo">{SLIDES[i].title}</h1>
            <p className="mt-7 text-[1.05rem] leading-[1.85] text-white/75 md:text-[1.1rem]">{SLIDES[i].lead}</p>
          </div>
          {/* 예약 두 갈래 — 왼쪽은 네이버 예약(플레이스와 연결), 오른쪽은 네이버 톡톡 상담.
              폰에서는 아래 빠른메뉴(전화·예약·상담·오시는 길)가 같은 일을 하므로 감춘다(오너) */}
          <div className="mt-10 hidden gap-3 hero-in hero-in-4 sm:flex sm:flex-wrap sm:gap-3.5">
            <a
              href={CLINIC.booking.naver}
              target="_blank"
              rel="noopener"
              className="btn-sun !gap-2 !px-4 !py-[16px] !text-[15.5px] !shadow-[0_14px_34px_rgba(242,111,30,0.35)] sm:!min-w-[186px] sm:!gap-2.5 sm:!px-7 sm:!py-[16px] sm:!text-[16px]"
            >
              {/* 흰 네모 안의 초록 N 은 주황 버튼 위에서 겉돌아 뺐다(오너 지적) — 글자와 같은 흰 선 아이콘 */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M7 3v3m10-3v3M4 8.5h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 13.5l2 2 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              네이버 예약
            </a>
            <a
              href={CLINIC.booking.naverTalk}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/95 px-4 py-[16px] text-[15.5px] font-bold text-brand-800 shadow-[0_14px_34px_rgba(9,14,35,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white sm:min-w-[186px] sm:gap-2.5 sm:px-7 sm:py-[16px] sm:text-[16px]"
            >
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#03C75A] text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 4c-4.7 0-8.5 3-8.5 6.8 0 2.4 1.6 4.5 4 5.7L6.8 20l4-2.4c.4 0 .8.1 1.2.1 4.7 0 8.5-3 8.5-6.8S16.7 4 12 4z" fill="currentColor" />
                </svg>
              </span>
              톡톡 상담
            </a>
          </div>
        </div>
      </div>

      {/* 아래 띠 — 장면 고르기(사진이 바뀐다) + 진료시간 */}
      {/* 좁은 화면에서는 아래 빠른메뉴(72px) 위에 얹는다 */}
      <div className="hero-bar absolute inset-x-0 bottom-[72px] z-10 border-t border-white/12 bg-night/35 backdrop-blur-md md:bottom-0">
        <div className="wrap grid gap-x-10 lg:grid-cols-[1fr_auto]">
          {/* 좁은 화면 — 점과 지금 장면 이름만 */}
          <div className="flex items-center gap-3.5 py-4 md:hidden">
            <span className="flex items-center gap-1.5">
              {SLIDES.map((s, n) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`${s.label} 장면 보기`}
                  aria-current={n === i}
                  className={`h-[7px] rounded-full transition-all duration-500 ${n === i ? 'w-7 bg-sun-500' : 'w-[7px] bg-white/30'}`}
                />
              ))}
            </span>
            <span key={i} className="hero-swap text-[15px] font-bold text-white">{SLIDES[i].label}</span>
          </div>

          <ul className="hidden grid-cols-3 md:grid">
            {SLIDES.map((s, n) => (
              <li key={s.key} className="relative">
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={n === i}
                  aria-label={`${s.label} 장면 보기`}
                  className="group relative block w-full cursor-pointer overflow-hidden py-5 pr-6 text-left md:py-6"
                >
                  {/* 고른 자리는 아래에서 옅은 빛이 올라온다 */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-0 bottom-0 top-px bg-[radial-gradient(130%_120%_at_50%_100%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_62%)] transition-opacity duration-700 ${
                      n === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    }`}
                  />
                  {/* 진행 막대 — 이 장면이 머무는 동안 왼쪽에서 오른쪽으로 찬다 */}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-white/10">
                    {n === i && <span key={i} className="hero-rail block h-[2px] bg-sun-500 shadow-[0_0_12px_rgba(242,111,30,0.6)]" />}
                  </span>
                  <span className="relative flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                        n === i ? 'border-sun-500' : 'border-white/30 group-hover:border-white/60'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full bg-sun-500 transition-transform duration-500 ${n === i ? 'scale-100' : 'scale-0'}`}
                      />
                    </span>
                    <span className={`text-[13px] font-bold tabular-nums tracking-[0.18em] transition-colors duration-500 ${n === i ? 'text-sun-400' : 'text-white/35'}`}>
                      {String(n + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[15px] font-bold transition-all duration-500 md:text-[17px] ${
                        n === i ? 'translate-x-0 text-white' : '-translate-x-0.5 text-white/60 group-hover:translate-x-0 group-hover:text-white/90'
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
                  {/* 넓은 화면에서만 이름 아래로 들여쓴다 — 좁으면 들여쓴 만큼 글이 두 줄로 접힌다 */}
                  <span
                    className={`relative mt-2 hidden text-[13.5px] leading-[1.55] transition-colors duration-500 md:block 2xl:pl-[62px] 2xl:text-[14.5px] ${
                      n === i ? 'text-white/75' : 'text-white/40'
                    }`}
                  >
                    {s.desc}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-8 border-l border-white/12 py-6 pl-10 lg:flex">
            <div>
              <p className="text-[12.5px] font-bold tracking-[0.16em] text-white/45">진료시간</p>
              {/* 네 줄 모두 보여 준다 — 점심시간과 토요일(2·4주)을 빼면 잘못 알고 오신다(오너) */}
              <ul className="mt-2.5 space-y-1.5 text-[14.5px]">
                {HOURS.display.map((h) => (
                  <li key={h.label} className="flex items-center justify-between gap-7">
                    <span className="text-white/55">
                      {h.label}
                      {h.short && <span className="ml-1.5 text-[12px] font-semibold text-sun-400">{h.short}</span>}
                    </span>
                    <span className="font-semibold tabular-nums text-white/90">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] text-white/40">{HOURS.closed}</p>
            </div>
            {/* 전화번호는 머리말 오른쪽에 늘 있으니 여기는 역·주차 안내(오너 지시) */}
            <Link
              href="/visit"
              className="group rounded-2xl border border-white/15 bg-white/5 px-6 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
            >
              <span className="block text-[12.5px] font-bold tracking-[0.16em] text-white/45">오시는 길</span>
              <ul className="mt-2.5 space-y-1.5 text-[14.5px]">
                {STATIONS.map((s) => (
                  <li key={s.station} className="flex items-center gap-2.5">
                    <span className="flex gap-1">
                      {s.lines.map((l) => (
                        <span
                          key={l.n}
                          className="flex h-[21px] w-[21px] items-center justify-center rounded-full text-[11.5px] font-extrabold text-white"
                          style={{ background: l.color }}
                        >
                          {l.n}
                        </span>
                      ))}
                    </span>
                    <span className="font-semibold text-white/90">{s.station}</span>
                    <span className="text-white/55">
                      {s.exit} · {s.walk}
                    </span>
                  </li>
                ))}
                <li className="text-[13.5px] text-white/45">
                  {CLINIC.parking.place} {CLINIC.parking.fee}
                </li>
              </ul>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
