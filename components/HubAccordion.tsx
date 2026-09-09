import Image from 'next/image';
import Link from 'next/link';
import { figSrc } from '@/lib/docs';

/**
 * 진료과목 — 펼침 아코디언 띠(오너 선택). 8개 띠가 가로로 붙어 한 화면을 채운다.
 *  · 기본은 첫 띠가 펼쳐져 있고, 마우스를 올린 띠가 넓어지며(flex 전환) 사진이 밝아지고 설명·세부 메뉴가 나온다.
 *  · 접힌 띠는 어두운 사진 위에 번호와 짧은 이름(2~4자)을 가로로 쓴다(세로 글씨는 오너가 어색해함). 키보드 초점도 같은 동작.
 *  · lg 미만은 이 부품을 쓰지 않고 카드 격자(page.tsx)로 보여 준다 — 터치에는 '올림' 이 없어서.
 */
export interface HubItem {
  href: string;
  label: string;
  /** 접힌 띠에 가로로 쓸 짧은 이름(2~4자) */
  short: string;
  desc: string;
  subs: string[];
  fig: string;
}

export function HubAccordion({ items }: { items: HubItem[] }) {
  return (
    <div className="acc reveal mt-12 hidden h-[560px] gap-2 lg:flex" role="list">
      {items.map((it, i) => (
        <Link key={it.href} href={it.href} className="acc-item group relative block overflow-hidden rounded-3xl bg-night text-white" role="listitem">
          <Image src={figSrc(it.fig)} alt="" fill sizes="(max-width: 1280px) 60vw, 800px" className="acc-img object-cover" />
          <div className="acc-shade absolute inset-0" />

          {/* 접힌 상태 — 세로 글씨 */}
          <div className="acc-closed absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5 px-2 pb-7">
            <span className="text-[12px] font-extrabold tracking-[0.2em] text-sun-300">{String(i + 1).padStart(2, '0')}</span>
            <span className="h-6 w-px bg-sun-400/70" />
            <span className="whitespace-nowrap text-[15px] font-bold tracking-[0.02em] text-white">{it.short}</span>
          </div>

          {/* 펼친 상태 */}
          <div className="acc-open absolute inset-x-0 bottom-0 p-8 lg:p-9">
            <span className="text-[12px] font-extrabold tracking-[0.2em] text-sun-300">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-2 text-[1.9rem] font-extrabold leading-tight tracking-[-0.02em] on-photo md:text-[2.2rem]">{it.label}</p>
            <p className="mt-3 max-w-[520px] text-[15.5px] leading-[1.75] text-white/85">{it.desc}</p>
            {it.subs.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {it.subs.map((s) => (
                  <li key={s} className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur">{s}</li>
                ))}
              </ul>
            )}
            <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-sun-300">
              자세히 보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
