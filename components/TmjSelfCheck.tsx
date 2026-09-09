'use client';

import { useState } from 'react';
import { CLINIC } from '@/lib/clinic';

/**
 * 턱관절 자가 점검 — 여섯 항목에 표시하면 개수에 따라 안내가 바뀐다(레퍼런스 FAQ 의 체크리스트를 눌러 보는 카드로).
 * ★ 진단이 아니라 참고용 — 문구에 '검사를 권합니다' 이상은 쓰지 않는다(의료광고). 서버 전송 없음.
 */
export function TmjSelfCheck({ items }: { items: string[] }) {
  const [on, setOn] = useState<boolean[]>(() => items.map(() => false));
  const n = on.filter(Boolean).length;
  const toggle = (i: number) => setOn((v) => v.map((x, k) => (k === i ? !x : x)));
  const verdict =
    n === 0
      ? { tone: 'bg-canvas text-ink-soft', text: '해당하는 항목에 표시해 보세요. 두 가지 이상이면 검사를 권합니다.' }
      : n === 1
        ? { tone: 'bg-brand-50 text-brand-800', text: '한 가지가 해당됩니다. 증상이 이어지거나 커지면 검사를 받아 보세요.' }
        : { tone: 'bg-sun-50 text-sun-700', text: `${n}가지가 해당됩니다. 턱관절 검사를 받아 보시길 권합니다.` };
  return (
    {/* ★ 3D 기울기(card-3d)는 안 쓴다 — 읽으며 눌러야 하는 표라 흔들리면 방해된다(오너). 테두리만 진하게 */}
    <div className="card border-[1.5px] border-[#d9dde8] p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[1.2rem] font-extrabold text-ink md:text-[1.35rem]">내 턱, 지금 어떤가요?</p>
        <p className="text-[13px] font-bold tracking-[0.12em] text-sun-600">SELF CHECK · {n}/{items.length}</p>
      </div>
      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={it}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={on[i]}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-snug transition-colors ${on[i] ? 'border-sun-400 bg-sun-50 text-ink' : 'border-hairline bg-white text-ink-soft hover:border-brand-300'}`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[12px] font-extrabold ${on[i] ? 'border-sun-500 bg-sun-500 text-white' : 'border-hairline bg-white text-transparent'}`} aria-hidden>
                ✓
              </span>
              {it}
            </button>
          </li>
        ))}
      </ul>
      <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4 text-[15px] font-semibold leading-snug ${verdict.tone}`} aria-live="polite">
        <span>{verdict.text}</span>
        {n >= 2 && (
          <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun !px-4 !py-2 text-[14px]">검사 예약하기</a>
        )}
      </div>
      <p className="mt-3 text-[12.5px] text-ink-muted">※ 참고용 점검이며 진단이 아닙니다. 정확한 상태는 검사로 확인합니다.</p>
    </div>
  );
}
