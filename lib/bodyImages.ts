/**
 * 글 본문(HTML 문자열) 속 로컬 사진을 Next 이미지 최적화로 보낸다 — 크기별 srcset + sizes.
 *
 * 2026-10-07 이미지 전수 점검: 임상 글 본문 사진이 날 <img src="/img/clinical/…"> 라서 최적화를 안 거쳤다.
 * 화면 폭은 672px(PC)인데 1400px 원본을 그대로 받아 쪽당 0.6~1MB 였다. next/image 와 같은 /_next/image 주소를 써서
 * 화면 폭에 맞는 크기(그리고 브라우저가 받으면 avif)만 받게 한다.
 *  · 폭은 next.config 기본 허용 폭만 쓴다(384 · 640 · 828 · 1080 · 1200). 그 밖의 폭은 400 으로 거절된다.
 *  · 원본보다 큰 폭은 넣지 않는다(키우지 않는다). 원본 폭이 허용 폭 사이면 원본 파일을 마지막 후보로 둔다.
 *  · 400px 보다 작은 사진은 그대로 둔다(줄일 것이 없다).
 *  · eagerFirst — 표지가 없는 임상 글은 본문 첫 사진이 첫 화면의 가장 큰 그림(LCP)이라 바로 불러온다.
 */
const WIDTHS = [384, 640, 828, 1080, 1200];
const SIZES = '(min-width: 768px) 672px, calc(100vw - 40px)';
const opt = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;

export function optimizeBodyImages(html: string, { eagerFirst = false }: { eagerFirst?: boolean } = {}): string {
  let first = true;
  return html.replace(/<img\b([^>]*)>/gi, (all, attrs: string) => {
    const isFirst = first;
    first = false;
    const src = attrs.match(/\bsrc="(\/img\/[^"]+\.(?:webp|png|jpe?g))"/i)?.[1];
    if (!src || /\bsrcset=/i.test(attrs)) return all;
    const natural = Number(attrs.match(/\bwidth="(\d+)"/i)?.[1] ?? 0);
    if (!natural || natural < 400) return all;
    const ws = WIDTHS.filter((w) => w <= natural);
    const set = ws.map((w) => `${opt(src, w)} ${w}w`);
    if (!WIDTHS.includes(natural) && natural < WIDTHS[WIDTHS.length - 1]) set.push(`${src} ${natural}w`);
    const fallback = opt(src, ws.filter((w) => w <= 1080).pop() ?? ws[0]);
    const rest = attrs.replace(/\s*\bsrc="[^"]*"/i, '').replace(/\s*\bloading="[^"]*"/i, '').replace(/\s*\bdecoding="[^"]*"/i, '').replace(/\s*\/\s*$/, '');
    const load = eagerFirst && isFirst ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
    return `<img${rest} src="${fallback}" srcset="${set.join(', ')}" sizes="${SIZES}"${load} decoding="async">`;
  });
}
