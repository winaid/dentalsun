/**
 * 네이버 블로그(sundent21) 글을 우리 사이트 글로 가져온다 — content/clinical/*.json + public/img/clinical/*.webp
 *
 * 왜: 오너 요청(2026-09-11) "인사이트에 임상글 메뉴 추가해서 … 가공해서 넣어주면".
 *     네이버 글은 검색용 지역명이 제목에 붙어 있고, 인사말·진료시간·전화 표 같은 상투 구절이 앞뒤에 있어
 *     그대로 옮기지 않고 본문만 추려 우리 글 규격(h2/p/figure/blockquote/table)으로 바꾼다.
 *
 * 쓰는 법:  node scripts/import-naver.mjs            (아래 POSTS 표 전부)
 *          node scripts/import-naver.mjs 224407031158 (한 편만 다시)
 * 새 글은 POSTS 표에 한 줄 추가하고 다시 돌린다. 사진은 우리 서버로 복사한다(네이버 주소를 그대로 걸면 끊길 수 있다).
 * ⚠️ 제목은 표의 title 이 우선 — 없으면 원제 그대로. 원제는 originalTitle 로 함께 저장한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const BLOG_ID = 'sundent21';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36';

/** [글 번호, 종류, 주소 이름, 진료 분류, 다듬은 제목(없으면 원제)] */
const POSTS = [
  ['224407031158', 'clinical', 'sinus-lift-thin-bone', '임플란트', '뼈가 1~2mm밖에 없는 상악 어금니 임플란트, 상악동거상술 사례'],
  ['224396261424', 'clinical', 'molar-implant-bone-graft', '임플란트', '어금니 임플란트, 뼈가 부족하다면? 뼈이식과 함께 심은 사례'],
  ['224401079678', 'clinical', 'nerve-proximity-navigation', '임플란트', '하치조신경과 가까운 임플란트, 내비게이션으로 식립한 사례'],
  ['224384458305', 'clinical', 'apicoectomy-natural-tooth', '자연치아', '치근단 염증, 치근단절제술로 자연치아를 보존한 사례'],
  ['224375227677', 'clinical', 'full-arch-both-jaws', '임플란트', '상·하악 풀아치 임플란트 치료 사례, 골이식과 디지털 가이드'],
  ['224356465023', 'clinical', 'one-day-whitening', '치아미백', '원데이 치아미백 과정, A3에서 B1까지 밝아진 사례'],
  ['224323427138', 'clinical', 'lower-full-arch-staged', '임플란트', '전신질환과 턱관절까지 고려한 하악 풀아치 임플란트, 단계적 치료 과정'],
  ['224297615769', 'clinical', 'implant-mobility-reimplant', '임플란트', '임플란트 흔들림, 알고 보니 구조물 파절? 재식립 사례'],
  ['224405846212', 'notice', 'sinus-lift-types', '임플란트', '상악동거상술의 종류, 치조정 접근과 측방 접근은 무엇이 다를까요?'],
  ['224136248545', 'notice', 'implant-structure-types', '임플란트', '임플란트의 구조와 종류, 쉽게 이해하기'],
  ['224147685214', 'notice', 'denture-vs-full-arch', '임플란트', '틀니와 풀아치 임플란트, 무엇이 다를까요? 치료 과정 총정리'],
  ['224060248093', 'notice', 'navigation-implant-accuracy', '임플란트', '내비게이션 임플란트, 0.1mm 의 오차가 왜 중요할까요?'],
  ['224058740151', 'notice', 'why-wait-after-extraction', '임플란트', '발치 즉시 임플란트 대신 4~5주를 기다리는 이유'],
];

const OUT_DIR = 'content/clinical';
const IMG_DIR = 'public/img/clinical';
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (s) => s.replace(/[​﻿]/g, '').replace(/\s+/g, ' ').trim();

/* 앞뒤 상투 구절 — 줄 단위로 버린다 */
const DROP_LINE =
  /안녕하세요|한자리|대표원장\s*양대일|양대일\s*대표원장|양대일\s*입니다|대표원장\s*입니다|진료 철학|안심할\s*수\s*있는 결과|바른 진료|치료한다는 원칙|^광화문\s*선치과(입니다)?[.!]?$|이벤트|참고해\s*주세요|감사합니다[.!]?$/;
