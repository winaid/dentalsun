import Image from 'next/image';
import Link from 'next/link';
import { figSrc, type Fig } from '@/lib/docs';

/**
 * 뒤집기 카드 — 앞면은 번호·제목·한 줄(사진 없음), 마우스를 올리면(키보드 초점·터치 누름 포함) 뒤집히며
 * 사진 배경 위에 제목과 설명이 나온다. 카드 전체가 링크라 어느 면에서든 누르면 이동한다.
 *  · CSS 3D(rotateY 180°) — .flip / .flip-inner / .flip-face 는 globals.css.
 *  · 터치 기기는 hover 가 없어 첫 탭에서 뒤집히지 않고 바로 이동한다(:active 로 잠깐 뒤집혀 보이기만).
 */
export function FlipCard({ href, num, label, desc, back, fig }: { href: string; num: string; label: string; desc: string; back: string; fig: Fig }) {
  return (
    <Link href={href} className="flip group block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-brand-600" aria-label={`${label} — ${desc}`}>
      <div className="flip-inner relative h-full min-h-[260px]">
        {/* 앞면 */}
        <div className="flip-face card flex h-full flex-col p-7 md:p-8">
          <span className="num-xl !text-brand-700">{num}</span>
          <p className="mt-auto pt-10 text-[1.15rem] font-bold leading-snug text-ink">{label}</p>
          <p className="mt-2 text-[13.5px] text-ink-muted">{desc}</p>
        </div>
        {/* 뒷면 — 사진 배경 */}
        <div className="flip-face flip-back overflow-hidden rounded-3xl bg-night text-white shadow-[var(--shadow-lift)]">
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/55 to-night/20" />
          <div className="relative flex h-full flex-col p-7 md:p-8">
            <span className="text-[12px] font-bold tracking-[0.2em] text-sun-300">{num}</span>
            <p className="mt-auto text-[1.15rem] font-bold leading-snug on-photo">{label}</p>
            <p className="mt-2 text-[13.5px] leading-[1.7] text-white/85">{back}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-sun-300">
              자세히 보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
