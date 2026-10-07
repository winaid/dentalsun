import Image from 'next/image';
import Link from 'next/link';
import { RoundBadges } from '@/components/ui';
import { figSrc } from '@/lib/docs';

/**
 * 홈 풀아치 구역 — 2026-10-07 원장 PPT 46쪽 '홈화면에 풀아치 추가', 오너 "메인에 너무 그대로 들어갔는데 좀 더 세련되고 모션그래픽이고 배경에 사진".
 *  · 글(제목·두 줄·배지)은 PPT 50쪽에 병원이 직접 쓴 글 그대로(굵게·주황도 PPT 그대로). 배지는 50쪽에 붙인 예시 배지 글자 그대로.
 *  · 바탕은 참고 20쪽(리더스: 밝은 바탕 + 오른쪽 모형 + 왼쪽 글) 짜임 — AI 그림 한 장을 두 겹으로 나눴다
 *    (ai/fullarch-band = 보철을 지운 바탕, ai/fullarch-band-bridge = 보철만 투명 오림. 원본·나누는 스크립트 C:/tmp/sun-ppt-fix/split-fa.mjs).
 *  · 모션: 보철이 천천히 내려와 임플란트 머리에 앉고(빛 고리) 다시 떠오른다 — globals.css .fa-* . 바탕은 아주 느리게 다가온다.
 *  · 넓은 화면(lg 1024~)은 그림이 구역 전체 배경(글은 왼쪽 위에), 그 아래 폭은 그림을 위에 두고 글을 아래에 둔다.
 * ⚠️ '수술 당일 식사까지 가능' · '가격은 합리적' 은 의료법 소지 — 오너에게 알림, 글자는 손대지 않는다.
 */
/* 그림(2048×1024)에서 잰 자리 — 무대(2:1) 안 % */
const BRIDGE = { left: 57.617, top: 19.531, width: 41.504 };
const IMPLANT_HEADS: Array<[number, number]> = [
  [62.6, 52.6],
  [68.6, 57.0],
  [85.2, 57.2],
  [91.8, 52.6],
];

function Stage() {
  return (
    <div className="fa-stage absolute right-0 top-0 aspect-[2/1] h-full lg:[mask-image:linear-gradient(to_right,transparent,#000_10%)]">
      <div className="fa-stage-inner">
        <Image
          src={figSrc('ai/fullarch-band')}
          alt="치아 전체를 한 덩어리로 이은 고정 보철이 임플란트 네 개 위로 내려와 고정되는 모습"
          fill
          sizes="(max-width: 639px) 180vw, (max-width: 1023px) 130vw, 100vw"
          className="object-cover"
        />
        {IMPLANT_HEADS.map(([x, y]) => (
          <span key={x} className="fa-pulse" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden />
        ))}
        <Image
          src={figSrc('ai/fullarch-band-bridge')}
          alt=""
          width={797}
          height={352}
          sizes="(max-width: 639px) 75vw, (max-width: 1023px) 55vw, 45vw"
          className="fa-bridge"
          style={{ left: `${BRIDGE.left}%`, top: `${BRIDGE.top}%`, width: `${BRIDGE.width}%` }}
        />
        <span className="fa-chip lg:max-xl:!hidden" style={{ right: '44.5%', top: '27%', transitionDelay: '0.7s' }} aria-hidden>
          고정된 치아
        </span>
        <span className="fa-chip" style={{ left: '77%', top: '74%', transform: 'translateX(-50%)', transitionDelay: '1s' }} aria-hidden>
          임플란트 4~6개
        </span>
      </div>
    </div>
  );
}

export function FullArchBand() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f6efe9]">
      {/* 그림 무대 — 좁은 화면은 위쪽 상자(오른쪽 붙임), lg 부터는 구역 전체 배경 */}
      <div className="reveal relative aspect-[8/7] overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
        <Stage />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-[#f6efe9] lg:hidden" />
      </div>
      <div className="wrap relative pb-16 pt-2 sm:pt-6 lg:flex lg:min-h-[600px] lg:items-center lg:py-20 xl:min-h-[700px] xl:py-24">
        <div className="reveal-stack max-w-[540px] lg:max-w-[460px] xl:max-w-[540px]">
          <p className="eyebrow">FULL ARCH IMPLANT</p>
          <h2 className="display-sm mt-4">
            틀니, <span className="accent whitespace-nowrap">불편하지 않으신가요?</span>
          </h2>
          <p className="mt-5 text-[1.12rem] leading-[1.7] text-ink-soft md:text-[1.3rem]">
            <span className="block">전체 치아에 필요한 임플란트, <strong className="font-extrabold text-ink">단 4~6개</strong></span>
            <span className="block"><strong className="font-extrabold text-ink">수술 당일 식사</strong>까지 가능한 <span className="font-extrabold text-sun-600">풀아치</span> 임플란트</span>
          </p>
          <RoundBadges items={['수술당일\n식사가능', '내원은\n최소한', '치료기간\n최소한', '가격은\n합리적']} className="mt-8" />
          <div className="mt-9">
            <Link href="/treatment/implant/full-arch" className="btn-brand">풀아치 임플란트 자세히</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
