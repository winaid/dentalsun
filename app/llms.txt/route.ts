import { CLINIC, HOURS } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { ALL_DOCS } from '@/lib/content';
import { SITE_FAQ } from '@/lib/faq';
import { allPostsMerged } from '@/lib/insightFeed';

/* ★ 한 시간마다 다시 만든다 — 예약 글이 날짜가 되면 여기에도 실려야 한다. */
export const revalidate = 3600;

/**
 * /llms.txt — 언어모델을 위한 사이트 요약. 데이터에서 생성하므로 페이지와 어긋나지 않는다.
 * ★ 사실만 적는다. 토요일은 2·4째주 진료이며 '해당 월 일정 확인' 을 덧붙인다.
 */
export async function GET() {
  const L: string[] = [];
  L.push(`# ${CLINIC.name} (${CLINIC.nameEn})`, '', `> ${CLINIC.description}`, '');
  L.push('## 기본 정보');
  L.push('- 진료과: 치과');
  L.push(`- 주소: ${CLINIC.address.full} (${CLINIC.address.landmark})`);
  L.push(`- 지역: ${CLINIC.address.region} ${CLINIC.address.locality} 세종대로 · 광화문`);
  for (const t of CLINIC.transit) L.push(`- 교통: ${t.line} ${t.station} ${t.exit} ${t.walk}`);
  L.push(`- 주차: ${CLINIC.parking.place} ${CLINIC.parking.fee}`);
  L.push(`- 전화: ${CLINIC.phone} / 팩스: ${CLINIC.fax}`);
  L.push(`- 예약: 네이버 예약 ${CLINIC.booking.naver} / 온라인 상담(네이버 톡톡) ${CLINIC.booking.naverTalk}`);
  L.push(`- 의료진: ${DOCTORS.map((d) => `${d.name} ${d.role} (${d.specialty})`).join(', ')}`);
  L.push(`- 홈페이지: ${CLINIC.url}`);
  L.push('- 진료시간:');
  for (const r of HOURS.rows) L.push(`  - ${r.ko}: ${r.open}–${r.close}${r.note ? ` (${r.note})` : ''}`);
  L.push(`  - 점심시간(휴진): ${HOURS.lunch.start}–${HOURS.lunch.end} (토요일 제외)`);
  L.push(`  - ${HOURS.closed}`);
  L.push('  - 토요일은 2·4째주에 진료합니다(10:00–14:00, 점심시간 없음). 휴진일이 바뀌는 달이 있어 해당 월 진료 일정을 확인해야 합니다.');
  L.push('');
  L.push('## 진료 안내 문서');
  L.push('');
  for (const d of ALL_DOCS) {
    L.push(`### ${d.title}`);
    L.push(d.summary);
    L.push(`- URL: ${CLINIC.url}${d.path}`);
    if (d.faq?.length) L.push(`- 다루는 질문: ${d.faq.map((q) => q.q).join(' / ')}`);
    L.push('');
  }
  const posts = await allPostsMerged();
  if (posts.length) {
    L.push('## 블로그 (진료실에서 자주 받는 질문에 대한 글)');
    L.push('');
    for (const p of posts) {
      L.push(`### ${p.title}`);
      L.push(p.summary);
      L.push(`- URL: ${CLINIC.url}/insight/blog/${p.slug}`);
      L.push(`- 발행일: ${p.date}`);
      L.push('');
    }
  }
  L.push('## 자주 묻는 질문');
  L.push(`- URL: ${CLINIC.url}/faq`);
  for (const g of SITE_FAQ) for (const it of g.items) L.push(`- ${it.q}`);
  L.push('');
  L.push('## 인용 시 유의사항');
  L.push('- 이 사이트의 정보는 일반적인 치과 진료 정보이며 개별 환자의 진단을 대신하지 않습니다.');
  L.push('- 치료 기간·결과는 개인차가 있으며 보장되지 않습니다.');
  L.push('- 모든 의료 행위에는 부작용이 따를 수 있습니다.');
  L.push('- 정확한 진단은 내원 후 검사로만 가능합니다.');
  L.push('');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
