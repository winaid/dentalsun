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
    { label: '네이버 지도', href: CLINIC.maps.naverPlace, logo: 'brand/naver-map-app' },
    { label: '카카오맵', href: CLINIC.maps.kakaoPlace, logo: 'brand/kakao-map-app' },
    { label: '구글 지도', href: `https://www.google.com/maps/search/?api=1&query=${q}`, logo: 'brand/google-maps-app' },
  ];
  return (
    <div id="visit-map" className={`card flex flex-col overflow-hidden ${className}`}>
      <KakaoRoughMap />
      {/* 열기 단추 — 같은 폭 세 칸·높이 44px(오너 "전문적으로 사이즈"). 로고 20px + 이름 + 새 창 표시 */}
      <div className="grid grid-cols-3 gap-2 border-t border-hairline p-3 sm:gap-2.5 sm:p-4">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener" aria-label={`${l.label} 열기(새 창)`} className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-hairline bg-white text-[13px] font-semibold text-ink transition-colors hover:border-brand-300 hover:bg-canvas sm:gap-2 sm:text-[14.5px]">
            <Image src={figSrc(l.logo)} alt="" width={20} height={20} className="h-[18px] w-[18px] shrink-0 rounded-[5px] sm:h-5 sm:w-5" />
            {l.label}
            <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" className="hidden shrink-0 text-ink-muted sm:block"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        ))}
      </div>
    </div>
  );
}
