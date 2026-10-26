'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 움직이는 카카오 지도 — 카카오맵 '지도 퍼가기'(키 없이 쓰는 공식 퍼가기 코드).
 * 2026-10-26 원장 PPT(홈페이지 261026) 5쪽 "지도 표시가 안 움직이는 거로 바뀜. 시청역도 표시가 안 되어 있음" →
 *   10-20 에 넣은 네이버 지도 사진(움직이지 않음, 시청역이 잘림) 대신 끌고 확대할 수 있는 카카오 지도.
 *   카카오 지도에는 광화문역 출구 번호(6번 포함)와 시청역이 지도 자체에 나온다.
 * 지도는 우리 쪽 작은 문서(public/kakao-map.html)를 iframe 으로 연다 — 카카오 설치 스크립트가 document.write 를 쓰고
 *   지금 문서 주소로 http/https 를 골라서, 화면에 바로 넣거나 srcdoc 으로 넣으면 막혔다(그 파일 맨 위 설명).
 */
/** 지도 아래 카카오 단추 줄(로드뷰·길찾기·지도 크게 보기) 높이 + 테두리 */
const BAR = 34;

export function KakaoRoughMap() {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const w = Math.round(box.current?.clientWidth ?? 0);
    if (!w) return;
    // 폰은 세로로 길게 — 병원 위쪽 광화문역과 아래쪽 시청역이 한 화면에 들어오게(가운데가 병원)
    setSize({ w, h: w < 640 ? 540 : Math.round(w * 0.62) });
  }, []);
  return (
    <div ref={box} className="kakao-rough" style={size ? { minHeight: size.h + BAR } : undefined}>
      {size && (
        <iframe
          title="광화문선치과의원 위치 — 카카오 지도(끌어서 움직이고 확대할 수 있습니다)"
          src={`/kakao-map.html?w=${size.w}&h=${size.h}`}
          width={size.w}
          height={size.h + BAR}
          className="block w-full border-0"
        />
      )}
    </div>
  );
}
