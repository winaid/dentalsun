import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 블로그 글 저장소.
 *
 * ★★ 왜 파일 한 개 = 글 한 개인가 (2026-09-02 오너: "자동화 느낌으로, 한 달 10개") ★★
 *   한 달에 열 개면 손으로 코드를 고치는 방식은 금방 무너진다.
 *   `content/blog/` 에 JSON 파일 하나를 **떨구기만 하면** 목록·상세·사이트맵·구조화 데이터가
 *   전부 따라오게 만든다. 자동화가 할 일은 파일을 쓰고 배포를 거는 것뿐이다.
 *
 * ★ 왜 JSON 인가 — 만들어 내는 쪽(생성기)이 기계라서다. 마크다운은 사람이 쓸 때 편하고,
 *   JSON 은 기계가 쓸 때 안전하다. 따옴표·줄바꿈을 기계가 알아서 처리한다.
 *   본문은 HTML 문자열이다 — 생성기가 이미 HTML 로 내보내므로 중간 변환이 없다.
 *
 * ⚠️⚠️ 본문 HTML 은 **우리가 저장소에 커밋한 것만** 들어온다 ⚠️⚠️
 *   외부 입력을 그대로 그리는 자리가 아니다. 방문자가 보낸 값이나 외부 API 응답을
 *   이 폴더에 바로 쓰지 말 것 — 그 순간 저장형 XSS 가 된다.
 *   아래 sanitizeBody 가 script/iframe/on* 을 걷어 내지만, 그것은 마지막 방어선이지
 *   외부 입력을 허용해도 된다는 뜻이 아니다.
 *
 * ⚠️ 의료광고다. 글마다 의료법 제56조가 그대로 적용된다.
 *    치료경험담·치료 전후 사진·최상급 표현('최고'·'유일')·객관적 근거 없는 효과 단정 금지.
 *    생성기 쪽에서 거르더라도 사람이 한 번 보고 올리는 것이 맞다.
 *
 * ⚠️ 파일 이름이 곧 주소다. 한 번 올린 글의 파일 이름을 바꾸면 그 주소가 404 가 된다.
 *    (색인된 글이면 검색 순위도 함께 사라진다.) 고쳐야 하면 이름은 두고 내용만 고칠 것.
 */

export interface BlogPost {
  /** 주소가 되는 이름. 파일 이름에서 온다(2026-09-05-implant-life.json → implant-life). */
  slug: string;
  title: string;
  /** YYYY-MM-DD. 목록 정렬과 구조화 데이터의 발행일. */
  date: string;
  /**
   * 발행 시각 HH:mm (한국 시간). 없으면 그날 0시. (2026-09-08 오너: "발행 날짜나 시간 고르도록")
   * ⚠️ 쪽은 한 시간마다 다시 그려지므로(ISR 3600) 실제 노출은 최대 한 시간 늦을 수 있다.
   */
  time?: string;
  /** 고친 날. 없으면 발행일과 같다. */
  updated?: string;
  /** 목록과 검색 결과에 나가는 한두 문장. */
  summary: string;
  /** 진료 영역 이름과 맞추면 목록에서 묶어 보기 좋다. 없어도 된다. */
  category?: string;
  /**
   * 대표 사진 (2026-09-07 오너: "이미지 하나정도씩 캐러셀처럼 넣어서 카드형태로").
   * public/img/blog/ 아래 경로. 목록 카드·상세 머리·공유 카드(og)에 쓴다. 없으면 제목 카드로 대신한다.
   * ⚠️ AI 로 만든 그림이면 사람·손·얼굴·글자가 없어야 한다(사이트의 다른 AI 사진과 같은 규칙).
   */
  image?: string;
  /** 사진에 무엇이 찍혔는지. image 가 있으면 반드시 채운다. */
  imageAlt?: string;
  /** 본문 HTML. h2/h3/p/ul/ol/li/strong/em/a/blockquote/figure/img 정도만 쓴다. */
  html: string;
  /**
   * 어디서 온 글인가. local = content/blog 파일(기본). central = 중앙(winaid) 인사이트 API(lib/insightFeed.ts).
   * 관리자 화면은 local 만 고칠 수 있다 — central 글은 중앙에서 발행 취소해야 사라진다.
   */
  source?: 'local' | 'central';
  /**
   * 네이버 블로그에서 가져온 글(content/clinical, scripts/import-naver.mjs) 전용.
   *  · kind: clinical = 임상 사례, notice = 핵심 안내(치료 설명글). 목록에서 두 묶음으로 나눈다.
   *  · sourceUrl: 네이버 원문 주소 — 상세 아래 '원문 보기' 로 건다.
   *  · originalTitle: 네이버 원제(검색용 지역명이 붙은 것). 화면에는 안 쓰고 대조용으로 남긴다.
   */
  kind?: 'clinical' | 'notice';
  sourceUrl?: string;
  originalTitle?: string;
}

