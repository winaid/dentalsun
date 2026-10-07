import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { figSize, figSrc, fitsBox, type Fig, type QA } from '@/lib/docs';
import { CLINIC, MEDICAL_DISCLAIMER } from '@/lib/clinic';

/**
 * 하이라이트(끌리는 말) — 글에서 {…} 로 감싼 곳을 <mark class="hl"> 로 (2026-10-07 오너 "서브 문구에도 후킹 될 만한 문구는 하이라이트, 자연스럽게").
 *  · 줄바꿈 엔진(pauseGlue)은 낱말 끝 조사를 보고 쉼 자리를 고르므로 {} 를 사용 영역 문자 두 개(HL_ON·HL_OFF)로 바꿔 넣고, 엔진은 그 문자를 무시한다.
 *  · 쉼표에서 마디가 갈려도 켜짐 상태를 이어 받는다(마디마다 mark 하나).
 *  · 구조화 데이터·llms.txt 에서는 지운다(lib/seo serializeJsonLd). 제목·FAQ·메타 설명에는 쓰지 않는다.
 */
const HL_ON = '\uE000';
const HL_OFF = '\uE001';
const HL_RE = /[\uE000\uE001]/g;
const toHl = (s: string) => s.replace(/\{/g, HL_ON).replace(/\}/g, HL_OFF);
/** 표시 문자를 빼고 글자만 */
export const plainText = (s: string) => s.replace(/[{}]/g, '').replace(HL_RE, '');
function marked(str: string, st: { on: boolean }, keyBase = ''): ReactNode {
  if (!str.includes(HL_ON) && !str.includes(HL_OFF)) return st.on ? <mark className="hl">{str}</mark> : str;
  const out: ReactNode[] = [];
  let buf = '';
  const flush = (k: number) => {
    if (!buf) return;
    out.push(st.on ? <mark key={`${keyBase}${k}`} className="hl">{buf}</mark> : <Fragment key={`${keyBase}${k}`}>{buf}</Fragment>);
    buf = '';
  };
  let k = 0;
  for (const ch of str) {
    if (ch === HL_ON || ch === HL_OFF) { flush(k++); st.on = ch === HL_ON; continue; }
    buf += ch;
  }
  flush(k++);
  return out;
}
/** 줄바꿈 엔진을 안 거치는 자리(카드 한 줄·표 칸 등)용 — {…} 를 하이라이트로 */
export function rich(text: string): ReactNode {
  if (!text.includes('{')) return text;
  return marked(toHl(text), { on: false });
}

/**
 * 문장·마디·쉼 줄바꿈 (오너 규칙, 2026-09-09)
 *  1) 마침표에서 줄을 바꾼다(.sent = block).
 *  2) 문장 안에서는 절 쉼표 마디(.clause)가 통째로 내려간다. 나열 쉼표("수술, 보철, 정기검진")는 마디를 가르지 않는다(isListComma).
 *  3) 마디 안에서는 **말하다 쉬는 자리**(연결어미·조사 뒤)만 보통 공백, 나머지는 붙임 공백(pauseGlue) —
 *     .clause 의 text-wrap: balance 가 쉬는 자리들 가운데 줄 길이가 고른 조합을 고른다(2026-09-29 개편, 옛 .chunk 덩어리 방식 폐기).
 * ★ split 은 경계에서만 자르므로 글자를 잃지 않는다. 좁은 화면에서는 마디를 풀어(inline) 흐르게 두되 붙임 공백은 그대로 지킨다.
 */
/**
 * 쉬는 자리 두 등급 (오너 규칙 보강 2026-09-21: "최대한 마침표·쉼표에서, 균형 맞출 때만 말 쉬는 데서")
 *  - 센 쉼: 연결어미(…하고 | …지만 | …는데) — 절이 갈리는 자리라 여기서 끊어도 말이 안 끊긴다.
 *  - 약한 쉼: 조사(…을 | …에서) — "운동을 | 하기 때문에" 처럼 목적어와 동사가 갈라진다. 센 쉼으로 잘라도
 *    덩어리가 너무 길 때(LONG_MAX)만 보조로 쓴다.
 */
