import Image from 'next/image';
import { CLINIC } from '@/lib/clinic';
import { figSrc } from '@/lib/docs';
import { KakaoRoughMap } from '@/components/KakaoRoughMap';

/**
 * 오시는 길 지도.
 * 2026-10-26 원장 PPT(홈페이지 261026) 5쪽 "지도 표시가 안 움직이는 거로 바뀜. 시청역도 표시가 안 되어 있음" →
 *   움직이는 카카오 지도(components/KakaoRoughMap). 광화문역 6번 출구 번호와 시청역이 지도 자체에 나온다.
 * 내력: 10-20 원장 PPT 105쪽 '광화문 6번출구 표시' 때 구글 지도 끼워 넣기(6번 출구 번호가 안 나옴)를 네이버 지도 사진(place/naver-map-v3, 꼬리표 두 개)으로
 *   바꿨었다 — 그 사진은 움직이지 않고 시청역이 잘려 이번에 뺐다(되살리려면 git 이력 7518392).
 * 열기 단추 로고: 네이버 지도·카카오맵은 Wikimedia Commons 앱 아이콘, 구글 지도는 구글 PWA 아이콘(public/img/brand/*-app.webp).
 */
export function VisitMap({ className = '' }: { className?: string }) {
  const q = encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`);
  const links = [
    { label: '네이버 지도', href: CLINIC.maps.naverPlace, logo: 'brand/naver-map-app', tone: 'border-[#02a94c] bg-[#03c75a] text-white shadow-[0_4px_12px_-4px_rgba(3,199,90,0.55)] hover:bg-[#02b350]' },
    { label: '카카오맵', href: CLINIC.maps.kakaoPlace, logo: 'brand/kakao-map-app', tone: 'border-[#e0c400] bg-[#fee500] text-[#191919] shadow-[0_4px_12px_-4px_rgba(224,196,0,0.6)] hover:bg-[#f5dc00]' },
    { label: '구글 지도', href: `https://www.google.com/maps/search/?api=1&query=${q}`, logo: 'brand/google-maps-app', tone: 'border-[#14254a] bg-[#1e3a6e] text-white shadow-[0_4px_12px_-4px_rgba(30,58,110,0.55)] hover:bg-[#182f5a]' },
  ];
  return (
    <div id="visit-map" className={`card flex flex-col overflow-hidden ${className}`}>
      <KakaoRoughMap />
      {/* 열기 단추 — 같은 폭 세 칸(오너 "전문적으로 사이즈"). 로고 + 이름 + 새 창 표시.
          2026-10-28 오너 "네이버는 초록, 카카오는 노랑, 구글은 남색으로 테두리 임팩트·강조" → 브랜드 색 채움 + 진한 테두리 + 색 그림자, 로고는 흰 칸 안에 */}
      <div className="grid grid-cols-3 gap-2 border-t border-hairline p-3 sm:gap-2.5 sm:p-4">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener" aria-label={`${l.label} 열기(새 창)`} className={`flex h-12 items-center justify-center gap-1.5 rounded-xl border-2 text-[13px] font-bold transition-[background-color,transform] hover:-translate-y-px sm:gap-2 sm:text-[15px] ${l.tone}`}>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white sm:h-7 sm:w-7">
              <Image src={figSrc(l.logo)} alt="" width={20} height={20} className="h-[18px] w-[18px] rounded-[4px] sm:h-5 sm:w-5" />
            </span>
            {l.label}
            <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" className="hidden shrink-0 opacity-75 sm:block"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        ))}
      </div>
    </div>
  );
}
