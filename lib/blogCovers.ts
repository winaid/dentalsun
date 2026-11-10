/**
 * 사진 없는 블로그 글의 대표 사진 — 분류별 묶음 (2026-11-10, 동그라미 co.kr lib/blogCovers.ts 와 같은 꼴).
 *
 * ★ 왜 이미 있는 사진인가 — 자동 글 사진은 원래 OpenAI 로 만들었는데, GPT 는 오너 확인 전에 쓰지 않는다
 *   (content/auto-blog.json image:false). 그래서 진료 안내 쪽에서 이미 쓰는 사진(public/img/ai)에서 고른다.
 * ★ 사람·손·얼굴·글자가 나오는 사진은 넣지 않았다 — 사물·장비·모형 사진만(2026-11-10 눈으로 확인).
 *   빠진 것: implant-custom·uv·prf·bonegraft-card·aftercare(손·사람) · aesthetic-*(얼굴) · insurance-*(사람) ·
 *   painless-hub(얼굴) · tmj-cause-*·tmj-focus-exam(사람) · insight-hub·insight-cost(손).
 * ★ 고르는 법 — 같은 분류 묶음에서 **최근 글이 쓰지 않은 사진**을 먼저. 다 쓰였으면 글 이름으로 하나 정한다.
 *   분류 이름은 lib/adminGemini.ts CATEGORIES 와 같아야 한다.
 */
export type Cover = { src: string; alt: string };

const A = '/img/ai';

const VISIT: Cover[] = [
  { src: `${A}/ct-room.webp`, alt: '진료실 한쪽에 놓인 3D CT 촬영 장비' },
  { src: `${A}/sterile.webp`, alt: '멸균기 앞에 밀봉 포장해 둔 치과 기구' },
  { src: `${A}/implant-navigation.webp`, alt: '태블릿에 띄운 잇몸뼈 CT 영상과 치아 모형' },
];

export const COVER_POOL: Record<string, Cover[]> = {
  임플란트: [
    { src: `${A}/implant-hub.webp`, alt: '흰 상판 위의 임플란트 고정체와 연결 기둥, 투명한 치아 모형' },
    { src: `${A}/implant-navigation.webp`, alt: '태블릿에 띄운 잇몸뼈 CT 영상과 치아 모형' },
    { src: `${A}/insight-implant-care.webp`, alt: '임플란트 모형 옆에 놓인 칫솔과 치간 칫솔' },
  ],
  턱관절: [
    { src: `${A}/tmj-bruxism-guard.webp`, alt: '흰 상판 위의 투명한 교합안정장치와 보관 케이스' },
    { src: `${A}/insight-jaw.webp`, alt: '진료실에 놓인 머리뼈 모형과 턱관절 부위' },
  ],
  심미치료: [{ src: `${A}/insight-whitening.webp`, alt: '부채꼴로 펼친 치아 색상 견본' }],
  '보험 틀니·임플란트': [{ src: `${A}/insight-gum.webp`, alt: '흰 상판 위의 위아래 치아와 잇몸 모형' }],
  사랑니: [{ src: `${A}/insight-wisdom.webp`, alt: '아래턱뼈 모형과 치과용 거울' }],
  '자연치아 살리기': [
    { src: `${A}/natural-mta.webp`, alt: '뿌리 속까지 보이는 치아 단면 모형' },
    { src: `${A}/insight-crack.webp`, alt: '확대경 너머로 보이는 어금니 모형' },
    { src: `${A}/natural-endosonic.webp`, alt: '쟁반 위에 놓인 초음파 근관 세척 기구' },
    { src: `${A}/insight-endo-pain.webp`, alt: '신경이 보이는 치아 단면 모형과 냉찜질 팩' },
  ],
  무통치료: [
    { src: `${A}/painless-anesthesia.webp`, alt: '쟁반 위의 도포 마취제 통과 면봉' },
    { src: `${A}/painless-airflow.webp`, alt: '진료실의 에어플로우 세정 장비' },
    { src: `${A}/painless-sedation.webp`, alt: '창가 진료 의자 옆 쟁반에 놓인 치과 기구' },
  ],
  '잇몸·예방': [
    { src: `${A}/insight-gum.webp`, alt: '흰 상판 위의 위아래 치아와 잇몸 모형' },
    { src: `${A}/insight-sensitive.webp`, alt: '치아 모형 두 개와 물 한 잔' },
  ],
  '치과 선택': VISIT,
};

const ALL: Cover[] = [...new Map(Object.values(COVER_POOL).flat().map((c) => [c.src, c])).values()];

/** 분류에 맞는 사진 하나 — 최근 글(recent)이 쓴 사진은 피한다. 분류가 없거나 모르면 진료실 장비 묶음. */
export function pickCover(category: string | undefined, recent: Array<string | undefined>, seed: string): Cover {
  const pool = (category && COVER_POOL[category]) || VISIT;
  const used = new Set(recent.filter(Boolean));
  const fresh = pool.find((c) => !used.has(c.src)) ?? ALL.find((c) => !used.has(c.src));
  if (fresh) return fresh;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}