/* 여기서부터는 꼬리(진료시간·전화·고지) — 그 뒤를 전부 버린다 */
const TAIL = /월\s*수\s*금|10:00|본 게시글|의료법|대표전화|상담\s*문의|진료\s*시간|오시는\s*길|세종대로|주차|카카오|네이버\s*예약|톡톡|예약\s*문의|문의\s*주세요/;

/** RSS 로 발행 시각(절대값) — 최신 글은 화면에 '22시간 전' 처럼만 나온다 */
async function rssDates() {
  const map = {};
  try {
    const xml = await (await fetch(`https://rss.blog.naver.com/${BLOG_ID}.xml`, { headers: { 'User-Agent': UA } })).text();
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const id = (m[1].match(/(\d{12})/) || [])[1];
      const d = (m[1].match(/<pubDate>([^<]*)<\/pubDate>/) || [])[1];
      if (id && d) map[id] = new Date(d);
    }
  } catch {}
  return map;
}

function kst(d) {
  const t = new Date(d.getTime() + 9 * 3600 * 1000);
  return { date: t.toISOString().slice(0, 10), time: t.toISOString().slice(11, 16) };
}

async function fetchImage(src, file) {
  /* 파라미터를 떼면 100px 썸네일이 온다(실측). ?type=w3840 이 원본(3000px), 없으면 w966 */
  const base = src.replace(/\?.*$/, '');
  let buf = null;
  for (const q of ['?type=w3840', '?type=w966', '?type=w773']) {
    const res = await fetch(base + q, { headers: { 'User-Agent': UA, Referer: 'https://blog.naver.com/' } });
    if (!res.ok) continue;
    buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 5000) break;
  }
  if (!buf) throw new Error(`사진 받기 실패 ${base}`);
  const img = sharp(buf).rotate();
  const meta = await img.metadata();
  const out = await img.resize({ width: Math.min(1400, meta.width ?? 1400), withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(file, out);
  const m2 = await sharp(out).metadata();
  /* 붉은 정도(R−G 평균) — 목록 표지로 피가 보이는 수술 사진 대신 엑스레이·완성 사진을 고르는 데 쓴다 */
  const st = await sharp(out).stats();
  const red = st.channels.length >= 2 ? st.channels[0].mean - st.channels[1].mean : 0;
  return { w: m2.width, h: m2.height, red };
}

/** 문단 한 줄의 인라인 HTML — 굵은 글씨만 살린다 */
function lineHtml($, p) {
  let html = '';
  let text = '';
  let boldLen = 0;
  $(p)
    .find('span')
    .each((_, sp) => {
      /* span 은 낱말 중간에서도 갈리므로 앞뒤 공백을 지우면 낱말이 붙는다("오늘은상악") — 한 칸으로만 줄인다 */
      const t = $(sp).text().replace(/[​﻿]/g, '').replace(/\^\^;?/g, '').replace(/\s+/g, ' ');
      if (!t.trim()) return;
      const bold = $(sp).find('b').length > 0 || /font-weight\s*:\s*(bold|[6-9]00)/.test($(sp).attr('style') ?? '');
      html += bold ? `<strong>${esc(t)}</strong>` : esc(t);
      text += t;
      if (bold) boldLen += t.length;
    });
  if (!html) {
    const t = clean($(p).text());
    html = esc(t);
    text = t;
  }
  html = html.replace(/\s+/g, ' ').trim();
  text = clean(text);
  const big = /se-fs-fs(19|2\d|3\d)/.test($(p).html() ?? '');
  return { html, text, allBold: text.length > 0 && boldLen >= text.length * 0.9, big };
}

async function importPost([id, kind, slug, category, title], dates) {
  const url = `https://blog.naver.com/PostView.naver?blogId=${BLOG_ID}&logNo=${id}`;
  const html = await (await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ko' } })).text();
  const $ = cheerio.load(html);
  const originalTitle = clean($('meta[property="og:title"]').attr('content') ?? $('title').text());
  const main = $('.se-main-container').first();
  if (!main.length) throw new Error(`${id}: 본문(se-main-container) 없음`);

  /* 날짜 — RSS 절대값 > 화면의 '2026. 8. 31. 17:16' > 오늘 */
  let when = dates[id];
  if (!when) {
    const t = clean($('.se_publishDate').first().text());
    const m = t.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{1,2}):(\d{2})/);
    if (m) when = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5]));
    else {
      const rel = t.match(/(\d+)\s*(시간|분)\s*전/);
      when = rel ? new Date(Date.now() - +rel[1] * (rel[2] === '시간' ? 3600e3 : 60e3)) : new Date();
    }
  }
  const { date, time } = kst(when);

  /* 1. 구성 요소를 순서대로 블록으로 */
  const blocks = []; /* { type: 'p'|'h2'|'h3'|'quote'|'img'|'table'|'hr', html, text } */
  let imgN = 0;
  const comps = main.children('.se-component').toArray();
  for (const comp of comps) {
    const c = $(comp);
    if (c.hasClass('se-text')) {
      const lines = c.find('p.se-text-paragraph').toArray().map((p) => lineHtml($, p));
      /* 글 전체가 굵게 쓰인 글은 굵기가 제목 신호가 아니다 */
      const nonEmpty = lines.filter((L) => L.text);
      const boldRatio = nonEmpty.length ? nonEmpty.filter((L) => L.allBold).length / nonEmpty.length : 0;
      /* 글 전체가 큰 글씨인 글(재식립 사례)도 마찬가지 — 큰 글씨가 절반을 넘으면 제목 신호가 아니다 */
      const bigRatio = nonEmpty.length ? nonEmpty.filter((L) => L.big).length / nonEmpty.length : 0;
      let run = [];
      const flush = () => {
        if (run.length) blocks.push({ type: 'p', html: run.map((r) => r.html).join(' '), text: clean(run.map((r) => r.text).join(' ')) });
        run = [];
      };
      for (let i = 0; i < lines.length; i++) {
        const L = lines[i];
        if (!L.text) {
          flush();
          continue;
        }
        if (DROP_LINE.test(L.text)) continue;
        /* 소제목: 큰 글씨 한 줄, 또는 (굵은 글이 절반 미만인 글에서) 앞뒤가 빈 줄인 굵은 짧은 줄.
           굵은 문장 조각("…재발하면서", "…치아를")이 소제목이 되지 않게 조사·어미로 끝나는 줄은 제외 */
        const bare = L.text.replace(/^[“"'‘]+|[”"'’)]+$/g, '');
        const titleLike = bare.length <= 26 && !/[.。!?,]$/.test(bare) && !/(며|면서|고|여|는|을|를|이|가|에|의|로|와|과|도|서|은|면|데)$/.test(bare);
        const standalone = (i === 0 || !lines[i - 1].text) && (i === lines.length - 1 || !lines[i + 1].text);
        if ((L.big && bigRatio < 0.5 && L.text.length <= 40 && !/[.。!?]$/.test(bare)) || (L.allBold && titleLike && standalone && boldRatio < 0.5)) {
          flush();
          blocks.push({ type: 'h3', html: esc(L.text), text: L.text });
          continue;
        }
        run.push({ html: L.html, text: L.text });
      }
      flush();
    } else if (c.hasClass('se-quotation')) {
      const t = clean(c.find('.se-quote').text() || c.text());
      if (!t) continue;
      if (t.length <= 45) blocks.push({ type: 'h2', html: esc(t), text: t });
      else blocks.push({ type: 'quote', html: `<p>${esc(t)}</p>`, text: t });
    } else if (c.hasClass('se-image') || c.hasClass('se-imageStrip')) {
      for (const im of c.find('img').toArray()) {
        const src = $(im).attr('data-lazy-src') || $(im).attr('src') || '';
        if (!/postfiles\.pstatic\.net|blogfiles\.pstatic\.net/.test(src)) continue;
        imgN++;
        const file = `${IMG_DIR}/${slug}-${String(imgN).padStart(2, '0')}.webp`;
        const size = await fetchImage(src, file);
        /* "※ 이미지 클릭시 예약 페이지로 연결됩니다" 같은 네이버 전용 안내는 여기서는 거짓말이 된다(오너 지적 2026-09-11) */
        const cap0 = clean(c.find('.se-caption').first().text());
        const cap = /클릭|예약 페이지|문의/.test(cap0) ? '' : cap0;
        blocks.push({ type: 'img', src: `/img/clinical/${slug}-${String(imgN).padStart(2, '0')}.webp`, size, cap, text: cap });
      }
    } else if (c.hasClass('se-table')) {
      const rows = c
        .find('tr')
        .toArray()
        .map((tr) => $(tr).find('td, th').toArray().map((td) => clean($(td).text())));
      const text = rows.flat().join(' ');
      if (!text || /02-734|대표전화|카카오|톡톡|예약|전화/.test(text)) continue; /* 전화·예약 표는 우리 사이드바가 맡는다 */
      const body = rows.map((r, i) => `<tr>${r.map((cell) => (i === 0 ? `<th>${esc(cell)}</th>` : `<td>${esc(cell)}</td>`)).join('')}</tr>`).join('');
      blocks.push({ type: 'table', html: `<div class="table-wrap"><table>${body}</table></div>`, text });
    } else if (c.hasClass('se-horizontalLine')) {
      blocks.push({ type: 'hr', html: '<hr>', text: '' });
    }
    /* oglink · placesMap · sticker · video 는 버린다 */
  }

  /* 2. 꼬리 자르기 — 뒤쪽 절반에서 진료시간·전화·고지가 시작되는 첫 블록부터 */
  const half = Math.floor(blocks.length * 0.5);
  const tailAt = blocks.findIndex((b, i) => i >= half && b.type !== 'img' && TAIL.test(b.text));
  const kept = tailAt > 0 ? blocks.slice(0, tailAt) : blocks;
  /* 끝에 남은 구분선·빈 제목은 버린다 */
  while (kept.length && (kept[kept.length - 1].type === 'hr' || kept[kept.length - 1].type === 'h2' || kept[kept.length - 1].type === 'h3')) kept.pop();

  /* 3. HTML */
  const parts = [];
  for (const b of kept) {
    if (b.type === 'p') parts.push(`<p>${b.html}</p>`);
    else if (b.type === 'h2') parts.push(`<h2>${b.html}</h2>`);
    else if (b.type === 'h3') parts.push(`<h3>${b.html}</h3>`);
    else if (b.type === 'quote') parts.push(`<blockquote>${b.html}</blockquote>`);
    else if (b.type === 'img') parts.push(`<figure><img src="${b.src}" alt="${esc(b.cap || title)}" width="${b.size.w}" height="${b.size.h}" loading="lazy">${b.cap ? `<figcaption>${esc(b.cap)}</figcaption>` : ''}</figure>`);
    else if (b.type === 'table') parts.push(b.html);
    else if (b.type === 'hr') parts.push('<hr>');
  }
  const bodyHtml = parts.join('\n');

  /* 4. 요약 — 첫 본문 문단의 앞 두 문장 */
  /* 본문 문단을 이어 붙여 앞 문장들 — 110자를 넘기면 멈추고 180자는 안 넘긴다 */
  const joined = kept.filter((b) => b.type === 'p').map((b) => b.text).join(' ');
  const sents = joined.split(/(?<=[.!?])\s+(?=\S)/);
  let summary = '';
  for (const se of sents) {
    if (summary && (summary + ' ' + se).length > 180) break;
    summary = summary ? summary + ' ' + se : se;
    if (summary.length >= 110) break;
  }
  if (!summary) summary = title;
  /* 표지 — 붉은 기가 적은(피가 안 보이는) 사진 가운데 마지막 것(대개 완성 사진), 없으면 가장 덜 붉은 것 */
  const imgs = kept.filter((b) => b.type === 'img');
  const calm = imgs.filter((b) => b.size.red < 20);
  const firstImg = calm.length ? calm[calm.length - 1] : imgs.length ? imgs.reduce((a, b) => (b.size.red < a.size.red ? b : a)) : undefined;

  const doc = {
    title: title || originalTitle,
    originalTitle,
    kind,
    date,
    time,
    summary,
    category,
    image: firstImg?.src,
    imageAlt: firstImg?.cap || title,
    sourceUrl: `https://blog.naver.com/${BLOG_ID}/${id}`,
    html: bodyHtml,
  };
  const file = `${OUT_DIR}/${date}-${slug}.json`;
  /* 같은 slug 의 옛 파일(날짜가 바뀐 경우) 정리 */
  for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith(`-${slug}.json`) && f !== path.basename(file)) fs.unlinkSync(`${OUT_DIR}/${f}`);
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
  const textLen = kept.filter((b) => b.type === 'p').reduce((n, b) => n + b.text.length, 0);
  console.log(`${id} → ${file}\n   ${date} ${time} | 본문 ${textLen}자 · 블록 ${kept.length}(원 ${blocks.length}) · 사진 ${imgN}장 · 꼬리 ${tailAt}\n   요약: ${summary.slice(0, 90)}`);
}

const only = process.argv.slice(2);
const dates = await rssDates();
for (const row of POSTS) {
  if (only.length && !only.includes(row[0])) continue;
  try {
    await importPost(row, dates);
  } catch (e) {
    console.error(`${row[0]} 실패: ${e.message}`);
  }
}
