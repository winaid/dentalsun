import Image from 'next/image';
import type { ReactNode } from 'react';
import { Breadcrumb, Sentences } from '@/components/ui';
import { figSrc } from '@/lib/docs';

/**
 * 밝은 쪽(치과소개·의료진·장비·FAQ·진료 안내·오시는 길)의 머리 — 진료 문서와 같은 어두운 사진 띠.
 * 구역이 비슷해 보이지 않도록 쪽마다 다른 와이드 AI 사진을 깐다.
 */
export function PageHero({ trail, eyebrow, title, lead, bg, children }: { trail: Array<{ name: string; path: string }>; eyebrow: string; title: ReactNode; lead?: string; bg: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc(bg)} alt="" fill priority sizes="100vw" className="kenburns object-cover" data-parallax="0.2" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night/80 to-transparent" />
      </div>
      <div className="wrap pt-[120px] pb-16 md:pt-[160px] md:pb-24">
        <Breadcrumb trail={trail} dark />
        <p className="eyebrow on-dark mt-6 hero-in">{eyebrow}</p>
        <h1 className="display mt-4 max-w-[900px] !text-white hero-in hero-in-2 on-photo">{title}</h1>
        {lead && (
          <p className="mt-6 max-w-[720px] text-[1.05rem] leading-[1.85] text-white/80 hero-in hero-in-3 md:text-[1.12rem]">
            <Sentences text={lead} />
          </p>
        )}
        {children && <div className="mt-8 hero-in hero-in-4">{children}</div>}
      </div>
    </section>
  );
}
