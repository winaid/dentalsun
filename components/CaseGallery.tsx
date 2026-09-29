'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CASE_CATEGORY_LABEL, CASE_NOTE, casesOf, type CaseCategory, type CaseItem } from '@/lib/caseLibrary';
import { figSrc } from '@/lib/docs';
import { Sentences } from '@/components/ui';
import { CompareStage } from '@/components/BeforeAfter';

/**
 * 치료 전후 사례 — 원장 요청(2026-09-29): **구내 사진 / 방사선 사진 두 영역**.
 *  · ★ 같은 날 밤 오너: "비포애프터 이전처럼 마우스로 끄는 모션 넣어줘" — 영역마다 옛 홈의 전후 비교 무대(CompareStage)를 다시 쓴다.
 *    가운데 큰 무대에서 주황 손잡이를 좌우로 끌고, 아래 사례 줄에서 고른다(처음 보일 때 갈림선이 한 번 좌우로 지나간다).
 *    (그 전에는 원장 요청대로 사례마다 위=전·아래=후로 쌓았었다.)
 *  · 임상 사진은 치료 부위가 잘리면 안 되므로 무대에 통째로(contain) 놓는다. 구내 사진은 남는 자리를 같은 사진을 흐리게 깔아 메운다.
 *  · 경과가 셋 이상인 사례(턱관절 CT)는 두 장 비교가 안 되니 옛 방식(위에서 아래로 차례)으로 둔다.
 *  · 홈에서는 진료별 칩으로 거른다(filter). 진료 쪽에서는 그 진료 사례만 보여 준다(categories).
 */
export function CaseGallery({ categories, filter = false }: { categories?: CaseCategory[]; filter?: boolean }) {
  const all = useMemo(() => casesOf(categories), [categories]);
  const cats = useMemo(() => [...new Set(all.map((c) => c.category))], [all]);
  const [cat, setCat] = useState<CaseCategory | 'all'>('all');
  const shown = cat === 'all' ? all : all.filter((c) => c.category === cat);
  const intra = shown.filter((c) => c.type === 'intraoral');
  const xray = shown.filter((c) => c.type === 'xray');
  if (!all.length) return null;
  /* 영역마다 끌어 보기인지(사례가 섞여 있으면) 위아래 차례인지(경과 사례뿐이면) — 아래 Area 와 같은 판정 */
  const areas = [intra, xray].filter((a) => a.length);
  const hasSlider = areas.some((a) => !a.every((c) => c.middle?.length));
  const hasStack = areas.some((a) => a.every((c) => c.middle?.length));
  const how = [hasSlider && '가운데 손잡이를 좌우로 끌면 왼쪽이 치료 전, 오른쪽이 치료 후입니다.', hasStack && '경과 사진은 위에서 아래로 시간 순서입니다.'].filter(Boolean).join(' ');
  return (
    <div>
      {filter && cats.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="진료별 사례 거르기">
          {(['all', ...cats] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={cat === k}
              onClick={() => setCat(k)}
              className={`rounded-full px-4 py-2 text-[14px] font-bold transition-colors ${cat === k ? 'bg-brand-700 text-white' : 'bg-canvas text-ink-soft hover:bg-brand-50 hover:text-brand-700'}`}
            >
              {k === 'all' ? '전체' : CASE_CATEGORY_LABEL[k]}
            </button>
          ))}
        </div>
      )}
      {/* key 로 거르기가 바뀌면 영역을 새로 — 고른 사례가 첫 장으로 돌아간다 */}
      {intra.length > 0 && <Area key={`i-${cat}`} title="구내 사진 전후" sub="입안을 직접 찍은 사진" items={intra} kind="intraoral" />}
      {xray.length > 0 && <Area key={`x-${cat}`} title="방사선 사진 전후" sub="파노라마 · 치근단 · CT" items={xray} kind="xray" />}
      <p className="mx-auto mt-8 max-w-[900px] rounded-xl bg-sun-50 px-5 py-3.5 text-center text-[13.5px] leading-relaxed text-sun-700"><Sentences text={`${CASE_NOTE} ${how}`} /></p>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

