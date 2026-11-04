import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { QuickMenu } from '@/components/QuickMenu';
import { RevealScript } from '@/components/RevealScript';
import { WrapGuard } from '@/components/WrapGuard';
import { CLINIC } from '@/lib/clinic';
import { metaDesc } from '@/lib/seo';

/* 홈 메타 설명 본문 — 앞에 '광화문 치과 광화문 선치과. 광화문역·시청역·종로·을지로 인근,' 이 붙는다(metaDesc, 2026-11-03 병원 요청). */
const HOME_DESC = '통합치의학과 전문의 대표원장이 내비게이션 임플란트, 풀아치 임플란트, 턱관절 치료, 사랑니 발치, MTA 신경치료, 라미네이트, 치아미백을 직접 진료합니다. 화·목 야간진료, 코리아나 호텔 주차.';

/**
 * 루트 레이아웃.
 * ★ metadataBase 가 있어야 OG 이미지·canonical 이 절대 주소로 나간다.
 * ★ 머리말(SiteHeader)은 쪽마다 둔다 — 어두운 첫 화면 위에서는 투명, 밝은 쪽은 흰 바탕이라 prop 이 다르다.
 * ★ 구조화 데이터는 여기서 내지 않는다 — components/JsonLd 가 쪽마다 @graph 하나를 낸다.
 */
export const metadata: Metadata = {
  metadataBase: new URL(CLINIC.url),
  title: {
    default: CLINIC.shortName,
    template: `%s | ${CLINIC.shortName}`,
  },
  description: metaDesc('/', HOME_DESC),
  applicationName: CLINIC.name,
  alternates: { canonical: '/', languages: { 'ko-KR': CLINIC.url, 'x-default': CLINIC.url }, types: { 'application/rss+xml': `${CLINIC.url}/rss.xml` } },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: CLINIC.name,
    title: CLINIC.shortName,
    description: metaDesc('/', HOME_DESC),
    url: CLINIC.url,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: true },
  /* 검색 소유 확인 — 네이버 서치어드바이저 https://dentalsun.co.kr (2026-11-04). 지우면 소유 확인이 풀린다. */
  verification: { other: { 'naver-site-verification': '5444666c67103709c56ce2c3b8ae7cfdde5c7e0b' } },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="/fonts/pretendard/pretendard.css" />
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: '.reveal,.reveal-stack>*,.img-in,.line-rise>span,.award-frame,.award-line,.award-rule{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
      </head>
      <body className="pb-[72px] md:pb-0">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-700 focus:px-5 focus:py-3 focus:text-white">
          본문으로 건너뛰기
        </a>
        {children}
        <SiteFooter />
        <QuickMenu />
        <RevealScript />
        <WrapGuard />
      </body>
    </html>
  );
}
