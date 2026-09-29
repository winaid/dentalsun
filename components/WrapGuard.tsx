'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 붙임 덩어리 풀기 — 줄바꿈 규칙(components/ui.tsx pauseGlue)은 '말 쉬는 자리'가 아닌 공백을 붙임 공백(U+00A0)으로 바꿔
 * 낱말 몇 개를 한 덩어리로 만든다(최대 15.5em). 카드가 좁아 덩어리가 칸보다 넓으면 브라우저가 낱말 가운데서 꺾었다
 * — "내비게이션 임플란 / 트는", "방식입니 / 다." (2026-09-29 전체 점검: 폰 홈 뒤집기 카드·태블릿/PC 단계 카드 등 30여 곳).
 * 폭은 화면마다 달라 글을 만들 때는 알 수 없으므로, 그려진 뒤 **실제로 두 줄에 걸친 덩어리만** 찾아 그 안의 붙임 공백을 보통 공백으로 바꾼다.
 * 칸에 들어가는 덩어리는 손대지 않는다(말 쉬는 자리 줄바꿈 그대로). 폭이 바뀌면 원래 글로 되돌린 뒤 다시 잰다.
 * ★ 접힌 칸·탭처럼 처음엔 안 보이던 글은 열릴 때(속성 변화) 다시 잰다.
 * ⚠️ React 가 그 글을 새로 그렸으면(값이 우리가 바꾼 것과 다르면) 되돌리지 않는다.
 */
const NB = String.fromCharCode(0xa0); // 붙임 공백 U+00A0

export function WrapGuard() {
  const pathname = usePathname();
  useEffect(() => {
    const edited = new Map<Text, { orig: string; mod: string }>();
    const range = document.createRange();

    const lines = (t: Text, a: number, b: number) => {
      range.setStart(t, a);
      range.setEnd(t, b);
      const tops = new Set<number>();
      for (const rc of range.getClientRects()) if (rc.width > 0 && rc.height > 0) tops.add(Math.round(rc.top + rc.height / 2));
      // 가까운 값(1~2px 차이)은 같은 줄
      const ys = [...tops].sort((x, y) => x - y);
      let n = 0;
      let prev = -1e9;
      for (const y of ys) { if (y - prev > 4) n++; prev = y; }
      return n;
    };

    const release = () => {
      for (const el of document.querySelectorAll('.clause, .sent-soft')) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let t = walker.nextNode() as Text | null;
        while (t) {
          const s = t.data;
          if (s.includes(NB)) {
            let out = '';
            let last = 0;
            const re = /[^ \t\n]+/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec(s))) {
              if (m[0].includes(NB) && lines(t, m.index, m.index + m[0].length) > 1) {
                out += s.slice(last, m.index) + m[0].split(NB).join(' ');
                last = m.index + m[0].length;
              }
            }
            if (last > 0) {
              out += s.slice(last);
              const prev = edited.get(t);
              edited.set(t, { orig: prev ? prev.orig : s, mod: out });
              t.data = out;
            }
          }
          t = walker.nextNode() as Text | null;
        }
      }
    };

    /*
     * 줄 첫머리 구분 기호 — 줄바꿈 규칙을 안 거치는 글(첫 화면 제목·표 제목 등)의 " · " 는 점 앞 공백에서도 꺾여
     * "관절잡음 · 개구장애 / · 저작근 통증," 처럼 점이 줄 첫머리에 떨어졌다(09-29 점검). 그렇게 떨어진 점만 앞 공백을 붙임 공백으로 바꿔 앞줄 끝에 둔다.
     */
    // 띄어 쓴 점(" · ")은 앞 공백을 붙임 공백으로, 붙여 쓴 점("개구장애·저작근")은 점 앞에 단어 잇기표(U+2060)를 넣는다
    const WJ = String.fromCharCode(0x2060);
    const DOT = /[·|]/g;
    const seps = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (/[·|]/.test((n as Text).data) && !(n.parentElement?.closest('script,style')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      let t = walker.nextNode() as Text | null;
      while (t) {
        const s = t.data;
        const cut: number[] = [];
        let m: RegExpExecArray | null;
        DOT.lastIndex = 0;
        while ((m = DOT.exec(s))) {
          // 점과 바로 앞 글자가 다른 줄이면 점이 줄 첫머리(앞 글자가 이미 잇기표면 건너뜀)
          const i = m.index;
          // ★ 줄 끝에 걸린 공백은 폭 0 으로 그려져 '공백+점'만 재면 못 잡는다 → 공백 앞 글자부터 잰다
          const j = s[i - 1] === ' ' ? i - 2 : i - 1;
          if (j >= 0 && s[i - 1] !== WJ && s[i - 1] !== NB && lines(t, j, i + 1) > 1) cut.push(i);
        }
        if (cut.length) {
          let out = s;
          for (const i of cut.reverse()) out = out[i - 1] === ' ' ? out.slice(0, i - 1) + NB + out.slice(i) : out.slice(0, i) + WJ + out.slice(i);
          const prev = edited.get(t);
          edited.set(t, { orig: prev ? prev.orig : s, mod: out });
          t.data = out;
        }
        t = walker.nextNode() as Text | null;
      }
    };

    const restore = () => {
      edited.forEach((v, t) => { if (t.isConnected && t.data === v.mod) t.data = v.orig; });
      edited.clear();
    };

    let timer = 0;
    const schedule = (full: boolean) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (full) restore(); release(); seps(); }, full ? 160 : 120);
    };

    release();
    seps();
    document.fonts?.ready.then(() => schedule(true));
    let w = window.innerWidth;
    const onResize = () => { if (window.innerWidth !== w) { w = window.innerWidth; schedule(true); } };
    window.addEventListener('resize', onResize);
    // 열고 닫는 칸(아코디언·탭·details) — 등장 효과(.reveal) 클래스 변화는 무시
    const mo = new MutationObserver((ms) => {
      if (ms.some((m) => !(m.target instanceof HTMLElement && m.target.classList.contains('reveal')))) schedule(false);
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'style', 'open', 'hidden', 'aria-expanded', 'data-state'] });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
