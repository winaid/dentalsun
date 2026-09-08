'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 스크롤 등장 효과 — 문서 전체에 IntersectionObserver **하나**.
 * 루트 레이아웃에 한 번만 두고, 경로가 바뀌면 다시 묶는다.
 * 동작 축소(prefers-reduced-motion)면 전부 즉시 보인다.
 */
export function RevealScript() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal, .reveal-stack, .img-in, .line-rise, .wipe');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      targets.forEach((el) => el.classList.add('is-shown'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-shown');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px 15% 0px' },
    );
    targets.forEach((el) => io.observe(el));
    /* 관찰이 어긋난 요소가 영영 안 보이는 사고 방지 — 이미 화면 안이면 강제로 보인다. */
    const rescue = window.setTimeout(() => {
      targets.forEach((el) => {
        if (!el.classList.contains('is-shown') && el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-shown');
      });
    }, 800);
    return () => {
      io.disconnect();
      window.clearTimeout(rescue);
    };
  }, [pathname]);

  return null;
}
