import { DoctorCard, LinkListCard } from '@/components/SideRail';
import { NAV } from '@/lib/nav';

type Item = { label: string; href: string };

/**
 * 맨 아래 바로가기 — 원장 카드 + 이 갈래 안내 + 전체 메뉴(다른 갈래).
 * 2026-11-10 병원(본부장 전달) "치과소개·임플란트 전체보기 하단에도 다른 페이지로 연결되는 부분. 턱관절처럼 오른쪽 칸 말고,
 * 모바일 제일 아래에서 다른 게시판으로 쉽게 옮겨지게 — '양대일 원장이 직접 진단' 카드 + 목록처럼" + 오너 "오른쪽이 아니라 하단에".
 * 카드 두 장은 턱관절·내비게이션 임플란트 사이드바와 같은 부품(SideRail)이라 한쪽만 고쳐지는 일이 없다.
 * 넓은 화면은 세 장 나란히, 태블릿은 두 칸, 폰은 위아래로 쌓인다.
 * ⚠️ 진료 쪽 '관련 문서 카드'는 오너가 링크 사슬을 줄이려 인사이트에만 두었다(DocPage) — 이 바로가기는 병원 요청으로 두 쪽(치과소개·임플란트 허브)에만 붙인다.
 */
export function BottomGuide({
  current,
  own,
  bg = 'bg-canvas',
}: {
  /** 지금 쪽 주소 — 목록에서 진하게 + 주황 점 */
  current: string;
  /** 이 갈래 안내 목록(제목 + 주황 낱말 + 항목) */
  own: { title: string; accent?: string; items: Item[] };
  /** 바로 위 구역과 바탕이 겹치지 않게 */
  bg?: string;
}) {
  /* 전체 메뉴 — 메뉴 맨 윗줄에서 지금 갈래만 뺀다(메뉴와 같은 순서·이름) */
  const others = NAV.filter((n) => !own.items.some((it) => it.href === n.href)).map((n) => ({ label: n.label, href: n.href }));
  return (
    <section className={`section ${bg}`} aria-label="다른 안내로 이동">
      <div className="wrap">
        <div className="reveal-stack mx-auto grid max-w-[1180px] gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-start">
          <DoctorCard />
          <LinkListCard title={own.title} accent={own.accent} items={own.items} current={current} />
          <LinkListCard title="전체" accent="메뉴" items={others} />
        </div>
      </div>
    </section>
  );
}
