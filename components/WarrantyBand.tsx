import Image from 'next/image';
import Link from 'next/link';
import { figSrc } from '@/lib/docs';

/**
 * 홈 보증 기간 띠 — 2026-10-07 원장 PPT 62쪽 '추가 희망'(예시: 본플란트치과 띠). 카톡 보증서 줄은 '지우기' → 뺐다.
 * 제목과 맨 아래 단서는 PPT 글자 그대로(제목 끝 마침표만 다른 제목들처럼 뺐다).
 * 숫자·구간은 우리 보증표(lib/content/implant.ts 보증제도 table) 값 — 남의 병원 예시 값이 아니다. 표가 바뀌면 SPANS 도 같이 바꾼다.
 *
 * 2026-10-07 오너 "여기도 좀 모션 그래픽 넣고 디자인 다시 보완하고" —
 *  ① 10년 메달: 테두리가 그려지고(ring-arc) 빛 한 점이 돌며(ring-comet), 숫자가 0부터 세어 올라간다(data-count).
 *  ② 기간별 지원을 계단 막대로: 폭 = 기간, 높이 = 지원 비율. 차례로 솟는다(wr-bar).
 *     10년이 전부 무상이 아니라 무상 → 50 · 30 · 15% 로 줄어든다는 것을 그림으로 보여 줘 과장으로 읽히지 않게 한다.
 */
type Span = { yrs: number; pct: number; label: string };
const STEPS: Array<{ label: string; years: number; from: string; spans: Span[] }> = [
  {
    label: '임플란트',
    years: 10,
    from: '장착일부터',
    spans: [
      { yrs: 2, pct: 100, label: '무상' },
      { yrs: 2, pct: 50, label: '50%' },
      { yrs: 3, pct: 30, label: '30%' },
      { yrs: 3, pct: 15, label: '15%' },
    ],
  },
  {
    label: '임플란트 보철',
    years: 5,
    from: '장착일부터',
    spans: [
      { yrs: 1, pct: 100, label: '무상' },
      { yrs: 1, pct: 50, label: '50%' },
      { yrs: 1, pct: 30, label: '30%' },
      { yrs: 2, pct: 15, label: '15%' },
    ],
  },
  {
    label: '보존 · 보철 치료',
    years: 5,
    from: '치료일부터',
    spans: [
      { yrs: 1, pct: 100, label: '무상' },
      { yrs: 1, pct: 50, label: '50%' },
      { yrs: 1, pct: 30, label: '30%' },
      { yrs: 2, pct: 15, label: '15%' },
    ],
  },
];

/* 막대 색 — 지원이 줄수록 옅은 주황(불투명). 반투명으로 칠하면 남색 바탕 위에서 갈색으로 탁해졌다 */
const BAR = ['from-sun-600 to-sun-400', 'from-sun-500 to-sun-300', 'from-sun-400 to-sun-200', 'from-sun-300 to-sun-100'];

