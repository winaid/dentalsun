import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { PageHero } from '@/components/PageHero';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand , Sentences } from '@/components/ui';
import { CLINIC, HOURS, MONTHLY_NOTICE } from '@/lib/clinic';
import { alt, breadcrumbSchema, medicalWebPageSchema, og, withLocality } from '@/lib/seo';

const TITLE = '오시는 길 · 진료시간';
const DESC = withLocality('광화문선치과 오시는 길과 진료시간 — 5호선 광화문역 6번 출구 도보 2분, 1·2호선 시청역 3번 출구 도보 5분. 화·목 야간진료 21시, 코리아나 호텔 야외주차장 무료주차.');

export const metadata: Metadata = { title: TITLE, description: DESC, alternates: alt('/visit'), openGraph: og({ title: TITLE, description: DESC, path: '/visit' }) };

export default function VisitPage() {
  const trail = [{ name: TITLE, path: '/visit' }];
  const q = encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`);
  return (
    <>
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/visit' })]} />
      <main id="main">
        <PageHero trail={trail} eyebrow="VISIT US" bg="ai/wide-visit" title={<>광화문역 <span className="accent">6번 출구 도보 2분</span>
              <br />
              광화문선치과 오시는 길</>}>
          <p className="max-w-[720px] text-[1.05rem] leading-[1.85] text-white/80">{CLINIC.address.full} — {CLINIC.address.landmark}. 화·목요일은 밤 9시까지 야간진료를 하고, 코리아나 호텔 야외주차장을 무료로 이용하실 수 있습니다.</p><ul className="flex flex-wrap gap-2.5">
              {CLINIC.transit.map((t) => (
                <li key={t.line} className="inline-flex items-center gap-2 rounded-full border-2 bg-white/95 px-4 py-1.5 text-[14px] font-bold text-ink" style={{ borderColor: t.color }}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-white" style={{ background: t.color }}>{t.line.replace('호선', '')}</span>
                  {t.station} {t.exit} {t.walk}
                </li>
              ))}
            </ul>
        </PageHero>

        <section className="section">
          <div className="wrap grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="reveal card overflow-hidden">
              <iframe title="광화문선치과 지도" src={`https://www.google.com/maps?q=${q}&z=17&output=embed&hl=ko`} className="h-[420px] w-full border-0 lg:h-[560px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="reveal-stack grid content-start gap-4">
              <div className="card p-6">
                <p className="text-[13px] font-bold tracking-wide text-ink-muted">주소</p>
                <p className="mt-2 text-[1.1rem] font-bold text-ink">{CLINIC.address.full}</p>
                <p className="mt-1 text-[14px] text-ink-soft">{CLINIC.address.landmark}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={CLINIC.maps.naverPlace} target="_blank" rel="noopener" className="pill hover:border-brand-300">네이버 지도</a>
                  <a href={CLINIC.maps.kakaoPlace} target="_blank" rel="noopener" className="pill hover:border-brand-300">카카오맵</a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener" className="pill hover:border-brand-300">구글 지도</a>
                </div>
              </div>
              <div className="card p-6" id="hours">
                <p className="text-[13px] font-bold tracking-wide text-ink-muted">진료시간</p>
                <ul className="mt-3 divide-y divide-hairline">
                  {HOURS.display.map((h) => (
                    <li key={h.label} className="flex items-center justify-between py-2.5 text-[15px]">
                      <span className="font-semibold text-ink">
                        {h.label}
                        {h.note && <span className="ml-2 pill-sun !py-0.5 !text-[11px]">{h.note}</span>}
                      </span>
                      <span className="font-bold tabular-nums text-brand-800">{h.time}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] text-ink-muted">{HOURS.closed} · 토요일은 격주 진료이므로 아래 이달의 진료일정을 확인해 주세요.</p>
              </div>
              <div className="card p-6">
                <p className="text-[13px] font-bold tracking-wide text-ink-muted">주차</p>
                <p className="mt-2 text-[15px] font-bold text-ink">
                  {CLINIC.parking.place} {CLINIC.parking.fee}
                </p>
              </div>
              <a href={CLINIC.phoneHref} className="rounded-2xl bg-brand-700 p-6 text-white transition-colors hover:bg-brand-800">
                <p className="text-[13px] text-white/70">전화 문의 · 예약</p>
                <p className="mt-1 text-[1.8rem] font-extrabold tracking-tight">{CLINIC.phone}</p>
                <p className="mt-1 text-[13px] text-white/70">팩스 {CLINIC.fax}</p>
              </a>
            </div>
          </div>
        </section>

        <section className="section bg-canvas" id="notice">
          <div className="wrap grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div className="reveal">
              <p className="eyebrow">MONTHLY SCHEDULE</p>
              <h2 className="display-sm mt-4">{MONTHLY_NOTICE.title}</h2>
              <p className="lead mt-4"><Sentences text="진료 일정 참고하셔서 내원 및 예약에 착오 없으시길 바랍니다." /></p>
              <ul className="mt-6 divide-y divide-hairline rounded-2xl border border-hairline bg-white">
                {MONTHLY_NOTICE.items.map((it) => (
                  <li key={it.dates} className="flex items-center justify-between px-5 py-3.5 text-[15px]">
                    <span className="font-semibold text-ink">{it.dates}</span>
                    <span className={`font-bold ${/휴진/.test(it.label) ? 'text-sun-600' : 'text-brand-700'}`}>{it.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal mx-auto w-full max-w-[520px]">
              <Image src={MONTHLY_NOTICE.image} alt={MONTHLY_NOTICE.title} width={1024} height={1536} sizes="(max-width: 1024px) 100vw, 520px" className="h-auto w-full rounded-2xl border border-hairline" />
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">CONTACT</p>
              <h2 className="display-sm mt-4">상담 · 예약 창구</h2>
              <p className="lead mt-4"><Sentences text="기존 홈페이지의 온라인상담·온라인예약·치료후기 창구를 그대로 잇습니다." /></p>
            </div>
            <div className="reveal-stack mt-8 grid gap-5 sm:grid-cols-3">
              <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="card card-hover p-6">
                <p className="text-[1.05rem] font-bold text-ink">1:1 톡 상담 ↗</p>
                <p className="mt-1.5 text-[14px] text-ink-soft">네이버 톡톡으로 궁금한 점을 남겨 주세요.</p>
              </a>
              <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="card card-hover p-6">
                <p className="text-[1.05rem] font-bold text-ink">온라인 예약 ↗</p>
                <p className="mt-1.5 text-[14px] text-ink-soft">네이버 예약에서 원하는 시간을 고르세요.</p>
              </a>
              <a href={CLINIC.booking.naverReview} target="_blank" rel="noopener" className="card card-hover p-6">
                <p className="text-[1.05rem] font-bold text-ink">치료후기 ↗</p>
                <p className="mt-1.5 text-[14px] text-ink-soft">다녀가신 환자분들의 후기는 네이버 플레이스에서 보실 수 있습니다.</p>
              </a>
            </div>
          </div>
        </section>
        <ContactBand />
      </main>
    </>
  );
}