function Area({ title, sub, items, kind }: { title: string; sub: string; items: CaseItem[]; kind: 'intraoral' | 'xray' }) {
  /* 경과 사례(턱관절 CT 세 시점)는 다른 사례와 함께 있으면 처음↔최근 두 장으로 끌어 보고, 그것뿐일 때(턱관절 쪽)만 위아래 차례로 둔다 */
  const onlyStacks = items.every((c) => c.middle?.length);
  const pairs = onlyStacks ? [] : items;
  const stacks = onlyStacks ? items : [];
  const [ci, setCi] = useState(0);
  const cur = pairs[Math.min(ci, pairs.length - 1)];
  const xr = kind === 'xray';
  /*
   * 무대 비율 — 구내는 16:10 고정(사진 대부분 1.5~2:1). 방사선은 사진마다 다르다(파노라마 2.4:1 · 치근단 1.37:1 · 세로 치근단 0.73:1) —
   * 파노라마 틀에 세로 치근단을 넣으면 가는 띠가 됐다(09-29 캡처). 사진 비율을 따르되 1.45~2.4 사이로 묶는다. 사진은 통째로 놓는다.
   */
  const stageRatio = (c: CaseItem) => (xr ? Math.min(2.4, Math.max(1.45, c.before.w / c.before.h)) : 1.6);
  const thumbRatio = xr ? 'aspect-[11/5]' : 'aspect-[16/10]';
  return (
    <section className="mt-12" aria-label={title}>
      <div className="mx-auto flex max-w-[800px] items-baseline justify-between gap-4">
        <h3 className="text-[1.2rem] font-extrabold text-ink md:text-[1.35rem]">
          {title} <span className="ml-1 text-[14px] font-semibold text-ink-muted">{sub}</span>
        </h3>
        <span className="shrink-0 text-[13px] font-semibold text-ink-muted">{items.length}건</span>
      </div>

      {cur && (
        <div className="mx-auto mt-4 max-w-[800px]">
          <CompareStage
            before={{ src: figSrc(cur.before.key), alt: `${cur.caption} — 치료 전` }}
            after={{ src: figSrc(cur.after.key), alt: `${cur.caption} — 치료 후` }}
            badge={`${CASE_CATEGORY_LABEL[cur.category]} · CASE ${pad(ci + 1)} / ${pad(pairs.length)}`}
            resetKey={cur.id}
            style={{ aspectRatio: String(stageRatio(cur)) }}
            className=""
            fit="contain"
            backdrop={!xr}
            bg={xr ? 'bg-black' : 'bg-night'}
          />
          <p className="mt-3 text-center text-[14.5px] font-semibold text-ink">
            <span className="mr-1.5 text-[12.5px] font-bold text-sun-600">{CASE_CATEGORY_LABEL[cur.category]}</span>
            {cur.caption}
          </p>
          {/* 사례 고르기 — 무대 아래 한 줄. 다 들어오면 가운데, 넘치면 옆으로 밀어 본다 */}
          {pairs.length > 1 && (
            <ul className="mx-auto mt-3 flex w-max max-w-full gap-2.5 overflow-x-auto p-1 pb-2 sm:gap-3" aria-label={`${title} 사례 목록`} data-lenis-prevent-horizontal>
              {pairs.map((c, k) => (
                <li key={c.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setCi(k)}
                    aria-pressed={k === ci}
                    aria-label={`CASE ${pad(k + 1)} — ${c.caption}`}
                    className={`group block w-[104px] overflow-hidden rounded-xl bg-white p-1.5 ring-2 transition-all sm:w-[132px] ${k === ci ? 'ring-sun-500 shadow-[var(--shadow-soft)]' : 'ring-hairline opacity-75 hover:opacity-100'}`}
                  >
                    <span className={`relative block ${thumbRatio} overflow-hidden rounded-lg ${xr ? 'bg-black' : 'bg-canvas-2'}`}>
                      <Image src={figSrc(c.after.key)} alt="" fill sizes="132px" className={xr ? 'object-contain' : 'object-cover'} />
                    </span>
                    <span className={`mt-1.5 block text-[11.5px] font-bold tracking-[0.08em] ${k === ci ? 'text-sun-600' : 'text-ink-muted'}`}>CASE {pad(k + 1)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {stacks.length > 0 && (
        <ul className="mx-auto mt-6 flex max-w-[800px] flex-wrap justify-center gap-4 [--case-h:150px] sm:[--case-h:210px]">
          {stacks.map((c) => (
            <li key={c.id} className="shrink-0" style={{ width: `calc(var(--case-h) * ${((c.before.w / c.before.h) * (2 / (2 + (c.middle?.length ?? 0)))).toFixed(3)})`, minWidth: 150 }}>
              <figure className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <Shot img={c.before} label="치료 전" alt={`${c.caption} — 치료 전`} dark={xr} />
                {c.middle?.map((m, i) => <Shot key={m.key} img={m} label={`경과 ${i + 1}`} alt={`${c.caption} — 경과 ${i + 1}`} dark={xr} />)}
                <Shot img={c.after} label="최근" alt={`${c.caption} — 최근`} after dark={xr} />
                <figcaption className="px-4 py-3 text-[14px] font-semibold leading-snug text-ink">
                  <span className="mr-1.5 text-[12px] font-bold text-sun-600">{CASE_CATEGORY_LABEL[c.category]}</span>
                  {c.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Shot({ img, label, alt, after = false, dark }: { img: { key: string; w: number; h: number }; label: string; alt: string; after?: boolean; dark: boolean }) {
  return (
    <div className={`relative ${dark ? 'bg-black' : 'bg-canvas-2'}`}>
      <Image src={figSrc(img.key)} alt={alt} width={img.w} height={img.h} sizes="(max-width: 640px) 360px, 520px" className="block h-auto w-full" />
      <span className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[12px] font-extrabold text-white ${after ? 'bg-sun-500' : 'bg-night/75'}`}>{label}</span>
    </div>
  );
}