/** 계단 막대 — 폭은 기간, 높이는 지원 비율. 아래 눈금은 구간 경계의 해 */
function StepChart({ spans, years, from, c, tall = false }: { spans: Span[]; years: number; from: string; c: number; tall?: boolean }) {
  const edges = spans.reduce<number[]>((a, s) => [...a, a[a.length - 1] + s.yrs], [0]);
  const desc = `${from} ` + spans.map((s, i) => `${edges[i] === 0 ? '' : `${edges[i]}~`}${edges[i + 1]}년 ${s.label === '무상' ? '무상' : `${s.label} 지원`}`).join(', ');
  return (
    <div className="w-full">
      <p className="sr-only">{desc}</p>
      <div aria-hidden className={`flex items-end gap-[3px] pt-6 ${tall ? 'h-[112px]' : 'h-[88px]'}`}>
        {spans.map((s, i) => (
          <div key={i} className="relative h-full" style={{ flex: s.yrs }}>
            <div
              className={`wr-bar absolute inset-x-0 bottom-0 rounded-t-[6px] bg-gradient-to-t ${BAR[i] ?? BAR[BAR.length - 1]}`}
              style={{ height: `${s.pct}%`, ['--c' as string]: c, ['--i' as string]: i }}
            />
            <span
              className="wr-lab absolute inset-x-0 text-center text-[11.5px] font-bold text-white/90 md:text-[12px]"
              style={{ bottom: `calc(${s.pct}% + 4px)`, ['--c' as string]: c, ['--i' as string]: i }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div aria-hidden className="relative mt-1.5 h-4 border-t border-white/20 text-[11px] tabular-nums text-white/45">
        {edges.map((e, i) => (
          <span
            key={i}
            className="absolute top-1"
            style={i === 0 ? { left: 0 } : i === edges.length - 1 ? { right: 0 } : { left: `${(e / years) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {i === edges.length - 1 ? `${e}년` : e}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WarrantyBand() {
  const [main, ...rest] = STEPS;
  return (
    <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-28">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc('place2/treatment-bays')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-30" data-parallax="0.2" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/75 to-night/95" />
        {/* 메달 뒤 주황 빛 — 숨 쉬듯 */}
        <div className="wr-glow absolute left-1/2 top-[300px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_closest-side,rgba(242,111,30,0.28),transparent)] md:top-[330px]" />
      </div>
      <div className="wrap">
        <div className="reveal mx-auto max-w-[880px] text-center">
          <p className="eyebrow on-dark justify-center">WARRANTY</p>
          <h2 className="display-sm mt-4 !text-white on-photo">
            치료에 대한 자신감,
            <br />
            보증기간으로 약속합니다
          </h2>

          {/* 10년 메달 */}
          <div className="relative mx-auto mt-10 h-[208px] w-[208px] md:h-[236px] md:w-[236px]">
            <span aria-hidden className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),rgba(255,255,255,0.03)_70%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[2px]" />
            <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full -rotate-90 overflow-visible">
              <defs>
                <linearGradient id="wr-arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffb68a" />
                  <stop offset="1" stopColor="#f26f1e" />
                </linearGradient>
              </defs>
              {/* 바깥 점선 고리 — 천천히 돈다 */}
              <g className="wr-spin">
                <circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" strokeDasharray="0.6 2.4" />
              </g>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" />
              <circle className="ring-arc" pathLength={100} cx="50" cy="50" r="42" fill="none" stroke="url(#wr-arc)" strokeWidth="2.4" strokeLinecap="round" />
              <g className="ring-comet">
                <circle cx="50" cy="50" r="42" fill="none" pathLength={100} stroke="rgba(255,255,255,0.35)" strokeWidth="2.4" strokeDasharray="14 86" strokeLinecap="round" />
                <circle className="ring-comet-head" cx="50" cy="50" r="42" fill="none" pathLength={100} stroke="#fff" strokeWidth="3" strokeDasharray="1.2 98.8" strokeDashoffset="-12.8" strokeLinecap="round" />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-white/80 md:text-[16px]">{main.label}</span>
              <span className="mt-0.5 flex items-baseline">
                <span data-count={main.years} className="text-[72px] font-extrabold leading-none tracking-[-0.04em] text-sun-300 tabular-nums md:text-[86px]">
                  {main.years}
                </span>
                <span className="ml-1 text-[20px] font-bold md:text-[22px]">년</span>
              </span>
              <span className="mt-1 text-[12.5px] font-semibold text-white/55">{main.from}</span>
            </div>
          </div>

          {/* 10년이 어떻게 나뉘는지 */}
          <div className="mx-auto mt-8 max-w-[560px]">
            <StepChart spans={main.spans} years={main.years} from={main.from} c={0} tall />
          </div>

          {/* 5년 두 가지 */}
          <ul className="mx-auto mt-10 grid max-w-[680px] gap-3 sm:grid-cols-2">
            {rest.map((s, k) => (
              <li key={s.label} className="wr-card rounded-[22px] border border-white/12 bg-white/[0.06] px-5 pb-4 pt-5 text-left backdrop-blur-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[15px] font-bold text-white/90 md:text-[16px]">{s.label}</p>
                  <p className="text-[15px] text-white/80">
                    <span data-count={s.years} className="mr-0.5 align-[-0.08em] text-[40px] font-extrabold leading-none text-sun-300 tabular-nums md:text-[44px]">
                      {s.years}
                    </span>
                    년
                  </p>
                </div>
                <p className="mt-0.5 text-[12.5px] text-white/50">{s.from}</p>
                <div className="mt-1">
                  <StepChart spans={s.spans} years={s.years} from={s.from} c={k + 1} />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-[14px] text-white/65 md:text-[15px]">기간에 따라 무상 · 50% · 30% · 15%로 나눠 지원합니다.</p>
          <p className="mx-auto mt-2 max-w-[640px] text-balance text-[15px] font-bold leading-[1.7] text-white md:text-[16px]">(단, 본원의 치료계획을 준수하고 정기검진을 지속적으로 받는 경우에 한합니다)</p>
          <div className="mt-8 flex justify-center">
            <Link href="/treatment/implant/warranty" className="btn-sun">보증표 자세히 보기</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
