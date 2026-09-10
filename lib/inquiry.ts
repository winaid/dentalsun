import { TREATMENT_HUBS } from '@/lib/nav';

/**
 * 간편 상담예약 — 화면(팝업)과 서버(API)가 같은 규칙을 쓴다.
 *
 * ★ 받는 값은 셋뿐이다: 진료 항목 · 성함 · 연락처. 환자 개인정보는 최소로만 받는다(PIPA).
 *   증상·병력 같은 민감정보는 폼에서 받지 않는다 — 전화나 톡톡으로 상담한다.
 * ★ 항목 목록은 메뉴(TREATMENT_HUBS)에서 만든다. 진료과목이 늘면 여기도 자동으로 따라온다.
 */
export const INQUIRY_TOPICS = ['일반진료 · 검진', ...TREATMENT_HUBS.map((h) => h.label), '기타'] as const;

export type InquiryBody = {
  topic: string;
  name: string;
  phone: string;
  consent: boolean;
  /** 사람은 비워 두는 칸 — 값이 차 있으면 봇이다 */
  website?: string;
  page?: string;
};

/** 숫자만 남긴 연락처 (010-1234-5678 → 01012345678) */
export const digitsOnly = (v: string) => v.replace(/[^0-9]/g, '');

/** 휴대폰·지역번호 모두 허용 — 9~11자리 숫자, 0으로 시작 */
export function isValidPhone(v: string): boolean {
  const d = digitsOnly(v);
  return /^0\d{8,10}$/.test(d);
}

/** 입력한 그대로 보여 주되 저장·전달은 하이픈 붙인 형태로 */
export function formatPhone(v: string): string {
  const d = digitsOnly(v);
  if (/^01\d{8,9}$/.test(d)) return d.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  if (/^02\d{7,8}$/.test(d)) return d.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  if (/^0\d{9,10}$/.test(d)) return d.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  return v.trim();
}

export type InquiryError = { field: 'topic' | 'name' | 'phone' | 'consent'; message: string };

/** 화면과 서버가 함께 쓰는 검증. 통과하면 null. */
export function validateInquiry(b: Partial<InquiryBody>): InquiryError | null {
  const topic = (b.topic ?? '').trim();
  const name = (b.name ?? '').trim();
  const phone = (b.phone ?? '').trim();
  if (!INQUIRY_TOPICS.includes(topic as (typeof INQUIRY_TOPICS)[number])) return { field: 'topic', message: '진료 항목을 골라 주세요.' };
  if (name.length < 2 || name.length > 20) return { field: 'name', message: '성함을 2~20자로 적어 주세요.' };
  if (!isValidPhone(phone)) return { field: 'phone', message: '연락처를 다시 확인해 주세요. 예) 010-1234-5678' };
  if (b.consent !== true) return { field: 'consent', message: '개인정보 수집·이용에 동의해 주세요.' };
  return null;
}
