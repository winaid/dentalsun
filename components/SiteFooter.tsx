import Link from 'next/link';
import Image from 'next/image';
import { NAV } from '@/lib/nav';
import { CLINIC, HOURS } from '@/lib/clinic';

/**
 * 꼬리말 — 사업자 정보(의료광고 필수 표기)와 사이트 전역 내부 링크.
 * ★ 전 페이지에 한 번씩 실리는 자리라 지역명·역 정보가 여기 들어간다.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_2.6fr]">
          <div>
            <Image src="/img/brand/logo.png" alt={CLINIC.name} width={522} height={145} className="h-11 w-auto" />
            <p className="mt-5 max-w-[380px] text-[14px] leading-relaxed text-ink-soft">{CLINIC.description}</p>
            <div className="mt-6 space-y-1.5 text-[14px] text-ink-soft">
              <p>
                <span className="font-bold text-ink">주소</span> {CLINIC.address.full} ({CLINIC.address.landmark})
              </p>
              <p>
                <span className="font-bold text-ink">전화</span> <a href={CLINIC.phoneHref} className="hover:underline">{CLINIC.phone}</a> · <span className="font-bold text-ink">팩스</span> {CLINIC.fax}
              </p>
              <p>
                <span className="font-bold text-ink">진료시간</span>{' '}
                {HOURS.display.map((h) => `${h.label} ${h.time}`).join(' · ')}
              </p>
              <p>{HOURS.closed}</p>
              <p>
                <span className="font-bold text-ink">주차</span> {CLINIC.parking.place} {CLINIC.parking.fee}
              </p>
            </div>
          </div>

          <nav aria-label="전체 메뉴" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {NAV.map((item) => (
              <div key={item.href}>
                {item.href.startsWith('http') ? (
                  <p className="text-[14px] font-extrabold text-ink">{item.label}</p>
                ) : (
                  <Link href={item.href} className="text-[14px] font-extrabold text-ink hover:text-brand-700">{item.label}</Link>
                )}
                <ul className="mt-3 space-y-2">
                  {item.children?.map((c) => (
                    <li key={c.href}>
                      {c.external ? (
                        <a href={c.href} target="_blank" rel="noopener" className="text-[13.5px] text-ink-soft hover:text-brand-700">{c.label} ↗</a>
                      ) : (
                        <Link href={c.href} className="text-[13.5px] text-ink-soft hover:text-brand-700">{c.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 text-[12.5px] text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            상호명 {CLINIC.name} · 대표자 {CLINIC.director} · 사업자등록번호 {CLINIC.bizNo}
          </p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
            <Link href="/faq" className="hover:underline">자주 묻는 질문</Link>
            <span>© {new Date().getFullYear()} {CLINIC.nameEn}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
