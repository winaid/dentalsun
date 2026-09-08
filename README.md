# 광화문 선치과 홈페이지 (dentalsun)

기존 홈페이지(dentalsun.co.kr)의 내용을 전부 옮기고, AEO(답변 엔진)·GEO(지역 검색)·SEO 에 맞게 구조를 다시 짠 사이트입니다.
Next.js 15 (App Router) + React 19 + Tailwind 4. 데이터베이스·로그인 없음 — 전부 정적 생성.

## 실행

```bash
npm ci
npm run dev        # http://localhost:3400
npm run build      # 배포 전 반드시 통과시킬 것 (개발 서버는 끄고)
```

## 구조 — 사실은 한 곳에서만 고친다

| 무엇 | 어디 |
|---|---|
| 병원 정보(주소·전화·진료시간·이달 일정) | `lib/clinic.ts` |
| 의료진 약력 | `lib/doctors.ts` |
| 메뉴·사이트 구조 | `lib/nav.ts` |
| 진료 문서 본문 (임플란트·턱관절·심미·보험·사랑니·자연치아·무통) | `lib/content/*.ts` → `lib/content/index.ts` |
| 사이트 FAQ | `lib/faq.ts` |
| 구조화 데이터(JSON-LD)·메타 헬퍼 | `lib/seo.ts`, `components/JsonLd.tsx` |
| 원본 이미지 → 사이트용 사진 자르기 | `scripts/images.mjs` (원본은 덴탈빌더 job 폴더) |

진료 페이지는 전부 `components/DocPage.tsx` 하나가 `lib/docs.ts` 의 `Doc` 데이터를 그려 만듭니다.
새 진료 문서를 추가하려면 `lib/content/<갈래>.ts` 에 `Doc` 을 하나 넣고 `index.ts` 에 이어 주면
페이지·사이트맵·llms.txt·JSON-LD 가 함께 생깁니다.

## 내용 원칙

- 본문은 기존 홈페이지 배너·본문 원문이 바탕입니다. 숫자·장비명·자격·금액은 원문 그대로입니다.
- 원문에 없는 내용은 일반적인 치과 상식 수준에서만 보탰습니다. 병원 고유 주장은 원문에 없으면 쓰지 않았습니다.
- 확인되지 않은 값(좌표·우편번호)은 화면과 구조화 데이터 모두에서 뺐습니다(`lib/clinic.ts` UNVERIFIED).
- 토요일은 격주 진료라 구조화 데이터의 진료시간에서 뺐습니다. 이달 일정은 `MONTHLY_NOTICE` 에서 달마다 갱신합니다.

## 검색·AI 노출 장치

- 쪽마다 `@graph` 하나짜리 JSON-LD (Dentist · WebSite · Physician · MedicalWebPage · Article · FAQPage · BreadcrumbList · ItemList)
- `/sitemap.xml` · `/robots.txt`(AI 크롤러 명시 허용) · `/llms.txt` · 쪽마다 다른 OG 카드(`/api/og?t=`)
- 옛 주소(`/implant.html` 등) → 새 주소 301 (`next.config.ts`)

## 배포

GitHub `winaid/dentalsun` → Vercel 자동 배포. 커스텀 도메인을 붙이면 Vercel 환경변수 `SITE_URL` 을 그 주소로 바꾸고 재배포합니다(canonical·OG·sitemap 이 그 값을 씁니다).
