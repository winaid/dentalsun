import Image from 'next/image';
import Link from 'next/link';
import { figSrc } from '@/lib/docs';
import { CLINIC, HOURS, MONTHLY_NOTICE } from '@/lib/clinic';

/**
 * 오른쪽 사이드바 카드 — 턱관절 화면(TmjPage)에서 쓰던 것을 블로그 글에서도 쓰려고 뽑았다(오너 2026-09-11:
 * "블로그 글 오른쪽 여백 많은데 턱관절 오른쪽처럼 꾸며볼래?"). 두 화면이 같은 카드를 쓰니 한쪽만 고쳐지는 일이 없다.
 */

/** 의료진 사진 카드 — 의료진 소개로 간다 */
export function DoctorCard() {
  return (
    <Link href="/about/doctors" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-night shadow-[var(--shadow-soft)]">
      <Image src={figSrc('sun/doctor-arms')} alt="진료실에서 팔짱을 낀 양대일 원장" fill sizes="360px" className="object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-[1.04]" />
      <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="block text-[12px] font-bold tracking-[0.18em] text-sun-300">보건복지부 인증 전문의</span>
        <span className="mt-1 block text-[1.15rem] font-extrabold leading-snug">양대일 원장이 직접 진단하고 치료합니다</span>
        <span className="mt-1 block text-[13px] text-white/75">강남성심병원 외래교수 출신 · 의료진 소개 ›</span>
      </span>
    </Link>
  );
}

/** 전화 · 진료시간 · 예약 단추 */
export function ContactCard() {
  return (
    <div className="card p-5">
      <p className="text-[1.1rem] font-extrabold text-ink">진료상담안내</p>
      <a href={CLINIC.phoneHref} className="mt-1 block text-[1.9rem] font-extrabold tracking-[-0.03em] text-brand-800 hover:text-sun-600">{CLINIC.phone}</a>
      <dl className="mt-3 divide-y divide-hairline text-[14px]">
        {HOURS.display.map((h) => (
          <div key={h.label} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="font-semibold text-ink">
              {h.label}
              {h.note && <span className="ml-1.5 text-[12px] font-semibold text-sun-600">{h.note}</span>}
            </dt>
            <dd className="tabular-nums text-ink-soft">{h.time}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[12.5px] leading-[1.6] text-ink-muted">{HOURS.closed}</p>
      <p className="mt-4 rounded-xl bg-sun-50 px-4 py-3 text-[12.5px] leading-[1.6] text-sun-700">
        <span className="font-bold">{MONTHLY_NOTICE.title}</span>
        <br />
        {MONTHLY_NOTICE.items.map((it) => `${it.dates} ${it.label}`).join(' · ')}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun !px-3 !py-2.5 text-center text-[14px]">네이버 예약</a>
        <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="btn-ghost !px-3 !py-2.5 text-center text-[14px]">톡톡 상담</a>
      </div>
    </div>
  );
}

/** 링크 목록 카드 — 제목 한 줄 + 항목들(오른쪽 › 표시) */
export function LinkListCard({ title, accent, items }: { title: string; accent?: string; items: Array<{ label: string; href: string; meta?: string }> }) {
  if (!items.length) return null;
  return (
    <div className="card p-5">
      <p className="text-[1.15rem] font-extrabold text-ink">
        {title}
        {accent && <span className="text-sun-500"> {accent}</span>}
      </p>
      <ul className="mt-3 divide-y divide-hairline">
        {items.map((g) => (
          <li key={g.href}>
            <Link href={g.href} className="flex items-center justify-between gap-3 py-2.5 text-[14.5px] font-semibold text-ink-soft hover:text-brand-700">
              <span className="min-w-0">
                <span className="line-clamp-1">{g.label}</span>
                {g.meta && <span className="mt-0.5 block text-[12px] font-medium tabular-nums text-ink-muted">{g.meta}</span>}
              </span>
              <span aria-hidden className="shrink-0 text-ink-muted">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
