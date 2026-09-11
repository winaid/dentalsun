/**
 * 구조화 데이터(JSON-LD) 빌더 — AEO/GEO 의 뼈대.
 *
 * ★ 검색엔진과 AI 는 본문을 읽기 전에 구조화 데이터를 먼저 본다. 진료시간·주소·전화번호가
 *   기계가 읽을 수 있는 형태로 있어야 지도·지식패널·AI 답변에 인용된다.
 * ★★ 확인되지 않은 값은 절대 넣지 않는다 ★★ — 틀린 구조화 데이터는 없는 것보다 나쁘다.
 *   좌표(UNVERIFIED.geo)는 확인 전이라 빠지고, 2·4째주 토요일은 openingHoursSpecification 에서 뺀다.
 * ★ 모든 노드는 @id 로 이어진다 — 발행자·검토자·저자가 한 병원, 한 사람으로 모인다.
 */
import { CLINIC, HOURS, UNVERIFIED } from './clinic';
import { DOCTORS } from './doctors';
import { NAV } from './nav';
import { contentDates } from './contentMeta';

const BASE = CLINIC.url;
export const abs = (path: string) => (path === '/' ? BASE : `${BASE}${path}`);
/** 병원 네이버 블로그 — /insight/clinical 글의 원문 출처(scripts/import-naver.mjs). sameAs 로 같은 병원임을 잇는다 (2026-09-11). */
export const NAVER_BLOG = 'https://blog.naver.com/sundent21';

export const ID = {
  clinic: `${BASE}/#clinic`,
  website: `${BASE}/#website`,
  director: `${BASE}/about/doctors#${DOCTORS[0].slug}`,
  doctor: (slug: string) => `${BASE}/about/doctors#${slug}`,
  page: (path: string) => `${abs(path)}#webpage`,
  article: (path: string) => `${abs(path)}#article`,
  breadcrumb: (path: string) => `${abs(path)}#breadcrumb`,
  image: (path: string) => `${abs(path)}#primaryimage`,
} as const;

/** 진료 갈래 이름 — 기존 홈페이지 9개 대메뉴 */
const SERVICES = NAV.filter((n) => n.href.startsWith('/treatment')).map((n) => ({ name: n.label, path: n.href }));

