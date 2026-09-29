/**
 * 글 본문 HTML(블로그·임상 글)의 문단을 문장마다 <span class="sent"> 로 감싼다 — 마침표에서 줄이 바뀌게 (오너 규칙, 2026-09-29 "전부 다시").
 * 화면에 그릴 때만 쓴다(PostArticle). 저장된 글·관리자 편집기·FAQ 뽑기(extractFaq)는 원래 HTML 을 그대로 본다.
 *
 * ★ 굵게·기울임(strong·b·em·i·u·mark·span) 안의 마침표는 태그를 닫았다가 다음 문장에서 다시 연다 — 여닫는 짝이 깨지지 않게.
 *   링크(a) 등 그 밖의 태그 안에서는 자르지 않는다(링크가 둘로 갈라지면 안 된다).
 * ★ "1. " 같은 번호, 말줄임표(...), 뒤에 괄호 덧붙임이 오는 마침표("…없습니다. (확인)")는 문장 끝으로 보지 않는다
 *   (components/ui.tsx splitSentences 와 같은 규칙).
 * ⚠️ 목록(<li>)은 안에 다른 목록·문단이 없을 때만 다룬다.
 */
import { pauseGlue, splitClauses } from '@/components/ui';

const VOID = /^<(br|img|wbr|hr|input|source)\b/i;
const REOPENABLE = /^(strong|b|em|i|u|mark|span)$/i;
/** 문장 끝 — 마침표·물음표·느낌표 + 닫는 따옴표·괄호(엔티티 포함) */
const CLOSERS = /(?:["'”’)\]]|&quot;|&#39;|&#x27;|&rdquo;|&rsquo;)+$/;
const END = /[.!?](?:["'”’)\]]|&quot;|&#39;|&#x27;|&rdquo;|&rsquo;)*$/;

function visible(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function isSentenceEnd(text: string): boolean {
  const t = text.trimEnd();
  if (!END.test(t)) return false;
  const core = t.replace(CLOSERS, '');
  if (/(^|\s)\d{1,2}\.$/.test(core)) return false; // "1." 번호
  if (/(\.\.|…)\.$/.test(core)) return false; // 말줄임표
  return true;
}

function splitInner(inner: string): string[] {
  const tokens = inner.split(/(<[^>]+>)/);
  const out: string[] = [];
  /** 열려 있는 태그 — [이름, 여는 태그 원문] */
  const stack: Array<[string, string]> = [];
  let cur = '';
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok.startsWith('<')) {
      const name = (tok.match(/^<\/?([a-zA-Z0-9]+)/)?.[1] ?? '').toLowerCase();
      if (tok.startsWith('</')) {
        const at = stack.map((s) => s[0]).lastIndexOf(name);
        if (at >= 0) stack.splice(at);
      } else if (!VOID.test(tok) && !tok.endsWith('/>')) stack.push([name, tok]);
      cur += tok;
      continue;
    }
    const canSplit = stack.every(([n]) => REOPENABLE.test(n));
    if (!canSplit) {
      cur += tok;
      continue;
    }
    /* 공백 덩어리마다 '바로 앞까지가 문장 끝인가' 를 본다 */
    let from = 0;
    const ws = /\s+/g;
    let m: RegExpExecArray | null;
    while ((m = ws.exec(tok))) {
      /* 뒤가 '(' 면 앞 문장의 덧붙임이라 붙여 둔다 */
      if (tok[m.index + m[0].length] === '(') continue;
      const head = cur + tok.slice(from, m.index);
      if (!visible(head) || !isSentenceEnd(visible(head))) continue;
      const close = [...stack].reverse().map(([n]) => `</${n}>`).join('');
      out.push(head + close);
      cur = stack.map(([, open]) => open).join('');
      from = m.index + m[0].length;
    }
    cur += tok.slice(from);
  }
  if (cur) out.push(cur);
  /* 글자 없는 조각(끝에 남은 닫는 태그·빈 여는 태그 등)은 앞 문장에 붙인다 */
  const merged: string[] = [];
  for (const s of out) {
    if (!visible(s) && merged.length) merged[merged.length - 1] += s;
    else merged.push(s);
  }
  return merged;
}

/**
 * 태그 없는 문장은 화면의 다른 글(Sentences)과 같은 규칙으로 — 절 쉼표 마디(.clause) + 쉬는 자리만 여는 붙임 공백(pauseGlue).
 * 굵게·링크가 든 문장은 문장 경계만 가르고 안은 그대로 둔다(태그를 가로질러 공백을 바꾸지 않는다).
 */
function renderSentence(s: string): string {
  const t = s.trim();
  if (/[<>]/.test(t)) return t;
  return splitClauses(t)
    .map((c) => `<span class="clause">${pauseGlue(c)}</span>`)
    .join(' ');
}

export function sentenceHtml(html: string): string {
  const wrap = (tag: string) => (all: string, attrs: string | undefined, inner: string) => {
    if (tag === 'li' && /<(ul|ol|p|div)\b/i.test(inner)) return all;
    if (!visible(inner)) return all;
    const parts = splitInner(inner);
    return `<${tag}${attrs ?? ''}>${parts.map((s) => `<span class="sent">${renderSentence(s)}</span>`).join(' ')}</${tag}>`;
  };
  return html
    .replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi, wrap('p'))
    .replace(/<li(\s[^>]*)?>([\s\S]*?)<\/li>/gi, wrap('li'));
}