const STRONG_PAUSE_END = /(고|며|면|서|라서|해서|하면|해도|지만|는데|은데|더라도|으며|이며|하고|이고|라면|다가|자마자|니까|므로)$/;
/* '의'(소유격)는 뒷말과 한 덩어리라 쉼 자리에서 뺐다("끝의 | 둥근 부분" 방지) */
const PAUSE_END = /(은|는|이|가|을|를|에|에서|으로|로|과|와|도|고|며|면|서|까지|부터|처럼|보다|에게|한테|마다|조차|이나|나|든|라서|해서|하면|해도|지만|는데|은데|더라도|으며|이며|하고|이고|라면|이라|다가|자마자|니까|므로)$/;
/** 앞말과 한 덩어리로 읽히는 낱말 — 이 앞에서는 끊지 않는다("오차로 | 인해", "가지고 | 있고" 방지) */
const NO_BREAK_BEFORE = /^(인해|인한|통해|통한|위해|위한|위해서|의해|의한|대해|대한|대해서|따라|따른|따라서|비해|비하면|걸쳐|관해|관한|더불어|이상|이하|이내|정도|만큼|때문|때문에|덕분|덕분에|이후|이전|동안|사이|뒤|후|전|중|안|밖|없이|없는|없어|없고|없다|없으며|없기|있는|있어|있을|있고|있다|있으며|있어서|있으면|있기|있습니다|없습니다|않고|않는|않은|않아|않으면|못한|못하는|것|수|줄|지|때|데|적|뿐|아니라|아니고|아닌|아닙니다|주는|주고|주며|주면|줍니다|주세요|주시면|주시기|드립니다|드리고|드리며|드려|드리는|드릴|봅니다|보세요|보시면|보시길|두고|둡니다|등|및|또는|혹은|그리고|그래서|하지만|다른|같은|위|아래|옆)$/;
/** 뒷말을 꾸미는 낱말 — 이 뒤에서는 끊지 않는다("볼 베어링 같은 | 구조로" 방지). 관형사·관형형·부사 몇 개 */
const NO_BREAK_AFTER = /^(같은|다른|이런|그런|저런|어떤|모든|여러|각|매|새|첫|두|세|네|한|그|이|저|및|또는|혹은|가장|더|덜|안|못|바로|아주|매우|너무|약|총|전|후|약간|다소|주로|대개|대부분|거의|보다|훨씬|꼭|늘|자주|다시|먼저|미리|함께)$/;
/** 관형형 어미로 끝나는 낱말 — 뒤의 명사를 꾸미므로 뒤에서 끊지 않는다("돌아가는 | 운동", "많은 | 사람" 방지) */
const NO_BREAK_AFTER_END = /(하는|되는|가는|오는|지는|나는|보는|주는|받는|이는|리는|르는|치는|우는|내는|키는|시는|하던|되던|작은|많은|적은|높은|낮은|좋은|나쁜|넓은|좁은|깊은|짧은|젊은|밝은|굵은|얇은|굳은|굽은|틀어진|벗어난|눌린|밀린|남은|둥근|[가-힣]된|[가-힣]한|적인|스러운|[가-힣]할|[가-힣]될|[가-힣]인|있는|없는|않는|않은)$/;
/** "사소하고 | 다양한 원인", "딱딱하고 | 질긴 음식" — '고' 로 이어진 꾸밈말 짝은 안 가른다 */
const COORD_MODIFIER = /(한|된|스러운|적인|긴|운|는|은|진|린|든)$/;
/** 앞말에 붙어 읽히는 뒷말 꼴 — "자기도 | 모르게", "…을 | 싣는" 방지 */
const NO_BREAK_BEFORE_END = /(게|듯|채)$/;
const OBJECT_MARK = /(을|를)$/;
const VERB_LIKE = /(는|은|던|을|고|며|면|서|해|여|아|어|다|지|게|기|려|러|니다|습니다)$/;
/** 쉼표 앞(또는 뒤) 조각이 이보다 짧으면 나열(소리, 통증, 개구 제한)로 본다 */
const ENUM_MAX = 8;
/** 서술 없는 명사구가 이 길이 이하면 나열 항목으로 본다("모의 식립과 수술 가이드,") */
const ENUM_PHRASE_MAX = 16;
/** 쉼표 앞 낱말이 연결어미로 끝나면 **절이 갈리는 쉼표**(…하고, …지만,) — 줄을 바꿔도 되는 첫째 자리 */
const CLAUSE_COMMA_END = /(고|며|면|서|해|여|지만|는데|은데|더라도|으며|이며|니|듯|도|게|거나|든지|면서|려고|다가|도록|므로|니까)$/;
/** 문장 머리 부사 뒤 쉼표("또한," "특히,")는 뒷말에 붙인다 — 한 낱말만 한 줄에 서지 않게 */
const LEAD_ADVERB = /^(또한|특히|다만|그리고|그래서|하지만|그러나|즉|이때|반면|따라서|한편|물론|대신|예를 들어|그러므로|이처럼)$/;
/** 서술이 든 낱말(관형형·연결어미·종결·주제) — 나열 항목은 보통 명사구라 이것이 없다 */
const PREDICATE_END = /(는|은|던|인|된|진|온|린|난|적인|하고|하며|하여|해|고|며|서|면|다|니다|요)$/;

/**
 * 나열 쉼표의 종류 (오너 2026-09-21 "나열되는 쉼표마다 줄바꿈하지 말고" · 2026-09-29 재지적).
 *   'hard' = 짧은 나열("수술, 보철, 정기검진")·문장 머리 부사("또한,") — 여기서는 줄을 바꾸지 않는다.
 *   'long' = 항목 자체가 긴 명사구 나열("모의 식립과 수술 가이드, CAD/CAM 보철 제작까지") — 조사 등급의 쉼 자리로만 친다.
 *   null   = 절 쉼표(…하고, …지만,)·긴 동격("…지켜온 광화문 선치과,") — 쉼 자리 가운데 1순위.
 *   예전엔 '쉼표 앞 조각이 8자 이하'만 봐서 "첫 상담부터 수술, | 보철," 처럼 첫 항목 앞에 다른 말이 붙으면 나열을 못 알아봤다.
 * before = 앞 쉼표(또는 마디 머리)부터 이 쉼표까지, after = 이 쉼표 뒤부터 다음 쉼표(또는 끝)까지.
 */
function listCommaKind(before: string, after: string, single = false): 'hard' | 'long' | null {
  const b = before.replace(/[,，]\s*$/, '').trim();
  const last = strip(b.split(/\s+/).pop() ?? '');
  if (LEAD_ADVERB.test(b)) return 'hard';
  if (CLAUSE_COMMA_END.test(last)) return null;
  /* '·' 로 이미 나열한 뒤의 쉼표는 나열을 닫는 쉼표다("관절잡음·개구장애·턱 통증, 원인부터…") */
  if (/[·ㆍ]/.test(b)) return null;
  const a = after.replace(/[,，]\s*$/, '').trim();
  /*
   * 쉼표가 **하나뿐**이고 뒤가 서술(절)이면 나열이 아니다 — "어금니 임플란트, 뼈가 부족하다면?" "서울 중구 세종대로, 광화문역 … 의원입니다."
   * 나열은 보통 쉼표가 둘 이상(수술, 보철, 정기검진)이다. 이걸 짧은 나열로 잘못 봐서 제목 전체가 붙어 버렸고,
   * 폰에서 칸을 넘치자 브라우저가 물음표만 다음 줄로 떼어 냈다(2026-09-29).
   */
  if (single && a.split(/\s+/).some((w) => { const x = strip(w); return x.length >= 2 && PREDICATE_END.test(x); })) return null;
  if (a.length <= ENUM_MAX || b.length <= ENUM_MAX) return 'hard';
  const predicate = b.split(/\s+/).some((w) => { const x = strip(w); return x.length >= 2 && PREDICATE_END.test(x); });
  if (b.length <= ENUM_PHRASE_MAX && !predicate) return 'long';
  return null;
}
/** 나열 쉼표면 마디를 가르지 않는다(splitClauses) */
const isListComma = (before: string, after: string, single = false) => listCommaKind(before, after, single) !== null;

