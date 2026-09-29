'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CASE_CATEGORY_LABEL, CASE_NOTE, casesOf, type CaseCategory, type CaseItem } from '@/lib/caseLibrary';
import { figSrc } from '@/lib/docs';

/**
 * 치료 전후 사례 — 원장 요청(2026-09-29): **구내 사진 / 방사선 사진 두 영역**, 사례마다 **위 = 치료 전, 아래 = 치료 후**.
 *  · 영역마다 한 줄로 옆으로 넘긴다(사례가 많다 — 세로로 쌓으면 화면이 끝없이 길어진다).
 *  · 홈에서는 진료별 칩으로 거른다(filter). 진료 쪽에서는 그 진료 사례만 보여 준다(categories).
 *  · 드래그 비교 슬라이더(BeforeAfter)를 쓰지 않는 이유: 원장이 "위아래로 비교"를 콕 집었다.
 */
export function CaseGallery({ categories, filter = false }: { categories?: CaseCategory[]; filter?: boolean }) {
  const all = useMemo(() => casesOf(categories), [categories]);
  const cats = useMemo(() => [...new Set(all.map((c) => c.category))], [all]);
  const [cat, setCat] = useState<CaseCategory | 'all'>('all');
  const shown = cat === 'all' ? all : all.filter((c) => c.category === cat);
  const intra = shown.filter((c) => c.type === 'intraoral');
  const xray = shown.filter((c) => c.type === 'xray');
  if (!all.length) return null;
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
      {intra.length > 0 && <Area title="구내 사진 전후" sub="입안을 직접 찍은 사진" items={intra} />}
      {xray.length > 0 && <Area title="방사선 사진 전후" sub="파노라마 · 치근단 · CT" items={xray} />}
      <p className="mx-auto mt-8 max-w-[900px] rounded-xl bg-sun-50 px-5 py-3.5 text-center text-[13.5px] leading-relaxed text-sun-700">{CASE_NOTE}</p>
    </div>
  );
}

function Area({ title, sub, items }: { title: string; sub: string; items: CaseItem[] }) {
  return (
    <section className="mt-10" aria-label={title}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[1.2rem] font-extrabold text-ink md:text-[1.35rem]">
          {title} <span className="ml-1 text-[14px] font-semibold text-ink-muted">{sub}</span>
        </h3>
        <span className="shrink-0 text-[13px] font-semibold text-ink-muted">{items.length}건 · 옆으로 넘겨 보기</span>
      </div>
      {/* 사진 한 장의 높이를 줄마다 같게(--case-h) — 폭은 사진 비율로 정한다. 세로로 긴 치근단 사진이 줄 전체를 늘이지 않게 */}
      <ul className="mt-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-3 [--case-h:150px] sm:[--case-h:210px] md:gap-5" data-lenis-prevent-horizontal>
        {items.map((c) => (
          <li key={c.id} className="shrink-0 snap-start" style={{ width: `calc(var(--case-h) * ${((c.before.w / c.before.h) * (2 / (2 + (c.middle?.length ?? 0)))).toFixed(3)})`, minWidth: 150 }}>
            <figure className="overflow-hidden rounded-2xl border border-hairline bg-white">
              <Shot img={c.before} label="치료 전" alt={`${c.caption} — 치료 전`} dark={c.type === 'xray'} />
              {c.middle?.map((m, i) => <Shot key={m.key} img={m} label={`경과 ${i + 1}`} alt={`${c.caption} — 경과 ${i + 1}`} dark={c.type === 'xray'} />)}
              <Shot img={c.after} label={c.middle?.length ? '최근' : '치료 후'} alt={`${c.caption} — 치료 후`} after dark={c.type === 'xray'} />
              <figcaption className="px-4 py-3 text-[14px] font-semibold leading-snug text-ink">
                <span className="mr-1.5 text-[12px] font-bold text-sun-600">{CASE_CATEGORY_LABEL[c.category]}</span>
                {c.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
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

