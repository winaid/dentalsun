import { TREATMENT_HUBS } from '@/lib/nav';

/**
 * 글의 분류(category) → 이어지는 진료 갈래. 블로그·임상 글 사이드바의 '이 글과 이어지는 진료' 카드가 쓴다.
 * 분류 이름은 글쓴이가 자유롭게 적으므로 표에 없으면 메뉴 이름과 겹치는 쪽을 고른다.
 */
const CATEGORY_HUB: Record<string, string> = {
  '무통·수면치료': '/treatment/painless',
  '무통': '/treatment/painless',
  '수면치료': '/treatment/painless',
  '임플란트': '/treatment/implant',
  '턱관절': '/treatment/tmj',
  '심미치료': '/treatment/aesthetic',
  '치아미백': '/treatment/aesthetic',
  '미백': '/treatment/aesthetic',
  '보험': '/treatment/insurance',
  '틀니': '/treatment/insurance',
  '사랑니': '/treatment/wisdom-tooth',
  '자연치아': '/treatment/natural-tooth',
  '신경치료': '/treatment/natural-tooth',
};

export function hubForCategory(category?: string): string | undefined {
  if (!category) return undefined;
  if (CATEGORY_HUB[category]) return CATEGORY_HUB[category];
  const key = Object.keys(CATEGORY_HUB).find((k) => category.includes(k));
  if (key) return CATEGORY_HUB[key];
  return TREATMENT_HUBS.find((h) => category.includes(h.label) || h.label.includes(category))?.href;
}