/** 병원 본체 스키마. 전 페이지 1회. */
export function clinicSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    /* 세 타입을 함께 준다 — 검사 도구가 @type 문자열에서 'Organization' 을 그대로 찾는다. */
    '@type': ['Organization', 'MedicalOrganization', 'Dentist'],
    '@id': ID.clinic,
    name: CLINIC.name,
    legalName: CLINIC.name,
    alternateName: [CLINIC.shortName, CLINIC.nameEn],
    description: CLINIC.description,
    url: BASE,
    telephone: CLINIC.phone,
    faxNumber: CLINIC.fax,
    taxID: CLINIC.bizNo,
    founder: { '@id': ID.director },
    employee: DOCTORS.map((d) => ({ '@id': ID.doctor(d.slug) })),
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE}/#logo`,
      url: `${BASE}/img/brand/logo.png`,
      contentUrl: `${BASE}/img/brand/logo.png`,
      caption: `${CLINIC.name} 로고`,
      width: 522,
      height: 145,
    },
    image: { '@id': `${BASE}/#logo` },
    contactPoint: [
      { '@type': 'ContactPoint', telephone: CLINIC.phone, contactType: '예약 및 진료 문의', areaServed: 'KR', availableLanguage: ['ko'] },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${CLINIC.address.street}, ${CLINIC.address.floor}`,
      addressLocality: CLINIC.address.locality,
      addressRegion: CLINIC.address.region,
      addressCountry: CLINIC.address.country,
      ...(CLINIC.address.postalCode ? { postalCode: CLINIC.address.postalCode } : {}),
    },
    areaServed: CLINIC.serviceArea.map((a) => ({ '@type': 'Place', name: a })),
    medicalSpecialty: 'Dentistry',
    /* "주차 되나요" 는 지역 병원 검색의 흔한 질의 — 기계가 읽는 형태로 낸다. */
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: '주차', value: true, description: `${CLINIC.parking.place} ${CLINIC.parking.fee}` },
      { '@type': 'LocationFeatureSpecification', name: '야간진료', value: true, description: '화·목요일 21:00까지' },
    ],
    publicAccess: true,
    availableService: SERVICES.map((s) => ({ '@type': 'MedicalProcedure', name: s.name })),
    /*
     * sameAs — "이 홈페이지와 저 네이버 예약·플레이스·카카오맵 항목이 같은 병원" 이라는 선언.
     * 전부 기존 홈페이지가 실제로 링크하던 채널이다 (없는 주소를 넣으면 신호가 깨진다).
     */
    sameAs: [CLINIC.booking.naver, CLINIC.booking.naverTalk, CLINIC.maps.naverPlace, CLINIC.maps.kakaoPlace, NAVER_BLOG],
    /* 신뢰 지표 = 자격·학회만. 후기·별점(aggregateRating/review)은 의료법 제56조로 금지 — 절대 넣지 말 것. */
    hasCredential: DOCTORS.map((d) => ({
      '@type': 'EducationalOccupationalCredential',
      name: `보건복지부 인증 ${d.specialty}`,
      credentialCategory: '전문의 자격',
      recognizedBy: { '@type': 'GovernmentOrganization', name: '보건복지부' },
    })),
    knowsAbout: SERVICES.map((s) => s.name),
    makesOffer: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'MedicalProcedure', name: s.name }, url: abs(s.path) })),
  };

  /*
   * 진료시간 — 요일별 한 줄씩, **점심시간을 쪼개서** 낸다. 묶어서 내면 크롤러가 못 읽고,
   * 점심을 안 빼면 지도가 13:30 에 '진료 중' 이라고 답한다.
   * ⚠️ 토요일(2·4째주)은 넣지 않는다 — 휴진 토요일에 '진료 중' 이 되는 쪽이 더 나쁘다.
   */
  const lunch = HOURS.lunch;
  schema.openingHoursSpecification = HOURS.rows
    .filter((r) => !('biweekly' in r && r.biweekly))
    .flatMap((r): Record<string, unknown>[] => {
      const base = { '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${r.day}` };
      if (r.open < lunch.start && r.close > lunch.end) {
        return [
          { ...base, opens: r.open, closes: lunch.start },
          { ...base, opens: lunch.end, closes: r.close },
        ];
      }
      return [{ ...base, opens: r.open, closes: r.close }];
    });

  if (UNVERIFIED.geo.verified && UNVERIFIED.geo.lat && UNVERIFIED.geo.lng) {
    schema.geo = { '@type': 'GeoCoordinates', latitude: UNVERIFIED.geo.lat, longitude: UNVERIFIED.geo.lng };
  }
  /* 지도 항목 — 기존 홈페이지에 심겨 있던 ID 라 좌표 없이도 확실하다. */
  schema.hasMap = [CLINIC.maps.naverPlace, CLINIC.maps.kakaoPlace];
  return schema;
}

/** 메타 설명 뒤에 지역 한 줄. 시술·내원 페이지에만 쓴다(전 페이지에 박으면 키워드 스터핑). */
export function withLocality(base: string) {
  const tail = ` 서울 중구 세종대로, 광화문역 6번 출구 도보 2분 ${CLINIC.name}입니다.`;
  return base.length + tail.length <= 155 ? base + tail : base;
}

/**
 * meta description · og:description 을 80자 안으로 (2026-09-11).
 *  · 네이버 서치어드바이저 검사 기준 "설명문 80자 이내". 구글은 155자까지 보여 주지만 네이버가 주 대상이다.
 *  · 문장 끝(. )에서 자르고, 문장이 80자를 넘으면 쉼표·띄어쓰기에서 끊어 말줄임표까지 80자 안에 넣는다. 낱말 중간에서는 안 끊는다.
 *  · 화면에는 안 보이는 값이다 — 본문·제목은 손대지 않는다.
 */
export const DESC_MAX = 80;
export function desc80(s: string, max = DESC_MAX): string {
  const t = s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다. '), cut.lastIndexOf('요. '), cut.endsWith('.') ? cut.length - 1 : -1);
  if (end > max * 0.5) return cut.slice(0, end + 1).trim();
  const body = cut.slice(0, max - 1);
  const pause = Math.max(body.lastIndexOf(', '), body.lastIndexOf(' '));
  return `${(pause > max * 0.5 ? body.slice(0, pause) : body).trim()}…`;
}

