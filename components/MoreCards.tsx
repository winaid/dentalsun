import Image from 'next/image';
import Link from '@/components/SiteLink';
import type { CSSProperties } from 'react';
import { Sentences } from '@/components/ui';
import { figSrc, type Doc } from '@/lib/docs';
import { docByPath } from '@/lib/content';
import { NAV } from '@/lib/nav';

/**
 * 쪽 맨 아래 '○○, 더 자세히 알아보기' 사진 카드 — 턱관절 쪽(components/TmjPage)의 카드와 같은 모양.
 * 2026-11-24 병원(본부장 전달) "임플란트나 일반진료는 관련한 걸로 안 들어가 있다" → 오너 "사진 카드 다 통일".
 * 카드 = 지금 쪽이 속한 메뉴(임플란트 아홉·일반진료 일곱)의 나머지 쪽, 메뉴 이름·순서 그대로(첫 칸은 '○○ 안내').
 * 메뉴 아래 하위 쪽(심미보철·MTA·보험틀니 등)은 부모 갈래의 메뉴를 쓴다. 메뉴 첫 쪽(임플란트·일반진료 허브)은
 * 위에 이미 같은 목록이 있어 넣지 않는다.
 */

export type MoreItem = { href: string; label: string; desc: string; fig: { key: string; alt: string } };

const LEADS: Record<string, string> = {
  '/treatment/implant': '내비게이션·맞춤·풀아치·UV·자가혈 임플란트와 뼈이식·상악동거상술, 보험 틀니·임플란트, 보증제도를 페이지별로 나눠 정리했습니다.',
  '/treatment/general': '심미치료, 매복사랑니, 자연치아 살리기, 재근관치료, 치주치료, 무통·저자극 시스템을 페이지별로 나눠 정리했습니다.',
};

const GROUPS = Object.keys(LEADS).flatMap((href) => {
  const n = NAV.find((x) => x.href === href);
  if (!n) return [];
  return [{ href, name: n.label, lead: LEADS[href], items: [{ label: `${n.label} 안내`, href: n.href }, ...(n.children ?? []).map((c) => ({ label: c.label, href: c.href }))] }];
});

/** 지금 쪽의 '더 자세히 알아보기' 묶음 — 해당 없으면 null. photo = 경로별 카드 사진(쪽마다 같은 그림이 나오게 한곳에서) */
export function moreFor(doc: Doc, photo: (href: string) => string) {
  const g = GROUPS.find((x) => x.items.some((it) => it.href === doc.path || it.href === doc.hub));
  if (!g || doc.path === g.href) return null;
  const items: MoreItem[] = g.items
    .filter((it) => it.href !== doc.path)
    .map((it) => {
      const d = docByPath(it.href);
      return { href: it.href, label: it.label, desc: d ? d.summary.split(/(?<=다\.)\s/)[0] : '', fig: { key: photo(it.href), alt: it.label } };
    });
  return { name: g.name, lead: g.lead, items };
}

/** 한 줄 카드 수 — 여섯·아홉은 셋씩, 일곱·여덟은 넷씩(마지막 줄은 가운데로) */
export const morePerRow = (n: number) => (n % 4 === 0 || n === 7 ? 4 : 3);

export function MoreCards({ id, name, lead, items, perRow, className = '', inner = '' }: { id: string; name: string; lead: string; items: MoreItem[]; perRow: number; className?: string; inner?: string }) {
  const line = <span aria-hidden className="h-px w-5 shrink-0 bg-current opacity-50 md:w-7" />;
  return (
    <section className={className} aria-labelledby={id}>
      <div className={inner}>
        <div className="reveal text-center">
          <p className="inline-flex items-center gap-2.5 text-[14px] font-bold leading-none text-sun-600 md:text-[15px]">
            {line}더 알아보기{line}
          </p>
          <h2 id={id} className="display-sm mt-4">
            {name}, <span className="accent-sun">더 자세히</span> 알아보기
          </h2>
          <p className="lead mx-auto mt-4 max-w-[640px] lg:max-w-[960px]">
            <Sentences text={lead} clauses={false} />
          </p>
        </div>
        <ul className="reveal-stack cards-flex mt-12" style={{ '--sm': 2, '--lg': perRow, '--xl': perRow } as CSSProperties}>
          {items.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="card card-hover flex h-full flex-col overflow-hidden">
                {/* 사진은 칸을 꽉 채운다 — 풀아치 렌더(illust/)를 턱관절 도해처럼 contain 하면 위아래 흰 띠가 생긴다 */}
                <span className="relative block aspect-[4/3] overflow-hidden bg-canvas-2">
                  <Image src={figSrc(c.fig.key)} alt={c.fig.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="text-[1.15rem] font-extrabold text-ink">{c.label}</span>
                  <span className="mt-2 text-[16px] leading-[1.7] text-ink-soft">{c.desc}</span>
                  <span className="mt-auto pt-4 text-[13.5px] font-bold text-brand-700">자세히 보기 ›</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
