import Image from 'next/image';
import { figSrc } from '@/lib/docs';

/**
 * 국가자격 치과위생사 띠 — 홈과 치과소개가 같이 쓴다(한쪽만 고쳐지는 일이 없게).
 * 2026-10-07 원장 PPT 61쪽 '추가 희망 · 내용 변경 가능'(예시 띠). 예시 문구를 우리 말로 다듬었다(스탭→스태프, 치위생사→치과위생사).
 * 배경은 AI 사진(병원 사진은 전부 원장이라 스태프 사진이 없다, 얼굴 없음).
 * 2026-11-10 병원(본부장 전달) "멸균 내용 중 치과위생사는 빼고, 이 띠로 나왔으면" — 치과소개에도 넣었다. 병원이 직접 넣어 달라 해 '스태프 전원' 사실 확인으로 본다.
 */
export function HygienistBand() {
  return (
    <section id="hygienist" className="relative isolate overflow-hidden bg-night py-24 text-white md:py-28">
      <div className="absolute inset-0 -z-10">
        <Image src={figSrc('ai/wide-hygienist')} alt="" fill sizes="(max-width: 1023px) 250vw, 100vw" className="object-cover opacity-45" data-parallax="0.2" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/60 to-night/85" />
      </div>
      <div className="wrap">
        <div className="reveal mx-auto max-w-[860px] text-center">
          <p className="eyebrow on-dark justify-center">COMFORT &amp; CARE</p>
          <h2 className="display-sm mt-4 !text-white on-photo">
            전문의 의료진은 물론,
            <br />
            스태프 전원이 <span className="accent-sun whitespace-nowrap">국가자격 치과위생사</span>로 구성됩니다
          </h2>
          <p className="mx-auto mt-6 max-w-[640px] text-[1.1rem] leading-[1.8] text-white/80 md:text-[1.12rem]">편안하고 친절하게, 안심하실 수 있도록 함께 돌봅니다.</p>
        </div>
      </div>
    </section>
  );
}
