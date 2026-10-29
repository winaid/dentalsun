'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { isLive, todayKst, type Popup } from '@/lib/popups';

/**
 * 홈 첫 화면 공지 팝업 (2026-10-29 오너 "11월 진료일정 팝업 올려줘, 사이즈 전문적인 치과처럼").
 * 목록은 관리자 화면 /admin/popup 에서 넣는다 → content/popups.json (lib/popups.ts).
 *
 * - 크기: PC 폭 480px + 아래 버튼 줄. 폰은 좌우 20px 여백만 남기고 꽉 채운다.
 *   (국내 치과 사이트 공지 팝업이 대개 400~500px 폭 — 첫 화면을 다 가리지 않는 크기)
 * - 여러 개면 PC 는 나란히, 폰은 하나씩(닫으면 다음 것).
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

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center gap-5 bg-black/45 px-5"
      onClick={() => setShown([])}
      data-lenis-prevent
    >
      {shown.map((p, i) => {
        const img = (
          <Image
            src={p.image}
            alt={p.alt}
            width={p.width}
            height={p.height}
            sizes="(max-width: 520px) calc(100vw - 40px), 480px"
            className="block h-auto max-h-[calc(100dvh-140px)] w-full object-contain"
            priority
          />
        );
        return (
          <div
            key={p.id}
            role="dialog"
            aria-modal="true"
            aria-label={p.alt}
            className={`w-full max-w-[480px] overflow-hidden rounded-[10px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] ${i > 0 ? 'hidden lg:block' : ''}`}
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
  );
}
