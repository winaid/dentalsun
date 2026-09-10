import Link from 'next/link';
import Image from 'next/image';
import { NAV } from '@/lib/nav';
import { CLINIC, HOURS } from '@/lib/clinic';

/**
 * 꼬리말 — 사업자 정보(의료광고 필수 표기)와 사이트 전역 내부 링크.
 * ★ 전 페이지에 한 번씩 실리는 자리라 지역명·역 정보가 여기 들어간다.
 */
/** 전체 메뉴 칸들 — 넓은 화면의 다섯 칸과 폰의 접힘 상자가 같은 목록을 쓴다. 링크는 폰에서도 손가락 높이(≥32px) */
function NavColumns() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-8">
      {NAV.map((item) => (
        <div key={item.href}>
          {item.href.startsWith('http') ? (
            <p className="text-[15px] font-extrabold text-ink">{item.label}</p>
          ) : (
            <Link href={item.href} className="inline-block py-1 text-[15px] font-extrabold text-ink hover:text-brand-700">{item.label}</Link>
          )}
          <ul className="mt-1.5 lg:mt-2">
            {item.children?.map((c) => (
              <li key={c.href}>
                {c.external ? (
                  <a href={c.href} target="_blank" rel="noopener" className="inline-block py-1.5 text-[14.5px] text-ink-soft hover:text-brand-700 lg:py-1">{c.label} ↗</a>
                ) : (
                  <Link href={c.href} className="inline-block py-1.5 text-[14.5px] text-ink-soft hover:text-brand-700 lg:py-1">{c.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_2.6fr]">
          <div>
            <Image src="/img/brand/logo.png" alt={CLINIC.name} width={522} height={145} className="h-11 w-auto" />
            <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-ink-soft">{CLINIC.description}</p>
            {/* 항목마다 이름표를 왼쪽에 세워 눈이 한 줄씩 따라가게 한다 — 한 문단에 몰아 쓰면 읽히지 않는다(오너) */}
            <dl className="mt-7 grid grid-cols-[52px_1fr] gap-x-4 gap-y-3 text-[15px] text-ink-soft">
              <dt className="font-bold text-ink">주소</dt>
              <dd className="leading-[1.6]">
                {CLINIC.address.full}
                <span className="block text-ink-muted">{CLINIC.address.landmark}</span>
              </dd>

              <dt className="font-bold text-ink">전화</dt>
              <dd className="leading-[1.6]">
                <a href={CLINIC.phoneHref} className="font-semibold text-ink hover:underline">
                  {CLINIC.phone}
                </a>
                <span className="block text-ink-muted">팩스 {CLINIC.fax}</span>
              </dd>

              <dt className="font-bold text-ink">진료시간</dt>
              <dd>
                <ul className="space-y-1.5">
                  {HOURS.display.map((h) => (
                    <li key={h.label} className="leading-[1.5]">
                      <span className="inline-block w-[72px] text-ink-muted">{h.label}</span>
                      <span className="tabular-nums whitespace-nowrap">{h.time}</span>
                      {/* 단서(야간진료 · 2·4째주)는 시간 아래 줄로 — 옆에 붙이면 시간이 두 줄로 접힌다 */}
                      {h.note && <span className="block pl-[72px] text-[13px] text-sun-600">{h.note}</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-ink-muted">{HOURS.closed}</p>
              </dd>

              <dt className="font-bold text-ink">주차</dt>
              <dd className="leading-[1.6]">
                {CLINIC.parking.place} {CLINIC.parking.fee}
              </dd>
            </dl>
          </div>

          {/* 넓은 화면: 다섯 칸 전체 메뉴. 폰: 접어 두고 '전체 메뉴 보기'로 편다 — 마흔 개 링크가 두 화면을 차지하던 것 */}
          <nav aria-label="전체 메뉴" className="hidden lg:block">
            <NavColumns />
          </nav>
          <details className="group rounded-2xl border border-hairline bg-white lg:hidden">
            <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between px-5 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
              전체 메뉴 보기
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform group-open:rotate-180"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <nav aria-label="전체 메뉴 (폰)" className="border-t border-hairline px-5 pb-5 pt-4">
              <NavColumns />
            </nav>
          </details>
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