/**
 * 근거 출처 — 페이지 주제에 맞는 학회·공공기관 (구조화 데이터 citation, 화면에는 안 나옴).
 * 2026-09-11 전부 실제로 열어 200 확인. 없는 주소를 넣으면 신호가 깨지므로 확인 안 된 곳은 넣지 않는다.
 * AI 답변 엔진은 출처가 있는 글을 우선 인용한다(2026 인용 연구). 본문에 보이는 출처가 더 강하지만, 그건 화면이 바뀌므로 오너 결정 뒤.
 */
const CITATIONS: Array<[RegExp, Array<{ name: string; url: string }>]> = [
  [/^\/treatment\/insurance/, [{ name: '국민건강보험공단', url: 'https://www.nhis.or.kr/' }, { name: '건강보험심사평가원', url: 'https://www.hira.or.kr/' }]],
  [/^\/treatment\/implant/, [{ name: '대한치과의사협회', url: 'https://www.kda.or.kr/' }, { name: '국민건강보험공단 (만 65세 이상 임플란트 급여)', url: 'https://www.nhis.or.kr/' }]],
  [/^\/treatment\/tmj/, [{ name: '대한안면통증구강내과학회', url: 'https://www.kaom.org/' }]],
  [/^\/treatment\/natural-tooth/, [{ name: '대한치과보존학회', url: 'https://www.kacd.or.kr/' }]],
  [/^\/treatment\/wisdom-tooth/, [{ name: '대한구강악안면외과학회', url: 'https://www.kaoms.org/' }]],
  [/^\/treatment\/aesthetic/, [{ name: '대한치과보철학회', url: 'https://www.kap.or.kr/' }]],
  [/^\/treatment\/(perio|gum)/, [{ name: '대한치주과학회', url: 'https://www.kperio.org/' }]],
  [/^\/treatment/, [{ name: '대한치과의사협회', url: 'https://www.kda.or.kr/' }]],
  [/^\/insight/, [{ name: '질병관리청 국가건강정보포털', url: 'https://health.kdca.go.kr/' }, { name: '대한치과의사협회', url: 'https://www.kda.or.kr/' }]],
  [/^\/faq/, [{ name: '대한치과의사협회', url: 'https://www.kda.or.kr/' }]],
];
export function citationsFor(path: string) {
  const hit = CITATIONS.find(([re]) => re.test(path));
  return hit ? hit[1].map((c) => ({ '@type': 'CreativeWork', name: c.name, url: c.url })) : [];
}

/** 페이지별 alternates — canonical + hreflang. Next 는 alternates 를 통째로 교체하므로 헬퍼로 낸다. */
export function alt(path: string) {
  const url = abs(path);
  /* types: RSS 자동발견 링크 — 전 페이지 <head> 에 <link rel="alternate" type="application/rss+xml"> (app/rss.xml). */
  return { canonical: path, languages: { 'ko-KR': url, 'x-default': url }, types: { 'application/rss+xml': `${BASE}/rss.xml` } };
}

/** 페이지별 Open Graph. images 를 생략하면 제목이 박힌 1200×630 카드(/api/og)가 붙는다. */
export function og(opts: { title: string; description: string; path: string; images?: Array<{ url: string; width?: number; height?: number; alt?: string }> }) {
  return {
    type: 'article' as const,
    locale: 'ko_KR',
    siteName: CLINIC.name,
    title: opts.title,
    description: desc80(opts.description),
    url: abs(opts.path),
    images: opts.images ?? [{ url: `/api/og?t=${encodeURIComponent(opts.title)}`, width: 1200, height: 630, alt: `${opts.title} — ${CLINIC.name}` }],
  };
}

/** 의사 한 명의 Person·Physician 노드. 경력은 lib/doctors.ts 원문 그대로. */
export function physicianSchema(d: (typeof DOCTORS)[number]) {
  return {
    '@type': ['Person', 'Physician'],
    '@id': ID.doctor(d.slug),
    name: d.name,
    jobTitle: `치과의사 · ${d.role}`,
    medicalSpecialty: 'Dentistry',
    url: `${abs('/about/doctors')}#${d.slug}`,
    image: abs(d.photo),
    worksFor: { '@id': ID.clinic },
    knowsAbout: d.focus,
    alumniOf: d.career.filter((c) => /대학교|대학원/.test(c)).map((c) => ({ '@type': 'EducationalOrganization', name: c })),
    memberOf: d.career.filter((c) => /정회원/.test(c)).map((c) => ({ '@type': 'Organization', name: c })),
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: `보건복지부 인증 ${d.specialty}`,
        credentialCategory: '전문의 자격',
        recognizedBy: { '@type': 'GovernmentOrganization', name: '보건복지부' },
      },
      ...d.career.filter((c) => /수료|연수|수련|과정/.test(c)).map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c, credentialCategory: '수료·연수' })),
    ],
  };
}

