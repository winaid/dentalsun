import Image from 'next/image';
import { figSrc, type Fig } from '@/lib/docs';

/**
 * 장비 진열 띠 — 진료과목 아코디언(HubAccordion)과 같은 동작·같은 결(오너 요청).
 *  · 넓은 화면: 띠가 가로로 붙어 한 화면을 채우고, 올린 띠가 넓어지며 이름·설명·특징이 나온다.
 *  · 좁은 화면: '올림' 이 없으니 카드로 편다(진료과목과 같은 규칙).
 *
 * ★ 진료과목과 다른 점 — 장비 사진은 진료 장면(꽉 채움)과 배경 있는 제품 사진(통째로 놓기)이 섞여 있다.
 *   제품 사진을 띠에 꽉 채우면 잘려 나가므로 shot 값으로 갈라 담는다. 흰 배경 제품은 띠 바탕도 흰색이라
 *   사진이 잘린 티가 안 난다(회귀 사례: 사진을 옅은 상자에 또 넣어 '상자 안 상자' 로 보이던 것).
 */
export interface EquipItem {
  /** 접힌 띠에 쓸 짧은 이름(2~5자) */
  short: string;
  /** 알약에 쓰는 순번·갈래 (Point 01 · 무통마취 …) */
  n: string;
  title: string;
  desc: string;
  more?: string[];
  fig: Fig;
  /** photo = 진료 장면(꽉 채움) · product-light = 흰 배경 제품 · product-dark = 어두운 배경 제품 */
  shot: 'photo' | 'product-light' | 'product-dark';
}

const bandBg = (shot: EquipItem['shot']) => (shot === 'product-light' ? 'bg-white' : 'bg-night');

export function EquipShowcase({ items }: { items: EquipItem[] }) {
  return (
    <>
      {/* 넓은 화면 — 펼침 띠 */}
      <div className="acc reveal mt-10 hidden h-[460px] gap-2 lg:flex" role="list">
        {items.map((it, i) => (
          <div
            key={it.title}
            role="listitem"
            tabIndex={0}
            className={`acc-item group relative overflow-hidden rounded-3xl text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-500 ${bandBg(it.shot)}`}
          >
            <Image
              src={figSrc(it.fig.key)}
              alt={it.fig.alt}
              fill
              sizes="(max-width: 1280px) 60vw, 760px"
              className={`acc-img ${it.shot === 'photo' ? 'object-cover' : 'acc-fit object-contain p-7 pb-44'}`}
            />
            {/* 흰 바탕 띠는 접혀 있을 때만 남색으로 덮는다 — 접힌 띠들이 하나만 허옇게 튀지 않게 */}
            {it.shot === 'product-light' && <div aria-hidden className="acc-veil absolute inset-0 bg-night" />}
            <div className="acc-shade absolute inset-0" />
            {/* 흰 배경 제품 사진은 아래쪽이 밝아 흰 글씨가 묻힌다 — 글 자리에만 짙은 바탕을 한 겹 더 깐다 */}
            {it.shot === 'product-light' && <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-night via-night/88 to-transparent" />}

            {/* 접힌 상태 — 번호와 짧은 이름 */}
            <div className="acc-closed absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5 px-2 pb-7">
              <span className="text-[12px] font-extrabold tracking-[0.2em] text-sun-300">{String(i + 1).padStart(2, '0')}</span>
              <span className="h-6 w-px bg-sun-400/70" />
              <span className="whitespace-nowrap text-[15px] font-bold tracking-[0.02em] text-white">{it.short}</span>
            </div>

            {/* 펼친 상태 */}
            <div className="acc-open absolute inset-x-0 bottom-0 p-7 lg:p-8">
              <span className="inline-flex rounded-full bg-sun-500/90 px-3 py-1 text-[11.5px] font-extrabold tracking-[0.12em] text-white">{it.n}</span>
              <p className="mt-3 text-[1.45rem] font-extrabold leading-tight tracking-[-0.02em] on-photo xl:text-[1.7rem]">{it.title}</p>
              <p className="mt-3 max-w-[520px] text-[15px] leading-[1.75] text-white/85">{it.desc}</p>
              {it.more && it.more.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {it.more.map((m) => (
                    <li key={m} className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur">{m}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 좁은 화면 — 카드 (띠는 올림이 없어 못 쓴다) */}
      <div className="lg:hidden">
        <ul className="reveal-stack mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <li key={it.title} className="card flex h-full flex-col overflow-hidden">
              <span className={`relative block aspect-[3/2] ${it.shot === 'product-light' ? 'bg-white' : it.shot === 'product-dark' ? 'bg-night' : 'bg-canvas-2'}`}>
                <Image src={figSrc(it.fig.key)} alt={it.fig.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className={it.shot === 'photo' ? 'object-cover' : 'object-contain p-4'} />
              </span>
              <span className="flex flex-1 flex-col p-5">
                <span className="pill-sun w-fit !py-0.5 !text-[11px]">{it.n}</span>
                <span className="mt-2.5 block text-[1.05rem] font-bold leading-snug text-ink">{it.title}</span>
                <span className="mt-2 block text-[14.5px] leading-[1.7] text-ink-soft">{it.desc}</span>
                {it.more && it.more.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {it.more.map((m) => (
                      <li key={m} className="flex items-start gap-2 text-[13.5px] leading-[1.6] text-ink-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
