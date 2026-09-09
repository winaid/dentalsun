'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 본문 편집기 — 마케터가 HTML 을 안 보고 글처럼 고친다 (2026-09-08 오너: "html 코드로 되어 있으면 마케터가 수정하기 어려운데").
 *
 * ★ 화면에 보이는 것이 곧 사이트 모양이다 — 같은 .blog-body 스타일(globals.css)을 입힌다.
 * ★ 도구는 셋뿐이다: 소제목 · 굵게 · 링크. 목록·표·색·크기 단추가 **없어서** 사이트 규칙
 *   (p / h2 / h3 / strong / a 만, 목록·마크다운 금지)이 저절로 지켜진다. 단추를 늘리지 말 것.
 * ⚠️ 붙여넣기는 **글자만** 받는다. 워드·네이버 블로그에서 복사한 서식(span/style/font)이 그대로 들어오면
 *    사이트 모양이 깨지고, 목록 태그가 섞여 들어오면 AEO 점수가 빠진다.
 * ⚠️ 내보낼 때 clean() 이 한 번 더 걸러 낸다 — 브라우저가 만든 div/b/i/span 을 p/strong/em 으로 바꾸고,
 *    허용 밖 태그는 벗기고, 바깥 주소 링크는 글자만 남긴다. 편집기 안에서 무슨 일이 있어도 나가는 HTML 은 규칙 안이다.
 * ⚠️ document.execCommand 는 낡은 API 지만 모든 브라우저에서 아직 동작하고, 의존성 없이 되는 유일한 방법이다.
 */
const BLOCK_OK = new Set(['P', 'H2', 'H3']);
const INLINE_MAP: Record<string, string> = { B: 'strong', STRONG: 'strong', I: 'em', EM: 'em', A: 'a' };

export function cleanHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const root = document.createElement('div');
  root.innerHTML = html;

  const inline = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return esc(node.textContent || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === 'BR') return ' ';
    const inner = Array.from(el.childNodes).map(inline).join('');
    const to = INLINE_MAP[tag];
    if (to === 'a') {
      const href = el.getAttribute('href') || '';
      /* 사이트 안 주소만. 바깥 링크는 글자만 남긴다 — 의료광고에서 바깥으로 보내는 링크는 심의 대상이 되기도 한다. */
      if (/^\/[a-z0-9/_#-]*$/i.test(href)) return `<a href='${href}'>${inner}</a>`;
      return inner;
    }
    if (to) return inner.trim() ? `<${to}>${inner}</${to}>` : '';
    return inner;
  };

  const out: string[] = [];
  let run = '';
  const flush = () => {
    const t = run.replace(/\s+/g, ' ').trim();
    if (t) out.push(`<p>${t}</p>`);
    run = '';
  };
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) { run += esc(node.textContent || ''); return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === 'BR') { run += ' '; return; }
    if (INLINE_MAP[tag]) { run += inline(el); return; }
    if (tag === 'H1' || tag === 'H2') { flush(); const t = Array.from(el.childNodes).map(inline).join('').replace(/\s+/g, ' ').trim(); if (t) out.push(`<h2>${t}</h2>`); return; }
    if (tag === 'H3' || tag === 'H4' || tag === 'H5' || tag === 'H6') { flush(); const t = Array.from(el.childNodes).map(inline).join('').replace(/\s+/g, ' ').trim(); if (t) out.push(`<h3>${t}</h3>`); return; }
    if (tag === 'P' || tag === 'DIV' || tag === 'LI' || tag === 'BLOCKQUOTE' || tag === 'SECTION' || tag === 'ARTICLE') {
      flush();
      const hasBlock = Array.from(el.children).some((c) => BLOCK_OK.has(c.tagName) || /^(DIV|UL|OL|LI|H[1-6]|BLOCKQUOTE)$/.test(c.tagName));
      if (hasBlock) { Array.from(el.childNodes).forEach(walk); flush(); return; }
      const t = Array.from(el.childNodes).map(inline).join('').replace(/\s+/g, ' ').trim();
      if (t) out.push(`<p>${t}</p>`);
      return;
    }
    /* ul/ol/table/span/font/기타 — 자식만 이어 간다 (목록은 문단이 된다). */
    Array.from(el.childNodes).forEach(walk);
  };
  Array.from(root.childNodes).forEach(walk);
  flush();
  return out.join('');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 공백 뺀 글자 수 — 사이트의 다른 글자 수 표기와 같은 기준. */
