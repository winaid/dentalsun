import Image from 'next/image';
import Link from 'next/link';
import { Sentences } from '@/components/ui';
import { figSrc, type Block } from '@/lib/docs';
import { docByPath } from '@/lib/content';
import { CLINIC } from '@/lib/clinic';
import { TREATMENT_HUBS } from '@/lib/nav';

/**
 * 홈의 스크롤 연동 구역 세 가지 — 레퍼런스(one-dental)의 숫자 세기(dwc-counter) · 고정 무대(sd-stage) · 가로 흐름을
 * 광화문선치과의 **사실**만으로 옮겼다. 숫자는 lib/clinic·doctors·nav 에서 세고, 무대의 단계 글은 내비게이션 임플란트 문서의
 * 'process' 블록을 그대로 쓴다(글 중복 0). 동작은 RevealScript 가 붙인다.
 */

/** 한눈에 보는 숫자 — 전부 사실 기록에서 센다 */
export function HomeStats() {
  const walk = Number((CLINIC.transit[0].walk.match(/\d+/) ?? ['2'])[0]);
  const stats = [
    { n: 6, unit: '가지', label: '3D 디지털 진료 시스템 (Point 01~06)' },
    { n: walk, unit: '분', label: `${CLINIC.transit[0].station} ${CLINIC.transit[0].exit} 도보` },
    { n: 21, unit: '시', label: '화·목 야간진료 (21:00 까지)' },
    { n: TREATMENT_HUBS.length, unit: '분야', label: '임플란트 · 턱관절 등 진료 분야' },
  ];
  return (
    <ul className="reveal-stack mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-4">
      {stats.map((s) => (
        <li key={s.label} className="bg-white px-6 py-7">
          <p className="flex items-baseline gap-1 text-brand-800">
            <span className="text-[2.6rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums md:text-[3rem]" data-count={s.n}>
              {s.n}
            </span>
            <span className="text-[1.05rem] font-bold text-sun-600">{s.unit}</span>
          </p>
          <p className="mt-2 text-[13.5px] text-ink-soft">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

/** 고정 무대 사진 — 단계별. 작은 옛 도해 대신 큰 사진(AI 정물 2 + 원본 장비 2). */
const STAGE_IMG = [
  { key: 'equip/scanner', alt: '3D 구강 스캐너로 촬영해 모니터에 뜬 스캔 데이터' },
  { key: 'orig/intro-p03-sim', alt: '임플란트 식립 경로를 분석하는 화면' },
  { key: 'equip/printer', alt: '3D 프린터와 보철 디자인 화면' },
  { key: 'equip/guide', alt: '하악 모형에 씌운 투명 수술 유도장치' },
];

export function HomeStage() {
  const doc = docByPath('/treatment/implant/navigation');
  const block = doc?.blocks.find((b): b is Extract<Block, { type: 'steps' }> => b.type === 'steps' && b.id === 'process');
  if (!block) return null;
  const steps = block.steps.slice(0, STAGE_IMG.length);
  return (
    <section className="section bg-canvas" data-stage>
      <div className="wrap">
        <div className="reveal max-w-[820px]">
          <p className="eyebrow">DIGITAL PROCESS</p>
          <h2 className="display-sm mt-4">
            내비게이션 임플란트, <span className="accent">이렇게 진행됩니다</span>
          </h2>
          {block.lead && (
            <p className="lead mt-4">
              <Sentences text={block.lead} />
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* 왼쪽 — 고정 무대 (lg 이상) */}
          <div className="hidden lg:block">
            <div className="sticky top-[120px]">
              <div className="relative aspect-[2/1] overflow-hidden rounded-[28px] bg-canvas-2 shadow-[var(--shadow-lift)]">
                {STAGE_IMG.map((f, i) => (
                  <div key={f.key} className="stage-img" data-stage-img>
                    <Image src={figSrc(f.key)} alt={f.alt} fill sizes="50vw" className="object-cover" />
                    <span className="absolute left-5 top-5 rounded-full bg-night/60 px-3 py-1.5 text-[12px] font-bold tracking-[0.12em] text-white backdrop-blur">
                      STEP {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 — 단계 글 (모바일은 사진을 각 단계 아래에) */}
          <ol className="lg:py-[8vh]">
            {steps.map((s, i) => (
              <li key={s.title} className="stage-step flex gap-5 border-t border-hairline py-9 md:gap-7 lg:min-h-[54vh] lg:py-12" data-stage-step>
                <span className="num shrink-0 !text-[1.6rem]">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[1.3rem] font-bold leading-snug text-ink md:text-[1.55rem]">{s.title}</h3>
                  {s.desc && (
                    <p className="mt-3 max-w-[560px] text-[15.5px] leading-[1.85] text-ink-soft">
                      <Sentences text={s.desc} />
                    </p>
                  )}
                  <div className="relative mt-5 aspect-[2/1] overflow-hidden rounded-2xl bg-canvas-2 lg:hidden">
                    <Image src={figSrc(STAGE_IMG[i]?.key ?? STAGE_IMG[0].key)} alt={STAGE_IMG[i]?.alt ?? ''} fill sizes="100vw" className="object-cover" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal mt-6 flex flex-wrap gap-3 lg:mt-2">
          <Link href="/treatment/implant/navigation" className="btn-brand">내비게이션 임플란트 자세히</Link>
          <Link href="/treatment/implant" className="btn-ghost">임플란트 전체 안내</Link>
        </div>
      </div>
    </section>
  );
}

/** 둘러보기 — 스크롤하는 만큼 사진 띠가 옆으로 흐른다. 알트는 사진에 실제로 보이는 것만. */
const TOUR = [
  { key: 'place/place01', alt: '광화문선치과 진료실 복도' },
  { key: 'place/place02', alt: '광화문선치과 1·2번 진료실' },
  { key: 'place/place06', alt: '광화문선치과 임플란트 수술실' },
  { key: 'place/place08', alt: '3D CT 촬영실' },
  { key: 'place/place04', alt: '물리치료실과 3번 진료실' },
  { key: 'place/place03', alt: '광화문선치과 진료실' },
  { key: 'place/place09', alt: '광화문선치과 대기실' },
];

export function HomeTourPan() {
  return (
    <div className="mt-10 overflow-hidden">
      <div className="flex w-max gap-4 px-5 sm:px-8 lg:px-12" data-hpan>
        {TOUR.map((f) => (
          <div key={f.key} className="relative aspect-[4/3] w-[72vw] max-w-[480px] shrink-0 overflow-hidden rounded-2xl bg-canvas-2">
            <Image src={figSrc(f.key)} alt={f.alt} fill sizes="480px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
