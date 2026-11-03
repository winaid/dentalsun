/**
 * IndexNow — 사이트맵의 모든 주소를 빙·네이버·얀덱스 등에 한 번에 알린다 (2026-11-03 SEO 점검: 없음 → 추가).
 * ★ indexnow.org: "has support from Microsoft Bing, Naver, Seznam.cz, Yandex, Yep" — 한 곳에 보내면 참여 엔진끼리 나눈다.
 * ★ 키 파일 = public/a54b939008c73de312ec775eaf10d84a.txt (내용 = 키). 키를 바꾸면 그 파일도 같이.
 * ⚠️ 사이트가 실제 도메인(dentalsun.co.kr)에서 열린 **뒤에** 돌린다 — 키 파일이 그 도메인에서 열려야 받아 준다.
 * 쓰는 법:  node scripts/indexnow.mjs [https://dentalsun.co.kr]
 */
const KEY = 'a54b939008c73de312ec775eaf10d84a';
const SITE = (process.argv[2] || 'https://dentalsun.co.kr').replace(/\/$/, '');
const sm = await (await fetch(SITE + '/sitemap.xml')).text();
const urlList = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE));
if (!urlList.length) throw new Error('사이트맵 주소가 ' + SITE + ' 로 시작하지 않습니다 — SITE_URL 이 아직 바뀌지 않았나요?');
const keyOk = (await (await fetch(SITE + '/' + KEY + '.txt')).text()).trim() === KEY;
if (!keyOk) throw new Error('키 파일이 ' + SITE + ' 에서 안 열립니다');
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: SITE + '/' + KEY + '.txt', urlList }),
});
console.log('IndexNow', r.status, urlList.length + '개 주소');