/** 대표원장 — 모든 의료 문서의 author / reviewedBy 가 이 @id 를 가리킨다. */
export function directorPersonSchema() {
  return physicianSchema(DOCTORS[0]);
}

export function imageObjectSchema(opts: { path: string; src: string; caption: string; width: number; height: number }) {
  return {
    '@type': 'ImageObject',
    '@id': ID.image(opts.path),
    contentUrl: abs(opts.src),
    url: abs(opts.src),
    caption: opts.caption,
    width: opts.width,
    height: opts.height,
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    '@id': ID.breadcrumb(trail[trail.length - 1]?.path ?? '/'),
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  };
}

/** 화면에 번호 매긴 목록이 실제로 보일 때만 쓴다(허브 페이지). */
export function itemListSchema(path: string, items: Array<{ name: string; path: string }>, name?: string) {
  return {
    '@type': 'ItemList',
    '@id': `${abs(path)}#itemlist`,
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })),
  };
}

export function websiteSchema() {
  return { '@type': 'WebSite', '@id': ID.website, url: BASE, name: CLINIC.name, inLanguage: 'ko-KR', publisher: { '@id': ID.clinic } };
}

export function medicalWebPageSchema(opts: {
  title: string;
  description: string;
  path: string;
  about?: { type: 'MedicalProcedure' | 'MedicalCondition'; name: string };
  image?: { src: string; caption: string; width: number; height: number };
  related?: string[];
}) {
  const { published, modified } = contentDates(opts.path);
  const schema: Record<string, unknown> = {
    '@type': 'MedicalWebPage',
    '@id': ID.page(opts.path),
    name: opts.title,
    description: opts.description,
    url: abs(opts.path),
    inLanguage: 'ko-KR',
    isPartOf: { '@id': ID.website },
    publisher: { '@id': ID.clinic },
    ...(opts.path === '/' ? {} : { breadcrumb: { '@id': ID.breadcrumb(opts.path) } }),
    datePublished: published,
    dateModified: modified,
    reviewedBy: { '@id': ID.director },
    lastReviewed: modified,
    /* 소리 내어 읽을 곳 — 제목과 그 아래 '한 줄 답'. 화면 구조와 한 쌍이다. */
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'main p'] },
  };
  const citation = citationsFor(opts.path);
  if (citation.length) schema.citation = citation;
  if (opts.about) schema.about = { '@type': opts.about.type, name: opts.about.name };
  if (opts.image) schema.primaryImageOfPage = { '@id': ID.image(opts.path) };
  if (opts.related?.length) schema.relatedLink = opts.related.map(abs);
  return schema;
}

export function articleSchema(opts: { path: string; title: string; description: string; wordCount?: number; hasImage?: boolean; keywords?: string[] }) {
  const { published, modified } = contentDates(opts.path);
  const node: Record<string, unknown> = {
    '@type': 'Article',
    '@id': ID.article(opts.path),
    isPartOf: { '@id': ID.page(opts.path) },
    mainEntityOfPage: { '@id': ID.page(opts.path) },
    headline: opts.title,
    description: opts.description,
    inLanguage: 'ko-KR',
    datePublished: published,
    dateModified: modified,
    author: { '@id': ID.director },
    publisher: { '@id': ID.clinic },
  };
  if (opts.hasImage) node.image = { '@id': ID.image(opts.path) };
  if (opts.wordCount) node.wordCount = opts.wordCount;
  if (opts.keywords?.length) node.keywords = opts.keywords.join(', ');
  return node;
}

/** ⚠️ 화면에 실제로 보이는 문답 배열 그대로만 넣는다. */
export function faqSchema(items: Array<{ q: string; a: string }>, path?: string) {
  const base = path ? abs(path) : '';
  return {
    '@type': 'FAQPage',
    ...(path ? { '@id': `${base}#faq`, isPartOf: { '@id': ID.page(path) } } : {}),
    mainEntity: items.map((it, i) => ({
      '@type': 'Question',
      ...(path ? { '@id': `${base}#faq-${i + 1}` } : {}),
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
