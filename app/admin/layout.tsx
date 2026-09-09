import type { Metadata } from 'next';

/*
 * ⚠️ 관리자 화면은 검색에 안 실린다 — robots.ts 의 disallow 와 여기 noindex 가 한 쌍이다.
 *    한쪽만 있으면 링크를 타고 온 크롤러가 색인한다.
 */
export const metadata: Metadata = {
  title: '블로그 관리',
  robots: { index: false, follow: false, nocache: true },
};

/*
 * ★ data-admin — globals.css 가 이 표식을 보고 사이트 머리말·꼬리말·퀵메뉴를 숨긴다.
 *   루트 레이아웃은 손대지 않는다(사이트 전체가 쓰는 파일). 관리자는 작업 화면이라 예약 띠·전화 단추가 필요 없고,
 *   아래 고정 퀵메뉴가 '지금 바로 올리기' 띠를 가렸다(2026-09-08 실측).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div data-admin>{children}</div>;
}
