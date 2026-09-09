'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 스크롤 연출 한 벌 — 루트 레이아웃에 한 번만 둔다. 경로가 바뀌면 다시 묶는다.
 *
 *  · 등장(.reveal .reveal-stack .img-in .line-rise .wipe): IntersectionObserver 하나로 .is-shown 을 붙인다.
 *  · 패럴랙스([data-parallax="0.2"]): 배경 사진이 스크롤보다 천천히 움직인다(rAF 한 번에 전부 갱신).
 *  · 진행 막대(#scroll-progress): 화면 맨 위 얇은 주황 선이 읽은 만큼 길어진다.
 *  · 마우스 기울임([data-tilt] 안의 [data-tilt-item="깊이"]): 첫 화면의 떠 있는 카드가 포인터를 따라 살짝 움직인다.
 *  · 첫 화면 옅어짐([data-scroll-fade="세기"]): 스크롤을 시작하면 첫 화면 글이 올라가며 옅어진다.
 *  · 낱말 밝아짐([data-scrub] 안의 .w): 문단이 화면을 지나는 만큼 낱말이 차례로 밝아진다.
 *  · 가로 흐름([data-hpan]): 사진 띠가 구역이 지나가는 만큼 옆으로 흐른다.
 *  · 숫자 세기([data-count="21"]): 보이는 순간 0 부터 세어 올라간다.
 *  · 고정 무대([data-stage] 안의 [data-stage-step] / [data-stage-img]): 오른쪽 글이 가운데를 지나면 왼쪽 고정 사진이 바뀐다.
 *  동작 축소(prefers-reduced-motion)면 등장만 즉시 보이고 나머지는 하지 않는다.
 */
export function RevealScript() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll<HTMLElement>('.reveal, .reveal-stack, .img-in, .line-rise, .wipe');
    if (reduce) {
      targets.forEach((el) => el.classList.add('is-shown'));
      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        el.textContent = el.dataset.count ?? el.textContent;
      });
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
    const rescue = window.setTimeout(() => {
      targets.forEach((el) => {
        if (!el.classList.contains('is-shown') && el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-shown');
      });
    }, 800);

    /* 스크롤 연동 — 패럴랙스 · 진행 막대 · 첫 화면 옅어짐 · 낱말 밝아짐 · 가로 흐름 */
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const px = [...document.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => ({ el, speed: Number(el.dataset.parallax) || 0.2 }));
    const fades = [...document.querySelectorAll<HTMLElement>('[data-scroll-fade]')].map((el) => ({ el, k: Number(el.dataset.scrollFade) || 1 }));
    const scrubs = [...document.querySelectorAll<HTMLElement>('[data-scrub]')].map((el) => ({ el, words: [...el.querySelectorAll<HTMLElement>('.w')], last: -1 }));
    const pans = [...document.querySelectorAll<HTMLElement>('[data-hpan]')];
    const bar = document.getElementById('scroll-progress');
    let ticking = false;
    const frame = () => {
      ticking = false;
      const vh = window.innerHeight;
      const y = window.scrollY;
      for (const { el, speed } of px) {
        const host = el.parentElement ?? el;
        const r = host.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0) scale(${1 + speed * 0.9})`;
      }
      for (const { el, k } of fades) {
        const p = clamp(y / (vh * 0.75));
        el.style.opacity = String(1 - p * k);
        el.style.transform = `translate3d(0, ${(p * 90 * k).toFixed(1)}px, 0)`;
      }
      for (const s of scrubs) {
        const r = s.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
        const n = Math.round(p * s.words.length);
        if (n === s.last) continue;
        s.last = n;
        s.words.forEach((w, i) => w.classList.toggle('on', i < n));
      }
      for (const el of pans) {
        const host = el.parentElement ?? el;
        const r = host.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const over = el.scrollWidth - host.clientWidth;
        if (over <= 0) continue;
        const p = clamp((vh - r.top) / (vh + r.height));
        el.style.transform = `translate3d(${(-over * p).toFixed(1)}px, 0, 0)`;
      }
      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    /* 숫자 세기 — 보이는 순간 한 번 */
    const counters = [...document.querySelectorAll<HTMLElement>('[data-count]')];
    const cio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          cio.unobserve(e.target);
          const el = e.target as HTMLElement;
          const target = Number(el.dataset.count) || 0;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = clamp((t - t0) / 1400);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    counters.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = '0';
      cio.observe(el);
    });

    /* 고정 무대 — 글이 화면 가운데 띠를 지나면 그 단계가 켜진다 */
    const stageIOs = [...document.querySelectorAll<HTMLElement>('[data-stage]')].map((stage) => {
      const steps = [...stage.querySelectorAll<HTMLElement>('[data-stage-step]')];
      const imgs = [...stage.querySelectorAll<HTMLElement>('[data-stage-img]')];
      const set = (i: number) => {
        steps.forEach((s, j) => s.classList.toggle('on', j === i));
        imgs.forEach((m, j) => m.classList.toggle('on', j === i));
      };
      set(0);
      const sio = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) set(steps.indexOf(e.target as HTMLElement));
        },
        { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
      );
      steps.forEach((s) => sio.observe(s));
      return sio;
    });

    /* 마우스 기울임 */
    const tilt = document.querySelector<HTMLElement>('[data-tilt]');
    const items = tilt ? [...tilt.querySelectorAll<HTMLElement>('[data-tilt-item]')] : [];
    const onMove = (e: PointerEvent) => {
      if (!tilt) return;
      const r = tilt.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      for (const it of items) {
        const depth = Number(it.dataset.tiltItem) || 10;
        it.style.translate = `${(-dx * depth).toFixed(1)}px ${(-dy * depth).toFixed(1)}px`;
      }
    };
    const onLeave = () => items.forEach((it) => (it.style.translate = '0px 0px'));
    if (tilt && window.matchMedia('(pointer: fine)').matches) {
      tilt.addEventListener('pointermove', onMove);
      tilt.addEventListener('pointerleave', onLeave);
    }

    return () => {
      io.disconnect();
      cio.disconnect();
      stageIOs.forEach((s) => s.disconnect());
      window.clearTimeout(rescue);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (tilt) {
        tilt.removeEventListener('pointermove', onMove);
        tilt.removeEventListener('pointerleave', onLeave);
      }
    };
  }, [pathname]);

  return <div id="scroll-progress" aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-sun-500" />;
}