/**
 * 오늘 날짜(한국 시간) — 예약 발행의 기준.
 * ★★ 왜 (2026-09-07 오너: "매달 자동으로 발행") ★★
 *   글마다 date 를 미리 적어 두면, 그 날짜가 오기 전에는 목록·상세·사이트맵 어디에도 안 실린다.
 *   날짜가 지나면 저절로 실린다 — 쪽들이 ISR(revalidate) 로 다시 그려지기 때문이다.
 * ⚠️ 서버 시계는 UTC 다. 한국 자정을 기준으로 삼으려면 +9h 를 더해서 날짜를 잘라야 한다.
 *    안 그러면 한국 시간 새벽 0~9시에 올린 글이 아홉 시간 늦게 나온다.
 */
export function todayKST(): string {
  return nowKST().slice(0, 10);
}

/** 지금(한국 시간) — 'YYYY-MM-DDTHH:mm'. 발행 시각 게이트의 기준. */
export function nowKST(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16);
}

/** 구조화 데이터용 발행 시각 — 시각이 있으면 '2026-09-10T09:00:00+09:00', 없으면 날짜만. */
export function publishedIso(p: { date: string; time?: string }): string {
  return p.time && /^\d{2}:\d{2}$/.test(p.time) && p.time !== '00:00' ? `${p.date}T${p.time}:00+09:00` : p.date;
}

/** 글의 발행 시각 키 — date 와 time 을 붙여 nowKST() 와 문자열로 비교한다. */
export function publishKey(p: { date: string; time?: string }): string {
  return `${p.date}T${p.time && /^\d{2}:\d{2}$/.test(p.time) ? p.time : '00:00'}`;
}

const DIR = join(process.cwd(), 'content', 'blog');

/**
 * 위험한 조각을 걷어 낸다 — **마지막 방어선**이다.
 * ⚠️ 이것이 있으니 아무 HTML 이나 넣어도 된다고 생각하지 말 것. 위 주석 참고.
 */
export function sanitizeBody(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(object|embed|link|meta)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/** 파일 이름에서 주소를 뽑는다 — 앞에 붙은 날짜는 정렬용이라 주소에서 뺀다. */
function slugFromFile(file: string): string {
  return file.replace(/\.json$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/**
 * 글 전체를 최신순으로.
 * ⚠️ 폴더가 없거나 비어 있어도 **터지지 않는다** — 글이 하나도 없는 것은 정상 상태다.
 *    (블로그를 열어 두고 첫 글을 올리기 전까지가 그렇다.)
 */
export function allPosts(opts: { includeFuture?: boolean } = {}): BlogPost[] {
  return readPosts(DIR, opts);
}

/** 네이버에서 가져온 임상 사례·핵심 안내 (content/clinical). 블로그와 같은 규격, 다른 폴더·다른 주소(/insight/clinical). */
const CLINICAL_DIR = join(process.cwd(), 'content', 'clinical');
export function allClinicalPosts(opts: { includeFuture?: boolean } = {}): BlogPost[] {
  return readPosts(CLINICAL_DIR, opts);
}
export function clinicalBySlug(slug: string): BlogPost | undefined {
  return allClinicalPosts().find((p) => p.slug === slug);
}

function readPosts(dir: string, opts: { includeFuture?: boolean } = {}): BlogPost[] {
  /*
   * ⚠️ 기본은 **오늘까지의 글만**이다. date 가 미래인 글은 예약 상태라 목록·상세·사이트맵·
   *    llms.txt 어디에도 안 나간다. 관리자 화면만 includeFuture 로 전부 본다.
   */
  const now = nowKST();
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.json'));
  } catch {
    return [];
  }

  const posts: BlogPost[] = [];
  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    } catch {
      /* 깨진 파일 하나가 사이트 전체를 막지 않게 건너뛴다. */
      continue;
    }
    const p = raw as Partial<BlogPost>;
    /* 없으면 화면이 이상해지는 값들 — 하나라도 비면 그 글은 싣지 않는다. */
    if (!p.title || !p.date || !p.summary || !p.html) continue;
    /* 예약 글 — 날짜가 오기 전에는 없는 글이다. */
    if (!opts.includeFuture && publishKey(p as { date: string; time?: string }) > now) continue;
    posts.push({
      slug: p.slug || slugFromFile(file),
      title: p.title,
      date: p.date,
      time: p.time,
      updated: p.updated,
      summary: p.summary,
      category: p.category,
      /* ⚠️ 사진 경로는 우리 폴더 안에서만 — 바깥 주소를 그대로 그리면 남의 서버가 우리 쪽 그림을 바꿀 수 있다. */
      image: p.image && p.image.startsWith('/img/') ? p.image : undefined,
      imageAlt: p.imageAlt,
      html: sanitizeBody(p.html),
      source: 'local',
      kind: p.kind === 'clinical' || p.kind === 'notice' ? p.kind : undefined,
      sourceUrl: p.sourceUrl && /^https:\/\/blog\.naver\.com\//.test(p.sourceUrl) ? p.sourceUrl : undefined,
      originalTitle: p.originalTitle,
    });
  }

  return posts.sort((a, b) => (publishKey(a) < publishKey(b) ? 1 : publishKey(a) > publishKey(b) ? -1 : 0));
}

export function postBySlug(slug: string): BlogPost | undefined {
  return allPosts().find((p) => p.slug === slug);
}

/** 글에 쓰인 분류 — 목록 위에 몇 가지를 다루는지 보여 줄 때 쓴다. */
export function postCategories(): string[] {
  return [...new Set(allPosts().map((p) => p.category).filter(Boolean) as string[])];
}
