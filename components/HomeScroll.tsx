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
    <ul className="reveal-stack mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <li key={s.label} className="card card-3d px-6 py-7">
          <p className="flex items-baseline gap-1 text-brand-800">
            <span className="text-[2.6rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums md:text-[3rem]" data-count={s.n}>
              {s.n}
            </span>
            <span className="text-[1.05rem] font-bold text-sun-600">{s.unit}</span>
          </p>
          <p className="mt-2 text-[14.5px] text-ink-soft">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * 고정 무대 사진 — 단계별.
 *  · 1단계는 실제 CT 촬영실 사진(옛 배너에서 잘라 낸 691px 짜리 천장 구석 사진을 2026-09-10 교체).
 *  · 2~4단계는 흰 바탕 제품 사진이라 잘라 채우지 않고 통째로 놓는다(fit='contain').
 */
const STAGE_IMG: Array<{ key: string; alt: string; fit: 'cover' | 'contain' }> = [
  { key: 'place/place08', alt: '광화문선치과 3D CT 촬영실', fit: 'cover' },
  { key: 'orig/misc-nav-implant-set', alt: '내비게이션 임플란트 모의수술 화면이 뜬 모니터·태블릿과 임플란트 모형', fit: 'contain' },
  { key: 'orig/intro-p05-group', alt: '당일 보철 제작 장비 — 3D 프린터·CAD 모니터·후처리기', fit: 'contain' },
  { key: 'equip/guide', alt: '하악 모형에 씌운 투명 수술 유도장치', fit: 'contain' },
];

export function HomeStage() {
  const doc = docByPath('/treatment/implant/navigation');
  const block = doc?.blocks.find((b): b is Extract<Block, { type: 'steps' }> => b.type === 'steps' && b.id === 'process');
  if (!block) return null;
  const steps = block.steps.slice(0, STAGE_IMG.length);
  return (
    <section className="section bg-canvas" data-stage>
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* 왼쪽 — 제목·설명 + 고정 무대. lg 이상에서는 열 전체가 화면 세로 가운데에 고정돼 스크롤 내내 제목이 사진 위에 남는다(오너 요청). */}
          <div>
            <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-start lg:pt-[112px]">
              <div className="reveal">
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
              {/*
                무대 — 장비 사진은 잘라 채우지 않고 통째로 놓는다(오너: 옆·아래가 잘려 나갔다).
                밋밋하지 않도록 옅은 빛 바탕 + 안쪽 테두리로 촬영 부스처럼 만들고,
                위에는 단계 진행 막대, 아래에는 지금 보고 있는 단계 이름을 띄운다.
              */}
              {/* 진행 막대는 사진 밖(설명 아래)에 둔다 — 사진 위에 얹으면 어두운 사진에서 안 보인다 */}
              <div aria-hidden className="mt-7 hidden gap-1.5 lg:flex">
                {STAGE_IMG.map((f) => (
                  <span key={f.key} data-stage-dot className="stage-dot h-[3px] flex-1 rounded-full" />
                ))}
              </div>
              <div className="stage-panel relative mt-4 hidden w-full aspect-[3/2] max-h-[52svh] overflow-hidden rounded-[28px] shadow-[var(--shadow-lift)] lg:block">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(115%_80%_at_50%_12%,#ffffff_0%,#f6f8fc_72%,#eceff6_100%)]" />
                {STAGE_IMG.map((f, i) => (
                  <div key={f.key} className="stage-img" data-stage-img>
                    <Image src={figSrc(f.key)} alt={f.alt} fill sizes="50vw" className={f.fit === 'cover' ? 'object-cover' : 'object-contain p-8 pb-20'} />
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-hairline bg-white/88 px-6 py-4 backdrop-blur-md">
                      <span className="shrink-0 text-[12px] font-extrabold tracking-[0.16em] text-sun-600">STEP {String(i + 1).padStart(2, '0')}</span>
                      <span className="truncate text-[15.5px] font-bold text-ink">{steps[i]?.title}</span>
                    </div>
                  </div>
                ))}
                <div aria-hidden className="pointer-events-none absolute inset-0 z-20 rounded-[28px] ring-1 ring-inset ring-ink/[0.08]" />
              </div>
            </div>
          </div>

          {/*
            오른쪽 — 단계 글 (모바일은 사진을 각 단계 아래에).
            단계가 바뀌는 속도 = 칸 하나가 차지하는 스크롤 높이(칸 높이 + 칸 사이 간격). 전에는 30vh(화면의 0.3배) 뿐이라
            구역이 화면 위에 붙는 순간 이미 2번 칸이 판정 띠(화면 가운데 42~58%)에 걸쳐 "도착하자마자 2번"이 됐다(오너).
            칸 36vh + 간격 16vh = 52vh(화면 반 바퀴)로 넓히고, 위 여백 34vh 는 구역이 붙는 그 순간 1번 칸이 띠에 걸리도록 맞춘 값이다.
            (아래 여백 36vh 는 마지막 칸도 앞 칸들만큼 머물다 고정이 풀리게 하는 값 — 숫자를 바꿀 땐 네 값을 함께 다시 맞춰야 한다)
          */}
          <ol className="lg:pt-[34vh] lg:pb-[36vh]">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="stage-step flex flex-col items-start gap-3.5 rounded-3xl px-5 py-6 md:gap-6 md:px-6 md:py-7 lg:my-[16vh] lg:min-h-[36vh] lg:flex-row lg:items-center lg:px-8 lg:py-8"
                data-stage-step
              >
                <span className="stage-badge shrink-0">STEP {String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[1.3rem] font-bold leading-snug text-ink md:text-[1.55rem]">{s.title}</h3>
                  {s.desc && (
                    <p className="mt-3 max-w-[560px] text-[16.5px] leading-[1.85] text-ink-soft">
                      <Sentences text={s.desc} />
                    </p>
                  )}
                  {/* 폰 — 무대와 같은 규칙(사진은 꽉, 흰 바탕 제품은 통째로) */}
                  <div className="relative mt-5 aspect-[3/2] overflow-hidden rounded-2xl border border-hairline bg-[radial-gradient(115%_80%_at_50%_12%,#ffffff_0%,#f2f5fa_100%)] lg:hidden">
                    <Image src={figSrc(STAGE_IMG[i]?.key ?? STAGE_IMG[0].key)} alt={STAGE_IMG[i]?.alt ?? ''} fill sizes="100vw" className={(STAGE_IMG[i]?.fit ?? 'contain') === 'cover' ? 'object-cover' : 'object-contain p-3'} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal mt-6 flex flex-wrap gap-3 lg:mt-2">
          <Link href="/treatment/implant/navigation" className="btn-brand">디지털 맞춤 임플란트 자세히</Link>
          <Link href="/treatment/implant" className="btn-ghost">임플란트 전체 안내</Link>
        </div>
      </div>
    </section>
  );
}

/* 홈 둘러보기 띠(HomeTourPan)는 2026-09-21 오너 지시로 뺐다 — 사진은 /about#tour 에 그대로. 되살리려면 git 이력 */
