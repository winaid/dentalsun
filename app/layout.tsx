import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { QuickMenu } from '@/components/QuickMenu';
import { RevealScript } from '@/components/RevealScript';
import { CLINIC } from '@/lib/clinic';

/**
 * 루트 레이아웃.
 * ★ metadataBase 가 있어야 OG 이미지·canonical 이 절대 주소로 나간다.
 * ★ 머리말(SiteHeader)은 쪽마다 둔다 — 어두운 첫 화면 위에서는 투명, 밝은 쪽은 흰 바탕이라 prop 이 다르다.
 * ★ 구조화 데이터는 여기서 내지 않는다 — components/JsonLd 가 쪽마다 @graph 하나를 낸다.
 */
export const metadata: Metadata = {
  metadataBase: new URL(CLINIC.url),
  title: {
    default: `${CLINIC.shortName} | 광화문역 치과 · 디지털 임플란트 · 턱관절 치료`,
    template: `%s | ${CLINIC.shortName}`,
  },
  description: CLINIC.description,
  applicationName: CLINIC.name,
  alternates: { canonical: '/', languages: { 'ko-KR': CLINIC.url, 'x-default': CLINIC.url } },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: CLINIC.name,
    title: `${CLINIC.shortName} | 광화문역 치과 · 디지털 임플란트 · 턱관절 치료`,
    description: CLINIC.description,
    url: CLINIC.url,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: true },
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
              __html: '.reveal,.reveal-stack>*,.img-in,.line-rise>span{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
      </head>
      <body className="pb-16 md:pb-0">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-700 focus:px-5 focus:py-3 focus:text-white">
          본문으로 건너뛰기
        </a>
        {children}
        <SiteFooter />
        <QuickMenu />
        <RevealScript />
      </body>
    </html>
  );
}
