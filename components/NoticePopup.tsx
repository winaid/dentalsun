'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { isLive, todayKst, type Popup } from '@/lib/popups';

/**
 * 홈 첫 화면 공지 팝업 (2026-10-29 오너 "11월 진료일정 팝업 올려줘, 사이즈 전문적인 치과처럼").
 * 목록은 관리자 화면 /admin/popup 에서 넣는다 → content/popups.json (lib/popups.ts).
 *
 * - 크기: 폭 480px 을 넘지 않고, 화면 높이·한 줄 장수(폰 1·태블릿 2·넓은 화면 3)에 맞춰 줄인다(2026-11-03).
 *   (국내 치과 사이트 공지 팝업이 대개 400~500px 폭 — 첫 화면을 다 가리지 않는 크기)
 * - 여러 개면 넓은 화면은 나란히, 폰은 하나씩(닫으면 다음 것). 높이가 모자라면 바탕이 스크롤된다.
 * - '오늘 하루 보지 않기' = localStorage 에 오늘 날짜(한국 시간)를 팝업마다 적어 둔다.
 * - 기간은 방문자 브라우저가 오늘 날짜로 다시 거른다 — 종료일이 지나면 재빌드 없이도 안 뜬다.
 */
const hideKey = (id: string) => `notice-hide:${id}`;

export function NoticePopup({ popups }: { popups: Popup[] }) {
  const [shown, setShown] = useState<Popup[]>([]);

  useEffect(() => {
    const today = todayKst();
    setShown(
      popups.filter((p) => {
        if (!isLive(p, today)) return false;
        try {
          return localStorage.getItem(hideKey(p.id)) !== today;
        } catch {
          return true;
        }
      }),
    );
  }, [popups]);

  const close = (id: string, today = false) => {
    if (today) {
      try {
        localStorage.setItem(hideKey(id), todayKst());
      } catch {
        /* 저장소가 막힌 브라우저 — 닫기만 한다 */
      }
    }
    setShown((s) => s.filter((p) => p.id !== id));
  };

  useEffect(() => {
    if (!shown.length) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShown([]);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown.length]);

  if (!shown.length) return null;

  /* 한 줄에 놓을 장수 — 폰 1 · 태블릿(768~) 2 · 넓은 화면(1280~) 3. 넘치는 것은 앞의 것을 닫으면 나온다. */
  const n = shown.length;
  const perRow = `${n >= 2 ? 'wide2:[--n:2]' : ''} ${n >= 3 ? 'wide3:[--n:3]' : ''}`;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-black/45" onClick={() => setShown([])} data-lenis-prevent>
      <div className="flex min-h-full items-center p-5">
      {/* 윗선을 맞춘다 — 그림 비율이 조금씩 달라도 나란히 놓인 팝업의 머리가 한 줄에 선다. */}
      <div className={`flex w-full items-start justify-center gap-5 [--n:1] ${perRow}`}>
      {shown.map((p, i) => {
        /* 폭 = 480px · 화면 높이에 그림+버튼이 들어가는 폭 · 한 줄 장수로 나눈 폭 중 가장 작은 것.
           (2026-11-03 오너 "모든 기기에서 에러 없이" — 세 장이 1280 화면에서 넘치고, 낮은 가로 화면에서 그림이 잘리던 것) */
        const width = `min(480px, max(240px, calc((100dvh - 108px) * ${(p.width / p.height).toFixed(4)})), calc((100% - (var(--n) - 1) * 20px) / var(--n)))`;
        const img = (
          <Image
            src={p.image}
            alt={p.alt}
            width={p.width}
            height={p.height}
            sizes="(max-width: 767px) calc(100vw - 40px), 480px"
            className="block h-auto w-full"
            priority={i === 0}
          />
        );
        return (
          <div
            key={p.id}
            role="dialog"
            aria-modal="true"
            aria-label={p.alt}
            style={{ width }}
            className={`shrink-0 overflow-hidden rounded-[10px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] ${i === 1 ? 'hidden wide2:block' : i === 2 ? 'hidden wide3:block' : i > 2 ? 'hidden' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {p.link ? (
              <a href={p.link} {...(p.link.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
                {img}
              </a>
            ) : (
              img
            )}
            <div className="flex h-12 items-stretch border-t border-hairline text-[14px] text-brand-700">
              <button type="button" onClick={() => close(p.id, true)} className="flex-1 px-4 text-left hover:bg-brand-50">
                오늘 하루 보지 않기
              </button>
              <button type="button" onClick={() => close(p.id)} className="border-l border-hairline px-6 font-semibold hover:bg-brand-50">
                닫기
              </button>
            </div>
          </div>
        );
      })}
      </div>
      </div>
    </div>
  );
}
