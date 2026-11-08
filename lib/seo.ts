/**
 * 구조화 데이터(JSON-LD) 빌더 — AEO/GEO 의 뼈대.
 *
 * ★ 검색엔진과 AI 는 본문을 읽기 전에 구조화 데이터를 먼저 본다. 진료시간·주소·전화번호가
 *   기계가 읽을 수 있는 형태로 있어야 지도·지식패널·AI 답변에 인용된다.
 * ★★ 확인되지 않은 값은 절대 넣지 않는다 ★★ — 틀린 구조화 데이터는 없는 것보다 나쁘다.
 *   좌표는 네이버 공식 API 로 확인해 넣었고(2026-11-03), 2·4째주 토요일은 날짜별 specialOpeningHoursSpecification 으로 낸다.
 * ★ 모든 노드는 @id 로 이어진다 — 발행자·검토자·저자가 한 병원, 한 사람으로 모인다.
 */
import { CLINIC, HOURS, UNVERIFIED } from './clinic';
import { DOCTORS } from './doctors';
import { NAV } from './nav';
import { contentDates } from './contentMeta';

/**
 * 검색 결과 이름 줄에 띄울 사이트 이름 — og:site_name · WebSite name · applicationName 이 모두 이 값.
 * ★ 2026-11-08 오너 "광화문치과 다시 이름 도메인 말고 치과 이름 나오게":
 *   옛 카페24 사이트(og:site_name 없이 제목 '광화문 선치과')는 이름 줄이 '광화문 선치과'였는데,
 *   새 사이트는 제목 '광화문 선치과' ↔ og:site_name·WebSite '광화문선치과의원' 으로 갈려 11-07 부터 도메인으로 떴다.
 *   제목·og·WebSite 세 값을 하나로 맞춘다(51검색어 대조: 둘이 같은 곳 78% 이름 뜸, 다른 곳 53%).
 *   병원 노드(Dentist) 이름·푸터 상호는 CLINIC.name 그대로 — WebSite alternateName 에도 남긴다.
 */
export const SEARCH_SITE_NAME = CLINIC.shortName;

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

/** 02-734-8272 → +82-2-734-8272 (구조화 데이터 전용) */
export const intlPhone = (p: string) => p.replace(/^0(\d+)-/, '+82-$1-');

/**
 * 2·4째주 토요일 — 앞으로 약 3달 치를 날짜별 '특별 진료시간'으로 낸다 (2026-11-03 SEO 점검).
 * ★ schema.org 에는 '격주 토요일' 을 적을 칸이 없다. 요일로 넣으면 휴진 토요일에 '진료 중' 이 되고, 빼면 AI·지도가
 *   '토요일 휴무' 로 읽는다. 그래서 그날그날을 validFrom = validThrough 로 하나씩 적는다(구글 지역 업체 문서의 그 방식).
 * ⚠️ 빌드할 때 계산한다 — 사이트가 3달 넘게 다시 빌드되지 않으면 목록이 끝나 예전처럼 토요일 정보가 빠진다(틀린 값이 나가지는 않음).
 */
