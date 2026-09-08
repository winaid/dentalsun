/**
 * 진료 문서 전체 — 여기가 모든 진료 페이지·사이트맵·llms.txt 의 단일 출처다.
 * 새 갈래를 만들면 여기에 넣는다. 안 넣으면 그 쪽은 생성도, 색인도 안 된다.
 */
import type { Doc } from '../docs';
import { IMPLANT_DOCS } from './implant';
import { TMJ_DOCS } from './tmj';
import { AESTHETIC_DOCS } from './aesthetic';
import { INSURANCE_DOCS } from './insurance';
import { WISDOM_DOCS } from './wisdom';
import { NATURAL_DOCS } from './natural';
import { PAINLESS_DOCS } from './painless';
import { INSIGHT_DOCS } from './insight';

export const ALL_DOCS: Doc[] = [
  ...IMPLANT_DOCS,
  ...TMJ_DOCS,
  ...AESTHETIC_DOCS,
  ...INSURANCE_DOCS,
  ...WISDOM_DOCS,
  ...NATURAL_DOCS,
  ...PAINLESS_DOCS,
  ...INSIGHT_DOCS,
];

const BY_PATH = new Map(ALL_DOCS.map((d) => [d.path, d]));
export const docByPath = (path: string) => BY_PATH.get(path);
/** 같은 허브 아래 문서(허브 자신 제외) — 허브 카드·관련 문서에 쓴다 */
export const docsOfHub = (hub: string) => ALL_DOCS.filter((d) => d.hub === hub && d.path !== hub);
