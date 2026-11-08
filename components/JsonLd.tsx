import { serializeJsonLd, clinicSchema, websiteSchema, directorPersonSchema } from '@/lib/seo';

/**
 * 이 페이지의 구조화 데이터 전체 — **스크립트 하나, @graph 하나**.
 * 병원(Dentist)·사이트(WebSite)·대표원장(Person) 노드는 자동으로 앞에 붙고, 같은 @id 는 하나로 합친다
 * (뒤에 온 값이 이긴다 — 페이지가 직접 낸 노드가 자동 노드보다 그 페이지 사정을 잘 안다).
 * ⚠️ 서버 컴포넌트로 둔다 — 크롤러가 자바스크립트 없이 읽어야 한다.
 */
export function JsonLd({ data, site = true }: { data?: unknown | unknown[]; site?: boolean }) {
  const given = (Array.isArray(data) ? data : data ? [data] : []).filter(Boolean);
  const nodes = [...(site ? [clinicSchema(), websiteSchema(), directorPersonSchema()] : []), ...given].map(stripContext);
  const merged = mergeById(nodes);
  /*
   * ★★ ItemList 만은 @graph 밖 독립 스크립트로 낸다 (2026-11-08 오너 "co.kr 둘 다 카드") ★★
   *   ItemList 단 병원 홈 43곳 대조: 카드 받은 15곳은 전부 ItemList 가 최상위 독립 스크립트,
   *   @graph 안에 넣은 곳은 하나도 카드를 못 받았다(C:/tmp/cardtop/ilpos.json). 동그라미 co.kr 과 같은 조치.
   *   ⚠️ 다시 @graph 로 합치지 말 것.
   */
  const lists = merged.filter(isItemList);
  const graph = merged.filter((n) => !isItemList(n));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', '@graph': graph }) }}
      />
      {lists.map((list, i) => (
        <script
          key={typeof list['@id'] === 'string' ? list['@id'] : i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', ...list }) }}
        />
      ))}
    </>
  );
}

function isItemList(node: Record<string, unknown>) {
  return ([] as unknown[]).concat(node?.['@type'] ?? []).includes('ItemList');
}

function stripContext(node: unknown) {
  if (!node || typeof node !== 'object') return node as Record<string, unknown>;
  const { '@context': _ctx, ...rest } = node as Record<string, unknown>;
  return rest;
}

function mergeById(nodes: Record<string, unknown>[]) {
  const out: Record<string, unknown>[] = [];
  const seen = new Map<string, number>();
  for (const n of nodes) {
    const id = typeof n?.['@id'] === 'string' ? (n['@id'] as string) : null;
    if (id && seen.has(id)) {
      const at = seen.get(id)!;
      out[at] = { ...out[at], ...n };
      continue;
    }
    if (id) seen.set(id, out.length);
    out.push(n);
  }
  return out;
}