function biweeklySaturdays(): Record<string, unknown>[] {
  const sat = HOURS.rows.find((r) => 'biweekly' in r && r.biweekly);
  if (!sat) return [];
  const out: Record<string, unknown>[] = [];
  const now = new Date(Date.now() + 9 * 3600 * 1000);
  for (let i = 0; i < 100 && out.length < 6; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    if (d.getUTCDay() !== 6) continue;
    const nth = Math.ceil(d.getUTCDate() / 7);
    if (nth !== 2 && nth !== 4) continue;
    const iso = d.toISOString().slice(0, 10);
    out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/Saturday', opens: sat.open, closes: sat.close, validFrom: iso, validThrough: iso });
  }
  return out;
}

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
    /* 구글 지역 업체 문서: '국가번호와 지역번호를 함께' — 화면 표기(02-734-8272)와 별개로 기계용은 국제 형식 (2026-11-03) */
    telephone: intlPhone(CLINIC.phone),
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
      { '@type': 'ContactPoint', telephone: intlPhone(CLINIC.phone), contactType: '예약 및 진료 문의', areaServed: 'KR', availableLanguage: ['ko'] },
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
    sameAs: [CLINIC.booking.naver, CLINIC.maps.naverPlace, CLINIC.maps.kakaoPlace, NAVER_BLOG],
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
  const sats = biweeklySaturdays();
  if (sats.length) schema.specialOpeningHoursSpecification = sats;

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
  /* 첫 문장이 너무 짧으면(70% 미만) 문장에서 자르지 않고 쉼표·띄어쓰기에서 채운다 — 42자짜리 설명이 6쪽 나왔다(2026-11-03 SEO 점검, 네이버·구글 모두 '1~2문장' 권장) */
  if (end >= max * 0.7) return cut.slice(0, end + 1).trim();
  const body = cut.slice(0, max - 1);
  const pause = Math.max(body.lastIndexOf(', '), body.lastIndexOf(' '));
  return `${(pause > max * 0.5 ? body.slice(0, pause) : body).trim()}…`;
}

/**
 * 메타 설명 — '광화문역·시청역·종로·을지로 인근 광화문선치과입니다. {그 쪽 설명}' (2026-11-04 본부장 예시 2차).
 *  · 11-03 판 '광화문 {검색어} 광화문 선치과. 광화문역·시청역·종로·을지로 인근, {설명}' 이 병원에서
 *    "예시로 넘겼던 아크치과랑 쉼표·순서까지 너무 똑같다" → 본부장 턱관절 예시(16:22 '…인근에서 …', 16:42 다시) 꼴.
 *    16:42 예시 원문: "광화문역·시청역·종로·을지로 인근 광화문선치과입니다. 턱관절 통증·턱 소리·입 벌리기 어려움 등 증상의
 *    원인을 정밀하게 진단하고, 약물치료·물리치료·보톡스·스플린트 등 개인별 상태에 맞는 턱관절 치료를 진행합니다."
 *  · '광화문선치과' 붙여 쓰기는 예시 글자 그대로(화면·제목의 병원 이름은 CLINIC.shortName '광화문 선치과' 그대로).
 *  · 진료·소개 쪽은 DESC_FIXED 에 한 쪽씩 — 그 쪽 원래 설명(원장 문구)의 사실만, 순서·이음만 바꿈. 턱관절은 예시 글자 그대로.
 *  · 글(블로그·임상·증상·가이드)은 그 글 요약을 그대로 뒤에 잇는다. 기존 앞머리 '광화문 선치과 ○○ — ' 는 떼어 낸다.
 */
