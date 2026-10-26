'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 움직이는 카카오 지도 — 카카오맵 '지도 퍼가기'(키 없이 쓰는 공식 퍼가기 코드).
 * 2026-10-26 원장 PPT(홈페이지 261026) 5쪽 "지도 표시가 안 움직이는 거로 바뀜. 시청역도 표시가 안 되어 있음" →
 *   10-20 에 넣은 네이버 지도 사진(움직이지 않음, 시청역이 잘림) 대신 끌고 확대할 수 있는 카카오 지도.
 *   카카오 지도에는 광화문역 출구 번호(6번 포함)와 시청역이 지도 자체에 나온다.
 * 값은 map.kakao.com 장소 624215116(광화문선치과의원) → 지도공유 → HTML 태그 복사 → 소스 생성하기 로 받았다(도구 C:/tmp/sun-1026/kmap/probe4.mjs).
 * ★ 카카오 설치 스크립트는 document.write 로 본 스크립트를 끼워 넣어서, 화면이 다 그려진 뒤(비동기) 불러오면 막힌다.
 *   그래서 카카오가 준 코드를 글자 그대로 작은 문서(iframe srcdoc)에 넣어 그 안에서 평소처럼 돌린다. 지도 아래 주소·전화 칸(.cont)은 그 안에서 숨긴다.
 */
const ROUGH = { timestamp: '1793003401336', key: '3xzh2488kmy' };
const LOADER = 'https://t1.kakaocdn.net/kakaomapweb/roughmap/loader/prod/roughmapLoader.js';
/** 지도 아래 카카오 단추 줄(로드뷰·길찾기·지도 크게 보기) 높이 + 테두리 */
const BAR = 34;

const doc = (w: number, h: number) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><base target="_blank">
<style>html,body{margin:0;padding:0;overflow:hidden;background:#f7f8fa}.root_daum_roughmap .cont{display:none!important}</style></head>
<body><div id="daumRoughmapContainer${ROUGH.timestamp}" class="root_daum_roughmap root_daum_roughmap_landing"></div>
<script charset="UTF-8" class="daum_roughmap_loader_script" src="${LOADER}"></script>
<script charset="UTF-8">new daum.roughmap.Lander({"timestamp":"${ROUGH.timestamp}","key":"${ROUGH.key}","mapWidth":"${w}","mapHeight":"${h}"}).render();</script>
</body></html>`;

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
          srcDoc={doc(size.w, size.h)}
          width={size.w}
          height={size.h + BAR}
          loading="lazy"
          className="block w-full border-0"
        />
      )}
    </div>
  );
}
