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
  const graph = mergeById(nodes);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  );
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
