import Image from 'next/image';
import Link from 'next/link';
import { figSrc } from '@/lib/docs';
import { Sentences } from '@/components/ui';

/**
 * 홈 보증 기간 띠 — 2026-10-07 원장 PPT 62쪽 '추가 희망'(예시: 본플란트치과 띠). 카톡 보증서 줄은 '지우기' → 뺐다.
 * 제목과 맨 아래 단서는 PPT 글자 그대로(제목 끝 마침표만 다른 제목들처럼 뺐다).
 * 기간은 우리 보증표(lib/content/implant.ts 보증제도 table) 값 — 남의 병원 예시 값이 아니다. 표가 바뀌면 ITEMS 도 같이 바꾼다.
 *
 * 2026-10-08 오너 "10년 해준다는 느낌인데 저렇게 나타내면 1년만 무상이네? 바로 알 수 있으니깐 수치만 나타내자.
 * 동그라미 모션그래픽 너무 자주 사용해서 다른 걸로 바꾸자" —
 *  · 계단 막대와 '무상 · 50 · 30 · 15%' 줄을 뺐다. 예시 띠처럼 기간 숫자만. 구간별 지원은 '보증표 자세히 보기' 쪽에 그대로 있다.
 *  · 동그라미 메달(테두리 그리기 · 빛 돌기)을 뺐다. 숫자가 슬롯처럼 굴러 멈추고(wr-odo), 멈춘 뒤 빛이 한 번 스친다(wr-sheen).
 *    선은 가로로 그어지고(wr-line) 두 칸 사이 세로선이 내려온다(wr-vline).
 */
const ITEMS = [
  { label: '임플란트', years: 10, from: '장착일부터' },
  { label: '임플란트 보철', years: 5, from: '장착일부터' },
  { label: '보존 · 보철 치료', years: 5, from: '치료일부터' },
];

/**
 * 굴러가는 숫자 — 자리마다 세로 띠를 두고 끝 숫자까지 밀어 올린다.
 * 일의 자리는 0 → 9 를 한 바퀴 돌고 멈춘다(10 은 0 에서, 5 는 5 에서). 십의 자리는 빈칸에서 시작한다.
 * 화면 읽기 프로그램에는 숫자 하나로(sr-only), 띠는 aria-hidden.
 */
function Odometer({ value, delay, className }: { value: number; delay: number; className: string }) {
  const digits = String(value).split('').map(Number);
  const cols = digits.map((d, i) => {
    const isOnes = i === digits.length - 1;
    const strip: string[] = isOnes ? [...'0123456789'.split(''), ...Array.from({ length: d + 1 }, (_, k) => String(k))] : [' ', ...Array.from({ length: d }, (_, k) => String(k + 1))];
    return strip;
  });
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {cols.map((strip, i) => (
          <span key={i} className="wr-odo-col">
            {/* 칸 폭 · 높이는 끝 숫자가 정한다(숫자마다 폭이 달라 띠 전체 폭을 쓰면 10 사이가 벌어진다) */}
            <span className="invisible">{strip[strip.length - 1]}</span>
            <span className="wr-odo" style={{ ['--to' as string]: strip.length - 1, ['--d' as string]: `${delay + (cols.length - 1 - i) * 0.12}s` }}>
              {strip.map((ch, k) => (
                <span key={k} className="wr-digit">
                  {ch}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {/* 멈춘 숫자 위를 지나가는 빛 — 같은 글자를 겹쳐 두고 가는 띠 모양으로만 보이게 가린다 */}
      <span aria-hidden className="wr-sheen" style={{ ['--d' as string]: `${delay + 1.9}s` }}>
        {value}
      </span>
    </span>
  );
}

export function WarrantyBand() {
  const [main, ...rest] = ITEMS;
  return (
    <section className="relative isolate overflow-hidden bg-night py-24 text-white md:py-28">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc('place2/treatment-bays')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-30" data-parallax="0.2" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/75 to-night/95" />
        {/* 10년 뒤 낮게 깔린 주황 빛 — 가로로 넓게, 숨 쉬듯 */}
        <div className="wr-glow absolute left-1/2 top-[250px] h-[300px] w-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(242,111,30,0.3),transparent)] md:top-[270px]" />
      </div>
      <div className="wrap">
        <div className="reveal mx-auto max-w-[880px] text-center">
          <p className="eyebrow on-dark justify-center">WARRANTY</p>
          <h2 className="display-sm mt-4 !text-white on-photo">
            치료에 대한 자신감,
            <br />
            보증기간으로 약속합니다
          </h2>

          {/* 임플란트 10년 */}
          <div className="mt-12 md:mt-14">
            <p className="text-[17px] font-bold text-white/85 md:text-[20px]">{main.label}</p>
            <p className="mt-1 flex items-baseline justify-center">
              <Odometer value={main.years} delay={0.5} className="text-[120px] font-extrabold tracking-[-0.05em] md:text-[168px]" />
              <span className="ml-1.5 text-[30px] font-bold md:text-[38px]">년</span>
            </p>
            <div className="mx-auto mt-3 flex max-w-[360px] items-center gap-4 text-[13.5px] font-semibold text-white/60 md:text-[14.5px]">
              <span aria-hidden className="wr-line wr-line-l h-px flex-1 bg-gradient-to-l from-sun-300/70 to-transparent" />
              {main.from}
              <span aria-hidden className="wr-line wr-line-r h-px flex-1 bg-gradient-to-r from-sun-300/70 to-transparent" />
            </div>
          </div>

          {/* 5년 두 가지 — 예시 띠처럼 칸 없이 가는 세로선으로만 나눈다 */}
          <div className="relative mx-auto mt-12 max-w-[620px] md:mt-14">
            <span aria-hidden className="wr-vline absolute bottom-2 left-1/2 top-2 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
            <ul className="grid grid-cols-2">
              {rest.map((s, k) => (
                <li key={s.label} className="px-2">
                  <p className="text-[15px] font-bold text-white/85 md:text-[17px]">{s.label}</p>
                  <p className="mt-1 flex items-baseline justify-center">
                    <Odometer value={s.years} delay={1.1 + k * 0.25} className="text-[64px] font-extrabold tracking-[-0.04em] md:text-[80px]" />
                    <span className="ml-1 text-[19px] font-bold md:text-[22px]">년</span>
                  </p>
                  <p className="mt-1 text-[12.5px] font-semibold text-white/50 md:text-[13.5px]">{s.from}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-12 max-w-[640px] text-balance text-[15px] font-bold leading-[1.7] text-white md:text-[16px]">
            <Sentences text="(단, 본원의 치료계획을 준수하고 정기검진을 지속적으로 받는 경우에 한합니다)" />
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/treatment/implant/warranty" className="btn-sun">보증표 자세히 보기</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