/** 여는 괄호 − 닫는 괄호 — 0 보다 크면 괄호 안 */
function parenDelta(s: string): number {
  return (s.match(/[(（[]/g)?.length ?? 0) - (s.match(/[)）\]]/g)?.length ?? 0);
}

/**
 * 쉼표 마디 나누기 — 괄호 안의 쉼표에서는 나누지 않는다.
 * "(환자의 자발적 호흡, 외부에 반응)" 이 쉼표에서 두 줄로 갈라졌다(오너 지적 2026-09-11).
 */
export function splitClauses(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    cur += ch;
    depth += parenDelta(ch);
    if (ch === ',' && depth <= 0 && /^\s+\S/.test(s.slice(i + 1))) {
      out.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  /*
   * 나열 쉼표는 마디 경계가 아니다 (오너 2026-09-21: "나열되는 쉼표마다 줄바꿈하지 말고").
   * 나열이면(isListComma) 다음 조각에 붙여 한 마디로 둔다. 판정은 **바로 앞 조각**만 본다(합친 덩어리 전체가 아니라).
   */
  const merged: string[] = [];
  for (let k = 0; k < out.length; k++) {
    const prevRaw = out[k - 1];
    if (merged.length && prevRaw && prevRaw.endsWith(',') && isListComma(prevRaw, out[k], out.length === 2)) merged[merged.length - 1] += ` ${out[k]}`;
    else merged.push(out[k]);
  }
  return merged;
}

const strip = (w: string) => w.replace(HL_RE, '').replace(/[,.!?…)”’"']+$/, '');

/** 낱말 배열을 쉼 자리(pause 판정)에서 덩어리로 — 괄호 안·꾸밈말 뒤·붙는 말 앞에서는 쉬지 않는다 */
/** 두 낱말 사이를 끊어도 되는가 — 꾸밈말 뒤·붙는 말 앞·소유격 뒤·'고' 짝·목적어+동사는 안 된다 */
function canBreakBetween(w: string, next: string, prev = ''): boolean {
  const bare = strip(w);
  const nx = strip(next);
  /* 목적어 뒤의 -는/-은 은 조사가 아니라 뒤 명사를 꾸미는 말("턱을 괴는 | 자세", "음식을 즐기는 | 식습관") */
  if (prev && OBJECT_MARK.test(strip(prev)) && /[는은]$/.test(bare) && !/[,，]$/.test(w)) return false;
  if (NO_BREAK_AFTER.test(bare) || NO_BREAK_AFTER_END.test(bare) || /의$/.test(bare)) return false;
  if (NO_BREAK_BEFORE.test(nx) || NO_BREAK_BEFORE_END.test(nx)) return false;
  /* "…와 함께" 는 한 덩어리, "습관이 | 함께 얽혀" 는 끊어도 된다 — 함께·같이 앞은 와·과 뒤일 때만 막는다(09-29) */
  if (/^(함께|같이)$/.test(nx) && /[와과]$/.test(bare)) return false;
  /* "6번 | 출구", "도보 | 2분" — 길 안내 숫자 묶음은 한 덩어리 (2026-09-29 꼬리말) */
  if (/\d+번$/.test(bare) && /^출구/.test(nx)) return false;
  if (/^(도보|차로|걸어서)$/.test(bare) && /^\d/.test(nx)) return false;
  if (/(고|거나)$/.test(bare) && COORD_MODIFIER.test(nx)) return false;
  /* 목적어와 그것을 받는 동사("힘을 싣는", "구조를 가지고", "치료를 시작합니다")는 한 덩어리 */
  if (OBJECT_MARK.test(bare) && VERB_LIKE.test(nx)) return false;
  /* 목적어 + 받침 ㄴ·ㄹ 로 끝나는 꾸밈 동사("면허를 가진", "치아를 살릴")도 한 덩어리 (2026-09-29) */
  const lastCh = nx.charCodeAt(nx.length - 1) - 0xac00;
  if (OBJECT_MARK.test(bare) && nx.length >= 2 && lastCh >= 0 && lastCh < 11172 && [4, 8].includes(lastCh % 28)) return false;
  return true;
}

/** 마디 안의 나열 쉼표 자리와 종류(괄호 안 쉼표는 'hard') */
function listCommaKinds(words: string[]): Map<number, 'hard' | 'long'> {
  const at = new Map<number, 'hard' | 'long'>();
  let segStart = 0;
  let depth = 0;
  let d0 = 0;
  const single = words.filter((w) => { d0 += parenDelta(w); return d0 <= 0 && /[,，]$/.test(w); }).length === 1;
  for (let i = 0; i < words.length; i++) {
    depth += parenDelta(words[i]);
    if (!/[,，]$/.test(words[i])) continue;
    if (depth > 0) { at.set(i, 'hard'); continue; }
    let j = i + 1;
    while (j < words.length - 1 && !/[,，]$/.test(words[j])) j++;
    const kind = listCommaKind(words.slice(segStart, i + 1).join(' '), words.slice(i + 1, j + 1).join(' '), single);
    if (kind) at.set(i, kind);
    segStart = i + 1;
  }
  return at;
}

/** 글자 폭 어림(em) — Pretendard 실측: 한글·한자 ≈1(15자+문장부호가 263px@15.5px 에 꽉 참), 라틴·숫자 0.55, 공백 0.28, 문장부호 0.3 */
function emWidth(t: string): number {
  let w = 0;
  for (const ch of t) w += ch === HL_ON || ch === HL_OFF ? 0 : /[ㄱ-ㆎ가-힣一-鿿]/.test(ch) ? 1 : /[A-Za-z0-9]/.test(ch) ? 0.55 : /\s/.test(ch) ? 0.28 : 0.3;
  return w;
}
/**
 * 이 길이를 넘는 토막에만 쉼 자리를 하나 더 연다. 홈 강점 카드 글 칸이 263px(15.5px 글씨 ≈ 17em) — 그 안에 여유 있게 들어가는 길이.
 * ⚠️ 본문이 keep-all 이라 열린 자리가 없는 긴 토막은 좁은 칸에서 가로로 넘친다. 이 값을 크게 올리지 말 것.
 */
const RUN_MAX_EM = 15.5;
/** '치의학과'·'보철과' 처럼 과(科)로 끝나는 이름은 조사 '과' 가 아니다 */
const NOT_PARTICLE = /(학과|보철과|보존과|교정과|내과|외과|치과|안과|피부과)$/;
/** 쉼 자리 등급별 벌점(em) — 절 쉼표 0 < 연결어미 2 < 조사·긴 나열 쉼표 4 < 그냥 끊어도 되는 공백 8 < 마지막 수단 14 */
const TIER_PENALTY = [0, 2, 4, 8, 14];
/** 붙여 쓴 가운뎃점·빗금("소독·밀폐", "CAD/CAM")을 앞뒤 글자와 묶는다(U+2060) — 줄바꿈 규칙을 안 거치는 표 칸 글용. "다시 소독 / ·밀폐하는" 처럼 점 앞에서 꺾였다(09-29 점검). */
const WJ = String.fromCharCode(0x2060);
export const keepDots = (s: string) =>
  s
    .replace(/([^\s])([·ㆍ])(?=[^\s])/g, `$1${WJ}$2`) // 가운뎃점은 앞 글자에만 묶는다 — 점 뒤에서 줄이 바뀌는 건 괜찮다("…개구장애· / 저작근 통증,")
    .replace(/([^\s])(\/)(?=[^\s])/g, `$1${WJ}$2${WJ}`); // 빗금은 앞뒤 모두("CAD/CAM")
/** 띄어 쓴 나열 구분 기호 한 글자("A · B", "A | B") */
const SEPARATOR = /^[·ㆍ|/–—]$/;

/**
 * ★★ 줄바꿈 자리는 '꼭 필요한 만큼만, 좋은 순서대로' 연다 (오너 규칙 2026-09-09 → 09-21 → 09-29) ★★
 *   오너: "나열되는 쉼표에서 전부 하지 말고, 최대한 길이 균형 맞춰서 말 쉬는 텀에 줄바꿈 하되 쉼표나 마침표 쪽에서 하면 좋다."
 *   · 마침표 = 문장(.sent, block) 경계라 늘 갈린다.
 *   · 절 쉼표(…하고, …지만,) = 늘 연다.
 *   · 그 사이 토막이 한 줄(RUN_MAX_EM)보다 길 때만, 가운데에 가깝고 등급이 좋은 자리(연결어미 > 조사 > 그 밖) 하나를 열고 양쪽을 다시 본다.
 *   · 나머지 공백은 전부 붙임 공백(U+00A0) — 브라우저는 열린 자리에서만 줄을 바꾸고, .clause 의 text-wrap: balance 가 그중 고른 조합을 고른다.
 * ★ 쉬는 자리를 모두 열어 두면 브라우저 balance 가 "원판이 앞으로 | 밀리고," 처럼 쉼표를 두고 엉뚱한 조사에서 갈랐다(09-29 실측 986마디 비교).
 * ★ 옛 방식(앞에서부터 덩어리를 채워 inline-block)은 글자 수로 재 한글 폭을 못 맞췄고, 칸보다 넓은 덩어리는 브라우저가 아무 공백에서나 꺾었다.
 * ⚠️ 짧은 나열 쉼표·꾸밈말 뒤·붙는 말 앞·괄호 안은 마지막 수단(등급 4) — 다른 자리가 전혀 없을 때만.
 */
/** maxEm — 붙임 덩어리 최대 길이. 큰 제목(글씨가 커 한 줄에 드는 글자 수가 적다)은 짧게 준다 */
export function pauseGlue(clause: string, maxEm = RUN_MAX_EM): string {
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length < 2) return clause.trim();
  const n = words.length - 1;
  const lists = listCommaKinds(words);
  /* 공백마다 등급 — 0 절 쉼표 · 1 연결어미 · 2 조사·긴 나열 쉼표 · 3 끊어도 되는 공백 · 4 마지막 수단 */
  const tier = new Array<number>(n);
  let depth = 0;
  for (let i = 0; i < n; i++) {
    depth += parenDelta(words[i]);
    const bare = strip(words[i]);
    const kind = lists.get(i);
    if (depth > 0 || kind === 'hard' || !canBreakBetween(words[i], words[i + 1], words[i - 1])) tier[i] = 4;
    else if (/[,，]$/.test(words[i])) tier[i] = kind === 'long' ? 2 : 0;
    else if (STRONG_PAUSE_END.test(bare)) tier[i] = 1;
    /* 명사를 잇는 '와·과'("뼈와 신경의")는 조사보다 약한 쉼 — 이것만 남았을 때 쓴다 */
    else if (/[와과]$/.test(bare) && !NOT_PARTICLE.test(bare)) tier[i] = 3;
    else if (PAUSE_END.test(bare) && !NOT_PARTICLE.test(bare)) tier[i] = 2;
    else tier[i] = 3;
  }
  /* 나열 구분 기호(" · ", " | ", " / ") 앞 공백은 절대 열지 않는다 — 열면 "· 대한 구강…", "· 토요일" 처럼 점이 줄 첫머리에 떨어졌다(09-29 전체 점검).
     기호 뒤 공백은 긴 나열 쉼표와 같은 등급(2)으로 둔다. */
  const glued = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) {
    if (SEPARATOR.test(words[i + 1])) { glued[i] = true; tier[i] = 4; }
    if (SEPARATOR.test(words[i]) && tier[i] > 2) tier[i] = 2;
  }
  const open = tier.map((t, i) => t === 0 && !glued[i]);
  const width = (a: number, b: number) => emWidth(words.slice(a, b + 1).join(' '));
  const openIn = (a: number, b: number) => {
    const total = width(a, b);
    if (b <= a || total <= maxEm) return;
    let best = a;
    let bestScore = Infinity;
    for (let i = a; i < b; i++) {
      if (glued[i]) continue;
      const score = Math.abs(width(a, i) - total / 2) + TIER_PENALTY[tier[i]];
      if (score < bestScore) { bestScore = score; best = i; }
    }
    open[best] = true;
    openIn(a, best);
    openIn(best + 1, b);
  };
  let start = 0;
  for (let i = 0; i <= n; i++) {
    if (i === n || open[i]) { openIn(start, i); start = i + 1; }
  }
  /* 가운뎃점·빗금 앞뒤는 단어 잇기표(U+2060)로 묶는다 — keep-all 이어도 '뼈 | ·신경', 'CAD/ | CAM' 처럼 꺾였다(09-29 실측) */
  const join = (w: string) => w.replace(/([^\s])([·ㆍ/])(?=[^\s])/g, '$1⁠$2⁠');
  return words.map((w, i) => (i === 0 ? join(w) : (open[i - 1] ? ' ' : ' ') + join(w))).join('');
}

