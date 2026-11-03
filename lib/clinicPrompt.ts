import { readFile, commitFiles } from './github';

/**
 * 담당자 프롬프트 — 이 병원의 글·사진 규칙 두 칸을 저장소 content/clinic-prompt.json 에 둔다.
 *
 * ★★ 칸이 둘인 이유 (2026-09-14 오너: "이미지 프롬프트, 글 프롬프트 두 개? 제목까지 세 개?") ★★
 *   제목은 본문과 같은 말투를 써야 한다. 칸을 셋으로 나누면 "1인칭 원장 시점" 을 두 칸에 적게 되고,
 *   두 칸이 어긋났을 때 어느 쪽이 이기는지가 모호해진다. 그래서 **글·제목은 한 칸**이다.
 *   제목만의 요청은 그 칸에 한 줄 적으면 그대로 먹는다 — 기본값 첫 줄이 이미 제목 규칙이다.
 *
 * ★★ 기본값 = 지금까지 코드에 박혀 있던 프롬프트 그대로 (2026-09-14 오너: "고정적으로 항상 붙는
 *   프롬프트들도 칸에 미리 넣어둬. 수정해서 바꿀 수 있게") ★★
 *   전에는 "사람 안 나오게" 가 lib/adminImage.ts 에 박혀 있어서, 마케터가 무엇을 적어도 뒤에서 막혔다.
 *   지금은 그 문장이 IMAGE_DEFAULT 의 한 줄이다 — 지우면 사람이 나온다. 이것이 이 기능의 핵심이다.
 *
 * ⚠️ 그래도 칸에서 못 여는 것 셋 (코드에 잠겨 있고, 칸을 비워도 늘 붙는다):
 *     1) 의료법 제56조 낱말 — adminDraft 의 하드코딩 블록 + 결정론 검사(medlaw)
 *     2) 사진의 얼굴·입·환부·피·치료 전후 — adminImage 의 IMAGE_FLOOR
 *     3) 출력 구조(HTML 태그 화이트리스트·JSON 스키마) — adminDraft 의 normalize
 *   칸은 취향을 정하는 자리고, 이 셋은 병원을 지키는 자리다. 섞지 말 것.
 *
 * ★ 왜 저장소 파일인가 — 무인 발행 크론(/api/cron/blog)에는 브라우저가 없다. localStorage 에 두면
 *   사람이 쓸 때만 반영되고 자동으로 올라간 글은 병원 말투를 잃는다. (content/auto-blog.json 과 같은 방식)
 * ★ 사이트가 그릴 때 읽는 파일이 아니라 **API 가 요청마다 읽는** 파일이다(github.readFile, no-store).
 *   그래서 저장하면 다음 글부터 바로 적용된다 — content/central-hidden.json 처럼 빌드를 기다리지 않는다.
 * ⚠️ content/blog/ 안에 두지 않는다 — lib/blog.ts 가 그 폴더의 *.json 을 전부 글로 읽는다.
 */
export const CLINIC_PROMPT_PATH = 'content/clinic-prompt.json';

/** 한 칸당 글자 수 상한. 규칙 한 칸이 프롬프트 전체를 밀어낼 만큼 길어지면 안 된다. */
export const PROMPT_MAX = 2000;

/**
 * 글·제목 기본값.
 *
 * ★★ 사람 말만 둔다 (2026-09-14 오너: "왜 코드 같은 게 들어가. 마케터 담당자가 쉽게
 *   '치과 의사 안 나오게 해 줘' 이런 식으로 시키는 건데") ★★
 *   HTML 태그·마크다운 금지·나열 금지·사실 확인 같은 규칙은 마케터가 고칠 것이 아니라 늘 지켜야 하는 것이다.
 *   그래서 칸에서 빼고 adminDraft.draftPrompt 의 '출력 형식'·'사실' 블록에 잠가 뒀다. 칸에는 **바꾸고 싶을 만한 것만** 남긴다.
 * ⚠️ 여기를 고치면 **아직 한 번도 저장하지 않은 병원**의 글이 바뀐다. 저장한 병원은 저장값이 이긴다.
 */
export const WRITING_DEFAULT = [
  '대표원장이 환자에게 설명하듯 씁니다. 말투는 "~합니다" 이고 환자는 "분" 으로 부릅니다.',
  '제목은 환자가 실제로 묻는 질문 그대로 씁니다.',
  '첫 문단에서 결론을 먼저 말합니다.',
  '소제목은 서넛으로 나누고, 길이는 1,400~2,200자로 씁니다.',
].join('\n');

/**
 * 사진 기본값 — adminImage 의 LOOK 을 사람 말로 옮긴 것 (사이트의 다른 AI 사진과 같은 결).
 * ★ 마지막 줄이 "사람은 나오지 않게" 다. 사람이 나오는 사진을 원하면 그 줄을 고치면 된다. 이 줄이 이 기능의 요지다.
 */
/* 광화문 선치과 판(2026-11-03, 동그라미치과 기능을 옮겨 옴) — 사이트 AI 사진과 같은 결(흰색·옅은 회색 + 남색·주황 조금).
 * ★ '사람은 나오지 않게' 는 오너 지시다(2026-11-03 '원장님은 남자 한 분 — 다른 의료인이 원장으로 읽힌다'). */
