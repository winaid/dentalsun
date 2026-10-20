import Image from 'next/image';
import { CLINIC } from '@/lib/clinic';
import { figSrc } from '@/lib/docs';

/**
 * 오시는 길 지도 — 2026-10-20 원장 PPT 105쪽 '광화문 6번출구 표시 되게 가능할까요' + 오너 "지도 자리엔 사진, 밑에 네이버·카카오·구글로 열기 버튼".
 * 구글 지도 끼워 넣기(iframe)에는 광화문역 6번 출구 번호가 안 나와서(3·4·7번만) 네이버 지도 장소 화면을 2배로 찍은 사진으로 바꿨다.
 *   원본: map.naver.com/p/entry/place/37932471 (확대 17) — 오너 "병원이 너무 아래, 조금 더 아래쪽으로" → 병원 핀이 세로 70% 쯤,
 *   위로 광화문역 이름까지. 도구 C:/tmp/sun-ppt-1019/tools/nmap4.mjs(잘라 낸 자리 navermap/crop4.json), 사진 1040×960 CSS px 의 2배.
 *   사진은 네이버 지도 저작물 — 아래 'ⓒ NAVER Corp.' 표기를 지우지 말 것.
 * 오너 "지도 사진 너무 크다, 버튼은 전문적으로" → crop4 에서 위 190px(광화문역 이름 줄)을 덜고 1040×700(v3)로, 열기 단추는 같은 폭 세 칸.
 * 꼬리표 자리는 사진 위 % — 6번 출구 원 가운데(538,327) · 병원 핀 머리 위(478,501) / 1040×700. 사진을 다시 찍으면 두 자리를 다시 잴 것.
 * 열기 단추 로고: 네이버 지도·카카오맵은 Wikimedia Commons 앱 아이콘, 구글 지도는 구글 PWA 아이콘(public/img/brand/*-app.webp).
 */
const EXIT6 = { left: '51.7%', top: '46.7%' };
const PIN = { left: '46%', top: '71.6%' };

function Tag({ at, tone, children }: { at: { left: string; top: string }; tone: 'navy' | 'sun'; children: React.ReactNode }) {
  const bg = tone === 'navy' ? 'bg-brand-700' : 'bg-sun-500';
  const tip = tone === 'navy' ? 'border-t-brand-700' : 'border-t-sun-500';
  return (
    <span
      aria-hidden
      className={`absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-full ${bg} px-3 py-1.5 text-[12.5px] font-bold text-white shadow-[var(--shadow-lift)] md:text-[14px]`}
      style={at}
    >
      {children}
      <span className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent ${tip}`} />
    </span>
  );
}

export function VisitMap({ className = '' }: { className?: string }) {
  const q = encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`);
  const links = [
    { label: '네이버 지도', href: CLINIC.maps.naverPlace, logo: 'brand/naver-map-app' },
    { label: '카카오맵', href: CLINIC.maps.kakaoPlace, logo: 'brand/kakao-map-app' },
    { label: '구글 지도', href: `https://www.google.com/maps/search/?api=1&query=${q}`, logo: 'brand/google-maps-app' },
  ];
  return (
    <div className={`card flex flex-col overflow-hidden ${className}`}>
      <a href={CLINIC.maps.naverPlace} target="_blank" rel="noopener" className="relative block" aria-label="네이버 지도에서 광화문선치과의원 위치 열기">
        <Image
          src={figSrc('place/naver-map-v3')}
          alt="광화문역 6번 출구에서 동화면세점을 지나 남쪽으로 약 170m, 광화문선치과의원 위치를 표시한 지도"
          width={1600}
          height={1077}
          sizes="(max-width: 1023px) 100vw, 720px"
          className="h-auto w-full"
        />
        <Tag at={EXIT6} tone="navy">광화문역 6번 출구 · 도보 2분</Tag>
        <Tag at={PIN} tone="sun">광화문선치과의원</Tag>
        {/* 네이버 지도 저작물 표기 — 지도 오른쪽 아래 귀퉁이(지도 서비스 표기 자리) */}
        <span className="absolute bottom-2 right-2 rounded bg-white/85 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-muted">ⓒ NAVER Corp.</span>
      </a>
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