function Clause({ text, st }: { text: string; st: { on: boolean } }) {
  return <span className="clause">{marked(pauseGlue(text), st)}</span>;
}

/**
 * 문장 나누기 — 마침표·물음표·느낌표(뒤따르는 닫는 따옴표·괄호까지) 다음 공백에서 자른다.
 * 예전 정규식은 `?"` 처럼 닫는 따옴표가 붙으면 못 잘랐다("…건가요?" "뼈에…" 가 한 문장으로 이어짐, 2026-09-29).
 * "1. " 같은 번호, 말줄임표(...)는 문장 끝이 아니다.
 */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  /* 뒤가 '(' 면 앞 문장의 덧붙임("…없습니다. (확인 후 식립)")이라 자르지 않는다 */
  const re = /([.!?])(["'”’)\]\uE001]*)\s+(?=[^\s(])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index);
    if (m[1] === '.' && (/(^|\s)\d{1,2}$/.test(before) || /[.…]$/.test(before))) continue;
    out.push(text.slice(last, m.index + m[1].length + m[2].length).trim());
    last = re.lastIndex;
  }
  out.push(text.slice(last).trim());
  return out.filter(Boolean);
}

export function Sentences({
  text,
  className = '',
  clauses: useClauses = true,
  soft = false,
  br = false,
}: {
  text: string;
  className?: string;
  /** 좁은 카드에서는 쉼표 마디를 풀어 자연스럽게 흐르게 한다 */
  clauses?: boolean;
  /**
   * 제목·질문처럼 짧은 글 — 한 줄에 다 들어가면 그대로 두고, 줄을 바꿔야 할 때만 문장 경계에서 바꾼다(.sent-soft = inline-block).
   * 한 문장뿐이면 손대지 않는다.
   */
  soft?: boolean;
  /**
   * 줄 수를 자르는 카드(line-clamp) — 문장 사이를 <br> 로만 가른다.
   * .sent·.clause 상자(block·inline-block)를 쓰면 line-clamp 가 상자 안 줄을 세지 못해 말줄임이 깨진다.
   */
  br?: boolean;
}) {
  text = toHl(text);
  const st = { on: false };
  const sentences = splitSentences(text);
  const clauses = (s: string) => (useClauses ? splitClauses(s) : [s]);
  if (br) {
    return (
      <>
        {sentences.map((s, i) => (
          <Fragment key={i}>{i > 0 && <br />}{marked(s, st, `b${i}-`)}</Fragment>
        ))}
      </>
    );
  }
  if (soft) {
    if (sentences.length <= 1) return <>{marked(text, st)}</>;
    return (
      <span className={className}>
        {sentences.map((s, i) => (
          <Fragment key={i}><span className="sent-soft">{marked(pauseGlue(s, 11), st)}</span>{i < sentences.length - 1 ? ' ' : ''}</Fragment>
        ))}
      </span>
    );
  }
  if (sentences.length <= 1) {
    return (
      <span className={`sent-one ${className}`}>
        {clauses(text).map((c, i) => (
          <Fragment key={i}><Clause text={c} st={st} />{' '}</Fragment>
        ))}
      </span>
    );
  }
  return (
    <span className={className}>
      {sentences.map((s, i) => (
        <span key={i} className="sent">
          {clauses(s).map((c, j) => (
            <Fragment key={j}><Clause text={c} st={st} />{' '}</Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}

/** 구역 머리 — 윗줄 라벨 + 제목 + 설명. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  dark = false,
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={`reveal max-w-[820px] ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${dark ? 'on-dark' : ''} ${align === 'center' ? 'justify-center' : ''}`}>{eyebrow}</p>}
      <Tag className={`display-sm mt-4 ${dark ? '!text-white' : ''}`}>{title}</Tag>
      {lead && (
        <p className={`lead mt-4 ${dark ? '!text-white/75' : ''}`}>
          <Sentences text={lead} />
        </p>
      )}
    </div>
  );
}

export function Breadcrumb({ trail, dark = false }: { trail: Array<{ name: string; path: string }>; dark?: boolean }) {
  return (
    <nav aria-label="현재 위치" className={`text-[14px] ${dark ? 'text-white/60' : 'text-ink-muted'}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:underline">홈</Link>
        </li>
        {trail.map((t, i) => (
          <li key={t.path} className="flex items-center gap-1.5">
            <span aria-hidden>›</span>
            {i === trail.length - 1 ? (
              <span aria-current="page" className={dark ? 'text-white/90' : 'text-ink-soft'}>{t.name}</span>
            ) : (
              <Link href={t.path} className="hover:underline">{t.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * 그림. ratio 를 주면 그 비율 상자에 채워 넣는다(격자 안 사진은 전부 같은 비율이어야 줄이 맞는다).
 * 크기는 빌드 때 잰 값(lib/imageSizes.generated.json)이라 레이아웃이 튀지 않는다.
 */
export function Figure({
  fig,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className = '',
  rounded = 'rounded-2xl',
  ratio,
  effect = 'wipe',
  caption = true,
  fill = false,
}: {
  fig: Fig;
  sizes?: string;
  priority?: boolean;
  className?: string;
  rounded?: string;
  /** 예: 'aspect-[4/3]' — 주면 object-cover 로 채운다 */
  ratio?: string;
  effect?: 'wipe' | 'img-in' | 'none';
  caption?: boolean;
  /**
   * 작은 원본이라도 **상자를 꽉 채운다**(아래 '작은 원본' 안전장치를 이 자리에서만 끈다).
   *
   * ★★ 왜 필요한가 (2026-09-14 오너: "사진들이 좀 별로야. 카드에 딱 맞게") ★★
   *   안전장치는 폭 600px 미만이면 무조건 통째로(contain) 놓는데, 그 기준은
   *   **옛 배너에서 잘라 낸 111~200px 짜리 도해** 를 막으려고 만든 것이다.
   *   그런데 세로로 자른 진짜 사진(422·384px)까지 걸려서, /about 위생 구역의 두 장이
   *   318x565 카드 안에서 **41% · 38% 만 채우고** 회색 여백에 둥둥 떠 있었다(실측).
   * ⚠️ 원본이 상자보다 작은 자리에는 주지 말 것 — 늘려서 흐려진다. 여기 두 장은
   *    원본 폭(422·384)이 상자 폭(318)보다 커서 늘어나지 않는다.
   * ⚠️ 글자가 박힌 도해(equip/·illust/)에는 절대 주지 말 것 — 바깥 라벨이 잘려 나간다.
   */
  fill?: boolean;
}) {
  const s = figSize(fig.key);
  const fx = effect === 'none' ? '' : effect;
  /*
   * ★ 작은 원본(폭 600px 미만 — 옛 배너에서 잘라 낸 도해)은 상자에 늘려 채우지 않는다 (오너: "사진 막 확대돼서").
   *   같은 비율 상자 안에 **원래 크기 그대로** 가운데 놓고 옅은 바탕을 깐다 — 흐려지지 않고, 격자 줄은 그대로 맞는다.
   */
  /*
   * ★ 글자가 박힌 도해·장비 배너(equip/·illust/ 원본)도 상자에 잘라 넣지 않는다 — 상자 안에 통째로(contain) 놓는다.
   *   사진(scene/·place/·ai/)만 상자에 꽉 채워 자른다. 회귀 사례: GBT 도해의 바깥 라벨이 잘려 나갔다.
   */
  const diagram = /^(equip|illust)\//.test(fig.key);
  /* 상자 비율과 1.4배 넘게 다른 사진도 통째로 — 세로 사진이 4:3 에서 머리가 잘리거나, 긴 배너가 반 토막 나지 않게 */
  const ar = ratio?.match(/\[(\d+)\/(\d+)\]/);
  const mismatch = ar ? !fitsBox(fig.key, Number(ar[1]), Number(ar[2])) : false;
  /* ⚠️ fill 은 '작은 원본' 안전장치만 끈다 — 도해(diagram)와 비율 어긋남(mismatch)은 그대로 막는다. */
  const framed = !!ratio && ((s.w < 600 && !fill) || diagram || mismatch);
  return (
    <figure className={className}>
      {ratio && framed ? (
        <div className={`${fx} relative ${ratio} flex items-center justify-center overflow-hidden ${rounded} bg-canvas-2 p-6`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="max-h-full w-auto max-w-full rounded-xl object-contain" />
        </div>
      ) : ratio ? (
        <div className={`${fx} relative ${ratio} overflow-hidden ${rounded} bg-canvas-2`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      ) : s.w < 600 ? (
        /* 비율 상자 없는 작은 원본(옛 배너 조각 111~200px)도 폭에 맞춰 늘리지 않는다 — 원래 크기의 1.4배까지만, 옅은 바탕 가운데 */
        <div className={`${fx} flex justify-center overflow-hidden ${rounded} bg-canvas-2 p-5`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="h-auto w-full rounded-xl object-contain" style={{ maxWidth: Math.round(s.w * 1.4) }} />
        </div>
      ) : (
        <div className={`${fx} overflow-hidden ${rounded} bg-canvas-2`}>
          <Image src={figSrc(fig.key)} alt={fig.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="h-auto w-full object-cover" />
        </div>
      )}
      {caption && fig.caption && <figcaption className="mt-2.5 text-[14px] text-ink-muted">{fig.caption}</figcaption>}
    </figure>
  );
}

/** 문답 목록 — 화면과 FAQPage 스키마가 **같은 배열**을 쓴다. */
export function FaqList({ items, id = 'faq' }: { items: QA[]; id?: string }) {
  return (
    <div id={id} className="border-t border-hairline">
      {items.map((it, i) => (
        <details key={i} className="faq" open={i === 0}>
          <summary>
            <span className="q" aria-hidden>Q</span>
            <span><Sentences text={it.q} soft /></span>
            <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <p className="a">
            <Sentences text={it.a} />
          </p>
        </details>
      ))}
    </div>
  );
}

/** 마무리 상담 띠 — 페이지당 하나. AI 정물 사진을 배경으로 깐다. */
export function ContactBand({ title = '진료 예약 및 상담 안내', text, bg = 'ai/wide-visit' }: { title?: string; text?: string; bg?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc(bg)} alt="" fill sizes="(max-width: 1023px) 200vw, 100vw" className="object-cover opacity-30" data-parallax="0.18" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/50" />
      </div>
      <div className="wrap py-20 md:py-28">
        <div className="reveal mx-auto grid max-w-[1320px] items-center gap-10 md:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <p className="eyebrow on-dark">CONTACT</p>
            <h2 className="display-sm mt-4 !text-white">{title}</h2>
            <p className="mt-3 text-white/70">{text ? <Sentences text={text} /> : `화·목 야간진료 21:00 · ${CLINIC.parking.place} ${CLINIC.parking.fee}`}</p>
            {/* 빈 자리에 지하철 안내 — 기존 홈페이지 오시는 길 표기 그대로, 호선 색 동그라미 */}
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {CLINIC.transit.map((t) => (
                <li
                  key={`${t.line}-${t.station}`}
                  className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 py-1.5 pr-4 pl-1.5 backdrop-blur"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold text-white" style={{ background: t.color }}>
                    {t.line.replace('호선', '')}
                  </span>
                  <span className="text-[14px] leading-tight">
                    <span className="font-bold text-white">{t.station}</span>{' '}
                    <span className="text-white/60">
                      {t.exit} · {t.walk}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* 문의 카드 넷 — 가운데가 휑해 보여 버튼을 카드로 키웠다(오너). 이름 아래 한 줄로 무엇인지 알려 준다. 톡톡 상담 자리는 치료 후기(2026-09-21) */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:min-w-[560px]">
            <a
              href={CLINIC.phoneHref}
              className="group flex items-center gap-4 rounded-2xl bg-sun-500 px-5 py-4 shadow-[var(--shadow-btn)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-600"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold text-white">전화 상담</span>
                <span className="block text-[13.5px] tabular-nums text-white/80">{CLINIC.phone}</span>
              </span>
            </a>

            <a
              href={CLINIC.booking.naver}
              target="_blank"
              rel="noopener"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#03C75A] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 3h5.2l5.6 8.4V3H20v18h-5.2L9.2 12.6V21H4z" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold">네이버 예약</span>
                <span className="block text-[13.5px] text-white/60">원하는 날짜·시간 고르기</span>
              </span>
            </a>

            <a
              href={CLINIC.booking.naverReview}
              target="_blank"
              rel="noopener"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#03C75A] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold">치료 후기</span>
                <span className="block text-[13.5px] text-white/60">네이버 플레이스 방문자 리뷰</span>
              </span>
            </a>

            <Link
              href="/visit"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.2" fill="currentColor" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[16.5px] font-extrabold">오시는 길</span>
                <span className="block text-[13.5px] text-white/60">
                  {CLINIC.transit[0].station} {CLINIC.transit[0].exit} {CLINIC.transit[0].walk}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 의료 고지 — 상담 띠(남색) 아래에 그대로 이어 붙인다. 흰 띠를 끼우지 않아 꼬리말까지 남색이 이어진다(오너).
 * ⚠️ 문구 자체는 지우지 않는다 — 치료 효과를 말하는 광고에는 부작용·개인차 고지가 함께 있어야 한다(의료법 제56조).
 */
export function MedicalNotice() {
  return (
    <div className="bg-night pb-14">
      <div className="wrap">
        <p className="border-t border-white/10 pt-7 text-[13.5px] leading-relaxed text-white/45"><Sentences text={MEDICAL_DISCLAIMER} /></p>
      </div>
    </div>
  );
}

/** 링크 카드 — 격자 안에서 높이가 같다(h-full + flex). 사진이 있으면 4:3 상자. */
export function CardLink({ href, label, desc, external = false, fig, num }: { href: string; label: string; desc?: string; external?: boolean; fig?: Fig; num?: string }) {
  const inner = (
    <>
      {fig && (
        <span className="card-img block">
          <Image src={figSrc(fig.key)} alt={fig.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className={fitsBox(fig.key, 3, 2) ? 'object-cover' : '!object-contain p-3'} />
        </span>
      )}
      {/* 폰의 두 칸 격자에서도 글자가 쪼개지지 않게 여백·글자를 한 단계 줄인다 */}
      <span className="flex flex-1 flex-col p-4 sm:p-6">
        {num && <span className="num mb-3">{num}</span>}
        <span className="block text-[15px] font-bold leading-snug text-ink group-hover:text-brand-700 sm:text-[1.08rem]">{label}</span>
        {desc && (
          <span className="mt-2 block text-[13.5px] leading-[1.6] text-ink-soft sm:text-[15px] sm:leading-relaxed">
            <Sentences text={desc} clauses={false} />
          </span>
        )}
        <span aria-hidden className="mt-auto inline-flex pt-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all group-hover:translate-x-1 group-hover:bg-sun-500 group-hover:text-white">→</span>
        </span>
      </span>
    </>
  );
  /* 사진이 있는 카드는 3D 기울기 없이 살짝 떠오르기만(오너: 3D 는 사진 없이 글만 나열된 카드에만) */
  const cls = 'card card-hover group flex h-full flex-col overflow-hidden';
  return external ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

/* 흐르는 키워드 띠(Marquee) 는 지웠다 — 오너가 두 번 빼라고 한 것이라 부품째 없앤다.
   홈 2026-09-10(94a9157), 허브 6쪽 2026-09-16. 되살리지 말 것.
   .marquee CSS 는 남는다 — 홈 의료진 뒤 큰 글자(오너가 따로 요청한 것)가 쓴다. */

/**
 * 스크롤 따라 낱말이 차례로 밝아지는 글(레퍼런스의 문단 강조) — RevealScript 가 [data-scrub] 안의 .w 에 .on 을 붙인다.
 * 문장 단위 줄바꿈은 Sentences 와 같다. 어두운 배경이 기본, 밝은 배경은 light.
 */
export function ScrubText({ text, className = '', light = false }: { text: string; className?: string; light?: boolean }) {
  let on = false;
  const sentences = splitSentences(toHl(text));
  /* 낱말(.w)마다 밝아지되, 하이라이트 {…} 는 낱말 여럿을 한 mark 로 감싼다.
     예전엔 낱말마다 mark 를 따로 달아 띄어쓰기 자리에 띠가 끊기고, 한 말이 조각 여럿으로 보였다(2026-10-07 점검) */
  const words = (t: string, key: string) =>
    t.split(/(\s+)/).map((w, j) => (!w ? null : /^\s+$/.test(w) ? ' ' : <span key={`${key}${j}`} className="w">{w}</span>));
  return (
    <span className={`scrub ${light ? 'scrub-light' : ''} ${className}`} data-scrub>
      {sentences.map((s, i) => {
        const segs: Array<{ t: string; on: boolean }> = [];
        let buf = '';
        for (const ch of s) {
          if (ch === HL_ON || ch === HL_OFF) {
            if (buf) segs.push({ t: buf, on });
            buf = '';
            on = ch === HL_ON;
            continue;
          }
          buf += ch;
        }
        if (buf) segs.push({ t: buf, on });
        return (
          <span key={i} className="sent">
            {segs.map((g, k) => (g.on ? <mark key={k} className="hl">{words(g.t, `${k}-`)}</mark> : <Fragment key={k}>{words(g.t, `${k}-`)}</Fragment>))}{' '}
          </span>
        );
      })}
    </span>
  );
}

/**
 * 인증 마크 — 약력의 '보건복지부 인증 … 전문의' 줄 앞(원장 PPT 49쪽 '인증마크 이모티콘').
 * 톱니 둥근 인장 + 체크(lucide badge-check 모양, ISC).
 */
export function CertMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 ${className}`}>
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill="currentColor"
      />
      <path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 동그라미 배지 — 풀아치 PPT 50쪽에 붙인 예시 배지(수술당일 식사가능 · 내원은 최소한 · 치료기간 최소한 · 가격은 합리적).
 * 글 속 줄바꿈 문자에서 줄을 바꾼다. 풀아치 첫 화면과 홈 풀아치 구역이 같이 쓴다.
 * 2026-10-07 오너 "메인에 너무 그대로 들어갔는데 좀 더 세련되게" — 예시의 주황 덩어리 원 → 흰 유리 원 + 주황 테두리가 그려지며 나타난다(.ring-arc).
 * 글자는 그대로, 윗줄은 작게·아랫줄(무엇이)은 주황 굵게. 테두리는 보이는 순간(.is-shown / .hero-in) 차례로 그린다.
 * 2026-10-07 오너 "동그라미 네개 디자인 좀 보완하자. 모션그래픽도 넣고" — 유리 원 + 뜻 아이콘(sm 이상) + 움직임 넷:
 * 차례로 톡 나타남(badge-pop) → 테두리 그리기(ring-draw) → 빛 한 점이 테두리를 따라 계속 돎(ring-orbit) → 뒤 빛이 숨 쉬듯(badge-breathe).
 * tone='dark' 는 어두운 첫 화면(HeroCollage), 기본은 밝은 바탕(홈 풀아치 구역).
 */
/* 배지 뜻 아이콘 — lucide(ISC) utensils · calendar-check · timer · wallet. 글에 든 낱말로 고른다 */
const BADGE_ICONS: Array<[RegExp, ReactNode]> = [
  [/식사/, <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>],
  [/내원/, <><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></>],
  [/기간|시간/, <><path d="M10 2h4" /><path d="m12 14 3-3" /><circle cx="12" cy="14" r="8" /></>],
  [/가격|비용/, <><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></>],
];
export function RoundBadges({ items, className = '', tone = 'light' }: { items: string[]; className?: string; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <ul className={`grid max-w-[372px] grid-cols-4 gap-2.5 sm:flex sm:max-w-none sm:flex-wrap sm:gap-4 ${className}`}>
      {items.map((b, i) => {
        const [top, bottom] = b.split('\n');
        const icon = BADGE_ICONS.find(([re]) => re.test(b))?.[1];
        return (
          <li key={b} className="ring-badge relative flex aspect-square w-full flex-col items-center justify-center text-center sm:h-[112px] sm:w-[112px]" style={{ ['--i' as string]: i }}>
            {/* 둘레 빛 — 원 둘레에만 퍼지는 고리(가운데는 비워 원 색이 탁해지지 않게), 숨 쉬듯 커졌다 작아진다 */}
            <span aria-hidden className={`badge-glow absolute -inset-3 rounded-full blur-md ${dark ? 'bg-[radial-gradient(circle_closest-side,transparent_62%,rgba(242,111,30,0.6)_80%,transparent_100%)]' : 'bg-[radial-gradient(circle_closest-side,transparent_62%,rgba(251,135,67,0.55)_80%,transparent_100%)]'}`} />
            {/* 유리 원 */}
            <span
              aria-hidden
              className={`absolute inset-0 rounded-full backdrop-blur-md ${
                dark
                  ? 'bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,0.2),rgba(255,255,255,0.05)_58%,rgba(255,255,255,0.02)),linear-gradient(rgba(11,19,46,0.45),rgba(11,19,46,0.45))] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_36px_-18px_rgba(0,0,0,0.6)]'
                  : 'bg-[radial-gradient(circle_at_32%_22%,#fff,rgba(255,255,255,0.9)_55%,rgba(255,246,238,0.92))] shadow-[inset_0_1px_0_#fff,0_16px_32px_-18px_rgba(185,67,12,0.55)]'
              }`}
            />
            <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full -rotate-90 overflow-visible">
              <circle cx="50" cy="50" r="48" fill="none" stroke={dark ? 'rgba(255,255,255,0.16)' : 'var(--color-sun-100)'} strokeWidth="2" />
              <circle className="ring-arc" cx="50" cy="50" r="48" fill="none" stroke={dark ? 'var(--color-sun-400)' : 'var(--color-sun-500)'} strokeWidth="2.4" strokeLinecap="round" pathLength={100} />
              {/* 테두리를 따라 도는 흰 광택 — 꼬리(옅게) + 머리(밝게, 주황 번짐). 테두리와 같은 색이면 밝은 바탕에서 안 보였다 */}
              <g className="ring-comet">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeOpacity={dark ? 0.5 : 0.75} strokeWidth="2.6" strokeLinecap="round" pathLength={100} strokeDasharray="16 84" />
                <circle className="ring-comet-head" cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" pathLength={100} strokeDasharray="1.5 98.5" strokeDashoffset="-14.5" />
              </g>
            </svg>
            {icon && (
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`relative mb-1 hidden h-[22px] w-[22px] sm:block ${dark ? 'text-sun-300' : 'text-sun-500'}`}>
                {icon}
              </svg>
            )}
            <span className={`relative text-[11.5px] font-semibold leading-[1.25] sm:text-[13px] ${dark ? 'text-white/75' : 'text-ink-soft'}`}>{top}</span>
            {bottom && <span className={`relative text-[13.5px] font-extrabold leading-[1.3] sm:text-[16.5px] ${dark ? 'text-sun-300' : 'text-sun-600'}`}>{bottom}</span>}
          </li>
        );
      })}
    </ul>
  );
}