export const IMAGE_DEFAULT = [
  '밝고 정돈된 실제 치과에서 찍은 사진처럼, 일러스트나 3D 느낌 없이.',
  '흰색과 옅은 회색 위주에 남색이나 주황을 조금.',
  '기구나 모형을 가까이에서 찍은 느낌으로.',
  '사람은 나오지 않게 해 주세요.',
].join('\n');

/**
 * 글 한 편에 들어갈 사진 장수(대표 사진 포함) — 2026-11-03 오너 '사진은 몇 장 만들지 드롭다운'.
 * 1 = 대표 사진만(지금까지와 같음). 2~4 = 대표 + 본문 사진(소제목 아래에 들어간다, lib/blog.ts withBodyImages).
 * ★ 이 파일에 같이 두는 이유 — 사람이 쓰든 무인 크론이 쓰든 같은 장수를 따라야 한다.
 */
export const IMAGE_COUNT_MAX = 4;
export const IMAGE_COUNT_DEFAULT = 1;
export function cleanImageCount(v: unknown): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 1 ? Math.min(IMAGE_COUNT_MAX, n) : IMAGE_COUNT_DEFAULT;
}

export type ClinicPrompt = {
  /** 글·제목 규칙 — 말투·시점·구성·길이. */
  writing: string;
  /** 사진 규칙 — 무엇이 어떻게 찍혀야 하는지. */
  image: string;
  /** 글 한 편의 사진 장수(대표 포함, 1~4). 없으면 1. */
  imageCount?: number;
  /** 마지막 저장 시각(한국 시간, 표시용). */
  updatedAt?: string;
};

export const CLINIC_PROMPT_DEFAULT: ClinicPrompt = { writing: WRITING_DEFAULT, image: IMAGE_DEFAULT, imageCount: IMAGE_COUNT_DEFAULT };

/**
 * 한 줄에 규칙 하나. 빈 줄은 버리고 앞뒤 공백을 털고 상한으로 자른다.
 * ★ 화면이 '+ 규칙 추가' 로 빈 칸을 먼저 만들기 때문에, 안 채운 칸이 그대로 저장되지 않게 여기서 거른다.
 */
export function cleanPrompt(v: unknown): string {
  return String(v ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, PROMPT_MAX);
}

/**
 * 저장소에서 읽는다.
 * ★ 파일이 없으면(= 한 번도 저장한 적 없으면) **기본값** 이다 — 지금까지와 똑같이 쓴다.
 * ★ 파일이 있으면 저장값이 이긴다. 마케터가 칸을 비우고 저장했다면 그 빈 칸이 진실이다
 *   ("저장하면 그대로 반영" — 2026-09-14 오너). 화면에 '기본값으로 되돌리기' 를 둬서 언제든 돌아온다.
 * ⚠️ 토큰이 없거나 GitHub 가 답을 못 주면 기본값으로 간다(fail-open). 글쓰기가 멈추는 것보다 낫다.
 */
export async function readClinicPrompt(token: string | null | undefined): Promise<ClinicPrompt & { saved: boolean }> {
  if (!token) return { ...CLINIC_PROMPT_DEFAULT, saved: false };
  try {
    const { text } = await readFile(token, CLINIC_PROMPT_PATH);
    const j = JSON.parse(text) as Partial<ClinicPrompt>;
    return {
      writing: cleanPrompt(j.writing),
      image: cleanPrompt(j.image),
      imageCount: cleanImageCount(j.imageCount),
      updatedAt: typeof j.updatedAt === 'string' ? j.updatedAt : undefined,
      saved: true,
    };
  } catch {
    return { ...CLINIC_PROMPT_DEFAULT, saved: false };
  }
}

export async function writeClinicPrompt(token: string, p: ClinicPrompt, message: string) {
  return commitFiles(token, [{ path: CLINIC_PROMPT_PATH, content: JSON.stringify(p, null, 2) + '\n' }], message);
}

/**
 * 글·제목 규칙을 프롬프트 한 덩이로. 비어 있으면 빈 문자열 — 부르는 쪽이 배열에서 걸러 낸다.
 * ⚠️ 이 덩이 **뒤에** 의료법 블록이 온다. 마지막 말이 법이어야 한다(adminDraft.draftPrompt 의 순서를 바꾸지 말 것).
 */
export function writingBlock(writing: string): string {
  if (!writing.trim()) return '';
  return ['## 반드시 지킬 형식과 말투', writing.trim()].join('\n');
}

/** 주제를 고를 때 — 형식·말투는 쓸모가 없고 "무엇을 다룰지" 만 본다. */
export function topicBlock(writing: string): string {
  if (!writing.trim()) return '';
  return [
    '## 이 병원의 글 규칙 (주제를 고를 때 참고)',
    '형식·말투·길이에 관한 부분은 여기서 무시하고, **어떤 진료·어떤 환자를 자주 다루라**는 부분만 반영합니다.',
    '그런 말이 없으면 이 항목은 무시합니다. 겹치지 않는 주제를 고르는 것이 먼저입니다.',
    '"""',
    writing.trim().slice(0, 800),
    '"""',
  ].join('\n');
}

/** 감수 단계 — 병원이 정한 말투를 감수가 표준어로 되돌려 놓지 못하게 막는 한 줄. */
export function reviewKeepLine(writing: string): string {
  const w = writing.trim();
  if (!w) return '';
  return `- 아래는 병원이 정한 말투·형식입니다. 여기에 맞게 쓰인 문장은 문제가 아니므로 그대로 둡니다: "${w.replace(/\s+/g, ' ').slice(0, 400)}"`;
}
