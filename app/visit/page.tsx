import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { HeroCollage } from '@/components/HeroCollage';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb, ContactBand, Figure, Sentences } from '@/components/ui';
import { CLINIC, HOURS, MONTHLY_NOTICE } from '@/lib/clinic';
import { desc80, alt, breadcrumbSchema, medicalWebPageSchema, og, withLocality } from '@/lib/seo';

/** 처음 오시는 날의 순서 — 사진은 네이버 플레이스 실사(place2/). 대기실 사진은 거울의 다른 원장 이름을 지운 판 */
const FIRST_VISIT = [
  {
    fig: { key: 'place2/entrance', alt: '금색 광화문 선치과 로고가 붙은 거울 기둥과 유리문이 있는 입구' },
    title: '입구',
    desc: '건물 3층, 금색 광화문 선치과 로고와 SUN DENTAL CLINIC 유리문이 있는 곳이 병원 입구입니다.',
  },
  {
    fig: { key: 'place2/reception', alt: '곡선형 나무 접수대와 광화문 선치과 간판' },
    title: '접수 · 문진',
    desc: '복용 중인 약이나 치료 중인 질환이 있으면 접수 때 알려 주세요. 다른 치과에서 찍은 X-ray나 CT가 있다면 가져오셔도 됩니다.',
  },
  {
    fig: { key: 'place2/waiting', alt: '창가에 가죽 벤치가 놓인 대기실' },
    title: '검사 · 상담',
    desc: '대표원장이 증상을 듣고 필요한 검사를 정합니다. 촬영한 영상은 모니터로 함께 보며 설명합니다.',
  },
];

const TITLE = '오시는 길 · 진료시간';
const DESC = withLocality('광화문선치과 오시는 길과 진료시간 — 5호선 광화문역 6번 출구 도보 2분, 1·2호선 시청역 3번 출구 도보 5분. 화·목 야간진료 21시, 코리아나 호텔 야외주차장 무료주차.');

export const metadata: Metadata = { title: TITLE, description: desc80(DESC), alternates: alt('/visit'), openGraph: og({ title: TITLE, description: DESC, path: '/visit' }) };

