import { CLINIC } from '@/lib/clinic';


/**
 * (2026-10-26 고정 무대 HomeStage 는 원장 PPT 3쪽·오너 "삭제해"로 뺐다 — 지금은 HomeStats 만)
 * 홈의 스크롤 연동 구역 세 가지 — 레퍼런스(one-dental)의 숫자 세기(dwc-counter) · 고정 무대(sd-stage) · 가로 흐름을
 * 광화문선치과의 **사실**만으로 옮겼다. 숫자는 lib/clinic·doctors·nav 에서 세고, 무대의 단계 글은 내비게이션 임플란트 문서의
 * 'process' 블록을 그대로 쓴다(글 중복 0). 동작은 RevealScript 가 붙인다.
 */

/**
 * 오시는 길 숫자 — 2026-09-29 원장 피드백 4번: 강점 구역의 숫자 카드('6가지 시스템'·'3분야')가 "의미 없는 숫자"라 싫다 →
 * 홈 맨 아래 오시는 길로 내리고, 찾아오는 데 실제로 쓰는 숫자(역·출구·야간·토요 진료)만 남겼다. 올라가며 세는 효과(data-count)도 뺐다.
 * 값은 전부 lib/clinic.ts 에서 읽는다.
 */
export function HomeStats() {
  const walkOf = (i: number) => Number((CLINIC.transit[i].walk.match(/\d+/) ?? ['0'])[0]);
  const city = CLINIC.transit.find((t) => t.station !== CLINIC.transit[0].station);
  const stats = [
    { n: walkOf(0), unit: '분', label: `${CLINIC.transit[0].station} ${CLINIC.transit[0].exit} 도보` },
    ...(city ? [{ n: walkOf(CLINIC.transit.indexOf(city)), unit: '분', label: `${city.station} ${city.exit} 도보` }] : []),
    { n: 21, unit: '시', label: '화 · 목 야간진료 (21:00 까지)' },
    { n: 14, unit: '시', label: '토요일 진료 (격주, 14:00 까지)' },
  ];
  return (
    <ul className="reveal-stack mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <li key={s.label} className="card px-6 py-6">
          <p className="flex items-baseline gap-1 text-brand-800">
            <span className="text-[2.2rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums md:text-[2.5rem]">
              {s.n}
            </span>
            <span className="text-[1.05rem] font-bold text-sun-600">{s.unit}</span>
          </p>
          <p className="mt-2 text-[15.5px] text-ink-soft">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

/* 홈 둘러보기 띠(HomeTourPan)는 2026-09-21 오너 지시로 뺐다 — 사진은 /about#tour 에 그대로. 되살리려면 git 이력 */