export function charCount(html: string): number {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, 'x').replace(/\s/g, '').length;
}

export function BodyEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string>('');
  const [code, setCode] = useState(false);

  /* 바깥에서 값이 바뀌면(초안이 채워지면) 편집기에 넣는다. 내가 방금 내보낸 값이면 건드리지 않는다 — 커서가 튄다. */
  useEffect(() => {
    if (!ref.current || code) return;
    if (value === last.current) return;
    ref.current.innerHTML = value || '<p><br></p>';
    last.current = value;
  }, [value, code]);

  const emit = () => {
    if (!ref.current) return;
    const html = cleanHtml(ref.current.innerHTML);
    last.current = html;
    onChange(html);
  };

  const cmd = (name: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(name, false, arg);
    emit();
  };

  const link = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { alert('링크를 걸 글자를 먼저 드래그해서 고르세요.'); return; }
    const href = prompt('어디로 보낼까요? 사이트 안 주소만 됩니다. 예: /treatment/implant', '/treatment/');
    if (!href) return;
    if (!/^\/[a-z0-9/_#-]*$/i.test(href)) { alert('사이트 안 주소(/ 로 시작)만 됩니다.'); return; }
    cmd('createLink', href);
  };

  const toolBtn = 'rounded-lg border border-hairline bg-white px-3 py-1.5 text-[13.5px] font-bold text-ink hover:border-sun-500';

  return (
    <div className="rounded-2xl border border-hairline bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2">
        <button type="button" onClick={() => cmd('formatBlock', 'H2')} className={toolBtn} title="이 줄을 소제목으로">소제목</button>
        <button type="button" onClick={() => cmd('formatBlock', 'P')} className={toolBtn} title="이 줄을 보통 문단으로">본문</button>
        <button type="button" onClick={() => cmd('bold')} className={`${toolBtn} font-black`} title="고른 글자를 굵게">굵게</button>
        <button type="button" onClick={link} className={toolBtn} title="고른 글자에 사이트 안 링크">링크</button>
        <button type="button" onClick={() => cmd('unlink')} className={toolBtn}>링크 해제</button>
        <span className="ml-auto text-[12.5px] text-ink-muted">공백 제외 {charCount(value)}자</span>
        <button
          type="button"
          onClick={() => {
            /* ⚠️ 글로 돌아올 때 contenteditable 이 새 요소로 붙는다 — last 를 비워야 위 effect 가 다시 채운다(실제로 비어 보였다). */
            last.current = '';
            setCode((c) => !c);
          }}
          className="text-[12.5px] font-bold text-ink-muted underline underline-offset-2"
        >
          {code ? '글로 보기' : 'HTML 로 보기'}
        </button>
      </div>
      {code ? (
        <textarea
          value={value}
          onChange={(e) => { last.current = e.target.value; onChange(e.target.value); }}
          rows={18}
          className="w-full rounded-b-2xl px-5 py-4 font-mono text-[13px] leading-[1.7] text-ink outline-none"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            /* 빈 줄로 나뉜 덩어리는 문단으로. 한 줄 안의 줄바꿈은 띄어쓰기로. */
            const paras = text.split(/\n\s*\n/).map((t) => t.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
            document.execCommand('insertHTML', false, paras.map((t) => `<p>${esc(t)}</p>`).join(''));
            emit();
          }}
          className="blog-body min-h-[420px] max-w-none px-6 py-5 outline-none sm:px-8"
          style={{ fontSize: 16 }}
        />
      )}
    </div>
  );
}
