import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-[72px] md:pt-[88px]">
        <section className="section">
          <div className="wrap text-center">
            <p className="eyebrow justify-center">404</p>
            <h1 className="display-sm mt-4">찾으시는 페이지가 없습니다</h1>
            <p className="lead mt-4">주소가 바뀌었거나 잘못 입력되었을 수 있습니다.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/" className="btn-brand">홈으로</Link>
              <Link href="/treatment" className="btn-ghost">진료 안내</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
