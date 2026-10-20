import Image from 'next/image';
import { CLINIC } from '@/lib/clinic';
import { figSrc } from '@/lib/docs';

/**
 * 오시는 길 지도 — 2026-10-20 원장 PPT 105쪽 '광화문 6번출구 표시 되게 가능할까요' + 오너 "지도 자리엔 사진, 밑에 네이버·카카오·구글로 열기 버튼".
 * 구글 지도 끼워 넣기(iframe)에는 광화문역 6번 출구 번호가 안 나와서(3·4·7번만) 네이버 지도 장소 화면을 2배로 찍은 사진으로 바꿨다.
 *   원본: map.naver.com/p/entry/place/37932471 (확대 17, 광화문역 이름까지 보이게 지도를 240px 내림) → C:/tmp/sun-ppt-1019/navermap, 도구 tools/nmap3.mjs.
 *   사진은 네이버 지도 저작물 — 아래 'ⓒ NAVER Corp.' 표기를 지우지 말 것.
 * 6번 출구 꼬리표는 사진 위 % 자리(사진 1040×780 기준 출구 원 546,470). 사진을 다시 찍으면 EXIT6 도 다시 잴 것.
 */
const EXIT6 = { left: '52.5%', top: '60.3%' };

export function VisitMap({ className = '' }: { className?: string }) {
  const q = encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`);
  const links = [
    { label: '네이버 지도로 열기', href: CLINIC.maps.naverPlace, dot: 'bg-[#03C75A]' },
    { label: '카카오맵으로 열기', href: CLINIC.maps.kakaoPlace, dot: 'bg-[#FEE500]' },
    { label: '구글 지도로 열기', href: `https://www.google.com/maps/search/?api=1&query=${q}`, dot: 'bg-[#4285F4]' },
  ];
  return (
    <div className={`card flex flex-col overflow-hidden ${className}`}>
      <a href={CLINIC.maps.naverPlace} target="_blank" rel="noopener" className="relative block" aria-label="네이버 지도에서 광화문선치과의원 위치 열기">
        <Image
          src={figSrc('place/naver-map')}
          alt="광화문역 6번 출구에서 동화면세점을 지나 남쪽으로 약 170m, 광화문선치과의원 위치를 표시한 지도"
          width={1600}
          height={1200}
          sizes="(max-width: 1023px) 100vw, 780px"
          className="h-auto w-full"
        />
        <span
          aria-hidden
          className="absolute -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-full bg-brand-700 px-3 py-1.5 text-[13px] font-bold text-white shadow-[var(--shadow-lift)] md:text-[14px]"
          style={EXIT6}
        >
          광화문역 6번 출구 · 도보 2분
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent border-t-brand-700" />
        </span>
      </a>
      <div className="flex flex-wrap gap-2 border-t border-hairline p-4">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener" className="pill gap-2 !px-4 !py-2 !text-[14px] !text-ink hover:border-brand-300">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${l.dot}`} />
            {l.label}
          </a>
        ))}
      </div>
      <p className="px-4 pb-3 text-[11.5px] text-ink-muted">지도 ⓒ NAVER Corp.</p>
    </div>
  );
}