const REGION = '광화문역·시청역·종로·을지로 인근';
const DESC_FIXED: Record<string, string> = {
  '/': `통합치의학과 전문의 대표원장이 내비게이션·풀아치 임플란트, 턱관절 치료, 사랑니 발치, MTA 신경치료, 라미네이트, 치아미백을 직접 진료합니다. 화·목 야간진료, 코리아나 호텔 주차.`,
  '/about': `통합치의학과 전문의 양대일 대표원장이 1:1로 책임진료합니다. 3D CT·구강스캐너로 진단하고 모의 수술과 원내 3D 프린터 수술 가이드로 치료하며, 진료 기구는 1인 1기구로 멸균합니다.`,
  '/about/doctors': `보건복지부 인증 통합치의학과 전문의이자 강남성심병원 치과 외래교수인 양대일 대표원장이 진료합니다. 대표원장의 약력과 진료 철학을 소개합니다.`,
  '/about/equipment': `3D 구강스캐너와 3D CT(CBCT), 모의 수술 소프트웨어, 원내 3D 프린터 수술 가이드로 진단하고 치료합니다. INOS 진료 기구 소독, 무통마취기, 에어플로우, PHL-15 레이저를 갖췄습니다.`,
  '/visit': `5호선 광화문역 6번 출구 도보 2분, 1·2호선 시청역 3번 출구 도보 5분 거리입니다. 화·목 야간진료 21시, 코리아나 호텔 야외주차장 무료주차를 안내합니다.`,
  '/faq': `진료시간·야간진료·주차, 내비게이션·풀아치 임플란트, 턱관절 소리와 개구장애, 만 65세 보험 임플란트와 틀니, 무통마취 등 자주 묻는 질문을 문답으로 정리했습니다.`,
  '/treatment': `CBCT 계측과 모의 식립으로 진행하는 디지털 임플란트, 턱 소리·개구장애를 진단하는 턱관절 치료, MTA 신경치료로 자연치아 보존, 매복 사랑니 발치, 보험 틀니·임플란트를 진료합니다.`,
  '/treatment/implant': `통합치의학과 전문의 대표원장이 3D CT 진단과 모의 수술, 수술 가이드, 맞춤 보철, 정기검진까지 직접 진행합니다. 내비게이션·풀아치·UV·자가혈 임플란트와 10년 보증제도를 안내합니다.`,
  '/treatment/implant/navigation': `3D CT와 구강스캔으로 미리 수술해 보고 수술 가이드로 식립하는 내비게이션 임플란트를 진행합니다. 신경·상악동 거리 확인, 비절개 식립의 조건과 한계, 진행 순서를 안내합니다.`,
  '/treatment/implant/custom': `잇몸 모양과 맞물림에 맞춰 1:1로 설계하는 맞춤 지대주(커스텀 어버트먼트)로 임플란트를 완성합니다. 기성 지대주와의 차이, 제작 과정, 설계 기준, 임플란트 주위염 관리를 안내합니다.`,
  '/treatment/implant/full-arch': `치아가 없는 턱에 임플란트 4~6개를 식립해 한 턱 전체를 고정된 치아로 되살리는 풀아치 임플란트를 진행합니다. 틀니와의 차이, 3D CT 진단과 모의 수술, 당일 임시치아 조건을 안내합니다.`,
  '/treatment/implant/uv': `모든 임플란트에 식립 직전 UV 표면 처리를 적용합니다. 표면 유기물 제거와 친수성 향상으로 초기 골유착을 돕는 원리, UV 처리가 더욱 중요한 경우와 한계를 안내합니다.`,
  '/treatment/implant/prf': `내 혈액에서 얻은 PRF를 뼈이식재와 함께 넣어 잇몸뼈와 잇몸의 회복을 돕는 자가혈 임플란트를 진행합니다. 뼈이식·상악동거상술이 필요한 경우와 진행 과정을 안내합니다.`,
  '/treatment/implant/bone-graft': `잇몸뼈가 부족한 정도를 3D CT로 확인하고 뼈이식·상악동거상술로 필요한 만큼 뼈를 채운 뒤 임플란트를 진행합니다. 필요한 경우와 진행 순서, 회복을 안내합니다.`,
  '/treatment/implant/warranty': `보존·보철 치료와 임플란트 수술관련·보철관련을 나눈 기간별 보증표(무상·50%·30%·15% 지원)와 정기검진·치료계획 준수 등 보증 유지 조건을 안내합니다.`,
  '/treatment/insurance': `건강보험 가입 만 65세 이상이면 본인 부담금 30%로 틀니와 임플란트 진료를 받을 수 있습니다. 보험 틀니·임플란트의 대상과 적용 기준을 안내합니다.`,
  '/treatment/insurance/denture': `만 65세 이상 건강보험 가입자는 본인 부담금 30%로 전체틀니·부분틀니를 받을 수 있습니다. 보험틀니 적용 기준과 진행 과정, 틀니 관리법을 안내합니다.`,
  '/treatment/insurance/implant': `만 65세 이상, 치아가 일부라도 남아 있으면 1인당 평생 2개까지 건강보험이 적용되는 보험임플란트를 진행합니다. 본인 부담금 30%, 지르코니아 크라운 보철입니다.`,
  '/treatment/tmj': `턱관절 통증·턱 소리·입 벌리기 어려움 등 증상의 원인을 정밀하게 진단하고, 약물치료·물리치료·보톡스·스플린트 등 개인별 상태에 맞는 턱관절 치료를 진행합니다.`,
  '/treatment/tmj/symptoms': `관절잡음·통증·개구장애 같은 턱관절 장애의 증상과 분류, 거울 앞에서 해 보는 자가진단 다섯 가지와 점검표, 안면비대칭 등 전신 증상을 안내합니다.`,
  '/treatment/tmj/bruxism': `수면 이갈이와 주간 이악물기로 생긴 치아 마모·균열과 저작근 통증을 마모 양상·저작근 촉진으로 진단하고, 맞춤 교합안정장치와 보툴리눔 톡신·물리치료를 진행합니다.`,
  '/treatment/tmj/treatment': `약물·물리치료, 보툴리눔 톡신, 교합안정장치를 진단에 맞춰 필요한 만큼 진행합니다. 초음파치료, 저주파 전기 자극치료(TENS), PHL-15 레이저 물리치료는 건강보험이 적용됩니다.`,
  '/treatment/general': `MTA 근관치료로 자연치아 살리기, 재근관치료, 스케일링·치근활택술 치주치료, 3D CT 매복사랑니 발치, 심미보철·미백, 무통마취를 대표원장이 직접 진료합니다.`,
  '/treatment/natural-tooth': `3D CT로 신경과 뿌리 끝 상태를 확인하고, 엔도소닉 초음파 세척과 MTA로 신경치료를 해 자연치아를 살립니다. 신경 염증 단계별 치료와 치관 길이 확장술을 안내합니다.`,
  '/treatment/natural-tooth/mta': `바이오 세라믹 MTA로 신경관을 막아 재감염의 여지를 줄이는 MTA 근관치료를 진행합니다. 신경 보존·처음 신경치료·재신경치료에서의 쓰임과 일반 신경치료와의 차이를 안내합니다.`,
  '/treatment/natural-tooth/endosonic': `초음파로 세척액을 떨리게 해 곁가지와 어금니 신경관까지 씻어 내고 MTA로 막는 엔도소닉 근관세척을 진행합니다. 세척이 신경치료 결과에 중요한 이유를 안내합니다.`,
  '/treatment/re-root-canal': `신경치료 후 다시 생긴 뿌리 끝 염증을 3D CT로 진단하고, 기존 재료 제거·엔도소닉 세척·MTA 밀폐로 자연치아 보존을 시도합니다. 치근단절제술·발치와의 선택 기준도 안내합니다.`,
  '/treatment/periodontal': `잇몸 주머니 깊이와 엑스레이로 치은염·치주염 단계를 확인하고, 스케일링·치근활택술·에어플로우 관리로 잇몸뼈가 녹는 것을 늦춥니다.`,
  '/treatment/wisdom-tooth': `3D CT로 아래턱 신경과 뿌리의 거리를 확인하고 절개·나누기·발치·봉합 순으로 매복사랑니를 발치합니다. 묻힌 모양과 발치 난이도, 발치 후 관리를 안내합니다.`,
  '/treatment/aesthetic': `라미네이트·올세라믹·지르코니아 심미보철과 전문가 치아미백을 진행합니다. 치아 모양·색·배열과 잇몸선, 교합을 함께 보고 치아를 적게 깎는 방법부터 검토합니다.`,
  '/treatment/aesthetic/prosthetics': `라미네이트·올세라믹·지르코니아로 깨지거나 벌어진 앞니, 고르지 않은 배열을 개선합니다. 남은 치아 구조와 교합에 따른 재료 선택과 치료 전후 사례를 안내합니다.`,
  '/treatment/aesthetic/whitening': `전문가용 미백제와 광선 활성화로 누렇게 변색되거나 커피·흡연으로 착색된 치아를 밝힙니다. 치아미백이 필요한 경우와 진행 과정, 시술 후 주의사항을 안내합니다.`,
  '/treatment/painless': `무통마취기 NO-PAIN III, 리도카겔 도포마취·리도카글액 가글마취, EMS 에어플로우 저자극 스케일링으로 마취 주사의 통증과 스케일링의 시림을 줄입니다.`,
  '/treatment/painless/anesthesia': `무통마취기 NO-PAIN III로 마취액을 일정한 속도와 압력으로 주입해 주사 통증을 줄입니다. 리도카겔 도포마취와 리도카글액 2% 가글마취, 마취 후 주의사항을 안내합니다.`,
  '/treatment/painless/airflow': `미세 파우더 분사, 10단계 강도 조절, 물 온도 조절의 에어플로우 저자극 스케일링으로 시림과 자극을 줄입니다. 치은염·치주염·임플란트 주위염 관리와 GBT 8단계를 안내합니다.`,
  '/insight': `턱관절 소리, 시린 이, 잇몸 출혈 등 12가지 증상별 안내와 임플란트 과정·비용 요인·건강보험·턱관절 치료 순서 등 6가지 가이드를 일반 정보로 정리했습니다.`,
  '/insight/blog': `진료하면서 자주 받는 질문과 알아 두시면 좋은 내용을 정리해 올립니다. 충치와 잇몸, 임플란트와 사랑니처럼 진료실에서 설명이 길어지는 주제를 글로 풀어 두었습니다.`,
  '/insight/clinical': `실제로 진행한 치료 과정을 사진과 함께 정리한 임상 사례와, 상악동거상술·임플란트 구조·틀니와 풀아치 임플란트처럼 치료를 이해하는 데 필요한 안내 글을 모았습니다.`,
};
const LEAD = `${REGION} 광화문선치과입니다.`;
export const META_DESC_MAX = 150;
export function metaDesc(path: string, raw: string, _title = ''): string {
  const fixed = DESC_FIXED[path];
  if (fixed) return desc80(`${LEAD} ${fixed}`, META_DESC_MAX);
  const body = raw
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^광화문 ?선치과(의원)?[^—]{0,24}— ?/, '');
  if (body.startsWith(LEAD)) return desc80(body, META_DESC_MAX); // og() 가 한 번 더 부를 때
  return desc80(`${LEAD} ${body}`, META_DESC_MAX);
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
    siteName: SEARCH_SITE_NAME,
    title: opts.title,
    description: metaDesc(opts.path, opts.description),
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
export function itemListSchema(path: string, items: Array<{ name: string; path: string; image?: string }>, name?: string) {
  return {
    '@type': 'ItemList',
    '@id': `${abs(path)}#itemlist`,
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path), ...(it.image ? { image: abs(it.image) } : {}) })),
  };
}

export function websiteSchema() {
  return { '@type': 'WebSite', '@id': ID.website, url: BASE, name: SEARCH_SITE_NAME, alternateName: CLINIC.name, inLanguage: 'ko-KR', publisher: { '@id': ID.clinic } };
}

export function medicalWebPageSchema(opts: {
  title: string;
  description: string;
  path: string;
  about?: { type: 'MedicalProcedure' | 'MedicalCondition'; name: string };
  image?: { src: string; caption: string; width: number; height: number };
  related?: string[];
  /** 글(블로그·임상)은 글의 날짜를 쓴다 — 쪽 날짜와 BlogPosting 날짜가 어긋나지 않게 (2026-11-03) */
  dates?: { published: string; modified: string };
}) {
  const { published, modified } = opts.dates ?? contentDates(opts.path);
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
  /* 글 속 하이라이트 표시({…}, components/ui rich) 는 화면 전용 — 구조화 데이터에는 글자만 */
  return JSON.stringify(data, (_k, v) => (typeof v === 'string' ? v.replace(/[{}]/g, '') : v)).replace(/</g, '\\u003c');
}
