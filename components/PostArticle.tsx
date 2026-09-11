import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/blog';
import { Breadcrumb, Sentences } from '@/components/ui';
import { ContactCard, DoctorCard, LinkListCard } from '@/components/SideRail';

/**
 * 글 한 편의 본문 화면 — 블로그(/insight/blog)와 임상 글(/insight/clinical)이 같이 쓴다.
 *  · 왼쪽: 날짜·분류 → 제목 → 요약 → 대표 사진 → 본문(.blog-body) → 목록 단추
 *  · 오른쪽: 의료진 카드 → 이어지는 진료 → 다른 글 → 상담 카드(sticky)
 * ⚠️ 본문 모양은 globals.css 의 .blog-body 가 정한다. 본문은 문자열이라 자식마다 클래스를 줄 수 없다.
 * ⚠️ dangerouslySetInnerHTML — 넣는 값은 저장소에 커밋된 파일뿐이고 lib/blog.ts 가 script·iframe·on* 을 걷어 낸다.
 */
export function PostArticle({
  post,
  trail,
  back,
  hubLinks,
  others,
  note,
  sourceUrl,
  showCover = true,
}: {
  /** 대표 사진을 제목 아래 크게 — 임상 글은 표지가 본문 사진 중 하나라 두 번 나오지 않게 끈다 */
  showCover?: boolean;
  post: BlogPost;
  /** 빵부스러기 — '홈' 은 Breadcrumb 이 스스로 붙이니 빼고 준다 */
  trail: Array<{ name: string; path: string }>;
  back: { href: string; label: string };
  hubLinks: Array<{ label: string; href: string }>;
  others: Array<{ label: string; href: string; meta?: string }>;
  /** 본문 아래 고지 한 줄(임상 사례의 개인차 고지) */
  note?: string;
  /** 원문 주소(네이버 블로그) — 있으면 본문 아래 '원문 보기' */
  sourceUrl?: string;
}) {
  return (
    <main id="main">
      <div className="wrap pt-[110px] pb-16 sm:pb-20 lg:pt-[130px] lg:pb-24">
        <Breadcrumb trail={trail} />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            <div className="mt-9 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <time dateTime={post.date} className="font-bold text-[15px] tabular-nums text-sun-600">
                {post.date.replace(/-/g, '. ')}
              </time>
              {post.category && <span className="text-[14px] font-bold text-ink-muted">{post.category}</span>}
              {post.kind === 'clinical' && <span className="rounded-full bg-sun-50 px-2.5 py-0.5 text-[12.5px] font-bold text-sun-700">임상 사례</span>}
              {post.kind === 'notice' && <span className="rounded-full bg-canvas-2 px-2.5 py-0.5 text-[12.5px] font-bold text-ink-soft">핵심 안내</span>}
            </div>

            <h1 className="display-sm mt-4 max-w-[20em] text-[clamp(28px,3.6vw,44px)] leading-[1.25] tracking-[-0.02em] text-ink">{post.title}</h1>
            <p className="mt-6 max-w-[46em] text-[18px] leading-[1.9] text-ink-soft">
              <Sentences text={post.summary} />
            </p>

            {/* 대표 사진은 요약 다음 — 먼저 읽혀야 할 것은 제목과 요약이다 */}
            {showCover && post.image && (
              <figure className="mt-10 max-w-[56em] overflow-hidden rounded-2xl border border-hairline bg-canvas-2">
                <div className="relative aspect-[3/2]">
                  <Image src={post.image} alt={post.imageAlt ?? ''} fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" />
                </div>
              </figure>
            )}

            <div className="blog-body mt-12 max-w-[42em]" dangerouslySetInnerHTML={{ __html: post.html }} />

            {note && <p className="mt-10 max-w-[42em] rounded-xl bg-canvas-2 px-5 py-4 text-[13.5px] leading-[1.7] text-ink-muted">※ {note}</p>}

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8">
              <Link href={back.href} className="group inline-flex items-center gap-2 text-[16px] font-bold text-sun-700">
                <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
                {back.label}
              </Link>
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener" className="text-[14px] font-semibold text-ink-muted hover:text-brand-700">
                  네이버 블로그 원문 보기 ↗
                </a>
              )}
            </div>
          </article>

          {/* aside 는 글 높이만큼 늘어나고, 마지막 상담 카드만 sticky 로 글을 따라 내려온다 */}
          <aside className="mt-12 space-y-6 lg:mt-9" aria-label="진료 안내">
            <DoctorCard />
            <LinkListCard title="이 글과 이어지는" accent="진료" items={hubLinks} />
            <LinkListCard title="다른" accent="글" items={others} />
            <div className="lg:sticky lg:top-[96px]">
              <ContactCard />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