export default function VisitPage() {
  const trail = [{ name: TITLE, path: '/visit' }];
  const q = encodeURIComponent(`${CLINIC.name} ${CLINIC.address.full}`);
  return (
    <>
      <SiteHeader dark />
      <JsonLd data={[breadcrumbSchema(trail), medicalWebPageSchema({ title: TITLE, description: DESC, path: '/visit' })]} />
      <main id="main">
        <HeroCollage
          trail={trail}
          eyebrow="VISIT US"
          long
          cardsLead="내원 전에 확인해 주세요."
          lines={['광화문역 6번 출구', <><span className="accent-sun">도보 2분</span></>]}
          lead={`${CLINIC.address.street} ${CLINIC.address.landmark.replace(' · ', ', ')}입니다. 화·목요일은 오후 9시까지 진료하며, 주차는 ${CLINIC.parking.place}을 무료로 이용하실 수 있습니다.`}
          bg="ai/wide-visit"
          cards={[
            { fig: { key: 'place/place03', alt: '광화문 선치과 진료실과 간판' }, shape: 'portrait' },
            { fig: { key: 'place2/reception', alt: '곡선형 나무 접수대와 광화문 선치과 간판' }, shape: 'wide' },
            { fig: { key: 'place2/waiting', alt: '창가에 가죽 벤치가 놓인 대기실' }, shape: 'std' },
          ]}
          items={[
            { title: '주소', desc: `${CLINIC.address.full} · ${CLINIC.address.landmark}` },
            { title: '진료시간', desc: '월~금 10:00~19:00 · 화·목 야간진료 21:00까지 · 토요일 2·4째주 10:00~14:00' },
            { title: '주차', desc: `${CLINIC.parking.place} ${CLINIC.parking.fee}` },
          ]}
        >
          <ul className="flex flex-wrap gap-2.5">
            {CLINIC.transit.map((t) => (
              <li key={t.line} className="inline-flex items-center gap-2 rounded-full border-2 bg-white/95 px-4 py-1.5 text-[15px] font-bold text-ink" style={{ borderColor: t.color }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-white" style={{ background: t.color }}>{t.line.replace('호선', '')}</span>
                {t.station} {t.exit} {t.walk}
              </li>
            ))}
          </ul>
          {/* 다른 쪽과 같은 버튼 두 개(오너: 첫 화면마다 CTA 통일) */}
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="btn-sun">네이버 예약</a>
            <a href={CLINIC.phoneHref} className="btn-ghost-dark">전화 {CLINIC.phone}</a>
          </div>
        </HeroCollage>

        <section className="section">
          <div className="wrap grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="reveal card overflow-hidden">
              <iframe title="광화문선치과 지도" src={`https://www.google.com/maps?q=${q}&z=17&output=embed&hl=ko`} className="h-[420px] w-full border-0 lg:h-[560px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="reveal-stack grid content-start gap-4">
              <div className="card p-6">
                <p className="text-[14px] font-bold tracking-wide text-ink-muted">주소</p>
                <p className="mt-2 text-[1.1rem] font-bold text-ink">{CLINIC.address.full}</p>
                <p className="mt-1 text-[15px] text-ink-soft">{CLINIC.address.landmark}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={CLINIC.maps.naverPlace} target="_blank" rel="noopener" className="pill hover:border-brand-300">네이버 지도</a>
                  <a href={CLINIC.maps.kakaoPlace} target="_blank" rel="noopener" className="pill hover:border-brand-300">카카오맵</a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener" className="pill hover:border-brand-300">구글 지도</a>
                </div>
              </div>
              <div className="card p-6" id="hours">
                <p className="text-[14px] font-bold tracking-wide text-ink-muted">진료시간</p>
                <ul className="mt-3 divide-y divide-hairline">
                  {HOURS.display.map((h) => (
                    <li key={h.label} className="flex items-center justify-between gap-3 py-2.5 text-[16px]">
                      <span className="font-semibold text-ink">
                        {h.label}
                        {h.note && <span className="mt-1 !block w-fit pill-sun !py-0.5 !text-[11px] sm:ml-2 sm:mt-0 sm:!inline-flex">{h.note}</span>}
                      </span>
                      <span className="shrink-0 whitespace-nowrap font-bold tabular-nums text-brand-800">{h.time}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[14px] text-ink-muted">{HOURS.closed} · 토요일은 2·4째주 진료입니다. 휴진일이 바뀌는 달도 있으니 아래 이달의 진료일정을 확인해 주세요.</p>
              </div>
              <div className="card p-6">
                <p className="text-[14px] font-bold tracking-wide text-ink-muted">주차</p>
                <p className="mt-2 text-[16px] font-bold text-ink">
                  {CLINIC.parking.place} {CLINIC.parking.fee}
                </p>
              </div>
              <a href={CLINIC.phoneHref} className="rounded-2xl bg-brand-700 p-6 text-white transition-colors hover:bg-brand-800">
                <p className="text-[14px] text-white/70">전화 문의 · 예약</p>
                <p className="mt-1 text-[1.8rem] font-extrabold tracking-tight">{CLINIC.phone}</p>
                <p className="mt-1 text-[14px] text-white/70">팩스 {CLINIC.fax}</p>
              </a>
            </div>
          </div>
        </section>

        {/* 처음 오시는 날 — 2026-09-29 네이버 플레이스 실사(입구·접수·대기실)로 신설. 설명은 사진에 보이는 것과 환자에게 드리는 부탁만 쓴다 */}
        <section className="section bg-canvas" id="first-visit">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">FIRST VISIT</p>
              <h2 className="display-sm mt-4">
                처음 오시는 날, <span className="accent whitespace-nowrap">이렇게 진행합니다</span>
              </h2>
              <p className="lead mt-4"><Sentences text="첫날은 문진과 검사, 상담이 중심입니다. 치료를 바로 시작할지는 검사 결과를 함께 본 뒤에 정합니다." /></p>
            </div>
            <ol className="reveal-stack grid-cards mt-10 sm:grid-cols-3">
              {FIRST_VISIT.map((s, i) => (
                <li key={s.fig.key} className="card flex h-full flex-col overflow-hidden">
                  <Figure fig={s.fig} ratio="aspect-[4/3]" sizes="(max-width: 640px) 100vw, 33vw" rounded="rounded-none" effect="img-in" caption={false} />
                  <div className="flex flex-1 flex-col p-6">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-3 text-[1.05rem] font-bold text-ink">{s.title}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" id="notice">
          <div className="wrap grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div className="reveal">
              <p className="eyebrow">MONTHLY SCHEDULE</p>
              <h2 className="display-sm mt-4">{MONTHLY_NOTICE.title}</h2>
              <p className="lead mt-4"><Sentences text="휴진일과 야간진료일을 확인하신 뒤 예약해 주세요. 명절 연휴 등으로 달마다 휴진일이 달라질 수 있습니다." /></p>
              <ul className="mt-6 divide-y divide-hairline rounded-2xl border border-hairline bg-white">
                {MONTHLY_NOTICE.items.map((it) => (
                  <li key={it.dates} className="flex items-center justify-between px-5 py-3.5 text-[16px]">
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

        <section className="section bg-canvas" id="contact">
          <div className="wrap">
            <div className="reveal max-w-[760px]">
              <p className="eyebrow">CONTACT</p>
              <h2 className="display-sm mt-4">상담 · 예약 창구</h2>
              <p className="lead mt-4"><Sentences text="예약은 전화와 네이버 예약으로 받습니다. 다녀가신 분들의 후기는 네이버 플레이스에서 보실 수 있습니다." /></p>
            </div>
            <div className="reveal-stack mt-8 grid gap-5 sm:grid-cols-3">
              <a href={CLINIC.phoneHref} className="card card-hover p-6">
                <p className="text-[1.05rem] font-bold text-ink">전화 상담</p>
                <p className="mt-1.5 text-[15px] text-ink-soft">{CLINIC.phone} — 진료시간 중에 증상 상담과 예약 변경을 받습니다.</p>
              </a>
              <a href={CLINIC.booking.naver} target="_blank" rel="noopener" className="card card-hover p-6">
                <p className="text-[1.05rem] font-bold text-ink">온라인 예약 ↗</p>
                <p className="mt-1.5 text-[15px] text-ink-soft">네이버 예약에서 날짜와 시간을 직접 고를 수 있습니다. 처음이시면 불편한 부위를 짧게 남겨 주세요.</p>
              </a>
              <a href={CLINIC.booking.naverReview} target="_blank" rel="noopener" className="card card-hover p-6">
                <p className="text-[1.05rem] font-bold text-ink">치료후기 ↗</p>
                <p className="mt-1.5 text-[15px] text-ink-soft">다녀가신 환자분들의 후기는 네이버 플레이스에서 보실 수 있습니다.</p>
              </a>
            </div>
          </div>
        </section>
        <ContactBand />
      </main>
    </>
  );
}
